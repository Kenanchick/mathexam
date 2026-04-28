import "dotenv/config";

import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../lib/generated/prisma/client";

import {
  UserRole,
  ClassMemberStatus,
  TaskDifficulty,
  TaskStatus,
  AnswerType,
  HomeworkStatus,
  HomeworkRecipientStatus,
  ActivityEventType,
} from "../lib/generated/prisma/enums";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in .env");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type SeedTask = {
  authorId: string;
  topicId: string;
  subtopicId?: string;
  examNumber: number;
  title: string;
  condition: string;
  difficulty: TaskDifficulty;
  status: TaskStatus;
  answerType: AnswerType;
  correctAnswer: string;
  acceptedAnswers: string[];
  solution?: string;
  hints: string[];
  source?: string;
  solveTimeSec?: number;
  publishedAt?: Date;
};

async function upsertTask(data: SeedTask) {
  const existingTask = await prisma.task.findFirst({
    where: {
      title: data.title,
      topicId: data.topicId,
      examNumber: data.examNumber,
    },
  });

  if (existingTask) {
    return prisma.task.update({
      where: {
        id: existingTask.id,
      },
      data,
    });
  }

  return prisma.task.create({
    data,
  });
}

async function seedHomework(
  teacherId: string,
  studentId: string,
  classroomId: string,
) {
  const now = new Date();
  const daysFromNow = (d: number) =>
    new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
  const daysAgo = (d: number) =>
    new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  const [trigTask1, trigTask2, derivTask1, derivTask2, stereoTask, paramTask, probTask] =
    await Promise.all([
      prisma.task.findFirst({ where: { title: "Тригонометрическое уравнение" } }),
      prisma.task.findFirst({ where: { title: "Тригонометрическое уравнение с косинусом" } }),
      prisma.task.findFirst({ where: { title: "Производная и точка максимума" } }),
      prisma.task.findFirst({ where: { title: "Точка минимума функции" } }),
      prisma.task.findFirst({ where: { title: "Объем пирамиды" } }),
      prisma.task.findFirst({ where: { title: "Квадратное уравнение с параметром" } }),
      prisma.task.findFirst({ where: { title: "Вероятность выбора шаров" } }),
    ]);

  async function ensureHomework(
    title: string,
    deadline: Date,
    taskIds: string[],
    recipientStatus: HomeworkRecipientStatus,
    answeredCount: number,
    submittedAt?: Date,
  ) {
    const existing = await prisma.homework.findFirst({
      where: { teacherId, title },
    });
    if (existing) {
      console.log(`Homework "${title}" already exists, skipping.`);
      return;
    }

    const homework = await prisma.homework.create({
      data: {
        teacherId,
        classroomId,
        title,
        description: `Домашнее задание: ${title}`,
        deadline,
        status: HomeworkStatus.PUBLISHED,
        publishedAt: new Date(),
        tasks: {
          create: taskIds.map((taskId, i) => ({
            taskId,
            order: i + 1,
            points: 1,
          })),
        },
      },
      include: { tasks: true },
    });

    const recipient = await prisma.homeworkRecipient.create({
      data: {
        homeworkId: homework.id,
        studentId,
        status: recipientStatus,
        startedAt:
          recipientStatus !== HomeworkRecipientStatus.ASSIGNED
            ? daysAgo(3)
            : undefined,
        submittedAt: submittedAt ?? undefined,
      },
    });

    const tasksToAnswer = homework.tasks.slice(0, answeredCount);
    for (const hwTask of tasksToAnswer) {
      await prisma.homeworkAnswer.create({
        data: {
          homeworkRecipientId: recipient.id,
          homeworkTaskId: hwTask.id,
          answer: "Демо-ответ",
          submittedAt:
            submittedAt ?? daysAgo(1),
          result:
            recipientStatus === HomeworkRecipientStatus.SUBMITTED
              ? "CORRECT"
              : "PENDING",
        },
      });
    }

    console.log(`Created homework: "${title}"`);
  }

  if (trigTask1 && trigTask2) {
    await ensureHomework(
      "Тригонометрия: базовый уровень",
      daysFromNow(2),
      [trigTask1.id, trigTask2.id],
      HomeworkRecipientStatus.IN_PROGRESS,
      1,
    );
  }

  if (derivTask1 && derivTask2) {
    await ensureHomework(
      "Производная",
      daysFromNow(4),
      [derivTask1.id, derivTask2.id],
      HomeworkRecipientStatus.ASSIGNED,
      0,
    );
  }

  if (stereoTask) {
    await ensureHomework(
      "Стереометрия",
      daysAgo(5),
      [stereoTask.id],
      HomeworkRecipientStatus.SUBMITTED,
      1,
      daysAgo(8),
    );
  }

  if (paramTask) {
    await ensureHomework(
      "Параметры",
      daysFromNow(7),
      [paramTask.id],
      HomeworkRecipientStatus.IN_PROGRESS,
      0,
    );
  }

  if (probTask) {
    await ensureHomework(
      "Вероятность",
      daysAgo(5),
      [probTask.id],
      HomeworkRecipientStatus.OVERDUE,
      0,
    );
  }
}

