import * as React from "react";
import { cn } from "@/lib/utils";

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: "live" | "warning" | "error" | "syncing";
  latency?: number;
  label?: string;
  showRipple?: boolean;
}

export function StatusIndicator({
  className,
  status = "live",
  latency,
  label,
  showRipple = true,
  ...props
}: StatusIndicatorProps) {
  const colorMap = {
    live: {
      dot: "bg-[#00D688]",
      ripple: "bg-[#00D688]",
      text: "text-[#00D688]",
      badgeBg: "bg-[#00D688]/10 border-[#00D688]/25",
    },
    warning: {
      dot: "bg-amber-400",
      ripple: "bg-amber-400",
      text: "text-amber-400",
      badgeBg: "bg-amber-500/10 border-amber-500/25",
    },
    error: {
      dot: "bg-[#F6465D]",
      ripple: "bg-[#F6465D]",
      text: "text-[#F6465D]",
      badgeBg: "bg-[#F6465D]/10 border-[#F6465D]/25",
    },
    syncing: {
      dot: "bg-blue-400",
      ripple: "bg-blue-400",
      text: "text-blue-400",
      badgeBg: "bg-blue-500/10 border-blue-500/25",
    },
  }[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2 py-1 rounded border text-xs font-mono select-none",
        colorMap.badgeBg,
        className
      )}
      {...props}
    >
      <span className="relative flex h-2 w-2">
        {showRipple && (
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              colorMap.ripple
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            colorMap.dot
          )}
        />
      </span>
      {label && <span className="text-zinc-300 font-medium text-[11px]">{label}</span>}
      {typeof latency === "number" && (
        <span className={cn("tabular-nums text-[11px] font-mono", colorMap.text)}>
          {latency}ms
        </span>
      )}
    </div>
  );
}
