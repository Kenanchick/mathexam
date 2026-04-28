import { Rocket } from "lucide-react";

export const StartPreparing = () => {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-[1480px] w-full">
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-blue-50/40 p-10 shadow-sm">
          <div className="flex items-center justify-center gap-12">
            <div className="hidden h-32 w-32 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm md:flex">
              <Rocket className="h-16 w-16 text-blue-600" />
            </div>

            <div className="text-center">
              <h2 className="mb-3 text-3xl font-bold tracking-tight">
                Начните подготовку уже сегодня
              </h2>

              <p className="mb-6 text-lg text-gray-500">
                Зарегистрируйтесь бесплатно и получите доступ ко всем
                возможностям платформы.
              </p>

              <button className="rounded-lg bg-blue-600 px-10 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700">
                Создать аккаунт
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
