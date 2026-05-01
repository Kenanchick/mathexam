import "dotenv/config";

import Anthropic from "@anthropic-ai/sdk";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../lib/generated/prisma/client";
import { TaskStatus } from "../lib/generated/prisma/enums";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY не задан");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL не задан");
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

const examNumber = Number(getArg("exam-number") ?? "0");
if (!examNumber) {
  console.error(
    "Используйте: npm run generate-variants -- --exam-number=N [--variants=K] [--limit=M] [--dry-run]",
  );
  process.exit(1);
}

const variantsPerTask = Number(getArg("variants") ?? "5");
const limit = Number(getArg("limit") ?? "999");
const dryRun = args.includes("--dry-run");

const VARIANT_SOURCE_SUFFIX = " (вариант)";
const ORIGINAL_SOURCE_PREFIX = "ФИПИ, Открытый банк заданий ЕГЭ";

const SYSTEM_PROMPT = `Ты — эксперт по профильной математике ЕГЭ России. Тебе дают каноническую задачу с условием, ответом и пошаговым решением. Ты создаёшь N вариантов этой задачи: меняешь числа в условии, перерешиваешь, выписываешь новый ответ и согласованное пошаговое решение.

ЖЁСТКИЕ ПРАВИЛА:
1. Вариант — это та же по сути задача (та же формула, тот же метод, тот же тип ответа), но с другими числовыми значениями. Структуру условия не меняй.
2. НИ ОДИН вариант не должен совпадать с оригинальным условием — числа должны быть другие. Между вариантами также числа должны различаться.
3. Числа подбирай так, чтобы итоговый ответ был «красивым»: целым или несложной дробью (например 0,5; 1,25). Никаких иррациональных ответов, если в оригинале ответ был рациональным.
4. Перерешай задачу заново под новые числа — нельзя просто скопировать оригинальное решение и поменять цифры. Каждый шаг должен быть пересчитан.
5. Все формулы в LaTeX: inline — $...$, блочные — $$...$$
   КРИТИЧЕСКИ ВАЖНО для JSON: все обратные слеши в LaTeX дублируй: $\\frac{a}{b}$, $\\sqrt{x}$, $\\log_2 x$, $\\sin(x)$, $\\cdot$, $\\Leftrightarrow$ — одиночный \\ в JSON недопустим.
6. Решение шаги нумеруй (1), 2), 3) ...). В конце фраза "Ответ: <число>".
7. Если оригинал содержит картинки/чертежи — НЕ генерируй вариант: верни пустой массив.
8. Если оригинальная формула не позволяет красиво подобрать числа — лучше верни меньше вариантов, чем плохие.

Ответ — строго JSON без markdown-обёртки:
{
  "variants": [
    {
      "condition": "новое условие с LaTeX",
      "correctAnswer": "новый ответ числом или короткой строкой",
      "solution": "1) ... 2) ... ... Ответ: <число>"
    }
  ]
}`;

