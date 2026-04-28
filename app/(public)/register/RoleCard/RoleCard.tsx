"use client";

import { CheckCircle2 } from "lucide-react";

type TpropsRoleCards = {
  selectedRole: string;
  roleName: string;
  description: string;
  features: { icon: React.ElementType; title: string }[];
  LogoIcon: React.ElementType;
  BarIcon: React.ElementType;
  ClipboardIcon: React.ElementType;
  handleSelectRole: (role: string) => void;
};

export const RoleCard = ({
  selectedRole,
  roleName,
  description,
  features,
  LogoIcon,
  BarIcon,
  ClipboardIcon,
  handleSelectRole,
}: TpropsRoleCards) => {
  const isSelected = selectedRole === roleName;
  const isStudent = roleName === "STUDENT";

  return (
    <div
      onClick={() => handleSelectRole(roleName)}
      className={`relative cursor-pointer rounded-2xl border bg-white p-6 transition-all duration-300 ease-out ${
        isSelected
          ? isStudent
            ? "-translate-y-1 border-blue-600 shadow-[0_14px_32px_rgba(37,99,235,0.18)]"
            : "-translate-y-1 border-green-600 shadow-[0_14px_32px_rgba(22,163,74,0.18)]"
          : "border-gray-200 shadow-sm hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
      }`}
    >
      <div
        className={`absolute right-4 top-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white transition-all duration-300 ${
          isSelected
            ? isStudent
              ? "scale-100 bg-blue-600 opacity-100"
              : "scale-100 bg-green-600 opacity-100"
            : "pointer-events-none scale-95 bg-gray-300 opacity-0"
        }`}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Выбрано
      </div>

      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="max-w-[240px]">
          <h3 className="mb-3 text-[20px] font-bold text-gray-900">
            {isStudent ? "Я ученик" : "Я учитель"}
          </h3>

          <p className="text-sm leading-7 text-gray-500">{description}</p>
        </div>

        <div
          className={`flex h-[120px] w-[150px] shrink-0 items-center justify-center rounded-2xl ${
            isStudent ? "bg-blue-50" : "bg-green-50"
          }`}
        >
          <div className="relative flex h-full w-full items-center justify-center">
            <div className="absolute left-4 top-4 rounded-xl border border-blue-100 bg-white px-3 py-2 shadow-sm">
              <BarIcon
                className={`h-5 w-5 ${
                  isStudent ? "text-blue-500" : "text-green-500"
                }`}
              />
            </div>

            <div className="absolute left-6 top-14 rounded-xl border border-blue-100 bg-white px-3 py-2 shadow-sm">
              <ClipboardIcon
                className={`h-5 w-5 ${
                  isStudent ? "text-green-500" : "text-blue-500"
                }`}
              />
            </div>

            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full ${
                isStudent ? "bg-blue-100" : "bg-green-100"
              }`}
            >
              <LogoIcon
                className={`h-10 w-10 ${
                  isStudent ? "text-blue-600" : "text-green-600"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600"
            >
              <Icon
                className={`h-4 w-4 ${
                  isStudent ? "text-blue-600" : "text-green-600"
                }`}
              />
              {feature.title}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition cursor-pointer ${
          isSelected
            ? isStudent
              ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
              : "border-green-600 bg-green-600 text-white hover:bg-green-700"
            : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
        }`}
      >
        {isSelected ? "Выбрано" : "Выбрать"}
      </button>
    </div>
  );
};