async function seedDemoTeacherDashboard() {
  console.log("Seeding demo teacher dashboard data...");

  const passwordHash = await bcrypt.hash("password123", 10);
  const now = new Date();
  const daysFromNow = (d: number) =>
    new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
  const daysAgo = (d: number) =>
    new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
  const hoursAgo = (h: number) =>
    new Date(now.getTime() - h * 60 * 60 * 1000);

  // ── Demo teacher ──────────────────────────────────────────────────────
  const demoTeacher = await prisma.user.upsert({
    where: { email: "teacher@mathexam.local" },
    update: {
      name: "Анна Сергеевна",
      role: UserRole.TEACHER,
      teacherProfile: {
        upsert: {
          create: { subject: "Профильная математика", city: "Санкт-Петербург" },
          update: { subject: "Профильная математика", city: "Санкт-Петербург" },
        },
      },
    },
    create: {
      email: "teacher@mathexam.local",
      name: "Анна Сергеевна",
      passwordHash,
      role: UserRole.TEACHER,
      teacherProfile: {
        create: { subject: "Профильная математика", city: "Санкт-Петербург" },
      },
    },
  });

  // ── Demo students ─────────────────────────────────────────────────────
  const studentsInput = [
    { email: "student1@mathexam.local",  name: "Иван Петров",        grade: "10А" },
    { email: "student2@mathexam.local",  name: "Мария Козлова",      grade: "10А" },
    { email: "student3@mathexam.local",  name: "Алексей Смирнов",    grade: "10А" },
    { email: "student4@mathexam.local",  name: "Екатерина Иванова",  grade: "10А" },
    { email: "student5@mathexam.local",  name: "Дмитрий Соколов",    grade: "10А" },
    { email: "student6@mathexam.local",  name: "Анастасия Новикова", grade: "11Б" },
    { email: "student7@mathexam.local",  name: "Артём Морозов",      grade: "11Б" },
    { email: "student8@mathexam.local",  name: "Полина Волкова",     grade: "11Б" },
    { email: "student9@mathexam.local",  name: "Никита Лебедев",     grade: "11Б" },
    { email: "student10@mathexam.local", name: "Юлия Зайцева",       grade: "11Б" },
    { email: "student11@mathexam.local", name: "Максим Орлов",       grade: "мини" },
    { email: "student12@mathexam.local", name: "Дарья Кузнецова",    grade: "мини" },
  ];

  const students = await Promise.all(
    studentsInput.map((s) =>
      prisma.user.upsert({
        where: { email: s.email },
        update: { name: s.name, role: UserRole.STUDENT },
        create: {
          email: s.email,
          name: s.name,
          passwordHash,
          role: UserRole.STUDENT,
          studentProfile: {
            create: {
              school: "Школа №57",
              grade: s.grade,
              city: "Санкт-Петербург",
              targetScore: 80,
              dailyGoalTasks: 8,
            },
          },
        },
      }),
    ),
  );

  // ── Classrooms ────────────────────────────────────────────────────────
  const classA = await prisma.classroom.upsert({
    where: { inviteCode: "DEMO-10A-PROF" },
    update: { title: "10А Профиль", isArchived: false, teacherId: demoTeacher.id },
    create: {
      teacherId: demoTeacher.id,
      title: "10А Профиль",
      description: "Профильная математика, 10 класс",
      inviteCode: "DEMO-10A-PROF",
    },
  });

  const classB = await prisma.classroom.upsert({
    where: { inviteCode: "DEMO-11B-EGE" },
    update: { title: "11Б ЕГЭ", isArchived: false, teacherId: demoTeacher.id },
    create: {
      teacherId: demoTeacher.id,
      title: "11Б ЕГЭ",
      description: "Подготовка к ЕГЭ по профильной математике",
      inviteCode: "DEMO-11B-EGE",
    },
  });

  const classMini = await prisma.classroom.upsert({
    where: { inviteCode: "DEMO-MINI-1" },
    update: { title: "Мини-группа №1", isArchived: false, teacherId: demoTeacher.id },
    create: {
      teacherId: demoTeacher.id,
      title: "Мини-группа №1",
      description: "Индивидуальные занятия, малая группа",
      inviteCode: "DEMO-MINI-1",
    },
  });

  // ── Class memberships ─────────────────────────────────────────────────
  const classroomMap: Record<string, string> = {
    [students[0].id]:  classA.id,
    [students[1].id]:  classA.id,
    [students[2].id]:  classA.id,
    [students[3].id]:  classA.id,
    [students[4].id]:  classA.id,
    [students[5].id]:  classB.id,
    [students[6].id]:  classB.id,
    [students[7].id]:  classB.id,
    [students[8].id]:  classB.id,
    [students[9].id]:  classB.id,
    [students[10].id]: classMini.id,
    [students[11].id]: classMini.id,
  };

  await Promise.all(
    Object.entries(classroomMap).map(([studentId, classroomId]) =>
      prisma.classStudent.upsert({
        where: {
          classroomId_studentId: { classroomId, studentId },
        },
        update: { status: ClassMemberStatus.ACTIVE, removedAt: null },
        create: { classroomId, studentId, status: ClassMemberStatus.ACTIVE },
      }),
    ),
  );

  // ── Tasks lookup ──────────────────────────────────────────────────────
  const [derivTask, trigTask, logTask, probTask] = await Promise.all([
    prisma.task.findFirst({ where: { title: "Производная и точка максимума" }, select: { id: true } }),
    prisma.task.findFirst({ where: { title: "Тригонометрическое уравнение" }, select: { id: true } }),
    prisma.task.findFirst({ where: { title: "Логарифмическое уравнение" }, select: { id: true } }),
    prisma.task.findFirst({ where: { title: "Вероятность выбора шаров" }, select: { id: true } }),
  ]);

  if (!derivTask || !trigTask || !logTask || !probTask) {
    console.warn("⚠ Some base tasks not found — run full seed first, then re-run.");
    return;
  }

  // ── Homeworks ─────────────────────────────────────────────────────────
  async function ensureDemoHomework(
    title: string,
    classroomId: string,
    deadline: Date,
    taskId: string,
  ): Promise<{ id: string }> {
    const existing = await prisma.homework.findFirst({
      where: { teacherId: demoTeacher.id, title },
      select: { id: true },
    });
    if (existing) {
      console.log(`  Homework "${title}" already exists, skipping.`);
      return existing;
    }
    const created = await prisma.homework.create({
      data: {
        teacherId: demoTeacher.id,
        classroomId,
        title,
        description: title,
        deadline,
        status: HomeworkStatus.PUBLISHED,
        publishedAt: daysAgo(7),
        tasks: { create: [{ taskId, order: 1, points: 1 }] },
      },
      select: { id: true },
    });
    console.log(`  Created homework: "${title}"`);
    return created;
  }

  const hw1 = await ensureDemoHomework(
    "Домашнее задание №4: Производная",
    classA.id,
    daysFromNow(2),
    derivTask.id,
  );
  const hw2 = await ensureDemoHomework(
    "Тренировка по задачам 1–6",
    classB.id,
    daysFromNow(7),
    trigTask.id,
  );
  const hw3 = await ensureDemoHomework(
    "Пробный вариант ЕГЭ",
    classB.id,
    daysAgo(5),
    logTask.id,
  );
  const hw4 = await ensureDemoHomework(
    "Задачи на вероятность",
    classMini.id,
    daysFromNow(10),
    probTask.id,
  );

  // ── HomeworkRecipients ────────────────────────────────────────────────
  type RecipientDef = {
    homeworkId: string;
    studentId: string;
    status: HomeworkRecipientStatus;
    progressPercent: number;
    scorePercent?: number;
    submittedAt?: Date;
    checkedAt?: Date;
  };

  const recipientDefs: RecipientDef[] = [
    // HW1 — "10А Профиль", дедлайн через 2 дня
    { homeworkId: hw1.id, studentId: students[0].id, status: HomeworkRecipientStatus.ASSIGNED,    progressPercent: 0 },
    { homeworkId: hw1.id, studentId: students[1].id, status: HomeworkRecipientStatus.IN_PROGRESS, progressPercent: 50 },
    { homeworkId: hw1.id, studentId: students[2].id, status: HomeworkRecipientStatus.SUBMITTED,   progressPercent: 100, submittedAt: hoursAgo(2) },
    { homeworkId: hw1.id, studentId: students[3].id, status: HomeworkRecipientStatus.CHECKING,    progressPercent: 100, submittedAt: daysAgo(1) },
    { homeworkId: hw1.id, studentId: students[4].id, status: HomeworkRecipientStatus.CHECKED,     progressPercent: 100, scorePercent: 78, submittedAt: daysAgo(3), checkedAt: daysAgo(2) },

    // HW2 — "11Б ЕГЭ", дедлайн через 7 дней
    { homeworkId: hw2.id, studentId: students[5].id, status: HomeworkRecipientStatus.ASSIGNED,    progressPercent: 0 },
    { homeworkId: hw2.id, studentId: students[6].id, status: HomeworkRecipientStatus.IN_PROGRESS, progressPercent: 30 },
    { homeworkId: hw2.id, studentId: students[7].id, status: HomeworkRecipientStatus.SUBMITTED,   progressPercent: 100, submittedAt: hoursAgo(18) },
    { homeworkId: hw2.id, studentId: students[8].id, status: HomeworkRecipientStatus.IN_PROGRESS, progressPercent: 60 },
    { homeworkId: hw2.id, studentId: students[9].id, status: HomeworkRecipientStatus.CHECKED,     progressPercent: 100, scorePercent: 85, submittedAt: daysAgo(2), checkedAt: daysAgo(1) },

    // HW3 — "11Б ЕГЭ", дедлайн 5 дней назад (просрочен)
    { homeworkId: hw3.id, studentId: students[5].id, status: HomeworkRecipientStatus.OVERDUE,     progressPercent: 0 },
    { homeworkId: hw3.id, studentId: students[6].id, status: HomeworkRecipientStatus.SUBMITTED,   progressPercent: 100, submittedAt: daysAgo(6) },
    { homeworkId: hw3.id, studentId: students[7].id, status: HomeworkRecipientStatus.CHECKED,     progressPercent: 100, scorePercent: 62, submittedAt: daysAgo(7), checkedAt: daysAgo(4) },
    { homeworkId: hw3.id, studentId: students[8].id, status: HomeworkRecipientStatus.RETURNED,    progressPercent: 40 },
    { homeworkId: hw3.id, studentId: students[9].id, status: HomeworkRecipientStatus.CHECKED,     progressPercent: 100, scorePercent: 91, submittedAt: daysAgo(8), checkedAt: daysAgo(3) },

    // HW4 — "Мини-группа №1", дедлайн через 10 дней
    { homeworkId: hw4.id, studentId: students[10].id, status: HomeworkRecipientStatus.IN_PROGRESS, progressPercent: 50 },
    { homeworkId: hw4.id, studentId: students[11].id, status: HomeworkRecipientStatus.SUBMITTED,   progressPercent: 100, submittedAt: hoursAgo(1) },
  ];

  for (const r of recipientDefs) {
    await prisma.homeworkRecipient.upsert({
      where: {
        homeworkId_studentId: { homeworkId: r.homeworkId, studentId: r.studentId },
      },
      update: {
        status: r.status,
        progressPercent: r.progressPercent,
        scorePercent: r.scorePercent ?? null,
        submittedAt: r.submittedAt ?? null,
        checkedAt: r.checkedAt ?? null,
      },
      create: {
        homeworkId: r.homeworkId,
        studentId: r.studentId,
        status: r.status,
        progressPercent: r.progressPercent,
        scorePercent: r.scorePercent ?? null,
        startedAt: r.status !== HomeworkRecipientStatus.ASSIGNED ? daysAgo(4) : null,
        submittedAt: r.submittedAt ?? null,
        checkedAt: r.checkedAt ?? null,
      },
    });
  }

  // ── ActivityLog ───────────────────────────────────────────────────────
  type ActivityDef = {
    type: ActivityEventType;
    studentIdx?: number;
    classroomId?: string;
    homeworkId?: string;
    createdAt: Date;
  };

  const activityDefs: ActivityDef[] = [
    { type: ActivityEventType.HOMEWORK_SUBMITTED, studentIdx: 11, homeworkId: hw4.id, createdAt: hoursAgo(1) },
    { type: ActivityEventType.HOMEWORK_SUBMITTED, studentIdx: 2,  homeworkId: hw1.id, createdAt: hoursAgo(2) },
    { type: ActivityEventType.HOMEWORK_SUBMITTED, studentIdx: 7,  homeworkId: hw2.id, createdAt: hoursAgo(18) },
    { type: ActivityEventType.HOMEWORK_CHECKING,  studentIdx: 3,  homeworkId: hw1.id, createdAt: daysAgo(1) },
    { type: ActivityEventType.HOMEWORK_CHECKED,   studentIdx: 9,  homeworkId: hw2.id, createdAt: daysAgo(1) },
    { type: ActivityEventType.HOMEWORK_CHECKED,   studentIdx: 4,  homeworkId: hw1.id, createdAt: daysAgo(2) },
    { type: ActivityEventType.HOMEWORK_RETURNED,  studentIdx: 8,  homeworkId: hw3.id, createdAt: daysAgo(3) },
    { type: ActivityEventType.HOMEWORK_CHECKED,   studentIdx: 9,  homeworkId: hw3.id, createdAt: daysAgo(3) },
    { type: ActivityEventType.HOMEWORK_CHECKED,   studentIdx: 7,  homeworkId: hw3.id, createdAt: daysAgo(4) },
    { type: ActivityEventType.HOMEWORK_OVERDUE,   studentIdx: 5,  homeworkId: hw3.id, classroomId: classB.id, createdAt: daysAgo(5) },
    { type: ActivityEventType.HOMEWORK_SUBMITTED, studentIdx: 6,  homeworkId: hw3.id, createdAt: daysAgo(6) },
  ];

  for (const def of activityDefs) {
    const studentId = def.studentIdx !== undefined ? students[def.studentIdx].id : undefined;

    const existing = await prisma.activityLog.findFirst({
      where: {
        teacherId: demoTeacher.id,
        type: def.type,
        studentId: studentId ?? null,
        homeworkId: def.homeworkId ?? null,
      },
    });
    if (existing) continue;

    await prisma.activityLog.create({
      data: {
        teacherId: demoTeacher.id,
        studentId: studentId ?? null,
        classroomId: def.classroomId ?? null,
        homeworkId: def.homeworkId ?? null,
        type: def.type,
        createdAt: def.createdAt,
      },
    });
  }

  console.log("Demo teacher dashboard data seeded.");
}

