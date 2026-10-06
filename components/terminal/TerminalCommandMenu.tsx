"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Zap,
  BarChart3,
  Star,
  BookOpen,
  ArrowRight,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Kbd } from "@/components/ui/kbd";
import { Badge } from "@/components/ui/badge";

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TerminalCommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via parent
          const event = new CustomEvent("open-terminal-search");
          window.dispatchEvent(event);
        }
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const quickLinks = [
    {
      title: "Markets Overview",
      category: "Navigation",
      href: "/terminal",
      icon: BarChart3,
      badge: "All Feeds",
    },
    {
      title: "Arbitrage Scanner (Live Spreads)",
      category: "Engine",
      href: "/terminal/arbitrage",
      icon: Zap,
      badge: "+EV Spreads",
    },
    {
      title: "Saved Watchlists",
      category: "Personal",
      href: "/terminal/watchlists",
      icon: Star,
      badge: "Pinned",
    },
    {
      title: "Trade Journal & Audit Log",
      category: "Personal",
      href: "/terminal/journal",
      icon: BookOpen,
      badge: "Non-Custodial",
    },
  ];

  const filteredLinks = quickLinks.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-sm animate-in fade-in-0 duration-150">
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-[#1F232F] bg-surface shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-[#1F232F] px-4 py-3 bg-surface-elevated/40">
          <Search className="h-4 w-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search normalized markets..."
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none font-mono"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-80 overflow-y-auto p-2 terminal-scroll">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Workspaces & Modules
          </div>

          <div className="space-y-1">
            {filteredLinks.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleSelect(item.href)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-zinc-300 hover:bg-surface-elevated hover:text-white transition-colors cursor-pointer group text-left border border-transparent hover:border-[#1F232F]"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded bg-surface-elevated border border-[#1F232F] text-zinc-400 group-hover:text-[#00D688]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{item.title}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="surface" size="sm">
                      {item.badge}
                    </Badge>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-300" />
                  </div>
                </button>
              );
            })}

            {filteredLinks.length === 0 && (
              <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                No matching terminal modules or markets found.
              </div>
            )}
          </div>
        </div>

        {/* Footer Shortcut Bar */}
        <div className="flex items-center justify-between border-t border-[#1F232F] bg-[#06070A] px-4 py-2 text-[10px] font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <span>Navigate:</span>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            <span>Select:</span>
            <Kbd>↵</Kbd>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Close:</span>
            <Kbd>ESC</Kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
