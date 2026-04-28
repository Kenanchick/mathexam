import { Send } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-50 px-6 pb-8">
      <div className="mx-auto max-w-[1480px] border-t border-gray-200 pt-8">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1.3fr] gap-10 pb-8">

          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
                M
              </div>

              <p className="text-xl font-bold">MathExam</p>
            </div>

            <p className="mb-5 max-w-[280px] text-sm leading-6 text-gray-500">
              Платформа для подготовки к ЕГЭ по профильной математике.
            </p>

            <div className="flex items-center gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border bg-white text-sm font-semibold text-gray-500 transition hover:text-blue-600"
              >
                VK
              </a>

              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border bg-white text-gray-500 transition hover:text-blue-600"
              >
                <Send className="h-4 w-4" />
              </a>
            </div>
          </div>


          <div>
            <h3 className="mb-4 font-semibold">Платформа</h3>

            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <a href="#" className="transition hover:text-blue-600">
                  Возможности
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-blue-600">
                  Тарифы
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-blue-600">
                  Для учеников
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-blue-600">
                  Для учителей
                </a>
              </li>
            </ul>
          </div>


          <div>
            <h3 className="mb-4 font-semibold">Поддержка</h3>

            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <a href="#" className="transition hover:text-blue-600">
                  Помощь
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-blue-600">
                  Частые вопросы
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-blue-600">
                  Инструкция
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-blue-600">
                  Обратная связь
                </a>
              </li>
            </ul>
          </div>


          <div>
            <h3 className="mb-4 font-semibold">Контакты</h3>

            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <a
                  href="mailto:support@mathexam.ru"
                  className="font-medium text-blue-600"
                >
                  support@mathexam.ru
                </a>
              </li>
              <li>8 (800) 555-35-35</li>
              <li>
                <a href="#" className="transition hover:text-blue-600">
                  Обработка персональных данных
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-5 text-sm text-gray-500">
          <p>© MathExam, 2024. Все права защищены.</p>

          <div className="flex items-center gap-8">
            <a href="#" className="transition hover:text-blue-600">
              Пользовательское соглашение
            </a>
            <a href="#" className="transition hover:text-blue-600">
              Политика конфиденциальности
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
