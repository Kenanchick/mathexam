import type { ActivityEventType } from "@/lib/generated/prisma/enums";

type ActivityForMessage = {
  type: ActivityEventType;
  student: { name: string | null } | null;
  homework: { title: string } | null;
  classroom: { title: string } | null;
};

export function getActivityMessage(activity: ActivityForMessage): string {
  const studentName = activity.student?.name ?? "Ученик";
  const homeworkTitle = activity.homework?.title;
  const classroomTitle = activity.classroom?.title;

  switch (activity.type) {
    case "HOMEWORK_SUBMITTED":
      return homeworkTitle
        ? `Отправлена работа: ${studentName} — «${homeworkTitle}»`
        : `Отправлена работа: ${studentName}`;

    case "HOMEWORK_CHECKING":
      return homeworkTitle
        ? `На проверке: ${studentName} — «${homeworkTitle}»`
        : `На проверке: ${studentName}`;

    case "HOMEWORK_CHECKED":
      return homeworkTitle
        ? `Проверена работа: ${studentName} — «${homeworkTitle}»`
        : `Проверена работа: ${studentName}`;

    case "HOMEWORK_RETURNED":
      return homeworkTitle
        ? `Возвращено на доработку: ${studentName} — «${homeworkTitle}»`
        : `Возвращено на доработку: ${studentName}`;

    case "HOMEWORK_OVERDUE":
      return homeworkTitle
        ? `Просрочено ДЗ: ${studentName} — «${homeworkTitle}»`
        : `Просрочено ДЗ: ${studentName}`;

    case "STUDENT_JOINED":
      return classroomTitle
        ? `Ученик вступил в класс: ${studentName} — «${classroomTitle}»`
        : `Ученик вступил в класс: ${studentName}`;

    default: {
      const _exhaustive: never = activity.type;
      return _exhaustive;
    }
  }
}
