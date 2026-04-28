type Props = {
  percent: number;
  compact?: boolean;
};

export const Progress = ({ percent, compact = false }: Props) => {
  const viewSize = 120;
  const stroke = 10;
  const radius = viewSize / 2;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = 2 * Math.PI * normalizedRadius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div
      className={`flex h-full w-full flex-col rounded-2xl border border-gray-200 bg-white shadow-sm ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <p
        className={`shrink-0 font-semibold ${
          compact ? "text-sm" : "text-base"
        }`}
      >
        Прогресс подготовки
      </p>

      {/* Центр карточки */}
      <div className="flex flex-1 items-center">
        <div className={`flex items-center ${compact ? "gap-4" : "gap-5"}`}>
          <div
            className={`relative aspect-square shrink-0 w-2/5 ${
              compact ? "max-w-[110px]" : "max-w-[130px]"
            }`}
          >
            <svg
              viewBox={`0 0 ${viewSize} ${viewSize}`}
              width="100%"
              height="100%"
              className="-rotate-90"
            >
              <circle
                stroke="#e5e7eb"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />

              <circle
                stroke="#2563eb"
                fill="transparent"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset }}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-500"
              />
            </svg>

            <div
              className={`absolute inset-0 flex items-center justify-center font-bold ${
                compact ? "text-lg" : "text-xl"
              }`}
            >
              {percent}%
            </div>
          </div>

          <div
            className={`min-w-0 ${
              compact ? "space-y-2 text-xs" : "space-y-4 text-sm"
            }`}
          >
            <div>
              <p className="text-gray-500">Освоено тем</p>
              <p className="font-semibold">36 из 50</p>
            </div>

            <div>
              <p className="text-gray-500">Решено задач</p>
              <p className="font-semibold">842 из 1200</p>
            </div>
          </div>
        </div>
      </div>

      {/* Низ карточки */}
      <div className={`shrink-0 border-t ${compact ? "pt-2" : "pt-3"}`}>
        <button
          className={`font-medium text-blue-600 ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          Перейти к прогрессу →
        </button>
      </div>
    </div>
  );
};
