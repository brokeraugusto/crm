
import * as React from "react";
import { SidebarContext } from "./types";

// Create the actual context with a default value
const SidebarContextInstance = React.createContext<SidebarContext>({
  state: "expanded",
  open: true,
  setOpen: () => {},
  openMobile: false,
  setOpenMobile: () => {},
  isMobile: false,
  toggleSidebar: () => {},
});

export function useSidebar() {
  const context = React.useContext(SidebarContextInstance);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  
  // Update CSS variable for content offset based on sidebar state
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty(
        '--sidebar-offset', 
        context.isMobile ? '0' : context.open ? '16rem' : '5rem'
      );
    }
  }, [context.open, context.isMobile]);
  
  return context;
}

export { SidebarContextInstance };
