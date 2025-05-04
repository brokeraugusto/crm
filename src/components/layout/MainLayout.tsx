
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MainLayout() {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar />
        <div className="relative flex flex-col flex-1 w-full overflow-hidden">
          <Navbar />
          <ScrollArea className="flex-1">
            <main className="p-4 sm:p-6">
              <Outlet />
            </main>
          </ScrollArea>
        </div>
      </div>
    </SidebarProvider>
  );
}
