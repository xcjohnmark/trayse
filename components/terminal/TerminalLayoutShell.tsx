"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TerminalHeader } from "@/components/terminal/TerminalHeader";
import { TerminalSidebar } from "@/components/terminal/TerminalSidebar";
import { TerminalPulseTicker } from "@/components/terminal/TerminalPulseTicker";
import { TerminalCommandMenu } from "@/components/terminal/TerminalCommandMenu";

export function TerminalLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  // TanStack Query Client for terminal data fetching & caching
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 10, // 10 seconds SWR
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const handleCustomOpen = () => setIsSearchOpen(true);
    window.addEventListener("open-terminal-search", handleCustomOpen);
    return () => window.removeEventListener("open-terminal-search", handleCustomOpen);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen w-screen overflow-hidden bg-void text-white antialiased selection:bg-[#00D688] selection:text-black">
        {/* Left Activity Sidebar Nav */}
        <TerminalSidebar />

        {/* Main Canvas Dock */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden bg-void">
          {/* Pinned Top Header Dock */}
          <TerminalHeader onOpenSearch={() => setIsSearchOpen(true)} />

          {/* Real-Time Pulse Metric Ticker */}
          <TerminalPulseTicker />

          {/* Main Scrollable Canvas Container */}
          <main className="flex-1 overflow-y-auto bg-void p-3 sm:p-4 lg:p-6 terminal-scroll">
            {children}
          </main>
        </div>

        {/* ⌘K Command Palette / Search Dialog */}
        <TerminalCommandMenu
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      </div>
    </QueryClientProvider>
  );
}
