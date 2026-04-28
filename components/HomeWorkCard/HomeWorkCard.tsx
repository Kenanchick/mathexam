export const HomeworkCard = ({ compact = false }) => {
  return (
    <div
      className={`flex h-full w-full flex-col justify-between rounded-2xl border border-gray-200 bg-white shadow-sm ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div>
        <h3
          className={`font-semibold ${
            compact ? "mb-1 text-sm" : "mb-1 text-base"
          }`}
        >
          Домашнее задание
        </h3>

        <p
          className={`text-gray-500 ${
            compact ? "mb-3 text-xs" : "mb-4 text-sm"
          }`}
        >
          Срок: 31 мая, 23:59
        </p>

        <div
          className={`${
            compact ? "mb-3 space-y-1.5 text-xs" : "mb-5 space-y-2 text-sm"
          }`}
        >
          <p>
            <span className="text-gray-500">Тема: </span>
            <span className="font-medium text-gray-500">Производная</span>
          </p>

          <p>
            <span className="text-gray-500">Задания: </span>
            <span className="font-medium text-gray-500">
              №15 (1–6), №15 (7–12)
            </span>
          </p>
        </div>

        <div className={compact ? "mb-3" : "mb-5"}>
          <span
            className={`rounded-full bg-green-100 font-medium text-green-700 ${
              compact ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
            }`}
          >
            Выполнено
          </span>
        </div>

        <p
          className={`text-gray-500 ${
            compact ? "mb-3 text-xs" : "mb-4 text-sm"
          }`}
        >
          Проверено: 28 мая, 14:32
        </p>
      </div>

      <div className={`border-t ${compact ? "pt-3" : "pt-4"}`}>
        <button
          className={`font-medium text-blue-600 ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          Смотреть задание →
        </button>
      </div>
    </div>
  );
};
