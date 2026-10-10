import type { Metadata } from "next";
import { TerminalLayoutShell } from "@/components/terminal/TerminalLayoutShell";
import "../globals.css";

export const metadata: Metadata = {
  title: "Trayse Terminal — Normalized Prediction Intelligence",
  description:
    "Institutional cross-platform prediction market intelligence, normalized odds, and automated cross-venue arbitrage across Polymarket and Kalshi.",
};

export default function TerminalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TerminalLayoutShell>{children}</TerminalLayoutShell>;
}
