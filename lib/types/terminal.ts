/**
 * Trayse Terminal: Foundational Domain Types & Interfaces
 * 
 * Master domain definitions unifying Polymarket (CLOB), Kalshi (CFTC v2),
 * Solana High-Frequency SVM, and Robinhood Arbitrum Nitro L2 rails.
 */

// 1. Odds Format Representation
export type OddsFormat = 'PROBABILITY' | 'DECIMAL' | 'AMERICAN' | 'CENTS';

// 2. Execution Blockchain Rail
export type BlockchainRail = 'DUAL' | 'SOLANA' | 'ROBINHOOD';

// 2b. High-Frequency WebSocket Stream Status
export type WebSocketConnectionStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'ERROR';

// 2c. Off-Thread Conflated Tick Payload (Bloomberg-Grade)
export interface ConflatedMarketTick {
  assetId: string;
  pairId?: string;
  yesPrice: number;
  noPrice: number;
  bestBid: number;
  bestAsk: number;
  lastTradePrice?: number;
  volume24h?: number;
  timestamp: number;
  tickDirection: 'UP' | 'DOWN' | 'FLAT';
}

// 3. Normalized Market Category Taxonomy
export type MarketCategory =
  | 'Macro'
  | 'Tech & Equities'
  | 'Physical & Weather'
  | 'Politics'
  | 'Crypto'
  | 'Sports';

// 4. Single Order Book Depth Level
export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

// 5. Full Central Limit Order Book Depth
export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  lastUpdated: number;
}

// 5b. Submarket Multi-Outcome Contract (e.g. Candidates, Teams)
export interface SubMarketOutcome {
  id: string;
  title: string;
  yesPrice: number;
  noPrice: number;
  image?: string;
  icon?: string;
  assetId?: string; // Polymarket CLOB token ID for streaming
}

// 6. Platform-Specific Market Contract
export interface VenueMarket {
  venue: 'polymarket' | 'kalshi';
  marketId: string;
  ticker: string;
  assetId?: string; // Polymarket CLOB token asset ID for direct WSS subscription
  yesPrice: number; // Normalized probability: 0.000 - 1.000
  noPrice: number;  // Normalized probability: 0.000 - 1.000
  bestBid: number;
  bestAsk: number;
  volume24h: number;
  liquidityUsd: number;
  orderBook: OrderBook;
  externalUrl: string;
  image?: string;
  icon?: string;
  submarkets?: SubMarketOutcome[];
}

// 7. Canonical Normalized Cross-Venue Market Pair
export interface NormalizedMarketPair {
  id: string;
  canonicalTitle: string;
  category: MarketCategory;
  expiryTimestamp: number;
  expiryDateFormatted: string;
  image?: string;
  icon?: string;
  submarkets?: SubMarketOutcome[];
  polymarket: VenueMarket;
  kalshi: VenueMarket;
  divergenceBps: number;
  hasArbitrage: boolean;
  correlatedEquityTicker?: string; // e.g., "$NVDA-RH", "$SPY-RH"
}

// 8. Actionable Cross-Venue Synthetic Arbitrage Opportunity
export interface ArbitrageOpportunity {
  pairId: string;
  canonicalTitle: string;
  buyVenueYes: 'polymarket' | 'kalshi';
  buyPriceYes: number;
  buyVenueNo: 'polymarket' | 'kalshi';
  buyPriceNo: number;
  effectiveCost: number; // YesPrice + NoPrice + EstimatedFees
  grossSpreadBps: number;
  netSpreadBps: number;
  roiPercent: number;
  maxCapitalCapacityUsd: number;
  expiryTimestamp: number;
}

// 9. Quantitative Strategy Model Specification
export interface QuantStrategyModel {
  id: string;
  name: string;
  category: MarketCategory;
  description: string;
  dataSource: string; // e.g., "NOAA High-Res Ensemble", "BLS Nowcast Regression", "Yellowstone Mempool"
  modelProbability: number;
  marketProbability: number;
  statisticalEdge: number; // modelProbability - marketProbability
  edgeDirection: 'BUY_YES' | 'BUY_NO' | 'NEUTRAL';
  historicalWinRate: number;
  sharpeRatio: number;
  signalStrength: 'STRONG' | 'MODERATE' | 'WEAK';
  suggestedKellyStakePercent: number;
}

// 10. Swig Non-Custodial Delegated Session Key Guardrails
export interface SessionKeyConfig {
  publicKey: string;
  isAuthorized: boolean;
  maxPositionUsd: number;
  maxSlippageBps: number;
  dailyLossLimitUsd: number;
  expiresAt: number;
  authorizedChains: string[];
}

// 11. Non-Custodial Personal Trade Journal Record
export interface JournalEntry {
  id: string;
  timestamp: number;
  pairId: string;
  marketTitle: string;
  venue: 'Polymarket' | 'Kalshi' | 'Dual-Arb';
  position: 'YES' | 'NO' | 'SYNTHETIC_ARB';
  entryPrice: number;
  sizeUsd: number;
  status: 'OPEN' | 'WON' | 'LOST' | 'CLOSED';
  pnlUsd: number;
  thesis: string;
}

// Auxiliary Rail Telemetry
export interface DualRailTelemetry {
  solanaSlot: number;
  solanaLatencyMs: number;
  nitroBlock: number;
  nitroLatencyMs: number;
  feedStatus: {
    polymarket: 'ACTIVE' | 'LAGGING' | 'OFFLINE';
    kalshi: 'ACTIVE' | 'LAGGING' | 'OFFLINE';
  };
  lastSyncTimestamp: number;
}
