import type { HomeworkStatus, HomeworkTab } from "./getHomeworkData";

export type { HomeworkStatus, HomeworkTab };

export const TAB_CONFIG: {
  key: HomeworkTab;
  label: string;
  status: HomeworkStatus;
}[] = [
  { key: "new", label: "Новые", status: "new" },
  { key: "in_progress", label: "В процессе", status: "in_progress" },
  { key: "submitted", label: "Сданные", status: "submitted" },
  { key: "overdue", label: "Просроченные", status: "overdue" },
];
