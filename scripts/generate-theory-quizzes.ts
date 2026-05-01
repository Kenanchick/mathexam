import Anthropic from "@anthropic-ai/sdk";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import { TOPICS } from "./theory-content";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const QUESTIONS_PER_QUIZ_DEFAULT = 12;
const BATCH_SIZE = 18;

// Cached system prompt — sent once, reused across all topic calls
const SYSTEM_PROMPT = `Ты — эксперт по профильной математике ЕГЭ России. Ты составляешь проверочные тесты по теории и формулам.

ЖЁСТКИЕ ПРАВИЛА:
1. Используй ТОЛЬКО формулы и факты из предоставленного материала.
2. Если формулы нет в материале — НЕ придумывай. Используй только то, в чём абсолютно уверен из стандартного школьного курса профильной математики России.
3. Все формулы в вопросах и вариантах ответов записывай в LaTeX: inline — $...$, блочные — $$...$$
   КРИТИЧЕСКИ ВАЖНО для JSON: все обратные слеши в LaTeX ОБЯЗАТЕЛЬНО дублируй: $\\frac{a}{b}$, $\\sin(x)$, $\\sqrt{x}$, $\\cdot$, $\\left($, $\\right)$ — одиночный \\ в JSON недопустим.
4. Вопросы должны быть разнообразными по типу:
   - «Где ошибка в этом решении?»
   - «Какое значение выражения?»
   - «Какое условие необходимо и достаточно?»
   - «Какой следующий шаг правильный?»
   - «Какой из вариантов — верная формула?»
   - «Какой корень подходит на промежутке?»
   - «Какое условие забыли?»
5. Варианты ответов должны быть правдоподобными — типичные ошибки учеников должны присутствовать среди неверных вариантов.
6. Объяснение должно быть подробным, с формулами, объяснять ПОЧЕМУ другие варианты неверны.
7. Никаких placeholder-вопросов вида «Что такое X?» с тривиальным ответом.

Ответ — строго JSON без markdown-обёртки:
{
  "questions": [
    {
      "type": "FORMULA_RECALL" | "CALCULATION" | "THEORETICAL",
      "question": "текст вопроса с LaTeX",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "подробное объяснение с формулами"
    }
  ]
}`;

type GeneratedQuestion = {
  type: "FORMULA_RECALL" | "CALCULATION" | "THEORETICAL";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

async function generateBatch(
  topicTitle: string,
  content: string,
  examNumber: number,
  batchSize: number,
  batchIndex: number,
  totalBatches: number,
): Promise<GeneratedQuestion[]> {
  const batchHint =
    totalBatches > 1
      ? ` (батч ${batchIndex + 1} из ${totalBatches} — вопросы ${batchIndex * batchSize + 1}–${(batchIndex + 1) * batchSize})`
      : "";

  const userPrompt = `Составь ${batchSize} вопросов для теста по теме: "${topicTitle}" (Задание ${examNumber} ЕГЭ)${batchHint}.

Вот весь материал по этой теме — используй ТОЛЬКО его (плюс общеизвестные факты):

${content}

Требования к вопросам:
- Равномерно покрой все подтемы и формулы из материала.
- Обязательно включи вопросы на типичные ошибки, перечисленные в материале.
- Минимум 30% вопросов типа CALCULATION (подставить значения, вычислить).
- Минимум 30% вопросов типа FORMULA_RECALL (какая формула верна).
- Минимум 20% вопросов типа THEORETICAL (свойства, условия, когда применять).
- Остальные — на твой выбор исходя из темы.
- Варианты ответов: ровно 4, один верный, три — реалистичные ошибки.
${totalBatches > 1 ? `- Не повторяй вопросы из других батчей — охватывай новые подтемы и формулы.` : ""}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
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

  const raw = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  // Fix unescaped LaTeX backslashes: protect \\ and \", escape all remaining single \
  const json = raw
    .replace(/\\\\/g, "\x01")   // protect already-doubled \\
    .replace(/\\"/g, "\x02")    // protect \"
    .replace(/\\/g, "\\\\")     // escape remaining single backslashes
    .replace(/\x01/g, "\\\\")   // restore \\
    .replace(/\x02/g, '\\"');   // restore \"
  const parsed = JSON.parse(json) as { questions: GeneratedQuestion[] };
  return parsed.questions;
}

async function generateQuestionsForTopic(
  topicTitle: string,
  content: string,
  examNumber: number,
  questionsCount: number,
): Promise<GeneratedQuestion[]> {
  if (questionsCount <= BATCH_SIZE) {
    return generateBatch(topicTitle, content, examNumber, questionsCount, 0, 1);
  }

  const batches = Math.ceil(questionsCount / BATCH_SIZE);
  const all: GeneratedQuestion[] = [];

  for (let i = 0; i < batches; i++) {
    const remaining = questionsCount - i * BATCH_SIZE;
    const size = Math.min(BATCH_SIZE, remaining);
    process.stdout.write(`\n    батч ${i + 1}/${batches}...`);
    const batch = await generateBatch(topicTitle, content, examNumber, size, i, batches);
    all.push(...batch);
    if (i < batches - 1) await new Promise((r) => setTimeout(r, 600));
  }

  return all;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌  ANTHROPIC_API_KEY не задан в .env");
    process.exit(1);
  }

  console.log(`Генерация тестов по теории ЕГЭ (${TOPICS.length} тем)\n`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const topic of TOPICS) {
    const existing = await prisma.theoryQuiz.findUnique({
      where: { topicSlug: topic.slug },
    });

    if (existing) {
      console.log(`  [пропуск] ${topic.title}`);
      skipped++;
      continue;
    }

    const qCount = topic.questionsCount ?? QUESTIONS_PER_QUIZ_DEFAULT;
    process.stdout.write(`  Генерирую: ${topic.title} (${qCount} вопросов)...`);

    try {
      const questions = await generateQuestionsForTopic(
        topic.title,
        topic.content,
        topic.examNumber,
        qCount,
      );

      await prisma.theoryQuiz.create({
        data: {
          examNumber: topic.examNumber,
          topicTitle: topic.title,
          topicSlug: topic.slug,
          description: topic.description,
          questions: {
            create: questions.map((q, idx) => ({
              type: q.type,
              question: q.question,
              options: q.options,
              correctIndex: q.correctIndex,
              explanation: q.explanation,
              order: idx + 1,
            })),
          },
        },
      });

      console.log(` ✓  (${questions.length} вопросов)`);
      created++;
    } catch (err) {
      console.log(` ✗  ОШИБКА: ${err}`);
      failed++;
    }

    // Небольшая пауза между запросами
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`\n────────────────────────────`);
  console.log(`Создано:   ${created}`);
  console.log(`Пропущено: ${skipped}`);
  console.log(`Ошибок:    ${failed}`);
  console.log(`────────────────────────────`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
