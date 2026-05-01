import { prisma } from "@/lib/prisma";

export type TopicOption = {
  id: string;
  title: string;
  slug: string;
  subtopics: { id: string; title: string; slug: string }[];
};

export async function getTopicsAndSubtopics(): Promise<TopicOption[]> {
  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      subtopics: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, slug: true },
      },
    },
  });

  return topics;
}
