type Props = {
  compact?: boolean;
};

export const TopicAndTasks = ({ compact = false }: Props) => {
  const badgeClass = `inline-flex shrink-0 whitespace-nowrap rounded-full text-xs ${
    compact ? "px-2 py-0.5" : "px-2.5 py-1"
  }`;

  const rowClass = `flex items-center justify-between ${compact ? "gap-3 py-2" : "gap-4 py-2.5"}`;
  const numClass = `text-gray-500 ${compact ? "text-xs" : "text-sm"}`;
  const labelClass = `truncate ${compact ? "text-xs" : "text-sm"}`;
  const countClass = `min-w-[3ch] text-right text-gray-500 ${compact ? "text-xs" : "text-sm"}`;

  return (
    <div
      className={`h-full w-full rounded-2xl border border-gray-200 bg-white shadow-sm ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className={`flex items-center justify-between ${compact ? "mb-3" : "mb-4"}`}>
        <p className={`font-semibold ${compact ? "text-sm" : "text-base"}`}>Темы и задачи</p>
        <button className={`font-medium text-blue-600 ${compact ? "text-xs" : "text-sm"}`}>
          Все темы
        </button>
      </div>

      <ul className="divide-y divide-gray-100">
        <li className={rowClass}>
          <div className="flex min-w-0 items-center gap-1.5">
            <span className={numClass}>13.</span>
            <span className={labelClass}>Тригонометрия</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`${badgeClass} bg-green-100 text-green-700`}>Освоено</span>
            <span className={countClass}>24/24</span>
          </div>
        </li>

        <li className={rowClass}>
          <div className="flex min-w-0 items-center gap-1.5">
            <span className={numClass}>15.</span>
            <span className={labelClass}>Производная</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`${badgeClass} bg-blue-100 text-blue-700`}>В процессе</span>
            <span className={countClass}>18/28</span>
          </div>
        </li>

        <li className={rowClass}>
          <div className="flex min-w-0 items-center gap-1.5">
            <span className={numClass}>17.</span>
            <span className={labelClass}>Экономическая задача</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`${badgeClass} bg-blue-100 text-blue-700`}>В процессе</span>
            <span className={countClass}>12/20</span>
          </div>
        </li>

        <li className={rowClass}>
          <div className="flex min-w-0 items-center gap-1.5">
            <span className={numClass}>18.</span>
            <span className={labelClass}>Стереометрия</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={`${badgeClass} bg-gray-100 text-gray-600`}>Не начато</span>
            <span className={countClass}>0/30</span>
          </div>
        </li>
      </ul>

      <div className={`border-t ${compact ? "mt-2 pt-2" : "mt-3 pt-3"}`}>
        <button className={`font-medium text-blue-600 ${compact ? "text-xs" : "text-sm"}`}>
          Ко всем темам →
        </button>
      </div>
    </div>
  );
};
