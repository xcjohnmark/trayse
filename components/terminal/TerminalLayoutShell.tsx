"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function TerminalLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen w-full flex-col bg-surface overflow-hidden">
        {/* Placeholder for future header */}
        <div className="flex flex-1 overflow-hidden">
          {/* Placeholder for future sidebar */}
          <main className="flex-1 overflow-y-auto bg-void text-white">
            {children}
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