type Variant = {
  condition: string;
  correctAnswer: string;
  solution: string;
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

async function generateVariants(
  topicTitle: string,
  subtopicTitle: string | null,
  examNumber: number,
  condition: string,
  correctAnswer: string,
  solution: string | null,
  count: number,
): Promise<Variant[]> {
  const userPrompt = `Задание ${examNumber}. Тема: "${topicTitle}"${subtopicTitle ? `, подтема: "${subtopicTitle}"` : ""}.

Канонический пример:

Условие:
${condition}

Правильный ответ: ${correctAnswer}

${solution ? `Эталонное решение:\n${solution}` : ""}

Создай ${count} вариантов этой задачи с другими числами. Для каждого варианта дай новое условие, новый ответ и пересчитанное пошаговое решение.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: userPrompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text.trim() : "";
  const json = repairLatexJson(text);
  const parsed = JSON.parse(json) as { variants: Variant[] };

  if (!Array.isArray(parsed.variants)) return [];
  return parsed.variants
    .filter(
      (v) =>
        v &&
        typeof v.condition === "string" &&
        typeof v.correctAnswer === "string" &&
        typeof v.solution === "string",
    )
    .map((v) => ({
      condition: v.condition.trim(),
      correctAnswer: v.correctAnswer.trim().replace(/[—–]/g, "-"),
      solution: v.solution.trim(),
    }));
}

async function main() {
  const tasksAll = await prisma.task.findMany({
    where: {
      examNumber,
      source: { startsWith: ORIGINAL_SOURCE_PREFIX, not: { contains: "вариант" } },
      imageUrls: { equals: [] },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      examNumber: true,
      title: true,
      condition: true,
      correctAnswer: true,
      acceptedAnswers: true,
      solution: true,
      hints: true,
      difficulty: true,
      answerType: true,
      topicId: true,
      subtopicId: true,
      topic: { select: { title: true } },
      subtopic: { select: { title: true } },
      solveTimeSec: true,
    },
  });

  // Идемпотентность: пропускаем источники, для которых уже есть варианты в БД
  // (по совпадению title-префикса "<оригинал> — вариант")
  const existingVariantTitles = await prisma.task.findMany({
    where: {
      examNumber,
      source: { contains: "вариант" },
    },
    select: { title: true },
  });
  const titleHasVariants = new Set<string>();
  for (const v of existingVariantTitles) {
    const m = v.title?.match(/^(.*) — вариант \d+$/);
    if (m) titleHasVariants.add(m[1]);
  }

  const eligible = tasksAll.filter(
    (t) => !t.title || !titleHasVariants.has(t.title),
  );
  const tasks = eligible.slice(0, limit);

  if (titleHasVariants.size > 0) {
    console.log(
      `Пропущено источников с уже существующими вариантами: ${tasksAll.length - eligible.length}`,
    );
  }

  if (tasks.length === 0) {
    console.log(
      `Нет задач для генерации вариантов (examNumber=${examNumber}, без картинок, не вариант).`,
    );
    return;
  }

  console.log(
    `Задач-источников: ${tasks.length}. Генерируем по ${variantsPerTask} вариантов на каждую${dryRun ? " (dry-run)" : ""}.\n`,
  );

  let okTasks = 0;
  let okVariants = 0;
  let failedTasks = 0;

  for (const [index, task] of tasks.entries()) {
    process.stdout.write(
      `[${index + 1}/${tasks.length}] ${task.title ?? "(без заголовка)"} … `,
    );

    try {
      const variants = await generateVariants(
        task.topic.title,
        task.subtopic?.title ?? null,
        task.examNumber,
        task.condition,
        task.correctAnswer,
        task.solution,
        variantsPerTask,
      );

      if (variants.length === 0) {
        console.log("0 вариантов (модель отказалась или картинка)");
        continue;
      }

      if (dryRun) {
        console.log(`OK, ${variants.length} вариантов (dry-run)`);
        for (const [i, v] of variants.entries()) {
          console.log(`  --- вариант ${i + 1} ---`);
          console.log(`  условие: ${v.condition.slice(0, 200)}`);
          console.log(`  ответ: ${v.correctAnswer}`);
          console.log(`  решение: ${v.solution.slice(0, 200)}...`);
        }
        console.log();
      } else {
        for (const [i, v] of variants.entries()) {
          await prisma.task.create({
            data: {
              topicId: task.topicId,
              subtopicId: task.subtopicId,
              examNumber: task.examNumber,
              title: `${task.title ?? "Вариант"} — вариант ${i + 1}`,
              condition: v.condition,
              difficulty: task.difficulty,
              status: TaskStatus.DRAFT,
              answerType: task.answerType,
              correctAnswer: v.correctAnswer,
              acceptedAnswers: [v.correctAnswer],
              solution: v.solution,
              hints: task.hints,
              source: `${ORIGINAL_SOURCE_PREFIX}${VARIANT_SOURCE_SUFFIX}`,
              imageUrls: [],
              solutionImageUrls: [],
              solveTimeSec: task.solveTimeSec,
            },
          });
          okVariants += 1;
        }
        console.log(`OK, +${variants.length} вариантов`);
      }
      okTasks += 1;
    } catch (err) {
      failedTasks += 1;
      console.log(
        `FAIL: ${err instanceof Error ? err.message : "unknown error"}`,
      );
    }

    if (index < tasks.length - 1) {
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  console.log(
    `\nГотово. Задач обработано: ${okTasks}, вариантов создано: ${okVariants}, ошибок: ${failedTasks}.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
