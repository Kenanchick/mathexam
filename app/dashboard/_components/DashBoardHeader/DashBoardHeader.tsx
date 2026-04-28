import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DashBoardHeader = () => {
  return (
    <header className="w-full border-b bg-white px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer hover:bg-transparent hover:text-primary"
          >
            <Bell className="size-6!" />
          </Button>

          <div className="flex items-center gap-3">
            <p className="text-sm font-medium leading-tight">
              Амина <br />
              Магомедова
            </p>

            <div className="flex h-15 w-15 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
              А
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
