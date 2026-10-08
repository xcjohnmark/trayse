import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  BlockchainRail,
  JournalEntry,
  MarketCategory,
  OddsFormat,
  SessionKeyConfig,
} from "../types/terminal";

export type ModalType =
  | "SESSION_KEYS"
  | "DIALECT_BLINK"
  | "ROBINHOOD_HEDGE"
  | "DEV_SDK"
  | "CONNECT_ACCOUNTS"
  | "ORDER_SLIP"
  | "QUANT_STUDIO"
  | "ONBOARDING"
  | null;

export interface TerminalState {
  // 1. Navigation & View Modes
  activeRail: BlockchainRail;
  oddsFormat: OddsFormat;
  activeCategory: MarketCategory | "All";
  searchQuery: string;
  selectedPairId: string | null;
  isSidebarCollapsed: boolean;

  // 1b. Onboarding & Trader Persona
  hasOnboarded: boolean;
  traderPersona: "ARBITRAGEUR" | "QUANT" | "ANALYST" | "HEDGER";

  // 2. Exchange Connection & Demo Paper Trading
  polymarketConnected: boolean;
  kalshiConnected: boolean;
  isDemoMode: boolean;
  demoBalanceUsd: number;

  // 3. Order Execution Slip Context
  orderSlipContext: {
    pairId: string;
    outcome: "YES" | "NO";
  } | null;

  // 4. Personal Watchlists & Audit Journal (Persisted)
  watchlists: string[];
  journalEntries: JournalEntry[];

  // 5. Swig Non-Custodial Session Keys
  sessionKey: SessionKeyConfig;

  // 6. Modal Triggers & Context
  activeModal: ModalType;
  modalContextPairId: string | null;

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveRail: (rail: BlockchainRail) => void;
  setOddsFormat: (format: OddsFormat) => void;
  setActiveCategory: (cat: MarketCategory | "All") => void;
  setSearchQuery: (q: string) => void;
  setSelectedPairId: (id: string | null) => void;
  connectPolymarket: () => void;
  disconnectPolymarket: () => void;
  connectKalshi: () => void;
  disconnectKalshi: () => void;
  toggleDemoMode: (enabled?: boolean) => void;
  adjustDemoBalance: (delta: number) => void;
  openOrderSlip: (pairId: string, outcome: "YES" | "NO") => void;
  toggleWatchlist: (pairId: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, "id" | "timestamp">) => void;
  updateJournalEntryStatus: (id: string, status: JournalEntry["status"]) => void;
  setOnboarded: (onboarded: boolean) => void;
  setTraderPersona: (persona: "ARBITRAGEUR" | "QUANT" | "ANALYST" | "HEDGER") => void;
  updateSessionKeyConfig: (config: Partial<SessionKeyConfig>) => void;
  authorizeSessionKey: (
    maxPosition: number,
    maxSlippageBps: number,
    dailyLoss: number,
    expiryHours: number
  ) => void;
  revokeSessionKey: () => void;
  openModal: (modal: ModalType, pairId?: string | null) => void;
  closeModal: () => void;
}

const DEFAULT_SESSION_KEY: SessionKeyConfig = {
  publicKey: "swig_8kF9...2Nq4",
  isAuthorized: true,
  maxPositionUsd: 250,
  maxSlippageBps: 200, // 2.0%
  dailyLossLimitUsd: 1000,
  expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  authorizedChains: ["solana-mainnet", "robinhood-arbitrum-nitro"],
};

const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "entry-01",
    timestamp: Date.now() - 3600 * 4 * 1000,
    pairId: "fed-rate-cut-nov-2026",
    marketTitle: "US Federal Reserve: Rate Cut in November 2026",
    venue: "Dual-Arb",
    position: "SYNTHETIC_ARB",
    entryPrice: 0.943,
    sizeUsd: 500,
    status: "OPEN",
    pnlUsd: 30.22,
    thesis:
      "Synthetic cross-venue arbitrage: Kalshi YES @ 0.42 + Polymarket NO @ 0.523. Effective cost $0.943 locks in guaranteed 6.0% net basis return at resolution.",
  },
  {
    id: "entry-02",
    timestamp: Date.now() - 3600 * 24 * 1000,
    pairId: "nvda-market-cap-3-5t",
    marketTitle: "NVIDIA Market Cap Above $3.5T Post-Earnings",
    venue: "Polymarket",
    position: "YES",
    entryPrice: 0.44,
    sizeUsd: 250,
    status: "WON",
    pnlUsd: 318.18,
    thesis:
      "Implied volatility skew on Robinhood L2 tokenized options signaled 54% probability vs 44% market odds. Took directional position with tight session key stop.",
  },
];

