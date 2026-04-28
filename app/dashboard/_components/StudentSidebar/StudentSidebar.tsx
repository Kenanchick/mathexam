"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Dumbbell,
  ClipboardList,
  LineChart,
  User,
  HelpCircle,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard/student", label: "Главная", icon: Home, exact: true },
  { href: "/dashboard/student/tasks", label: "Задачи", icon: BookOpen },
  { href: "/dashboard/student/training", label: "Тренировка", icon: Dumbbell },
  { href: "/dashboard/student/homework", label: "Домашние задания", icon: ClipboardList },
  { href: "/dashboard/student/progress", label: "Прогресс", icon: LineChart },
  { href: "/dashboard/student/profile", label: "Профиль", icon: User },
];

export const StudentSidebar = () => {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <Sidebar>
      <SidebarHeader className="px-5 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-gray-900">MathExam</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex flex-col justify-between px-3 py-2">
        <SidebarMenu className="gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className="h-11 rounded-xl px-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 data-active:bg-blue-50 data-active:text-blue-600 data-active:font-semibold"
                >
                  <Link href={item.href}>
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        <div className="mt-auto px-2 pb-2">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="mb-3 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm">
                <GraduationCap className="h-7 w-7 text-blue-600" />
              </div>
            </div>
            <p className="mb-3 text-center text-xs font-medium leading-snug text-gray-700">
              Готовься системно<br />к ЕГЭ и достигай цели!
            </p>
            <Link
              href="#"
              className="flex w-full items-center justify-center gap-1 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
            >
              Узнать больше
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="px-5 pb-5">
        <Link
          href="#"
          className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-blue-600"
        >
          <HelpCircle className="h-4 w-4" />
          Помощь и поддержка
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
};
