import { ContentBlock } from "@/components/ContentBlock/ContentBlock";
import { LoginForm } from "./LoginForm/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-64px)]  bg-gray-50">
      <div className="mx-auto grid w-full max-w-[1360px] grid-cols-[720px_520px] items-start justify-between px-6 py-10">
        <section>
          <h1 className="mb-3 max-w-[680px] text-3xl font-bold leading-tight tracking-tight">
            Профильная математика — подготовка, которая даёт результат
          </h1>

          <p className="mb-4 max-w-[680px] text-sm leading-6 text-gray-500">
            MathExam помогает системно готовиться к ЕГЭ: понятная теория,
            задания ЕГЭ, домашние задания от учителей и прогресс, который
            мотивирует.
          </p>

          <div className="w-full max-w-[720px]">
            <ContentBlock compact />
          </div>

          <div className="grid w-[720px] grid-cols-2 gap-5 mt-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-2 font-semibold">Подготовка без хаоса</h3>
              <p className="text-sm leading-6 text-gray-500">
                Чёткие планы, темы и задания — ничего лишнего.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-2 font-semibold">Все темы ЕГЭ в одном месте</h3>
              <p className="text-sm leading-6 text-gray-500">
                Теория, примеры и задания ЕГЭ с решениями.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16 w-[520px] rounded-2xl border border-gray-200 bg-white px-10 py-10 shadow-[0_10px_35px_rgba(15,23,42,0.08)]">
          <div className="mb-9 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-blue-600">
              M
            </div>
            <p className="text-xl font-bold">MathExam</p>
          </div>

          <div className="mb-8">
            <h2 className="mb-2 text-3xl font-bold tracking-tight">
              Войти в аккаунт
            </h2>

            <p className="text-base text-gray-500">
              Продолжите подготовку к профильной математике
            </p>
          </div>

          <LoginForm />
        </section>
      </div>
    </main>
  );
}
