import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "surface" | "outline" | "ghost" | "mint" | "crimson" | "white";
  size?: "xs" | "sm" | "md" | "icon-xs" | "icon-sm" | "icon-md";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variantStyles = {
      default:
        "bg-surface-elevated text-zinc-100 border border-[#1F232F] hover:bg-[#1A1D28] hover:border-zinc-700 active:scale-[0.98]",
      surface:
        "bg-surface text-zinc-300 border border-[#1F232F] hover:bg-surface-elevated hover:text-white hover:border-zinc-700 active:scale-[0.98]",
      outline:
        "bg-transparent text-zinc-300 border border-[#1F232F] hover:bg-surface hover:text-white hover:border-zinc-600 active:scale-[0.98]",
      ghost:
        "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 active:scale-[0.98]",
      mint:
        "bg-[#00D688] text-black font-semibold hover:bg-[#00FFA3] active:scale-[0.98] shadow-[0_0_16px_rgba(0,214,136,0.25)]",
      crimson:
        "bg-[#F6465D] text-white font-semibold hover:bg-[#ff5a71] active:scale-[0.98] shadow-[0_0_16px_rgba(246,70,93,0.25)]",
      white:
        "bg-white text-black font-semibold hover:bg-zinc-200 active:scale-[0.98]",
    }[variant];

    const sizeStyles = {
      xs: "h-7 px-2.5 text-xs rounded",
      sm: "h-8 px-3 text-xs rounded-md",
      md: "h-9 px-4 text-sm rounded-md",
      "icon-xs": "h-6 w-6 p-0 rounded",
      "icon-sm": "h-8 w-8 p-0 rounded-md",
      "icon-md": "h-9 w-9 p-0 rounded-md",
    }[size];

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all select-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00D688] disabled:pointer-events-none disabled:opacity-50",
          variantStyles,
          sizeStyles,
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
