"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Zap,
  Star,
  BookOpen,
  PanelLeftClose,
  PanelLeft,
  Activity,
  Layers,
  ChevronRight,
  Database,
  Radio,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "default" | "mint" | "surface" | "outline";
  description: string;
}

const mainNavItems: NavItem[] = [
  {
    name: "Markets",
    href: "/terminal",
    icon: BarChart3,
    badge: "1.2K",
    badgeVariant: "surface",
    description: "Normalized Cross-Platform Order Books",
  },
  {
    name: "Arbitrage Scanner",
    href: "/terminal/arbitrage",
    icon: Zap,
    badge: "+3.6% EV",
    badgeVariant: "mint",
    description: "Synthetic Risk-Free Spread Opportunities",
  },
  {
    name: "Watchlists",
    href: "/terminal/watchlists",
    icon: Star,
    badge: "3",
    badgeVariant: "default",
    description: "Custom Institutional Monitoring Desks",
  },
  {
    name: "Trade Journal",
    href: "/terminal/journal",
    icon: BookOpen,
    badge: "Local",
    badgeVariant: "surface",
    description: "Private Position Tracker & Audit Trail",
  },
];

export function TerminalSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-[#1F232F] bg-surface select-none transition-all duration-200 z-30 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Top Sidebar Sub-Dock / Header */}
      <div className="flex h-12 items-center justify-between px-3 border-b border-[#1F232F]">
        {!collapsed ? (
          <div className="flex items-center gap-2 overflow-hidden px-1">
            <div className="h-2 w-2 rounded-full bg-[#00D688] shadow-[0_0_8px_rgba(0,214,136,0.6)]" />
            <span className="text-xs font-semibold tracking-wider text-zinc-300 uppercase font-mono">
              Intelligence Dock
            </span>
          </div>
        ) : (
          <div className="mx-auto">
            <div className="h-2.5 w-2.5 rounded-full bg-[#00D688] shadow-[0_0_8px_rgba(0,214,136,0.6)]" />
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "inline-flex items-center justify-center h-7 w-7 rounded border border-[#1F232F] bg-surface-elevated text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer",
            collapsed && "mx-auto"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="h-3.5 w-3.5" />
          ) : (
            <PanelLeftClose className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Navigation Links Area */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 terminal-scroll">
        {!collapsed && (
          <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Workspaces
          </div>
        )}

        {mainNavItems.map((item) => {
          const Icon = item.icon;
          // Active if pathname matches exact or sub-route
          const isActive =
            item.href === "/terminal"
              ? pathname === "/terminal" || pathname === "/terminal/"
              : pathname.startsWith(item.href);

          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer",
                isActive
                  ? "bg-surface-elevated text-white border border-[#1F232F] shadow-sm"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
              )}
            >
              {/* Active left indicator accent bar */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[#00D688] shadow-[0_0_8px_rgba(0,214,136,0.5)]" />
              )}

              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-[#00D688]"
                    : "text-zinc-400 group-hover:text-zinc-200"
                )}
              />

              {!collapsed && (
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <Badge
                      variant={item.badgeVariant || "default"}
                      size="sm"
                      className="ml-auto shrink-0"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip
                key={item.href}
                side="right"
                content={
                  <div className="space-y-0.5">
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-[10px] text-zinc-400">{item.description}</p>
                  </div>
                }
              >
                {linkContent}
              </Tooltip>
            );
          }

          return linkContent;
        })}

        {/* Secondary Category / Feeds Group */}
        {!collapsed && (
          <div className="pt-4 px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Feed Channels
          </div>
        )}

        <div className="space-y-1">
          <div
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-zinc-500 rounded",
              collapsed && "justify-center px-0"
            )}
          >
            <Radio className="h-3.5 w-3.5 text-[#00D688] shrink-0 animate-pulse" />
            {!collapsed && (
              <div className="flex flex-1 items-center justify-between text-[11px] font-mono">
                <span>Polymarket CLOB</span>
                <span className="text-[#00D688]">9ms</span>
              </div>
            )}
          </div>

          <div
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-zinc-500 rounded",
              collapsed && "justify-center px-0"
            )}
          >
            <Database className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            {!collapsed && (
              <div className="flex flex-1 items-center justify-between text-[11px] font-mono">
                <span>Kalshi CFTC v2</span>
                <span className="text-blue-400">14ms</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Utility Dock */}
      <div className="border-t border-[#1F232F] p-2 bg-[#06070A]/80 backdrop-blur-sm">
        {!collapsed ? (
          <div className="rounded border border-[#1F232F] bg-surface-elevated/80 p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Activity className="h-3 w-3 text-[#00D688]" />
                Pulse
              </span>
              <span className="text-white font-medium">Institutional v1.0</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>Arbitrage Engine</span>
              <span className="text-[#00D688]">ONLINE</span>
            </div>
          </div>
        ) : (
          <Tooltip side="right" content="Terminal Engine: Online (Normalizing)">
            <div className="flex justify-center py-1">
              <div className="h-2 w-2 rounded-full bg-[#00D688]" />
            </div>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}