async function main() {
  console.log("Start seeding...");

  const teacher = await prisma.user.upsert({
    where: {
      email: "teacher@mathexam.ru",
    },
    update: {
      name: "Мария Сергеевна",
      role: UserRole.TEACHER,
      teacherProfile: {
        upsert: {
          create: {
            subject: "Профильная математика",
            city: "Москва",
          },
          update: {
            subject: "Профильная математика",
            city: "Москва",
          },
        },
      },
    },
    create: {
      email: "teacher@mathexam.ru",
      name: "Мария Сергеевна",
      passwordHash: "demo-password-hash",
      role: UserRole.TEACHER,
      teacherProfile: {
        create: {
          subject: "Профильная математика",
          city: "Москва",
        },
      },
    },
  });

  const student = await prisma.user.upsert({
    where: {
      email: "student@mathexam.ru",
    },
    update: {
      name: "Амина Магомедова",
      role: UserRole.STUDENT,
      studentProfile: {
        upsert: {
          create: {
            school: "Школа №125",
            grade: "11А",
            city: "Москва",
            targetScore: 85,
            dailyGoalTasks: 10,
          },
          update: {
            school: "Школа №125",
            grade: "11А",
            city: "Москва",
            targetScore: 85,
            dailyGoalTasks: 10,
          },
        },
      },
    },
    create: {
      email: "student@mathexam.ru",
      name: "Амина Магомедова",
      passwordHash: "demo-password-hash",
      role: UserRole.STUDENT,
      studentProfile: {
        create: {
          school: "Школа №125",
          grade: "11А",
          city: "Москва",
          targetScore: 85,
          dailyGoalTasks: 10,
        },
      },
    },
  });

  const classroom = await prisma.classroom.upsert({
    where: {
      inviteCode: "MATH-11A",
    },
    update: {
      title: "11А",
      description: "Группа подготовки к ЕГЭ по профильной математике",
      teacherId: teacher.id,
      isArchived: false,
    },
    create: {
      title: "11А",
      description: "Группа подготовки к ЕГЭ по профильной математике",
      inviteCode: "MATH-11A",
      teacherId: teacher.id,
    },
  });

  await prisma.classStudent.upsert({
    where: {
      classroomId_studentId: {
        classroomId: classroom.id,
        studentId: student.id,
      },
    },
    update: {
      status: ClassMemberStatus.ACTIVE,
      removedAt: null,
    },
    create: {
      classroomId: classroom.id,
      studentId: student.id,
      status: ClassMemberStatus.ACTIVE,
    },
  });

  const derivativeTopic = await prisma.topic.upsert({
    where: {
      slug: "proizvodnaya",
    },
    update: {
      title: "Производная",
      description: "Задачи на производную, касательную и исследование функции.",
      order: 1,
    },
    create: {
      title: "Производная",
      slug: "proizvodnaya",
      description: "Задачи на производную, касательную и исследование функции.",
      order: 1,
    },
  });

  const trigonometryTopic = await prisma.topic.upsert({
    where: {
      slug: "trigonometriya",
    },
    update: {
      title: "Тригонометрия",
      description:
        "Тригонометрические уравнения, преобразования и значения функций.",
      order: 2,
    },
    create: {
      title: "Тригонометрия",
      slug: "trigonometriya",
      description:
        "Тригонометрические уравнения, преобразования и значения функций.",
      order: 2,
    },
  });

  const stereometryTopic = await prisma.topic.upsert({
    where: {
      slug: "stereometriya",
    },
    update: {
      title: "Стереометрия",
      description: "Задачи по геометрии в пространстве.",
      order: 3,
    },
    create: {
      title: "Стереометрия",
      slug: "stereometriya",
      description: "Задачи по геометрии в пространстве.",
      order: 3,
    },
  });

  const derivativeSubtopic = await prisma.subtopic.upsert({
    where: {
      topicId_slug: {
        topicId: derivativeTopic.id,
        slug: "kasatelnaya",
      },
    },
    update: {
      title: "Касательная",
      description:
        "Задачи на уравнение касательной и геометрический смысл производной.",
      order: 1,
    },
    create: {
      topicId: derivativeTopic.id,
      title: "Касательная",
      slug: "kasatelnaya",
      description:
        "Задачи на уравнение касательной и геометрический смысл производной.",
      order: 1,
    },
  });

  await upsertTask({
    authorId: teacher.id,
    topicId: derivativeTopic.id,
    subtopicId: derivativeSubtopic.id,
    examNumber: 12,
    title: "Производная и точка максимума",
    condition: "Найдите точку максимума функции y = x^3 - 6x^2 + 9x + 1.",
    difficulty: TaskDifficulty.MEDIUM,
    status: TaskStatus.PUBLISHED,
    answerType: AnswerType.NUMERIC,
    correctAnswer: "1",
    acceptedAnswers: ["1", "1.0"],
    solution:
      "Найдем производную: y' = 3x^2 - 12x + 9. Приравняем к нулю и исследуем знак производной.",
    hints: [
      "Найдите производную функции.",
      "Приравняйте производную к нулю.",
      "Определите, где производная меняет знак с плюса на минус.",
    ],
    source: "Демо-задача MathExam",
    solveTimeSec: 300,
    publishedAt: new Date(),
  });

  await upsertTask({
    authorId: teacher.id,
    topicId: trigonometryTopic.id,
    examNumber: 13,
    title: "Тригонометрическое уравнение",
    condition: "Решите уравнение sin(x) = 1/2 на промежутке [0; 2π].",
    difficulty: TaskDifficulty.EASY,
    status: TaskStatus.PUBLISHED,
    answerType: AnswerType.TEXT,
    correctAnswer: "π/6; 5π/6",
    acceptedAnswers: ["π/6; 5π/6", "pi/6; 5pi/6"],
    solution: "На промежутке [0; 2π] синус равен 1/2 в точках π/6 и 5π/6.",
    hints: ["Вспомните значения синуса на единичной окружности."],
    source: "Демо-задача MathExam",
    solveTimeSec: 240,
    publishedAt: new Date(),
  });

  await upsertTask({
    authorId: teacher.id,
    topicId: stereometryTopic.id,
    examNumber: 14,
    title: "Объем пирамиды",
    condition:
      "Найдите объем пирамиды, если площадь основания равна 18, а высота равна 5.",
    difficulty: TaskDifficulty.EASY,
    status: TaskStatus.PUBLISHED,
    answerType: AnswerType.NUMERIC,
    correctAnswer: "30",
    acceptedAnswers: ["30", "30.0"],
    solution: "V = 1/3 * Sосн * h = 1/3 * 18 * 5 = 30.",
    hints: ["Используйте формулу объема пирамиды."],
    source: "Демо-задача MathExam",
    solveTimeSec: 180,
    publishedAt: new Date(),
  });

  const logarithmsTopic = await prisma.topic.upsert({
    where: {
      slug: "logarifmy",
    },
    update: {
      title: "Логарифмы",
      description: "Логарифмические уравнения и преобразования.",
      order: 4,
    },
    create: {
      title: "Логарифмы",
      slug: "logarifmy",
      description: "Логарифмические уравнения и преобразования.",
      order: 4,
    },
  });

  const exponentialTopic = await prisma.topic.upsert({
    where: {
      slug: "pokazatelnye-uravneniya",
    },
    update: {
      title: "Показательные уравнения",
      description: "Показательные уравнения и свойства степеней.",
      order: 5,
    },
    create: {
      title: "Показательные уравнения",
      slug: "pokazatelnye-uravneniya",
      description: "Показательные уравнения и свойства степеней.",
      order: 5,
    },
  });

  const probabilityTopic = await prisma.topic.upsert({
    where: {
      slug: "veroyatnost",
    },
    update: {
      title: "Вероятность",
      description: "Задачи на классическую вероятность.",
      order: 6,
    },
    create: {
      title: "Вероятность",
      slug: "veroyatnost",
      description: "Задачи на классическую вероятность.",
      order: 6,
    },
  });

  const parametersTopic = await prisma.topic.upsert({
    where: {
      slug: "parametry",
    },
    update: {
      title: "Параметры",
      description: "Уравнения и неравенства с параметром.",
      order: 7,
    },
    create: {
      title: "Параметры",
      slug: "parametry",
      description: "Уравнения и неравенства с параметром.",
      order: 7,
    },
  });

  const inequalitiesTopic = await prisma.topic.upsert({
    where: {
      slug: "neravenstva",
    },
    update: {
      title: "Неравенства",
      description: "Рациональные, показательные и логарифмические неравенства.",
      order: 8,
    },
    create: {
      title: "Неравенства",
      slug: "neravenstva",
      description: "Рациональные, показательные и логарифмические неравенства.",
      order: 8,
    },
  });

  await upsertTask({
    authorId: teacher.id,
    topicId: derivativeTopic.id,
    subtopicId: derivativeSubtopic.id,
    examNumber: 12,
    title: "Наибольшее значение функции",
    condition:
      "Найдите наибольшее значение функции y = 3x^3 - 12x^2 + 9x + 1 на отрезке [-2; 3].",
    difficulty: TaskDifficulty.MEDIUM,
    status: TaskStatus.PUBLISHED,
    answerType: AnswerType.NUMERIC,
    correctAnswer: "28",
    acceptedAnswers: ["28", "28.0"],
    solution:
      "Найдём производную функции: y' = 9x^2 - 24x + 9. Найдём критические точки и сравним значения функции на концах отрезка и в критических точках.",
    hints: [
      "Найдите производную функции.",
      "Приравняйте производную к нулю.",
      "Проверьте значения функции в критических точках и на концах отрезка.",
    ],
    source: "Демо-задача MathExam",
    solveTimeSec: 660,
    publishedAt: new Date(),
  });

  await upsertTask({
    authorId: teacher.id,
    topicId: derivativeTopic.id,
    subtopicId: derivativeSubtopic.id,
    examNumber: 12,
    title: "Точка минимума функции",
    condition: "Найдите точку минимума функции y = x^3 - 3x^2 - 9x + 5.",
    difficulty: TaskDifficulty.MEDIUM,
    status: TaskStatus.PUBLISHED,
    answerType: AnswerType.NUMERIC,
    correctAnswer: "3",
    acceptedAnswers: ["3", "3.0"],
    solution:
      "Найдём производную: y' = 3x^2 - 6x - 9. Решим уравнение y' = 0 и определим, в какой точке производная меняет знак с минуса на плюс.",
    hints: [
      "Найдите производную.",
      "Решите квадратное уравнение y' = 0.",
      "Точка минимума там, где производная меняет знак с минуса на плюс.",
    ],
    source: "Демо-задача MathExam",
    solveTimeSec: 420,
    publishedAt: new Date(),
  });

  await upsertTask({
    authorId: teacher.id,
    topicId: trigonometryTopic.id,
    examNumber: 13,
    title: "Тригонометрическое уравнение с косинусом",
    condition: "Решите уравнение 2cos(x) - 1 = 0 на промежутке [0; 2π].",
    difficulty: TaskDifficulty.EASY,
    status: TaskStatus.PUBLISHED,
    answerType: AnswerType.TEXT,
    correctAnswer: "π/3; 5π/3",
    acceptedAnswers: ["π/3; 5π/3", "pi/3; 5pi/3", "π/3, 5π/3", "pi/3, 5pi/3"],
    solution:
      "Из уравнения 2cos(x) - 1 = 0 получаем cos(x) = 1/2. На промежутке [0; 2π] это x = π/3 и x = 5π/3.",
    hints: [
      "Перенесите 1 вправо и разделите на 2.",
      "Вспомните, где cos(x) = 1/2 на единичной окружности.",
    ],
    source: "Демо-задача MathExam",
    solveTimeSec: 240,
    publishedAt: new Date(),
  });

  await upsertTask({
    authorId: teacher.id,
    topicId: logarithmsTopic.id,
    examNumber: 13,
    title: "Логарифмическое уравнение",
    condition: "Решите уравнение log₂(x - 1) = 3.",
    difficulty: TaskDifficulty.EASY,
    status: TaskStatus.PUBLISHED,
    answerType: AnswerType.NUMERIC,
    correctAnswer: "9",
    acceptedAnswers: ["9", "9.0"],
    solution:
      "По определению логарифма: log₂(x - 1) = 3 означает x - 1 = 2^3. Тогда x - 1 = 8, откуда x = 9.",
    hints: [
      "Переведите логарифмическое уравнение в показательную форму.",
      "Не забудьте про область определения: x - 1 > 0.",
    ],
    source: "Демо-задача MathExam",
    solveTimeSec: 180,
    publishedAt: new Date(),
  });

  await upsertTask({
    authorId: teacher.id,
    topicId: exponentialTopic.id,
    examNumber: 13,
    title: "Показательное уравнение",
    condition: "Решите уравнение 3^(x + 1) = 81.",
    difficulty: TaskDifficulty.EASY,
    status: TaskStatus.PUBLISHED,
    answerType: AnswerType.NUMERIC,
    correctAnswer: "3",
    acceptedAnswers: ["3", "3.0"],
    solution:
      "Представим 81 как степень тройки: 81 = 3^4. Тогда 3^(x + 1) = 3^4, значит x + 1 = 4, откуда x = 3.",
    hints: [
      "Представьте 81 как степень числа 3.",
      "Если основания равны, приравняйте показатели.",
    ],
    source: "Демо-задача MathExam",
    solveTimeSec: 160,
    publishedAt: new Date(),
  });

  await upsertTask({
    authorId: teacher.id,
    topicId: probabilityTopic.id,
    examNumber: 4,
    title: "Вероятность выбора шаров",
    condition:
      "В урне 7 белых и 5 чёрных шаров. Из урны наугад вынимают один шар. Найдите вероятность того, что шар окажется белым.",
    difficulty: TaskDifficulty.EASY,
    status: TaskStatus.PUBLISHED,
    answerType: AnswerType.NUMERIC,
    correctAnswer: "0.583",
    acceptedAnswers: ["7/12", "0.583", "0.58", "0,583", "0,58"],
    solution:
      "Всего шаров 7 + 5 = 12. Благоприятных исходов 7. Вероятность равна 7/12 ≈ 0.583.",
    hints: [
      "Найдите общее количество шаров.",
      "Разделите количество белых шаров на общее количество шаров.",
    ],
    source: "Демо-задача MathExam",
    solveTimeSec: 120,
    publishedAt: new Date(),
  });

  await upsertTask({
    authorId: teacher.id,
    topicId: parametersTopic.id,
    examNumber: 17,
    title: "Квадратное уравнение с параметром",
    condition:
      "Найдите все значения параметра a, при которых уравнение x^2 - 2(a + 1)x + 2a = 0 имеет ровно один корень.",
    difficulty: TaskDifficulty.HARD,
    status: TaskStatus.PUBLISHED,
    answerType: AnswerType.TEXT,
    correctAnswer: "a = 1",
    acceptedAnswers: ["1", "a=1", "a = 1"],
    solution:
      "Квадратное уравнение имеет ровно один корень, когда дискриминант равен нулю. Составим D и решим уравнение D = 0 относительно a.",
    hints: [
      "Для квадратного уравнения ровно один корень означает D = 0.",
      "Найдите дискриминант и приравняйте его к нулю.",
    ],
    source: "Демо-задача MathExam",
    solveTimeSec: 900,
    publishedAt: new Date(),
  });

  await upsertTask({
    authorId: teacher.id,
    topicId: inequalitiesTopic.id,
    examNumber: 6,
    title: "Рациональное неравенство",
    condition: "Решите неравенство (x - 2)(x + 3)(x - 5) ≤ 0.",
    difficulty: TaskDifficulty.MEDIUM,
    status: TaskStatus.PUBLISHED,
    answerType: AnswerType.TEXT,
    correctAnswer: "(-∞; -3] ∪ [2; 5]",
    acceptedAnswers: [
      "(-∞; -3] ∪ [2; 5]",
      "(-inf; -3] U [2; 5]",
      "x <= -3 или 2 <= x <= 5",
    ],
    solution:
      "Отметим нули выражения: x = -3, x = 2, x = 5. Разобьем числовую прямую на промежутки и определим знак произведения на каждом промежутке.",
    hints: [
      "Найдите нули каждого множителя.",
      "Используйте метод интервалов.",
      "Так как знак ≤ 0, включите корни в ответ.",
    ],
    source: "Демо-задача MathExam",
    solveTimeSec: 420,
    publishedAt: new Date(),
  });
  await seedHomework(teacher.id, student.id, classroom.id);
  await seedDemoTeacherDashboard();
  console.log("Seeding finished.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
