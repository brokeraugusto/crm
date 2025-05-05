
import * as React from "react";
import { TooltipProvider } from "../tooltip";
import { SidebarContext } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { SidebarContextInstance } from "./use-sidebar";

const SIDEBAR_KEYBOARD_SHORTCUT = "b";

export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);
    const [_open, _setOpen] = React.useState(defaultOpen);
    const open = openProp ?? _open;
    
    // Initialize sidebar based on device
    React.useEffect(() => {
      if (isMobile) {
        _setOpen(false);
      } else {
        _setOpen(defaultOpen); // Desktop always starts with sidebar open as per defaultOpen
      }
    }, [isMobile, defaultOpen]);
    
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(openState);
        } else {
          _setOpen(openState);
        }
      },
      [setOpenProp, open]
    );

    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open)
        : setOpen((open) => !open);
    }, [isMobile, setOpen, setOpenMobile]);

    // Handler for closing the sidebar when clicking outside
    const handleClickOutside = React.useCallback((event: MouseEvent) => {
      const sidebarElement = document.getElementById('sidebar-main');
      const hamburgerBtn = document.getElementById('hamburger-button');
      const sidebarCollapsed = document.querySelector('.sidebar-collapsed');
      
      if (sidebarElement && !sidebarElement.contains(event.target as Node) &&
          hamburgerBtn && !hamburgerBtn.contains(event.target as Node) &&
          sidebarCollapsed && !sidebarCollapsed.contains(event.target as Node)) {
        // Only close if mobile sidebar is open - desktop sidebar should remain as user set it
        if (isMobile && openMobile) {
          setOpenMobile(false);
        }
      }
    }, [isMobile, openMobile, setOpenMobile]);

    // Add listener for clicks outside the sidebar
    React.useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [handleClickOutside]);

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault();
          toggleSidebar();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);

    const state = open ? "expanded" : "collapsed";

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    );

    return (
      <SidebarContextInstance.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": "16rem",
                "--sidebar-width-icon": "5rem",
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
              className
            )}
            ref={ref}
            {...props}
          >
            {!open && !isMobile && (
              <div 
                className="sidebar-collapsed fixed left-0 top-1/2 -translate-y-1/2 bg-background border border-border rounded-r-md p-1 cursor-pointer z-50 shadow-md hover:bg-accent"
                onClick={() => setOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            )}
            {children}
          </div>
        </TooltipProvider>
      </SidebarContextInstance.Provider>
    );
  }
);
SidebarProvider.displayName = "SidebarProvider";
