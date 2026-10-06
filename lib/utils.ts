import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats numbers as tabular financial strings */
export function formatOdds(val: number | null | undefined): string {
  if (val === null || val === undefined || Number.isNaN(val)) return "—";
  return `${(val * 100).toFixed(1)}%`;
}

export function formatUsd(val: number | null | undefined): string {
  if (val === null || val === undefined || Number.isNaN(val)) return "$0.00";
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatBps(bps: number): string {
  const sign = bps > 0 ? "+" : "";
  return `${sign}${bps.toFixed(0)} bps`;
}
