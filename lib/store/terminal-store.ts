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
  | null;

export interface TerminalState {
  // 1. Navigation & View Modes
  activeRail: BlockchainRail;
  oddsFormat: OddsFormat;
  activeCategory: MarketCategory | "All";
  searchQuery: string;
  selectedPairId: string | null;

  // 2. Personal Watchlists & Audit Journal (Persisted)
  watchlists: string[];
  journalEntries: JournalEntry[];

  // 3. Swig Non-Custodial Session Keys
  sessionKey: SessionKeyConfig;

  // 4. Modal Triggers & Context
  activeModal: ModalType;
  modalContextPairId: string | null;

  // Actions
  setActiveRail: (rail: BlockchainRail) => void;
  setOddsFormat: (format: OddsFormat) => void;
  setActiveCategory: (cat: MarketCategory | "All") => void;
  setSearchQuery: (q: string) => void;
  setSelectedPairId: (id: string | null) => void;
  toggleWatchlist: (pairId: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, "id" | "timestamp">) => void;
  updateJournalEntryStatus: (id: string, status: JournalEntry["status"]) => void;
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

      watchlists: ["fed-rate-cut-nov-2026", "nvda-market-cap-3-5t"],
      journalEntries: INITIAL_JOURNAL_ENTRIES,

      sessionKey: DEFAULT_SESSION_KEY,

      activeModal: null,
      modalContextPairId: null,

      // Actions
      setActiveRail: (activeRail) => set({ activeRail }),

      setOddsFormat: (oddsFormat) => set({ oddsFormat }),

      setActiveCategory: (activeCategory) => set({ activeCategory }),

      setSearchQuery: (searchQuery) => set({ searchQuery }),

      setSelectedPairId: (selectedPairId) => set({ selectedPairId }),

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
      // Only persist watchlists, journalEntries, and sessionKey
      partialize: (state) => ({
        watchlists: state.watchlists,
        journalEntries: state.journalEntries,
        sessionKey: state.sessionKey,
        oddsFormat: state.oddsFormat,
        activeRail: state.activeRail,
      }),
    }
  )
);
