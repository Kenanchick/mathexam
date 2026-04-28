import Image from "next/image";
import { Book } from "lucide-react";

export const LeftSideBlock = () => {
  return (
    <div>
      <h1 className="mb-6 max-w-[620px] text-5xl font-bold leading-tight tracking-tight">
        Готовься к профильной математике системно
      </h1>

      <p className="mb-8 max-w-[460px] text-lg leading-8 text-gray-500">
        Решай задания ЕГЭ по темам, отслеживай прогресс и получай домашние
        задания от учителя прямо на платформе.
      </p>

      <div className="mb-10 flex gap-4">
        <button className="rounded-lg bg-blue-600 px-7 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700 cursor-pointer">
          Начать подготовку
        </button>

        <button className="rounded-lg border border-gray-200 bg-white px-7 py-3 font-medium shadow-sm transition hover:bg-gray-50 cursor-pointer">
          Посмотреть задания
        </button>
      </div>

      <div className="flex gap-8 text-sm font-medium">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm">
            <Image
              src="/users.png"
              alt=""
              width={80}
              height={80}
              className="h-20 w-20 object-contain"
            />
          </div>
          <p>
            11 классов
            <br />и репетиторов
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm">
            <Book className="h-6 w-6 text-primary" />
          </div>
          <p>
            Все темы
            <br />
            ЕГЭ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm">
            <Image
              src="/green.png"
              alt=""
              width={120}
              height={80}
              className="h-20 w-30 p-1 object-contain"
            />
          </div>
          <p>
            Проверка
            <br />
            решений
          </p>
        </div>
      </div>
    </div>
  );
};
