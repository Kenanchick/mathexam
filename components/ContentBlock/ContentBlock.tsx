import { Progress } from "@/components/Progress/Progress";
import { TopicAndTasks } from "@/components/TopicAndTasks/TopicAndTasks";
import { WeeklyResults } from "@/components/WeeklyResults/WeeklyResults";
import { HomeworkCard } from "@/components/HomeWorkCard/HomeWorkCard";

type Props = {
  compact?: boolean;
};

export const ContentBlock = ({ compact = false }: Props) => {
  return (
    <div
      className={`w-full rounded-2xl border border-gray-200 bg-white/70 shadow-[0_8px_32px_rgba(15,23,42,0.08)] ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div
        className={`grid w-full grid-cols-5 items-stretch ${
          compact ? "gap-3" : "gap-4"
        }`}
      >
        <div className="col-span-2 h-full">
          <Progress percent={72} compact={compact} />
        </div>

        <div className="col-span-3 h-full">
          <TopicAndTasks compact={compact} />
        </div>

        <div className="col-span-3 h-full">
          <WeeklyResults compact={compact} />
        </div>

        <div className="col-span-2 h-full">
          <HomeworkCard compact={compact} />
        </div>
      </div>
    </div>
  );
};
