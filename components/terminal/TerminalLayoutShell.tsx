"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { TerminalHeader } from "./TerminalHeader";
import { TerminalSidebar } from "./TerminalSidebar";
import { TerminalStatusBar } from "./TerminalStatusBar";
import { DepthLadderModal } from "./modals/DepthLadderModal";
import { SessionKeyModal } from "./modals/SessionKeyModal";
import { DialectBlinkModal } from "./modals/DialectBlinkModal";
import { RobinhoodHedgeModal } from "./modals/RobinhoodHedgeModal";
import { DeveloperSdkModal } from "./modals/DeveloperSdkModal";

export function TerminalLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { openModal } = useTerminalStore();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  // Global hotkeys listener for instant navigation and modal triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + 1-4 navigation shortcuts
      if (e.altKey) {
        if (e.key === "1") {
          e.preventDefault();
          router.push("/terminal");
        } else if (e.key === "2") {
          e.preventDefault();
          router.push("/terminal/arbitrage");
        } else if (e.key === "3") {
          e.preventDefault();
          router.push("/terminal/watchlists");
        } else if (e.key === "4") {
          e.preventDefault();
          router.push("/terminal/journal");
        }
      }
      // Ctrl+K / Cmd+K Developer SDK trigger
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openModal("DEV_SDK");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, openModal]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen w-full flex flex-col bg-black text-white overflow-hidden select-none">
        {/* Top Institutional Header Dock */}
        <TerminalHeader />

        {/* Central Workspace Canvas */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Activity Sidebar (w-14) */}
          <TerminalSidebar />

          {/* Main Module Route Canvas */}
          <main className="flex-1 overflow-y-auto bg-[#000000] p-3 sm:p-4">
            {children}
          </main>
        </div>

        {/* Bottom Diagnostic Status Strip */}
        <TerminalStatusBar />

        {/* Dynamic Blockchain & Inspection Modals */}
        <DepthLadderModal />
        <SessionKeyModal />
        <DialectBlinkModal />
        <RobinhoodHedgeModal />
        <DeveloperSdkModal />
      </div>
    </QueryClientProvider>
  );
}
