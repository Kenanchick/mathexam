import { z } from "zod";

export const createHomeworkSchema = z.object({
  title: z
    .string()
    .min(1, "Введите название")
    .max(200, "Максимум 200 символов"),
  description: z.string().max(2000, "Максимум 2000 символов").optional(),
  classroomId: z.string().min(1, "Выберите класс"),
  deadlineAt: z.string().min(1, "Укажите дедлайн"),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  recipientMode: z.enum(["all", "selected", "individual"]),
  selectedStudentIds: z.array(z.string()),
  taskIds: z.array(z.string()).min(1, "Добавьте хотя бы одну задачу"),
  settings: z.object({
    allowRetries: z.boolean(),
    showSolutionAfterSubmit: z.boolean(),
  }),
});

export type CreateHomeworkInput = z.infer<typeof createHomeworkSchema>;
