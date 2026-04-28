"use client";
import { useState } from "react";

import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  ClipboardCheck,
  ClipboardList,
  Lock,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { RoleCard } from "./RoleCard/RoleCard";
import { Footer } from "@/components/Footer/Footer";
import { RegisterForm } from "./RegisterForm/RegisterForm";

const featuresStudent = [
  { icon: ShieldCheck, title: "Тренировки" },
  { icon: BarChart3, title: "Прогресс" },
  { icon: ClipboardList, title: "Домашние задания" },
];

const featuresTeacher = [
  { icon: Users, title: "Классы" },
  { icon: ClipboardCheck, title: "Проверка" },
  { icon: BookOpen, title: "Домашние задания" },
];

export type TRole = "STUDENT" | "TEACHER";

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<TRole>("STUDENT");
  return (
    <main className="min-h-screen bg-[#f7f9fc]">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-7">
        <div className="rounded-[28px] border border-gray-200 bg-white px-8 py-7 shadow-[0_12px_40px_rgba(16,24,40,0.06)]">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-[28px] font-bold text-gray-900">
              Создайте аккаунт
            </h1>
            <p className="text-[15px] text-gray-500">
              Выберите роль и начните работу на платформе
            </p>
          </div>

          <div className="mx-auto mb-5 grid max-w-[840px] grid-cols-2 gap-6">
            <RoleCard
              selectedRole={selectedRole}
              roleName="STUDENT"
              description="Решайте задания, отслеживайте прогресс и выполняйте домашние задания"
              features={featuresStudent}
              LogoIcon={User}
              BarIcon={BarChart3}
              ClipboardIcon={ClipboardList}
              handleSelectRole={() => setSelectedRole("STUDENT")}
            />

            <RoleCard
              selectedRole={selectedRole}
              roleName="TEACHER"
              description="Создавайте классы, задавайте домашние задания и проверяйте решения"
              features={featuresTeacher}
              LogoIcon={Briefcase}
              BarIcon={ClipboardCheck}
              ClipboardIcon={BookOpen}
              handleSelectRole={() => setSelectedRole("TEACHER")}
            />
          </div>

       
          <div className="mb-5 text-center">
            <h2 className="mb-1 text-[22px] font-semibold text-gray-900">
              Создайте аккаунт для{" "}
              {selectedRole === "STUDENT" ? "ученика" : "учителя"}
            </h2>
            <p className="text-sm text-gray-500">
              Вы сможете изменить роль в настройках профиля в любое время
            </p>
          </div>

     
          <div className="mx-auto max-w-[520px] rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <RegisterForm selectedRole={selectedRole} />
          </div>

          
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Lock className="h-4 w-4" />
            <span>
              Регистрируясь, вы соглашаетесь с{" "}
              <Link
                href="#"
                className="font-medium text-blue-600 hover:underline"
              >
                условиями платформы
              </Link>
            </span>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}
