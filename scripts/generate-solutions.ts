import "dotenv/config";

import Anthropic from "@anthropic-ai/sdk";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../lib/generated/prisma/client";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("❌  ANTHROPIC_API_KEY не задан в .env");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("❌  DATABASE_URL не задан в .env");
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const args = process.argv.slice(2);
function getArg(name: string): string | null {
  const eq = args.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.split("=").slice(1).join("=");
  const idx = args.indexOf(`--${name}`);
  if (idx >= 0 && idx + 1 < args.length) return args[idx + 1];
  return null;
}

const limit = Number(getArg("limit") ?? "20");
const dryRun = args.includes("--dry-run");
const onlyTaskId = getArg("task-id");
const force = args.includes("--force"); //переписать solution даже если он есть

const SYSTEM_PROMPT = `Ты — эксперт по профильной математике ЕГЭ России. Ты пишешь подробные пошаговые решения школьных задач для платформы подготовки к ЕГЭ.

ЖЁСТКИЕ ПРАВИЛА:
1. Решай только используя стандартные методы школьной математики (никаких ВУЗовских и неочевидных трюков).
2. Все формулы и выражения записывай в LaTeX: inline — $...$, блочные — $$...$$
   КРИТИЧЕСКИ ВАЖНО для JSON: все обратные слеши в LaTeX ОБЯЗАТЕЛЬНО дублируй: $\\frac{a}{b}$, $\\sin(x)$, $\\sqrt{x}$, $\\cdot$, $\\angle ABC$, $\\Rightarrow$ — одиночный \\ в JSON недопустим.
3. Решение должно быть пошаговым, нумерованным (1), 2), 3) ...). Каждый шаг — отдельная мысль с пояснением.
4. В конце решения обязательно фраза с ответом: "Ответ: <число>".
5. Финальный ответ должен совпадать с указанным correctAnswer. Если ты получаешь другой ответ — значит ты решил неверно, перепроверь.
6. Решение должно быть понятным ученику 11 класса: обозначь, какую теорему/формулу применяешь, как только применяешь.
7. Если в условии есть ссылки на рисунок ($ABC$, $AO$ и т.д.) — используй те же обозначения в решении.
8. Не используй markdown-заголовки (# ##), только обычный текст с LaTeX.

Ответ — строго JSON без markdown-обёртки:
{
  "solution": "1) ... 2) ... ... Ответ: 119",
  "hints": ["короткая подсказка 1", "короткая подсказка 2", "короткая подсказка 3"]
}

В hints — 3 короткие подсказки, каждая ≤ 120 символов, без раскрытия конечного ответа.`;

type GeneratedSolution = {
  solution: string;
  hints: string[];
};

function repairLatexJson(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .replace(/\\\\/g, "\x01")
    .replace(/\\"/g, "\x02")
    .replace(/\\/g, "\\\\")
    .replace(/\x01/g, "\\\\")
    .replace(/\x02/g, '\\"');
}

async function generateSolution(
  examNumber: number,
  topicTitle: string,
  subtopicTitle: string | null,
  condition: string,
  correctAnswer: string,
): Promise<GeneratedSolution> {
  const userPrompt = `Задание ${examNumber} ЕГЭ. Тема: "${topicTitle}"${subtopicTitle ? `, подтема: "${subtopicTitle}"` : ""}.

Условие:
${condition}

Правильный ответ: ${correctAnswer}

Напиши пошаговое решение (LaTeX в формулах) и 3 подсказки.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text.trim() : "";
  const json = repairLatexJson(text);
  const parsed = JSON.parse(json) as GeneratedSolution;

  if (!parsed.solution || typeof parsed.solution !== "string") {
    throw new Error("Модель не вернула solution");
  }
  if (!Array.isArray(parsed.hints)) parsed.hints = [];

  return parsed;
}

async function main() {
  const where = onlyTaskId
    ? { id: onlyTaskId }
    : force
      ? {}
      : {
          OR: [{ solution: null }, { solution: "" }],
        };

  const tasks = await prisma.task.findMany({
    where,
    take: onlyTaskId ? 1 : limit,
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      examNumber: true,
      title: true,
      condition: true,
      correctAnswer: true,
      solution: true,
      topic: { select: { title: true } },
      subtopic: { select: { title: true } },
    },
  });

  if (tasks.length === 0) {
    console.log("Нет задач для обработки.");
    return;
  }

  console.log(
    `Найдено задач: ${tasks.length}${dryRun ? " (dry-run)" : ""}\n`,
  );

  let ok = 0;
  let failed = 0;

  for (const [index, task] of tasks.entries()) {
    process.stdout.write(
      `[${index + 1}/${tasks.length}] ${task.title ?? "(без заголовка)"} … `,
    );

    try {
      const result = await generateSolution(
        task.examNumber,
        task.topic.title,
        task.subtopic?.title ?? null,
        task.condition,
        task.correctAnswer,
      );

      if (dryRun) {
        console.log("OK (dry-run)");
        console.log("--- solution ---");
        console.log(result.solution);
        console.log("--- hints ---");
        for (const h of result.hints) console.log(`• ${h}`);
        console.log();
      } else {
        await prisma.task.update({
          where: { id: task.id },
          data: {
            solution: result.solution,
            hints: result.hints.length > 0 ? result.hints : undefined,
          },
        });
        console.log("OK");
      }
      ok += 1;
    } catch (err) {
      failed += 1;
      console.log(
        `FAIL: ${err instanceof Error ? err.message : "unknown error"}`,
      );
    }

    if (index < tasks.length - 1) {
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  console.log(`\nГотово. Успешно: ${ok}, ошибок: ${failed}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
