import { CalendarDays, CheckCircle2, Flag, Target } from "lucide-react";
import type { StudentDashboardView } from "../_lib/getStudentDashboard";
import { ContinueTrainingCard } from "./ContinueTrainingCard";
import { HomeworkPreviewCard } from "./HomeworkPreviewCard";
import { ProgressChartCard } from "./ProgressChartCard";
import { RecommendedTopics } from "./RecommendedTopics";

const iconByKind = {
  solved: CheckCircle2,
  accuracy: Target,
  streak: CalendarDays,
  goal: Flag,
};

const variantByKind = {
  solved: "blue",
  accuracy: "green",
  streak: "blue",
  goal: "orange",
} as const;

const variantStyles = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  orange: "bg-orange-50 text-orange-500",
};

export const MainContent = ({
  dashboard,
}: {
  dashboard: StudentDashboardView;
}) => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold">
          Привет, {dashboard.studentName}! Продолжим подготовку?
        </h1>

        <p className="text-sm text-gray-500">
          Сегодня у вас актуальная статистика по задачам и прогрессу.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {dashboard.stats.map((card) => {
          const Icon = iconByKind[card.kind];
          const variant = variantByKind[card.kind];

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${variantStyles[variant]}`}
                >
                  <Icon className="h-7 w-7" />
                </div>

                <div>
                  <h2 className="text-sm font-medium text-gray-500">
                    {card.title}
                  </h2>

                  <p className="mt-1 text-3xl font-bold leading-none text-gray-900">
                    {card.value}
                  </p>
                </div>
              </div>

              <p className="mt-5 pl-[72px] text-sm text-gray-500">
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-[1fr_1.15fr] gap-6">
        <ContinueTrainingCard training={dashboard.currentTraining} />
        <HomeworkPreviewCard homework={dashboard.homework} />
      </div>

      <div className="mt-6 grid grid-cols-[1fr_1.15fr] gap-6">
        <ProgressChartCard data={dashboard.progressChart} />
        <RecommendedTopics topics={dashboard.recommendedTopics} />
      </div>
    </div>
  );
};
