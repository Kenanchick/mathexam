import "dotenv/config";

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const examNumber = Number(process.argv[2] ?? "7");

  const all = await prisma.task.findMany({
    where: { examNumber },
    select: {
      id: true,
      title: true,
      condition: true,
      source: true,
      correctAnswer: true,
    },
  });

  const originals = all.filter((t) => t.source && !t.source.includes("вариант"));
  const variants = all.filter((t) => t.source && t.source.includes("вариант"));

  const originalConditions = new Set(originals.map((o) => o.condition.trim()));
  const conditionCounts = new Map<string, number>();
  for (const v of variants) {
    const k = v.condition.trim();
    conditionCounts.set(k, (conditionCounts.get(k) ?? 0) + 1);
  }

  const exactDupesOfOriginal = variants.filter((v) =>
    originalConditions.has(v.condition.trim()),
  ).length;

  const internalDupes = Array.from(conditionCounts.values())
    .filter((n) => n > 1)
    .reduce((acc, n) => acc + (n - 1), 0);

  const groups = new Map<string, string[]>();
  for (const v of variants) {
    const m = v.title?.match(/^(.*) — вариант \d+$/);
    if (!m) continue;
    const base = m[1];
    const arr = groups.get(base) ?? [];
    arr.push(v.condition.trim());
    groups.set(base, arr);
  }
  let withinGroupDupes = 0;
  for (const arr of groups.values()) {
    const seen = new Set<string>();
    for (const c of arr) {
      if (seen.has(c)) withinGroupDupes += 1;
      else seen.add(c);
    }
  }

  console.log(`examNumber=${examNumber}`);
  console.log(`  оригиналов: ${originals.length}`);
  console.log(`  вариантов: ${variants.length}`);
  console.log(`  вариантов = оригинал: ${exactDupesOfOriginal}`);
  console.log(`  вариантов с одинаковым condition (всего пересечений): ${internalDupes}`);
  console.log(`  дублей внутри одной группы (одного источника): ${withinGroupDupes}`);
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
