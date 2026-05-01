import Link from "next/link";
import { HomeworkStatusBadge } from "./HomeworkStatusBadge";
import { HomeworkProgress } from "./HomeworkProgress";
import type { HomeworkItemView } from "../_lib/getHomeworkData";

interface HomeworkTableProps {
  items: HomeworkItemView[];
}

const actionLabel: Record<HomeworkItemView["status"], string> = {
  new: "Начать",
  in_progress: "Продолжить",
  submitted: "Результат",
  overdue: "Продолжить",
};

const columns = [
  "Название",
  "Учитель",
  "Кол-во задач",
  "Дедлайн",
  "Прогресс",
  "Статус",
  "Действие",
];

export const HomeworkTable = ({ items }: HomeworkTableProps) => {
  if (items.length === 0) {
    return (
      <div className="rounded border border-gray-200 bg-white py-14 text-center">
        <p className="text-[15px] text-gray-400">Заданий в этой категории нет</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-5 py-3 text-left text-[13px] font-medium uppercase tracking-wide text-gray-500"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr
                key={item.id}
                className="transition hover:bg-gray-50/60"
              >
                <td className="px-5 py-4">
                  <p className="text-[16px] font-semibold leading-snug text-gray-900">
                    {item.title}
                  </p>
                  {item.status === "submitted" && item.submittedDate && (
                    <p className="mt-0.5 text-[13px] text-emerald-600">
                      Сдано {item.submittedDate}
                    </p>
                  )}
                  {item.status === "overdue" && (
                    <p className="mt-0.5 text-[13px] text-red-500">
                      {item.deadline} (просрочено)
                    </p>
                  )}
                </td>
                <td className="px-5 py-4 text-[15px] text-gray-600">
                  {item.teacher}
                </td>
                <td className="px-5 py-4 text-[15px] text-gray-600">
                  {item.tasksTotal} задач
                </td>
                <td className="px-5 py-4">
                  <span
                    className={
                      item.status === "overdue"
                        ? "text-[15px] text-red-500"
                        : "text-[15px] text-gray-600"
                    }
                  >
                    {item.deadline}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <HomeworkProgress
                    completed={item.tasksCompleted}
                    total={item.tasksTotal}
                    overdue={item.status === "overdue"}
                  />
                </td>
                <td className="px-5 py-4">
                  <HomeworkStatusBadge status={item.status} />
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/dashboard/student/homework/${item.id}`}
                    className="inline-flex h-9 items-center justify-center rounded border border-gray-300 px-4 text-[14px] font-medium text-gray-900 transition hover:bg-gray-100"
                  >
                    {actionLabel[item.status]}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-200 bg-gray-50 px-5 py-2.5">
        <p className="text-[13px] text-gray-400">
          Показано {items.length}{" "}
          {items.length === 1 ? "задание" : "заданий"}
        </p>
      </div>
    </div>
  );
};
