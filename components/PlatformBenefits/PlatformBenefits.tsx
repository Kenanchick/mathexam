import {
  BookOpen,
  Monitor,
  ClipboardList,
  BarChart3,
  ArrowRight,
} from "lucide-react";

type Advantage = {
  icon: React.ElementType;
  title: string;
  text: string;
};

type Step = {
  number: string;
  title: string;
  text: string;
};

const advantages: Advantage[] = [
  {
    icon: BookOpen,
    title: "Все типы заданий ЕГЭ",
    text: "Задания по всем темам и номерам из актуального банка ФИПИ.",
  },
  {
    icon: Monitor,
    title: "Понятный личный кабинет",
    text: "Удобный интерфейс, ничего лишнего. Всё, что нужно для подготовки.",
  },
  {
    icon: ClipboardList,
    title: "Домашние задания от учителя",
    text: "Учителя задают задания, проверяют и оставляют комментарии.",
  },
  {
    icon: BarChart3,
    title: "Аналитика прогресса",
    text: "Отслеживай прогресс, результаты и слабые места по темам.",
  },
];

const steps: Step[] = [
  {
    number: "1",
    title: "Выбираешь тему",
    text: "Выбери тему или задание из кодификатора ЕГЭ.",
  },
  {
    number: "2",
    title: "Решаешь задачи",
    text: "Решай задания с пошаговыми решениями и подсказками.",
  },
  {
    number: "3",
    title: "Получаешь проверку",
    text: "Проверка с баллами и комментариями учителя.",
  },
  {
    number: "4",
    title: "Видишь прогресс",
    text: "Анализируй результаты и улучшай свои показатели.",
  },
];

export const PlatformBenefits = () => {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto w-full max-w-[1480px] px-6">
        {/* Преимущества */}
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">
          Преимущества платформы
        </h2>

        <div className="grid grid-cols-4 gap-5">
          {advantages.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                  <Icon className="h-7 w-7 text-blue-600" />
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm leading-6 text-gray-500">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="mb-8 mt-20 text-center text-3xl font-bold tracking-tight">
          Как это работает
        </h2>

        <div className="grid grid-cols-4 items-center gap-6">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <div className="flex gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-blue-100 bg-blue-50 text-2xl font-medium text-blue-600">
                  {step.number}
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm leading-6 text-gray-500">{step.text}</p>
                </div>
              </div>

              {index !== steps.length - 1 && (
                <div className="pointer-events-none absolute left-full top-1/2 z-10 hidden w-6 -translate-y-1/2 items-center justify-center lg:flex">
                  <ArrowRight className="h-5 w-5 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
