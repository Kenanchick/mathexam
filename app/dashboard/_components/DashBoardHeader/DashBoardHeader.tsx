import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/server";
import { UserDropdown } from "./UserDropdown";

export const DashBoardHeader = async () => {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-10 w-full border-b border-gray-200 bg-white px-6 py-3">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <Bell className="h-4 w-4" />
          </Button>

          <UserDropdown
            name={user?.name ?? null}
            email={user?.email ?? ""}
            avatarUrl={null}
          />
        </div>
      </div>
    </header>
  );
};