export const useTerminalStore = create<TerminalState>()(
  persist(
    (set, get) => ({
      // Default state
      activeRail: "DUAL",
      oddsFormat: "PROBABILITY",
      activeCategory: "All",
      searchQuery: "",
      selectedPairId: null,
      isSidebarCollapsed: false,

      hasOnboarded: false,
      traderPersona: "ARBITRAGEUR",

      polymarketConnected: false,
      kalshiConnected: false,
      isDemoMode: true,
      demoBalanceUsd: 10000.0,

      orderSlipContext: null,

      watchlists: ["fed-rate-cut-nov-2026", "nvda-market-cap-3-5t"],
      journalEntries: INITIAL_JOURNAL_ENTRIES,

      sessionKey: DEFAULT_SESSION_KEY,

      activeModal: null,
      modalContextPairId: null,

      // Actions
      setOnboarded: (hasOnboarded) => set({ hasOnboarded }),
      setTraderPersona: (traderPersona) => set({ traderPersona }),
      toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
      setSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),

      setActiveRail: (activeRail) => set({ activeRail }),

      setOddsFormat: (oddsFormat) => set({ oddsFormat }),

      setActiveCategory: (activeCategory) => set({ activeCategory }),

      setSearchQuery: (searchQuery) => set({ searchQuery }),

      setSelectedPairId: (selectedPairId) => set({ selectedPairId }),

      connectPolymarket: () => set({ polymarketConnected: true }),
      disconnectPolymarket: () => set({ polymarketConnected: false }),

      connectKalshi: () => set({ kalshiConnected: true }),
      disconnectKalshi: () => set({ kalshiConnected: false }),

      toggleDemoMode: (enabled) =>
        set((s) => ({ isDemoMode: enabled !== undefined ? enabled : !s.isDemoMode })),

      adjustDemoBalance: (delta) =>
        set((s) => ({ demoBalanceUsd: Math.max(0, s.demoBalanceUsd + delta) })),

      openOrderSlip: (pairId, outcome) =>
        set({
          activeModal: "ORDER_SLIP",
          modalContextPairId: pairId,
          orderSlipContext: { pairId, outcome },
        }),

      toggleWatchlist: (pairId) => {
        const current = get().watchlists;
        const exists = current.includes(pairId);
        set({
          watchlists: exists
            ? current.filter((id) => id !== pairId)
            : [...current, pairId],
        });
      },

      addJournalEntry: (entry) => {
        const newEntry: JournalEntry = {
          ...entry,
          id: `entry-${Date.now()}`,
          timestamp: Date.now(),
        };
        set({ journalEntries: [newEntry, ...get().journalEntries] });
      },

      updateJournalEntryStatus: (id, status) => {
        set({
          journalEntries: get().journalEntries.map((e) =>
            e.id === id ? { ...e, status } : e
          ),
        });
      },

      updateSessionKeyConfig: (config) => {
        set({
          sessionKey: {
            ...get().sessionKey,
            ...config,
          },
        });
      },

      authorizeSessionKey: (
        maxPositionUsd,
        maxSlippageBps,
        dailyLossLimitUsd,
        expiryHours
      ) => {
        set({
          sessionKey: {
            publicKey: `swig_${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`,
            isAuthorized: true,
            maxPositionUsd,
            maxSlippageBps,
            dailyLossLimitUsd,
            expiresAt: Date.now() + expiryHours * 3600 * 1000,
            authorizedChains: ["solana-mainnet", "robinhood-arbitrum-nitro"],
          },
        });
      },

      revokeSessionKey: () => {
        set({
          sessionKey: {
            ...get().sessionKey,
            isAuthorized: false,
          },
        });
      },

      openModal: (activeModal, modalContextPairId = null) => {
        set({ activeModal, modalContextPairId });
      },

      closeModal: () => {
        set({ activeModal: null, modalContextPairId: null });
      },
    }),
    {
      name: "trayse-terminal-storage",
      storage: createJSONStorage(() => localStorage),
      // Persist user preferences, watchlists, journal, and demo state
      partialize: (state) => ({
        watchlists: state.watchlists,
        journalEntries: state.journalEntries,
        sessionKey: state.sessionKey,
        oddsFormat: state.oddsFormat,
        activeRail: state.activeRail,
        isDemoMode: state.isDemoMode,
        demoBalanceUsd: state.demoBalanceUsd,
        polymarketConnected: state.polymarketConnected,
        kalshiConnected: state.kalshiConnected,
        isSidebarCollapsed: state.isSidebarCollapsed,
        hasOnboarded: state.hasOnboarded,
        traderPersona: state.traderPersona,
      }),
    }
  )
);
