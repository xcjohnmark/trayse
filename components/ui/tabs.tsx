"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  onValueChange: (val: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export function useTabs() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("useTabs must be used within <Tabs>");
  return ctx;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (val: string) => void;
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [internalVal, setInternalVal] = React.useState(defaultValue || "");
  const value = controlledValue !== undefined ? controlledValue : internalVal;

  const handleValueChange = React.useCallback(
    (newVal: string) => {
      if (controlledValue === undefined) {
        setInternalVal(newVal);
      }
      onValueChange?.(newVal);
    },
    [controlledValue, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg bg-surface p-1 text-zinc-400 border border-[#1F232F]",
        className
      )}
      {...props}
    />
  );
}

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({
  className,
  value,
  children,
  ...props
}: TabsTriggerProps) {
  const { value: activeVal, onValueChange } = useTabs();
  const isActive = activeVal === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00D688] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
        isActive
          ? "bg-surface-elevated text-white shadow-sm border border-[#1F232F]/80 font-semibold"
          : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({
  className,
  value,
  children,
  ...props
}: TabsContentProps) {
  const { value: activeVal } = useTabs();
  if (activeVal !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn("mt-3 focus-visible:outline-none animate-in fade-in-50 duration-150", className)}
      {...props}
    >
      {children}
    </div>
  );
}
