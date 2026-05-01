import { z } from "zod";

export const taskFormSchema = z
  .object({
    examNumber: z.coerce.number().int().min(1).max(19),
    topicMode: z.enum(["existing", "new"]),
    topicId: z.string().uuid().optional(),
    newTopicTitle: z.string().trim().min(2).max(200).optional(),
    newTopicSlug: z
      .string()
      .trim()
      .min(2)
      .max(120)
      .regex(/^[a-z0-9-]+$/u, "Slug: только латиница, цифры и дефис")
      .optional(),
    newTopicDescription: z.string().trim().max(500).optional(),
    newTopicOrder: z.coerce.number().int().min(1).max(100).optional(),

    subtopicMode: z.enum(["none", "existing", "new"]),
    subtopicId: z.string().uuid().optional(),
    newSubtopicTitle: z.string().trim().min(2).max(200).optional(),
    newSubtopicSlug: z
      .string()
      .trim()
      .min(2)
      .max(120)
      .regex(/^[a-z0-9-]+$/u)
      .optional(),
    newSubtopicDescription: z.string().trim().max(500).optional(),
    newSubtopicOrder: z.coerce.number().int().min(1).max(100).optional(),

    title: z.string().trim().max(300).optional().or(z.literal("")),
    condition: z.string().trim().min(5).max(5000),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    answerType: z.enum(["SHORT", "NUMERIC", "TEXT"]),
    correctAnswer: z.string().trim().min(1).max(500),
    acceptedAnswers: z.array(z.string().trim().min(1).max(500)).max(20),
    hints: z.array(z.string().trim().min(1).max(1000)).max(10),
    solution: z.string().trim().max(10000).optional().or(z.literal("")),
    source: z.string().trim().max(300).optional().or(z.literal("")),
    solveTimeSec: z.coerce.number().int().min(10).max(7200).optional(),

    imageUrls: z.array(z.string().min(1).max(500)).max(10),
    solutionImageUrls: z.array(z.string().min(1).max(500)).max(10),

    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  })
  .superRefine((data, ctx) => {
    if (data.topicMode === "existing" && !data.topicId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["topicId"],
        message: "Выберите тему",
      });
    }
    if (data.topicMode === "new") {
      if (!data.newTopicTitle) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["newTopicTitle"],
          message: "Название темы обязательно",
        });
      }
      if (!data.newTopicSlug) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["newTopicSlug"],
          message: "Slug темы обязателен",
        });
      }
    }
    if (data.subtopicMode === "existing" && !data.subtopicId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subtopicId"],
        message: "Выберите подтему",
      });
    }
    if (data.subtopicMode === "new") {
      if (!data.newSubtopicTitle) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["newSubtopicTitle"],
          message: "Название подтемы обязательно",
        });
      }
      if (!data.newSubtopicSlug) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["newSubtopicSlug"],
          message: "Slug подтемы обязателен",
        });
      }
    }
  });

export type TaskFormInput = z.infer<typeof taskFormSchema>;
