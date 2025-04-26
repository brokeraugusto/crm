
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
  return context;
}

export { SidebarContextInstance };
