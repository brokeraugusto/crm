
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function MainLayout() {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar />
        <div className="relative flex flex-col flex-1 w-full overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 max-w-full">
            <div className="container mx-auto px-1 sm:px-4 md:px-6 lg:px-8 max-w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
