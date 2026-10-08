"use client";

import * as React from "react";
import {
  MagnifyingGlass,
  ArrowsLeftRight,
  ChartLineUp,
  Receipt,
  ShieldCheck,
  Globe,
  Coins,
  X,
  Command as CommandIcon,
  Sparkle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMarket?: (marketId: string) => void;
  onSelectAction?: (actionId: string) => void;
}

interface CommandItem {
  id: string;
  category: "Markets" | "Actions" | "Navigation";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: string;
}

const SAMPLE_COMMANDS: CommandItem[] = [
  {
    id: "poly-fed-rate",
    category: "Markets",
    title: "Fed Interest Rate Cut >= 25 bps in Q4",
    subtitle: "Polymarket: 74.2¢ | Kalshi: 71.0¢ | Spread: +3.2¢",
    icon: <Globe className="w-4 h-4 text-sky-400" />,
    badge: "Arb +3.2%",
  },
  {
    id: "poly-sol-tps",
    category: "Markets",
    title: "Solana Mainnet TPS Exceeds 6,500 in 2026",
    subtitle: "Polymarket: 48.0¢ | Kalshi: 46.5¢ | Fair Value: 52.4¢",
    icon: <Coins className="w-4 h-4 text-[#00D688]" />,
    badge: "Quant Edge",
  },
  {
    id: "poly-us-pres",
    category: "Markets",
    title: "US Presidential Election Winner 2026",
    subtitle: "Combined 24h Vol: $18.4M | Polymarket vs Kalshi",
    icon: <ChartLineUp className="w-4 h-4 text-indigo-400" />,
    badge: "High Vol",
  },
  {
    id: "action-scan-arb",
    category: "Actions",
    title: "Execute Cross-Venue Arbitrage Scan",
    subtitle: "Compute synthetic delta-neutral locks across CLOBs",
    icon: <ArrowsLeftRight className="w-4 h-4 text-[#00D688]" />,
    badge: "8 Spreads",
  },
  {
    id: "action-session-keys",
    category: "Actions",
    title: "Configure Swig Session Key Guardrails",
    subtitle: "Set daily spend limit, slippage cap, and stop-loss breaker",
    icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: "action-onboarding",
    category: "Actions",
    title: "Launch First-Time Setup & Onboarding Wizard",
    subtitle: "Configure quant persona, wallet identity, and Swig session guardrails",
    icon: <Sparkle className="w-4 h-4 text-purple-400" weight="fill" />,
    badge: "Guide",
  },
  {
    id: "nav-journal",
    category: "Navigation",
    title: "Open Automated Trade Journal & Audit",
    subtitle: "View execution logs, win rates, and rationale notes",
    icon: <Receipt className="w-4 h-4 text-zinc-400" />,
  },
];

export function CommandPalette({
  isOpen,
  onClose,
  onSelectMarket,
  onSelectAction,
}: CommandPaletteProps) {
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Filter items based on query
  const filteredItems = React.useMemo(() => {
    if (!query.trim()) return SAMPLE_COMMANDS;
    const q = query.toLowerCase();
    return SAMPLE_COMMANDS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query]);

  // Focus input on open
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        setSelectedIndex(0);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setQuery("");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Global hotkey listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        onClose();
      } else if (isOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredItems.length - 1 ? prev + 1 : 0
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredItems.length - 1
          );
        } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
          e.preventDefault();
          const item = filteredItems[selectedIndex];
          if (item.category === "Markets" && onSelectMarket) {
            onSelectMarket(item.id);
          } else if (onSelectAction) {
            onSelectAction(item.id);
          }
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, filteredItems, selectedIndex, onSelectMarket, onSelectAction]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-150">
      {/* Click outside to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-[#1F232F] bg-[#090A0E] text-white shadow-2xl shadow-black/80 flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1F232F] bg-[#0C0D12]">
          <MagnifyingGlass className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search markets, odds, arbitrage spreads, or commands..."
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 outline-none font-sans"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-[#161822] border border-[#1F232F] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
            <CommandIcon className="w-3 h-3" /> K
          </kbd>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2 space-y-1 terminal-scroll">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 font-sans">
              No matching markets or quantitative actions found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.category === "Markets" && onSelectMarket) {
                      onSelectMarket(item.id);
                    } else if (onSelectAction) {
                      onSelectAction(item.id);
                    }
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-left",
                    isSelected
                      ? "bg-[#141722] border border-[#1F232F]"
                      : "hover:bg-white/[0.03] border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-md bg-[#12141C] border border-[#1F232F] shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-zinc-200 truncate font-sans">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-zinc-500 font-mono truncate mt-0.5 tabular-nums">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.badge && (
                    <span className="shrink-0 px-2 py-0.5 text-[10px] font-mono rounded bg-[#00D688]/10 text-[#00D688] border border-[#00D688]/25 tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[#1F232F] bg-[#0A0B0F] text-[11px] text-zinc-500 font-sans">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-[#161822] text-[10px] font-mono text-zinc-400">
                ↑↓
              </kbd>{" "}
              Navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-[#161822] text-[10px] font-mono text-zinc-400">
                ↵
              </kbd>{" "}
              Select
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-[#161822] text-[10px] font-mono text-zinc-400">
                esc
              </kbd>{" "}
              Close
            </span>
          </div>
          <span className="text-zinc-600 font-mono text-[10px]">
            Trayse Intelligence Engine
          </span>
        </div>
      </div>
    </div>
  );
}
