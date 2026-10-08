"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTerminalStore } from "@/lib/store/terminal-store";
import { TerminalHeader } from "./TerminalHeader";
import { TerminalSidebar } from "./TerminalSidebar";
import { ConnectAccountsModal } from "./modals/ConnectAccountsModal";
import { OrderSlipModal } from "./modals/OrderSlipModal";
import { DepthLadderModal } from "./modals/DepthLadderModal";
import { SessionKeyModal } from "./modals/SessionKeyModal";
import { DialectBlinkModal } from "./modals/DialectBlinkModal";
import { RobinhoodHedgeModal } from "./modals/RobinhoodHedgeModal";
import { DeveloperSdkModal } from "./modals/DeveloperSdkModal";
import { QuantStudioModal } from "./modals/QuantStudioModal";
import { OnboardingModal } from "./modals/OnboardingModal";
import { CommandPalette } from "@/components/ui/CommandPalette";

export function TerminalLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { closeModal, openModal, hasOnboarded } = useTerminalStore();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);

  // First-time visitor launch check (SSR and hydration safe)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedOnboarded = localStorage.getItem("trayse_terminal_onboarded_v1");
      if (!storedOnboarded && !hasOnboarded) {
        openModal("ONBOARDING");
      }
    }
  }, [hasOnboarded, openModal]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to toggle command palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Escape to close modals or command palette
      if (e.key === "Escape") {
        setIsCommandPaletteOpen(false);
        closeModal();
      }

      // Alt + 1-4 for quick navigation
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
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
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, closeModal]);

  return (
    <div className="flex h-screen w-full flex-col bg-[#07080B] text-white overflow-hidden select-none">
      {/* 1. TOP HEADER (Brand, Global Search, Accounts Pill, Odds Format) */}
      <TerminalHeader />

      {/* 2. BODY WORKSPACE: Collapsible Sidebar + Main Content Stream */}
      <div className="flex flex-1 overflow-hidden relative">
        <TerminalSidebar />
        <main className="flex-1 overflow-y-auto bg-[#07080B] relative">
          {children}
        </main>
      </div>

      {/* 3. MODAL MOUNTS */}
      <ConnectAccountsModal />
      <OrderSlipModal />
      <DepthLadderModal />
      <SessionKeyModal />
      <DialectBlinkModal />
      <RobinhoodHedgeModal />
      <DeveloperSdkModal />
      <QuantStudioModal />
      <OnboardingModal />

      {/* 4. GLOBAL COMMAND PALETTE (CMD+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectAction={(actionId) => {
          if (actionId === "action-onboarding") {
            openModal("ONBOARDING");
          } else if (actionId === "action-session-keys") {
            openModal("SESSION_KEYS");
          } else if (actionId === "action-scan-arb") {
            router.push("/terminal/arbitrage");
          } else if (actionId === "nav-journal") {
            router.push("/terminal/journal");
          }
        }}
        onSelectMarket={(marketId) => {
          router.push(`/terminal?market=${marketId}`);
        }}
      />
    </div>
  );
}
