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
  Users,
  UserCheck,
  ClipboardList,
  CheckSquare,
  BookOpen,
  LineChart,
  Settings,
  HelpCircle,
  GraduationCap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard/teacher", label: "Главная", icon: Home, exact: true },
  { href: "/dashboard/teacher/classes", label: "Классы", icon: Users },
  { href: "/dashboard/teacher/students", label: "Ученики", icon: UserCheck },
  {
    href: "/dashboard/teacher/homework",
    label: "Домашние задания",
    icon: ClipboardList,
  },
  {
    href: "/dashboard/teacher/reviews",
    label: "Проверка работ",
    icon: CheckSquare,
  },
  { href: "/dashboard/teacher/tasks", label: "Банк задач", icon: BookOpen },
  { href: "/dashboard/teacher/analytics", label: "Аналитика", icon: LineChart },
  { href: "/dashboard/teacher/settings", label: "Настройки", icon: Settings },
];

export const TeacherSidebar = () => {
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
                  className="h-11 rounded-xl px-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 data-active:bg-blue-50 data-active:font-semibold data-active:text-blue-600"
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
