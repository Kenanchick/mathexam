"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "../../_actions/logout";

interface UserDropdownProps {
  name: string | null;
  email: string;
  avatarUrl?: string | null;
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return email[0].toUpperCase();
}

export const UserDropdown = ({ name, email, avatarUrl }: UserDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = getInitials(name, email);
  const displayName = name ?? email;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1 transition hover:bg-gray-100"
      >
        <span className="text-right text-[13px] font-medium leading-tight text-gray-700">
          {displayName}
        </span>
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-[13px] font-semibold text-gray-700">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-gray-400 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded border border-gray-200 bg-white shadow-lg"
          >
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="truncate text-[14px] font-semibold text-gray-900">
                {displayName}
              </p>
              <p className="mt-0.5 truncate text-[12px] text-gray-400">{email}</p>
            </div>

            <div className="py-1">
              <Link
                href="/dashboard/student/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-gray-700 transition-colors hover:bg-gray-50"
              >
                <User className="h-4 w-4 text-gray-400" />
                Профиль
              </Link>
              <Link
                href="/dashboard/student/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 text-gray-400" />
                Настройки
              </Link>
            </div>

            <div className="border-t border-gray-100 py-1">
              <form action={logout}>
                <button
                  type="submit"
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-[14px] text-red-500 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Выйти из аккаунта
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
