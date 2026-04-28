"use client";

import { usePathname } from "next/navigation";
import { StudentSidebar } from "../StudentSidebar/StudentSidebar";
import { TeacherSidebar } from "../TeacherSidebar/TeacherSidebar";

export const SidebarSelector = () => {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard/teacher")) {
    return <TeacherSidebar />;
  }

  return <StudentSidebar />;
};
