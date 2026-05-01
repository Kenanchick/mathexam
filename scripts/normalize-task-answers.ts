import "dotenv/config";

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../lib/generated/prisma/client";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL не задан");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function normalize(s: string): string {
  return s.replace(/[—–]/g, "-");
}

async function main() {
  const tasks = await prisma.task.findMany({
    select: { id: true, correctAnswer: true, acceptedAnswers: true },
  });

  let touched = 0;
  for (const task of tasks) {
    const newCorrect = normalize(task.correctAnswer);
    const newAccepted = task.acceptedAnswers.map(normalize);

    const correctChanged = newCorrect !== task.correctAnswer;
    const acceptedChanged =
      newAccepted.length !== task.acceptedAnswers.length ||
      newAccepted.some((v, i) => v !== task.acceptedAnswers[i]);

    if (!correctChanged && !acceptedChanged) continue;

    await prisma.task.update({
      where: { id: task.id },
      data: {
        correctAnswer: newCorrect,
        acceptedAnswers: newAccepted,
      },
    });
    touched += 1;
  }

  console.log(`Обновлено задач: ${touched} из ${tasks.length}.`);
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
