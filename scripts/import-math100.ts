import "dotenv/config";

import * as cheerio from "cheerio";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../lib/generated/prisma/client";
import {
  TaskDifficulty,
  TaskStatus,
  AnswerType,
} from "../lib/generated/prisma/enums";
import { taskImageStorage } from "../lib/storage";
import { MATH100_CONFIGS, type Math100Config } from "./math100-config";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL не задан");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const SOURCE = "ФИПИ, Открытый банк заданий ЕГЭ";

const args = process.argv.slice(2);
function getArg(name: string): string | null {
  const eq = args.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.split("=").slice(1).join("=");
  const idx = args.indexOf(`--${name}`);
  if (idx >= 0 && idx + 1 < args.length) return args[idx + 1];
  return null;
}

const taskArg = getArg("task");
if (!taskArg) {
  console.error("Используйте: npm run import-math100 -- --task=N (например, --task=3 или --task=6)");
  console.error("Доступные:", Object.keys(MATH100_CONFIGS).join(", "));
  process.exit(1);
}

const maybeConfig: Math100Config | undefined = MATH100_CONFIGS[Number(taskArg)];
if (!maybeConfig) {
  console.error(`Нет конфига для задания ${taskArg}.`);
  console.error("Доступные:", Object.keys(MATH100_CONFIGS).join(", "));
  process.exit(1);
}
const config: Math100Config = maybeConfig;

const subtypesArg = getArg("subtypes");
const limitPerSubtype = Number(getArg("limit") ?? "999");

const subtypeKeys = subtypesArg
  ? subtypesArg.split(",").map((s) => s.trim())
  : config.subtopics.map((s) => s.key);

const SLUGS: { slug: string; subKey: string }[] = [];
for (const sub of config.subtopics) {
  if (!subtypeKeys.includes(sub.key)) continue;
  const max = Math.min(sub.maxTasks, limitPerSubtype);
  for (let n = 1; n <= max; n++) {
    SLUGS.push({
      slug: `ege_profil_${config.math100Group}_${sub.key}-${n}`,
      subKey: sub.key,
    });
  }
}

