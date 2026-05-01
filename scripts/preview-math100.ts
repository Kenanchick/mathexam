import * as cheerio from "cheerio";

const SLUGS = [
  "ege_profil_2_1-1",
  "ege_profil_2_1-2",
  "ege_profil_2_2-1",
  "ege_profil_2_3-1",
  "ege_profil_2_4-1",
  "ege_profil_2_4-2",
  "ege_profil_2_5-1",
  "ege_profil_2_5-2",
  "ege_profil_2_6-1",
  "ege_profil_2_7-1",
];

function cleanText(s: string): string {
  return s
    .replace(/ /g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchTask(slug: string) {
  const url = `https://math100.ru/${slug}/`;
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const title = $("title").text().replace(/ — math100\.ru$/, "").trim();

  const article = $(".post-content, .fusion-text, article").first();
  const fullText = cleanText(article.length ? article.text() : $("body").text());

  const conditionMatch = fullText.match(
    /Задача\s+\d+\.\s*([\s\S]*?)\s*ОТВЕТ\s*:\s*([^\n.]+)/i,
  );
  const condition = conditionMatch?.[1]?.trim() ?? null;
  const answer = conditionMatch?.[2]?.trim() ?? null;

  const images: string[] = [];
  $("img.size-full, .post-content img, article img")
    .toArray()
    .forEach((el) => {
      const src = $(el).attr("src");
      if (
        src &&
        src.includes("math100.ru/wp-content/uploads") &&
        !images.includes(src)
      ) {
        images.push(src);
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
  const solution = cleanText(solutionRaw);

  return { slug, title, condition, answer, images, solution };
}

async function main() {
  for (const slug of SLUGS) {
    try {
      const t = await fetchTask(slug);
      console.log("=".repeat(80));
      console.log(`URL    : https://math100.ru/${slug}/`);
      console.log(`TITLE  : ${t.title}`);
      console.log(
        `COND   : ${t.condition ? t.condition.slice(0, 240) : "(не извлечено)"}`,
      );
      console.log(`ANSWER : ${t.answer ?? "(не извлечено)"}`);
      console.log(`IMG(s) : ${t.images.length} шт.`);
      for (const img of t.images.slice(0, 3)) console.log(`         ${img}`);
      console.log(
        `SOLVE  : ${t.solution ? t.solution.slice(0, 320) + (t.solution.length > 320 ? "..." : "") : "(не извлечено)"}`,
      );
      console.log();
    } catch (err) {
      console.log(`FAIL ${slug}: ${err instanceof Error ? err.message : err}`);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
