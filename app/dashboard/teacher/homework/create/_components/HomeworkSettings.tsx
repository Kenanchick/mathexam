"use client";

export type HomeworkSettingsValues = {
  allowRetries: boolean;
  showSolutionAfterSubmit: boolean;
  // TODO: add to schema — maxAttempts, showAnswerAfter, shuffleTasks, countInStats
};

interface HomeworkSettingsProps {
  settings: HomeworkSettingsValues;
  onUpdate: (updates: Partial<HomeworkSettingsValues>) => void;
}

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? "bg-blue-600" : "bg-gray-200"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

export const HomeworkSettings = ({
  settings,
  onUpdate,
}: HomeworkSettingsProps) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-base font-semibold text-gray-900">
        Настройки выполнения
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-800">
              Разрешить повторные попытки
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              Ученик сможет отправить работу ещё раз
            </p>
          </div>
          <Toggle
            checked={settings.allowRetries}
            onChange={(v) => onUpdate({ allowRetries: v })}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-800">
              Показывать решение после сдачи
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              Ученик увидит решение сразу после отправки
            </p>
          </div>
          <Toggle
            checked={settings.showSolutionAfterSubmit}
            onChange={(v) => onUpdate({ showSolutionAfterSubmit: v })}
          />
        </div>

        {/* TODO: implement when schema fields are added */}
        <div className="rounded-xl border border-dashed border-gray-200 px-4 py-3">
          <p className="text-xs font-medium text-gray-400">
            Расширенные настройки — в следующей версии
          </p>
          <p className="mt-1 text-xs text-gray-300">
            Лимит попыток · Показ правильного ответа · Перемешивание задач ·
            Учёт в статистике
          </p>
        </div>
      </div>
    </div>
  );
};
