import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../lib/generated/prisma/client";
import {
  TaskDifficulty,
  TaskStatus,
  AnswerType,
} from "../lib/generated/prisma/enums";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in .env");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type TaskJson = {
  slug: string;
  title: string;
  condition: string;
  difficulty?: keyof typeof TaskDifficulty;
  answerType?: keyof typeof AnswerType;
  correctAnswer: string;
  acceptedAnswers?: string[];
  solution?: string;
  hints?: string[];
  source?: string;
  solveTimeSec?: number;
  imageUrls?: string[];
  solutionImageUrls?: string[];
  status?: keyof typeof TaskStatus;
};

type SubtopicJson = {
  title: string;
  slug: string;
  description?: string;
  order: number;
  tasks: TaskJson[];
};

type CatalogJson = {
  topic: {
    title: string;
    slug: string;
    description?: string;
    examNumber: number;
    order: number;
  };
  subtopics: SubtopicJson[];
};

async function importCatalog(filePath: string) {
  const raw = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(raw) as CatalogJson;

  const topic = await prisma.topic.upsert({
    where: { slug: data.topic.slug },
    update: {
      title: data.topic.title,
      description: data.topic.description,
      order: data.topic.order,
    },
    create: {
      title: data.topic.title,
      slug: data.topic.slug,
      description: data.topic.description,
      order: data.topic.order,
    },
  });

  let createdTasks = 0;
  let updatedTasks = 0;

  for (const sub of data.subtopics) {
    const subtopic = await prisma.subtopic.upsert({
      where: {
        topicId_slug: { topicId: topic.id, slug: sub.slug },
      },
      update: {
        title: sub.title,
        description: sub.description,
        order: sub.order,
      },
      create: {
        topicId: topic.id,
        title: sub.title,
        slug: sub.slug,
        description: sub.description,
        order: sub.order,
      },
    });

    for (const task of sub.tasks) {
      const existing = await prisma.task.findFirst({
        where: {
          topicId: topic.id,
          subtopicId: subtopic.id,
          title: task.title,
          examNumber: data.topic.examNumber,
        },
        select: { id: true },
      });

      const taskData = {
        topicId: topic.id,
        subtopicId: subtopic.id,
        examNumber: data.topic.examNumber,
        title: task.title,
        condition: task.condition,
        imageUrls: task.imageUrls ?? [],
        solutionImageUrls: task.solutionImageUrls ?? [],
        difficulty: TaskDifficulty[task.difficulty ?? "MEDIUM"],
        status: TaskStatus[task.status ?? "PUBLISHED"],
        answerType: AnswerType[task.answerType ?? "NUMERIC"],
        correctAnswer: task.correctAnswer,
        acceptedAnswers: task.acceptedAnswers ?? [task.correctAnswer],
        solution: task.solution ?? null,
        hints: task.hints ?? [],
        source: task.source ?? null,
        solveTimeSec: task.solveTimeSec ?? null,
        publishedAt:
          (task.status ?? "PUBLISHED") === "PUBLISHED" ? new Date() : null,
      };

      if (existing) {
        await prisma.task.update({
          where: { id: existing.id },
          data: taskData,
        });
        updatedTasks += 1;
      } else {
        await prisma.task.create({ data: taskData });
        createdTasks += 1;
      }
    }
  }

  console.log(
    `[${path.basename(filePath)}] topic="${data.topic.title}" subtopics=${data.subtopics.length} tasks created=${createdTasks} updated=${updatedTasks}`,
  );
}

async function main() {
  const dir = path.resolve(process.cwd(), "data/tasks");
  const entries = await fs.readdir(dir);
  const files = entries
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => path.join(dir, f));

  if (files.length === 0) {
    console.log("No catalog files found in data/tasks/");
    return;
  }

  for (const file of files) {
    await importCatalog(file);
  }

  console.log("Import done.");
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