function cleanText(s: string): string {
  return s
    .replace(/ /g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function convertMathJaxToKatex(input: string): string {
  let out = input.replace(/\\\(/g, "$").replace(/\\\)/g, "$");
  out = out.replace(/\\\[/g, "$$").replace(/\\\]/g, "$$");
  return out;
}

function stripConditionTail(condition: string): string {
  let c = condition;
  c = c.replace(/\s+(?:Ответ|ОТВЕТ)\s*$/u, "");
  return c.trim();
}

type ParsedTask = {
  condition: string;
  correctAnswer: string;
  imageUrls: string[];
  solution: string;
  taskNumberLabel: string;
};

async function fetchTask(slug: string): Promise<ParsedTask> {
  const url = `https://math100.ru/${slug}/`;
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const article = $(".post-content, .fusion-text, article").first();
  const fullText = cleanText(
    article.length ? article.text() : $("body").text(),
  );

  const m = fullText.match(
    /Задача\s+(\d+)\.\s*([\s\S]*?)\s*ОТВЕТ\s*:\s*([^\n.]+)/i,
  );
  if (!m) throw new Error("Не удалось разобрать condition/answer");
  const taskNumberLabel = m[1];
  const condition = convertMathJaxToKatex(stripConditionTail(m[2]));
  const correctAnswer = m[3]
    .trim()
    .replace(/\s+/g, "")
    .replace(/[—–]/g, "-"); // длинное тире → минус

  const imageUrls: string[] = [];
  $("img.size-full, .post-content img, article img")
    .toArray()
    .forEach((el) => {
      const src = $(el).attr("src");
      if (
        src &&
        src.includes("math100.ru/wp-content/uploads") &&
        !imageUrls.includes(src)
      ) {
        imageUrls.push(src);
      }
    });

  const solutionSection = $(".math100-spoiler")
    .filter((_, el) =>
      $(el)
        .find(".math100-spoiler-title-text")
        .text()
        .trim()
        .toLowerCase()
        .includes("решен"),
    )
    .first();
  const solutionRaw = solutionSection.find(".math100-spoiler-content").text();
  const solution = convertMathJaxToKatex(cleanText(solutionRaw));

  return { condition, correctAnswer, imageUrls, solution, taskNumberLabel };
}

async function downloadAndStore(
  taskId: string,
  imageUrls: string[],
): Promise<string[]> {
  const stored: string[] = [];
  for (const remoteUrl of imageUrls) {
    try {
      const res = await fetch(remoteUrl);
      if (!res.ok) {
        console.warn(`  ! не удалось скачать ${remoteUrl}: HTTP ${res.status}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const mime = res.headers.get("content-type") ?? "image/png";
      const cleanMime = mime.split(";")[0].trim();
      const supported = ["image/png", "image/jpeg", "image/webp"];
      const finalMime = supported.includes(cleanMime) ? cleanMime : "image/png";
      const originalName = remoteUrl.split("/").pop() ?? "image.png";

      const uploaded = await taskImageStorage.uploadTaskImage({
        buffer: buf,
        mimeType: finalMime,
        originalName,
        taskId,
        kind: "condition",
      });
      stored.push(uploaded.url);
    } catch (err) {
      console.warn(
        `  ! ошибка при скачивании ${remoteUrl}: ${err instanceof Error ? err.message : err}`,
      );
    }
  }
  return stored;
}

async function main() {
  console.log(`Импорт ${config.topic.title} (math100 group=${config.math100Group}). Всего: ${SLUGS.length} задач.\n`);

  const topic = await prisma.topic.upsert({
    where: { slug: config.topic.slug },
    update: {
      title: config.topic.title,
      description: config.topic.description,
      order: config.topic.order,
    },
    create: {
      title: config.topic.title,
      slug: config.topic.slug,
      description: config.topic.description,
      order: config.topic.order,
    },
  });

  const subtopicCache = new Map<string, string>();
  async function ensureSubtopic(key: string): Promise<{ id: string; title: string }> {
    const cached = subtopicCache.get(key);
    const info = config.subtopics.find((s) => s.key === key);
    if (!info) throw new Error(`нет подтипа ${key} в конфиге`);
    if (cached) return { id: cached, title: info.title };
    const sub = await prisma.subtopic.upsert({
      where: { topicId_slug: { topicId: topic.id, slug: info.slug } },
      update: { title: info.title, order: info.order },
      create: {
        topicId: topic.id,
        slug: info.slug,
        title: info.title,
        order: info.order,
      },
    });
    subtopicCache.set(key, sub.id);
    return { id: sub.id, title: info.title };
  }

  let ok = 0;
  let failed = 0;
  let skipped = 0;

  for (const [index, item] of SLUGS.entries()) {
    process.stdout.write(`[${index + 1}/${SLUGS.length}] ${item.slug} … `);
    try {
      const parsed = await fetchTask(item.slug);
      const subtopic = await ensureSubtopic(item.subKey);

      const exists = await prisma.task.findFirst({
        where: {
          topicId: topic.id,
          subtopicId: subtopic.id,
          source: SOURCE,
          condition: parsed.condition,
        },
        select: { id: true },
      });

      if (exists) {
        console.log("уже импортирована, пропуск");
        skipped += 1;
        continue;
      }

      const created = await prisma.task.create({
        data: {
          topicId: topic.id,
          subtopicId: subtopic.id,
          examNumber: config.examNumber,
          title: `${subtopic.title} — задача ${parsed.taskNumberLabel}`,
          condition: parsed.condition,
          difficulty: TaskDifficulty.MEDIUM,
          status: TaskStatus.DRAFT,
          answerType: AnswerType.NUMERIC,
          correctAnswer: parsed.correctAnswer,
          acceptedAnswers: [parsed.correctAnswer],
          solution: parsed.solution || null,
          hints: [],
          source: SOURCE,
          imageUrls: [],
          solutionImageUrls: [],
        },
        select: { id: true },
      });

      const localImages = await downloadAndStore(created.id, parsed.imageUrls);
      if (localImages.length > 0) {
        await prisma.task.update({
          where: { id: created.id },
          data: { imageUrls: localImages },
        });
      }

      console.log(
        `OK  → ответ ${parsed.correctAnswer}, картинок: ${localImages.length}`,
      );
      ok += 1;
    } catch (err) {
      console.log(`FAIL: ${err instanceof Error ? err.message : err}`);
      failed += 1;
    }

    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(
    `\nГотово. Импортировано: ${ok}, пропущено: ${skipped}, ошибок: ${failed}.`,
  );
  console.log(
    `Откройте /dashboard/admin/tasks — задачи будут в статусе DRAFT.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
