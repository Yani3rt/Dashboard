"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type SidebarContextValue = {
  open: boolean;
  isMobile: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return ctx;
}

const SIDEBAR_KEYBOARD_SHORTCUT = "b";

export function SidebarProvider({
  defaultOpen = true,
  children,
}: {
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(max-width: 920px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const toggleSidebar = React.useCallback(() => {
    setOpen((current) => !current);
  }, []);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === SIDEBAR_KEYBOARD_SHORTCUT) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleSidebar]);

  return (
    <SidebarContext.Provider value={{ open, isMobile, setOpen, toggleSidebar }}>
      <div className="group/sidebar-wrapper flex min-h-svh w-full bg-background">{children}</div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  children,
  className,
  side = "left",
}: {
  children: React.ReactNode;
  className?: string;
  side?: "left" | "right";
}) {
  const { open, setOpen, isMobile } = useSidebar();
  const state = open ? "expanded" : "collapsed";
  const collapsible = open ? "" : "icon";

  if (isMobile) {
    return (
      <>
        {open ? (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-40 bg-black/45"
            onClick={() => setOpen(false)}
          />
        ) : null}
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 h-svh w-72 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200",
            open ? "translate-x-0" : "-translate-x-full",
            className,
          )}
        >
          <div className="flex h-full flex-col">{children}</div>
        </aside>
      </>
    );
  }

  return (
    <aside
      data-state={state}
      data-collapsible={collapsible}
      data-side={side}
      className={cn("group/sidebar peer block text-sidebar-foreground", className)}
    >
      <div
        className={cn(
          "relative h-svh w-72 bg-transparent transition-[width] duration-200",
          state === "collapsed" && "w-[5.25rem]",
        )}
      >
        <div
          className={cn(
            "fixed inset-y-0 z-10 flex h-svh border-r border-sidebar-border bg-sidebar transition-[width,left,right] duration-200",
            side === "left" ? "left-0" : "right-0",
            state === "expanded" ? "w-72" : "w-[5.25rem]",
          )}
        >
          <div data-sidebar="sidebar" className="flex h-full w-full flex-col">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function SidebarInset({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("relative flex min-w-0 flex-1 flex-col bg-background", className)}>{children}</div>;
}

export function SidebarTrigger({ className }: { className?: string }) {
  const { toggleSidebar } = useSidebar();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="outline" size="icon" onClick={toggleSidebar} className={cn("h-11 w-11 border-border bg-control", className)}>
          <PanelLeft className="h-4 w-4" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Toggle sidebar</TooltipContent>
    </Tooltip>
  );
}

export function SidebarHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-3 p-3 pb-2", className)}>{children}</div>;
}

export function SidebarFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mt-auto flex flex-col gap-3 p-3 pt-2", className)}>{children}</div>;
}

export function SidebarContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-3", className)}>{children}</div>;
}

export function SidebarGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("relative flex w-full min-w-0 flex-col gap-2 rounded-xl border border-sidebar-border bg-sidebar p-2", className)}>{children}</section>;
}

export function SidebarGroupLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("ui-meta-label px-2 py-1 text-sidebar-foreground/62 group-data-[collapsible=icon]:hidden", className)}>
      {children}
    </p>
  );
}

export function SidebarGroupContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("w-full text-sm", className)}>{children}</div>;
}

export function SidebarMenu({ children, className }: { children: React.ReactNode; className?: string }) {
  return <ul className={cn("flex w-full min-w-0 flex-col gap-1", className)}>{children}</ul>;
}

export function SidebarMenuItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <li className={cn("group/menu-item relative", className)}>{children}</li>;
}

export function SidebarMenuButton({
  asChild,
  isActive,
  className,
  children,
  ...props
}: {
  asChild?: boolean;
  isActive?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.ComponentProps<"button">) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="sidebar-menu-button"
      data-active={isActive}
      className={cn(
        "peer/menu-button flex w-full items-center gap-3 overflow-hidden rounded-xl border border-transparent px-3 py-3 text-left text-sm font-medium outline-none ring-sidebar-ring transition-colors duration-200 hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 data-[active=true]:border-sidebar-border data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0 group-data-[collapsible=icon]:[&>span]:hidden group-data-[collapsible=icon]:[&>svg+span]:hidden",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
