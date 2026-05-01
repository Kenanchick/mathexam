import "dotenv/config";

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../lib/generated/prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in .env");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const counts = {
    taskAttempts: await prisma.taskAttempt.count(),
    homeworkTasks: await prisma.homeworkTask.count(),
    studentTopicProgress: await prisma.studentTopicProgress.count(),
    tasks: await prisma.task.count(),
    subtopics: await prisma.subtopic.count(),
    topics: await prisma.topic.count(),
  };

  console.log("Before wipe:", counts);

  await prisma.$transaction(async (tx) => {
    await tx.taskAttempt.deleteMany({});
    await tx.homeworkTask.deleteMany({});
    await tx.studentTopicProgress.deleteMany({});
    await tx.task.deleteMany({});
    await tx.subtopic.deleteMany({});
    await tx.topic.deleteMany({});
  });

  const after = {
    taskAttempts: await prisma.taskAttempt.count(),
    homeworkTasks: await prisma.homeworkTask.count(),
    studentTopicProgress: await prisma.studentTopicProgress.count(),
    tasks: await prisma.task.count(),
    subtopics: await prisma.subtopic.count(),
    topics: await prisma.topic.count(),
  };

  console.log("After wipe:", after);
  console.log("Done.");
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
