import type { StudentDashboardView } from "../_lib/getStudentDashboard";
import { HomeworkPreviewCard } from "./HomeworkPreviewCard";
import { RecommendedTopics } from "./RecommendedTopics";

export const MainContent = ({
  dashboard,
}: {
  dashboard: StudentDashboardView;
}) => {
  return (
    <div className="w-full">
      <div className="mb-4">
        <h1 className="text-[24px] font-semibold leading-tight text-gray-900">
          {dashboard.studentName}
        </h1>
        <p className="mt-1 text-[16px] text-gray-500">
          Подготовка к ЕГЭ · Профильная математика
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <HomeworkPreviewCard homework={dashboard.homework} />
        <RecommendedTopics topics={dashboard.recommendedTopics} />
      </div>
    </div>
  );
};
