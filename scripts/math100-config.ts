// Маппинг ЕГЭ-заданий на структуру math100.
// math100 использует свою старую нумерацию: math100Group → examNumber

export type Math100Subtopic = {
  key: string; //номер подтипа на math100 (1, 2, ...)
  slug: string;
  title: string;
  order: number;
  maxTasks: number; //сколько задач есть в этом подтипе на math100
};

export type Math100Config = {
  examNumber: number; //номер задания в актуальном ЕГЭ
  math100Group: number; //первый параметр URL: ege_profil_{group}_X-Y
  topic: {
    title: string;
    slug: string;
    description: string;
    order: number;
  };
  subtopics: Math100Subtopic[];
};

export const MATH100_CONFIGS: Record<number, Math100Config> = {
  3: {
    examNumber: 3,
    math100Group: 2,
    topic: {
      title: "Задание 3. Стереометрия",
      slug: "ege-3-stereometriya",
      description:
        "Куб, параллелепипед, призма, пирамида, цилиндр, конус, шар — объёмы и площади поверхностей.",
      order: 3,
    },
    subtopics: [
      { key: "1", slug: "kub-parallelepiped", title: "Куб, прямоугольный параллелепипед", order: 1, maxTasks: 28 },
      { key: "2", slug: "elementy-sostavnykh-mnogogrannikov", title: "Элементы составных многогранников", order: 2, maxTasks: 10 },
      { key: "3", slug: "ploshchad-i-obem-sostavnogo-mnogogrannika", title: "Площадь поверхности и объём составного многогранника", order: 3, maxTasks: 31 },
      { key: "4", slug: "prizma", title: "Призма", order: 4, maxTasks: 38 },
      { key: "5", slug: "piramida", title: "Пирамида", order: 5, maxTasks: 43 },
      { key: "6", slug: "tsilindr-konus-shar", title: "Цилиндр, конус, шар", order: 6, maxTasks: 49 },
      { key: "7", slug: "kombinaciya-tel", title: "Комбинация тел", order: 7, maxTasks: 35 },
    ],
  },

  6: {
    examNumber: 6,
    math100Group: 5,
    topic: {
      title: "Задание 6. Уравнения",
      slug: "ege-6-uravneniya",
      description:
        "Рациональные, иррациональные, показательные, логарифмические и тригонометрические уравнения.",
      order: 6,
    },
    subtopics: [
      { key: "1", slug: "racionalnye-uravneniya", title: "Рациональные уравнения", order: 1, maxTasks: 15 },
      { key: "2", slug: "irracionalnye-uravneniya", title: "Иррациональные уравнения", order: 2, maxTasks: 4 },
      { key: "3", slug: "pokazatelnye-uravneniya", title: "Показательные уравнения", order: 3, maxTasks: 12 },
      { key: "4", slug: "logarifmicheskie-uravneniya", title: "Логарифмические уравнения", order: 4, maxTasks: 12 },
      { key: "5", slug: "trigonometricheskie-uravneniya", title: "Тригонометрические уравнения", order: 5, maxTasks: 6 },
    ],
  },

  7: {
    examNumber: 7,
    math100Group: 6,
    topic: {
      title: "Задание 7. Вычисления и преобразования",
      slug: "ege-7-vychisleniya-preobrazovaniya",
      description:
        "Вычисление значений рациональных, иррациональных, степенных, логарифмических и тригонометрических выражений.",
      order: 7,
    },
    subtopics: [
      { key: "1", slug: "racionalnye-vyrazheniya", title: "Рациональные выражения", order: 1, maxTasks: 31 },
      { key: "2", slug: "irracionalnye-vyrazheniya", title: "Иррациональные выражения", order: 2, maxTasks: 20 },
      { key: "3", slug: "stepennye-vyrazheniya", title: "Степенные выражения", order: 3, maxTasks: 46 },
      { key: "4", slug: "logarifmicheskie-vyrazheniya", title: "Логарифмические выражения", order: 4, maxTasks: 32 },
      { key: "5", slug: "trigonometricheskie-vyrazheniya", title: "Тригонометрические выражения", order: 5, maxTasks: 47 },
    ],
  },
};
