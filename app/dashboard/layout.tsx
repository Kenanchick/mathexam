import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashBoardHeader } from "./_components/DashBoardHeader/DashBoardHeader";
import { SidebarSelector } from "./_components/SidebarSelector/SidebarSelector";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SidebarSelector />

        <SidebarInset className="flex min-h-screen flex-1 flex-col bg-gray-50">
          <DashBoardHeader />

          <main className="p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
