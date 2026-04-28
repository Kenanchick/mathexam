import {
  CheckCircle2,
  GraduationCap,
  Presentation,
  ArrowRight,
} from "lucide-react";

export const AudienceSection = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto w-full max-w-[1480px] px-6">
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">
          Подходит и ученикам, и учителям
        </h2>

        <div className="grid grid-cols-2 gap-6">

          <div className="rounded-3xl border border-gray-200 bg-emerald-50/40 p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="mb-4 text-2xl font-bold">Для ученика</h3>

                <ul className="space-y-3 text-base font-medium">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    Тренировки по всем темам ЕГЭ
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    История решений и ошибок
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    Отслеживание прогресса
                  </li>
                </ul>
              </div>

              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm">
                <GraduationCap className="h-12 w-12 text-emerald-600" />
              </div>
            </div>

            <div className="grid grid-cols-[1.35fr_1fr] gap-5">

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-semibold">Последние задачи</h4>
                  <button className="text-sm font-medium text-blue-600">
                    Все задания
                  </button>
                </div>

                <ul className="divide-y divide-gray-100 text-sm">
                  <li className="flex items-center justify-between py-3">
                    <span className="text-gray-600">15. Производная (1–6)</span>
                    <span className="font-medium text-emerald-600">✓ 6/6</span>
                  </li>

                  <li className="flex items-center justify-between py-3">
                    <span className="text-gray-600">
                      13. Тригонометрия (1–5)
                    </span>
                    <span className="font-medium text-emerald-600">✓ 5/5</span>
                  </li>

                  <li className="flex items-center justify-between py-3">
                    <span className="text-gray-600">
                      17. Экономическая задача (1–3)
                    </span>
                    <span className="font-medium text-blue-600">2/3</span>
                  </li>

                  <li className="flex items-center justify-between py-3">
                    <span className="text-gray-600">
                      18. Стереометрия (1–2)
                    </span>
                    <span className="font-medium text-gray-500">0/2</span>
                  </li>
                </ul>
              </div>


              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h4 className="mb-4 font-semibold">Твой прогресс</h4>

                <p className="text-sm text-gray-500">Освоено тем</p>
                <p className="mb-3 text-3xl font-bold">72%</p>

                <div className="mb-5 h-3 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full w-[72%] rounded-full bg-emerald-600" />
                </div>

                <div className="mb-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Решено задач</p>
                    <p className="font-semibold">842 из 1200</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Средний балл</p>
                    <p className="font-semibold">78%</p>
                  </div>
                </div>

                <button className="flex items-center gap-2 text-sm font-medium text-blue-600">
                  Подробнее о прогрессе
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>


          <div className="rounded-3xl border border-gray-200 bg-blue-50/40 p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="mb-4 text-2xl font-bold">Для учителя</h3>

                <ul className="space-y-3 text-base font-medium">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    Управление классами и учениками
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    Назначение домашних заданий
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    Проверка решений и комментарии
                  </li>
                </ul>
              </div>

              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm">
                <Presentation className="h-12 w-12 text-blue-600" />
              </div>
            </div>

            <div className="grid grid-cols-[1fr_1.35fr] gap-5">

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-semibold">Классы</h4>
                  <button className="text-sm font-medium text-blue-600">
                    Все классы
                  </button>
                </div>

                <div className="mb-3 grid grid-cols-3 text-sm font-medium text-gray-500">
                  <span>Класс</span>
                  <span>Ученики</span>
                  <span>Прогресс</span>
                </div>

                <ul className="divide-y divide-gray-100 text-sm">
                  <li className="grid grid-cols-3 items-center py-3">
                    <span className="font-semibold">11А</span>
                    <span>28</span>
                    <div className="flex items-center gap-2">
                      <span>76%</span>
                      <div className="h-1.5 w-14 rounded-full bg-gray-100">
                        <div className="h-full w-[76%] rounded-full bg-emerald-600" />
                      </div>
                    </div>
                  </li>

                  <li className="grid grid-cols-3 items-center py-3">
                    <span className="font-semibold">11Б</span>
                    <span>24</span>
                    <div className="flex items-center gap-2">
                      <span>68%</span>
                      <div className="h-1.5 w-14 rounded-full bg-gray-100">
                        <div className="h-full w-[68%] rounded-full bg-emerald-600" />
                      </div>
                    </div>
                  </li>

                  <li className="grid grid-cols-3 items-center py-3">
                    <span className="font-semibold">11В</span>
                    <span>26</span>
                    <div className="flex items-center gap-2">
                      <span>70%</span>
                      <div className="h-1.5 w-14 rounded-full bg-gray-100">
                        <div className="h-full w-[70%] rounded-full bg-emerald-600" />
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

        
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-semibold">Последние задания</h4>
                  <button className="text-sm font-medium text-blue-600">
                    Все задания
                  </button>
                </div>

                <ul className="divide-y divide-gray-100 text-sm">
                  <li className="flex items-center justify-between py-3">
                    <span className="text-gray-600">Производная</span>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        Проверено
                      </span>
                      <span className="text-gray-500">18/24</span>
                    </div>
                  </li>

                  <li className="flex items-center justify-between py-3">
                    <span className="text-gray-600">Тригонометрия</span>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        На проверке
                      </span>
                      <span className="text-gray-500">7/24</span>
                    </div>
                  </li>

                  <li className="flex items-center justify-between py-3">
                    <span className="text-gray-600">Стереометрия</span>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        Назначено
                      </span>
                      <span className="text-gray-500">24/24</span>
                    </div>
                  </li>
                </ul>

                <div className="mt-4 border-t pt-4">
                  <button className="flex items-center gap-2 text-sm font-medium text-blue-600">
                    Создать задание
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
