import * as React from "react";
import { cn } from "@/lib/utils";

// If class-variance-authority is not installed, we provide a lightweight typed implementation
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "surface" | "outline" | "mint" | "crimson" | "warning" | "glow";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-surface-elevated text-zinc-300 border-[#1F232F]",
    surface: "bg-surface text-zinc-400 border-[#1F232F]",
    outline: "bg-transparent text-zinc-300 border-[#1F232F]",
    mint: "bg-[#00D688]/10 text-[#00D688] border-[#00D688]/30 font-medium",
    crimson: "bg-[#F6465D]/10 text-[#F6465D] border-[#F6465D]/30 font-medium",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30 font-medium",
    glow: "bg-[#00D688]/15 text-[#00FFA3] border-[#00D688]/40 shadow-[0_0_12px_rgba(0,214,136,0.2)]",
  }[variant];

  const sizeStyles = {
    sm: "px-1.5 py-0.5 text-[10px] leading-none",
    md: "px-2 py-0.5 text-xs",
  }[size];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded font-mono tabular-nums border transition-colors",
        variantStyles,
        sizeStyles,
        className
      )}
      {...props}
    />
  );
}
