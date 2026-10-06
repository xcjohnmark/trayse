import * as React from "react";
import { cn } from "@/lib/utils";

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {}

export function Kbd({ className, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center h-5 min-w-[20px] px-1 text-[10px] font-mono text-zinc-400 bg-surface-elevated border border-[#1F232F] rounded shadow-[0_1px_1px_rgba(0,0,0,0.5)] select-none",
        className
      )}
      {...props}
    />
  );
}

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorProps) {
  return (
    <div
      role="separator"
      className={cn(
        "bg-[#1F232F] shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  );
}
