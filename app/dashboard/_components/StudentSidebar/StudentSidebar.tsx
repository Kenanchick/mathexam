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
  Brain,
} from "lucide-react";

const navItems = [
  { href: "/dashboard/student", label: "Главная", icon: Home, exact: true },
  { href: "/dashboard/student/tasks", label: "Задачи", icon: BookOpen },
  { href: "/dashboard/student/training", label: "Тренировка", icon: Dumbbell },
  { href: "/dashboard/student/homework", label: "Домашние задания", icon: ClipboardList },
  { href: "/dashboard/student/theory", label: "Теория", icon: Brain },
  { href: "/dashboard/student/progress", label: "Прогресс", icon: LineChart },
  { href: "/dashboard/student/profile", label: "Профиль", icon: User },
];

export const StudentSidebar = () => {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-gray-200 px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded border border-gray-300 bg-white">
            <GraduationCap className="h-5 w-5 text-gray-800" />
          </div>
          <span className="text-[17px] font-semibold text-gray-900">MathExam</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarMenu className="gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className="h-11 rounded-md px-3.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 data-active:bg-gray-100 data-active:font-medium data-active:text-gray-900"
                >
                  <Link href={item.href}>
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="text-[15px]">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 px-5 py-4">
        <Link
          href="#"
          className="flex items-center gap-2.5 text-[15px] text-gray-500 transition hover:text-gray-800"
        >
          <HelpCircle className="h-5 w-5" />
          Помощь и поддержка
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
};
