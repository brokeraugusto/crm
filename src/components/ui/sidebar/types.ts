
import { VariantProps } from "class-variance-authority";
import { buttonVariants } from "../button";
import { TooltipContent } from "../tooltip";

export type Theme = "dark" | "light";

export interface SidebarContext {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export interface SidebarMenuButtonProps extends ButtonProps {
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
}
