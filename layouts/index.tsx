'use client'
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "./components/DashboardHeader";
import Sidebar from "./components/Sidebar";

// // app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-6">
          <div className="mx-auto w-full max-w-full">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
