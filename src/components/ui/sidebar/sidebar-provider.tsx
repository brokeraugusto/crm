
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
    
    // Inicializa o sidebar com base no dispositivo
    React.useEffect(() => {
      if (isMobile) {
        _setOpen(false);
      } else {
        _setOpen(true); // Desktop always starts with sidebar open
      }
    }, [isMobile]);
    
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

    // Handler para fechar o sidebar quando clicar fora
    const handleClickOutside = React.useCallback((event: MouseEvent) => {
      const sidebarElement = document.getElementById('sidebar-main');
      const hamburgerBtn = document.getElementById('hamburger-button');
      
      if (sidebarElement && !sidebarElement.contains(event.target as Node) &&
          hamburgerBtn && !hamburgerBtn.contains(event.target as Node)) {
        if (!isMobile && open) {
          setOpen(false);
        } else if (iMobile && openMobile) {
          setOpenMobile(false);
        }
      }
    }, [iMobile, open, openMobile, setOpen, setOpenMobile]);

    // Adiciona listener para cliques fora do sidebar
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
      [state, open, setOpen, iMobile, openMobile, setOpenMobile, toggleSidebar]
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
            {children}
          </div>
        </TooltipProvider>
      </SidebarContextInstance.Provider>
    );
  }
);
SidebarProvider.displayName = "SidebarProvider";
