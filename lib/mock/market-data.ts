import {
  NormalizedMarketPair,
  OrderBook,
  OrderBookLevel,
  QuantStrategyModel,
  VenueMarket,
} from "../types/terminal";
import { calculateSpreadBps, calculateSyntheticArbitrage } from "../market/normalization";

/**
 * Generates realistic 5-level bids and asks around a mid-market contract price.
 */
function createDepthLevels(midPrice: number, baseSize: number): OrderBook {
  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];

  let cumBidSize = 0;
  for (let i = 1; i <= 5; i++) {
    const price = Math.max(0.01, Number((midPrice - i * 0.01).toFixed(2)));
    const size = Math.round(baseSize * (1 + i * 0.35));
    cumBidSize += size;
    bids.push({ price, size, total: cumBidSize });
  }

  let cumAskSize = 0;
  for (let i = 1; i <= 5; i++) {
    const price = Math.min(0.99, Number((midPrice + i * 0.01).toFixed(2)));
    const size = Math.round(baseSize * (1 + i * 0.3));
    cumAskSize += size;
    asks.push({ price, size, total: cumAskSize });
  }

  return {
    bids,
    asks,
    lastUpdated: Date.now(),
  };
}

/**
 * 8 Realistic Pre-Seeded Normalized Prediction Market Pairs spanning
 * Macro, Tech & Equities, Physical Weather, Politics, and Crypto.
 */
export const INITIAL_MARKET_PAIRS: NormalizedMarketPair[] = [
  // Pair 1: Macro - Fed Rate Cut (Arbitrage Positive)
  {
    id: "fed-rate-cut-nov-2026",
    canonicalTitle: "US Federal Reserve: Rate Cut in November 2026",
    category: "Macro",
    expiryTimestamp: 1794096000000,
    expiryDateFormatted: "Nov 05, 2026",
    divergenceBps: 600, // 64% vs 58%
    hasArbitrage: true,
    polymarket: {
      venue: "polymarket",
      marketId: "pm-fed-rate-nov26",
      ticker: "PM-FED-CUT",
      yesPrice: 0.58,
      noPrice: 0.42,
      bestBid: 0.57,
      bestAsk: 0.58,
      volume24h: 3420800,
      liquidityUsd: 1250000,
      orderBook: createDepthLevels(0.58, 4200),
      externalUrl: "https://polymarket.com/event/fed-rate-cut-november-2026",
    },
    kalshi: {
      venue: "kalshi",
      marketId: "kalshi-fed-rate-nov26",
      ticker: "KXFEDNOV26",
      yesPrice: 0.64,
      noPrice: 0.36,
      bestBid: 0.63,
      bestAsk: 0.64,
      volume24h: 1850400,
      liquidityUsd: 890000,
      orderBook: createDepthLevels(0.64, 3100),
      externalUrl: "https://kalshi.com/markets/fed-rate-decision",
    },
  },

  // Pair 2: Tech & Equities - NVIDIA Market Cap (Arbitrage Positive + Robinhood Equity Link)
  {
    id: "nvda-market-cap-3-5t",
    canonicalTitle: "NVIDIA Market Cap Above $3.5T Post-Earnings",
    category: "Tech & Equities",
    expiryTimestamp: 1795305600000,
    expiryDateFormatted: "Nov 19, 2026",
    divergenceBps: 700, // 51% vs 44%
    hasArbitrage: true,
    correlatedEquityTicker: "$NVDA-RH",
    polymarket: {
      venue: "polymarket",
      marketId: "pm-nvda-cap-35t",
      ticker: "PM-NVDA-35T",
      yesPrice: 0.44,
      noPrice: 0.56,
      bestBid: 0.43,
      bestAsk: 0.44,
      volume24h: 4890100,
      liquidityUsd: 2100000,
      orderBook: createDepthLevels(0.44, 5800),
      externalUrl: "https://polymarket.com/event/nvidia-35t-market-cap",
    },
    kalshi: {
      venue: "kalshi",
      marketId: "kalshi-nvda-cap-35t",
      ticker: "KXNVDA35T",
      yesPrice: 0.51,
      noPrice: 0.49,
      bestBid: 0.50,
      bestAsk: 0.51,
      volume24h: 2410500,
      liquidityUsd: 1150000,
      orderBook: createDepthLevels(0.51, 3900),
      externalUrl: "https://kalshi.com/markets/nvda-market-cap",
    },
  },

  // Pair 3: Physical & Weather - Category 4 Hurricane Landfall
  {
    id: "atlantic-hurricane-cat4-2026",
    canonicalTitle: "Atlantic Hurricane Category 4+ US Landfall in 2026",
    category: "Physical & Weather",
    expiryTimestamp: 1796083200000,
    expiryDateFormatted: "Nov 30, 2026",
    divergenceBps: 200,
    hasArbitrage: false,
    polymarket: {
      venue: "polymarket",
      marketId: "pm-hurricane-cat4",
      ticker: "PM-HURR-CAT4",
      yesPrice: 0.34,
      noPrice: 0.66,
      bestBid: 0.33,
      bestAsk: 0.34,
      volume24h: 980400,
      liquidityUsd: 430000,
      orderBook: createDepthLevels(0.34, 1800),
      externalUrl: "https://polymarket.com/event/atlantic-hurricane-category-4",
    },
    kalshi: {
      venue: "kalshi",
      marketId: "kalshi-hurricane-cat4",
      ticker: "KXHURRCAT4",
      yesPrice: 0.36,
      noPrice: 0.64,
      bestBid: 0.35,
      bestAsk: 0.36,
      volume24h: 740100,
      liquidityUsd: 310000,
      orderBook: createDepthLevels(0.36, 1400),
      externalUrl: "https://kalshi.com/markets/hurricane-us-landfall",
    },
  },

  // Pair 4: Politics - US Popular Vote Margin
  {
    id: "us-popular-vote-margin-2-5",
    canonicalTitle: "US Presidential Popular Vote Margin > 2.5%",
    category: "Politics",
    expiryTimestamp: 1794009600000,
    expiryDateFormatted: "Nov 04, 2026",
    divergenceBps: 100,
    hasArbitrage: false,
    polymarket: {
      venue: "polymarket",
      marketId: "pm-pop-vote-margin",
      ticker: "PM-POPVOTE-25",
      yesPrice: 0.52,
      noPrice: 0.48,
      bestBid: 0.51,
      bestAsk: 0.52,
      volume24h: 12400900,
      liquidityUsd: 5900000,
      orderBook: createDepthLevels(0.52, 12000),
      externalUrl: "https://polymarket.com/event/popular-vote-margin",
    },
    kalshi: {
      venue: "kalshi",
      marketId: "kalshi-pop-vote-margin",
      ticker: "KXPOPVOTE25",
      yesPrice: 0.53,
      noPrice: 0.47,
      bestBid: 0.52,
      bestAsk: 0.53,
      volume24h: 8100400,
      liquidityUsd: 4200000,
      orderBook: createDepthLevels(0.53, 9500),
      externalUrl: "https://kalshi.com/markets/presidential-popular-vote",
    },
  },

  // Pair 5: Crypto - Solana Peak Daily TPS
  {
    id: "solana-peak-daily-tps-65k",
    canonicalTitle: "Solana Peak Daily TPS Breaks 65,000",
    category: "Crypto",
    expiryTimestamp: 1798761600000,
    expiryDateFormatted: "Dec 31, 2026",
    divergenceBps: 300,
    hasArbitrage: false,
    polymarket: {
      venue: "polymarket",
      marketId: "pm-sol-tps-65k",
      ticker: "PM-SOL-65K",
      yesPrice: 0.56,
      noPrice: 0.44,
      bestBid: 0.55,
      bestAsk: 0.56,
      volume24h: 2150000,
      liquidityUsd: 870000,
      orderBook: createDepthLevels(0.56, 3200),
      externalUrl: "https://polymarket.com/event/solana-peak-tps-2026",
    },
    kalshi: {
      venue: "kalshi",
      marketId: "kalshi-sol-tps-65k",
      ticker: "KXSOLTPS65",
      yesPrice: 0.59,
      noPrice: 0.41,
      bestBid: 0.58,
      bestAsk: 0.59,
      volume24h: 1120000,
      liquidityUsd: 540000,
      orderBook: createDepthLevels(0.59, 2100),
      externalUrl: "https://kalshi.com/markets/solana-network-tps",
    },
  },

  // Pair 6: Tech & Equities - S&P 500 Above 6,200 (Robinhood Equity Link)
  {
    id: "sp500-above-6200-yearend",
    canonicalTitle: "S&P 500 Closes Above 6,200 Before Year-End",
    category: "Tech & Equities",
    expiryTimestamp: 1798675200000,
    expiryDateFormatted: "Dec 30, 2026",
    divergenceBps: 200,
    hasArbitrage: false,
    correlatedEquityTicker: "$SPY-RH",
    polymarket: {
      venue: "polymarket",
      marketId: "pm-spy-6200-yearend",
      ticker: "PM-SPY-6200",
      yesPrice: 0.48,
      noPrice: 0.52,
      bestBid: 0.47,
      bestAsk: 0.48,
      volume24h: 3100500,
      liquidityUsd: 1450000,
      orderBook: createDepthLevels(0.48, 4100),
      externalUrl: "https://polymarket.com/event/sp500-6200-year-end",
    },
    kalshi: {
      venue: "kalshi",
      marketId: "kalshi-spy-6200-yearend",
      ticker: "KXSPY6200",
      yesPrice: 0.50,
      noPrice: 0.50,
      bestBid: 0.49,
      bestAsk: 0.50,
      volume24h: 2190800,
      liquidityUsd: 980000,
      orderBook: createDepthLevels(0.50, 3100),
      externalUrl: "https://kalshi.com/markets/sp500-target-level",
    },
  },

  // Pair 7: Macro - US Headline CPI YoY Below 2.4% (Arbitrage Positive)
  {
    id: "us-cpi-below-2-4-q4",
    canonicalTitle: "US Headline CPI YoY Below 2.4% in Q4 2026",
    category: "Macro",
    expiryTimestamp: 1797206400000,
    expiryDateFormatted: "Dec 14, 2026",
    divergenceBps: 500,
    hasArbitrage: true,
    polymarket: {
      venue: "polymarket",
      marketId: "pm-cpi-24-q4",
      ticker: "PM-CPI-24",
      yesPrice: 0.38,
      noPrice: 0.62,
      bestBid: 0.37,
      bestAsk: 0.38,
      volume24h: 1780400,
      liquidityUsd: 820000,
      orderBook: createDepthLevels(0.38, 2500),
      externalUrl: "https://polymarket.com/event/us-cpi-inflation-q4",
    },
    kalshi: {
      venue: "kalshi",
      marketId: "kalshi-cpi-24-q4",
      ticker: "KXCPI24Q4",
      yesPrice: 0.43,
      noPrice: 0.57,
      bestBid: 0.42,
      bestAsk: 0.43,
      volume24h: 1290300,
      liquidityUsd: 610000,
      orderBook: createDepthLevels(0.43, 1900),
      externalUrl: "https://kalshi.com/markets/cpi-inflation-print",
    },
  },

  // Pair 8: Crypto - Bitcoin All-Time High Breaks $120,000
  {
    id: "bitcoin-breaks-120k",
    canonicalTitle: "Bitcoin All-Time High Breaks $120,000",
    category: "Crypto",
    expiryTimestamp: 1798761600000,
    expiryDateFormatted: "Dec 31, 2026",
    divergenceBps: 100,
    hasArbitrage: false,
    polymarket: {
      venue: "polymarket",
      marketId: "pm-btc-120k",
      ticker: "PM-BTC-120K",
      yesPrice: 0.62,
      noPrice: 0.38,
      bestBid: 0.61,
      bestAsk: 0.62,
      volume24h: 18450000,
      liquidityUsd: 7800000,
      orderBook: createDepthLevels(0.62, 16000),
      externalUrl: "https://polymarket.com/event/bitcoin-ath-120k",
    },
    kalshi: {
      venue: "kalshi",
      marketId: "kalshi-btc-120k",
      ticker: "KXBTC120K",
      yesPrice: 0.63,
      noPrice: 0.37,
      bestBid: 0.62,
      bestAsk: 0.63,
      volume24h: 12100400,
      liquidityUsd: 5300000,
      orderBook: createDepthLevels(0.63, 11000),
      externalUrl: "https://kalshi.com/markets/bitcoin-all-time-high",
    },
  },
];

/**
 * 4 Verified Quantitative Strategy Models spanning Macro Nowcasting,
 * Physical Weather Dynamics, Tech Earnings Volatility, and On-Chain Whale Flow.
 */
export const QUANT_STRATEGY_MODELS: QuantStrategyModel[] = [
  {
    id: "quant-model-macro-nowcast",
    name: "FedWatch Inflation Nowcast Model",
    category: "Macro",
    description:
      "Multivariate regression model analyzing daily high-frequency CPI prints, Treasury breakeven spreads, and commodity futures to calculate statistical odds of central bank rate moves.",
    dataSource: "Bureau of Labor Statistics (BLS) & Cleveland Fed Nowcast",
    modelProbability: 0.685,
    marketProbability: 0.62,
    statisticalEdge: 0.065,
    edgeDirection: "BUY_YES",
    historicalWinRate: 72.4,
    sharpeRatio: 2.41,
    signalStrength: "STRONG",
    suggestedKellyStakePercent: 4.2,
  },
  {
    id: "quant-model-weathernext",
    name: "WeatherNext Physical Atmospheric Dynamics",
    category: "Physical & Weather",
    description:
      "Physics-based atmospheric numerical ensemble combining high-resolution satellite radar and GFS/ECMWF forecasts to predict temperature and hurricane landfall probabilities.",
    dataSource: "NOAA HRRR / European Centre ECMWF Ensembles",
    modelProbability: 0.41,
    marketProbability: 0.34,
    statisticalEdge: 0.07,
    edgeDirection: "BUY_YES",
    historicalWinRate: 76.2,
    sharpeRatio: 2.85,
    signalStrength: "STRONG",
    suggestedKellyStakePercent: 5.1,
  },
  {
    id: "quant-model-earnings-vol",
    name: "Earnings Volatility Surface Scanner",
    category: "Tech & Equities",
    description:
      "Options implied volatility surface analyzer modeling probability distributions of post-earnings price moves, correlated directly with Robinhood Tokenized Equities ($NVDA-RH).",
    dataSource: "Robinhood Nitro L2 Order Flow & Cboe Options Skew",
    modelProbability: 0.54,
    marketProbability: 0.495,
    statisticalEdge: 0.045,
    edgeDirection: "BUY_YES",
    historicalWinRate: 68.9,
    sharpeRatio: 2.1,
    signalStrength: "MODERATE",
    suggestedKellyStakePercent: 3.5,
  },
  {
    id: "quant-model-whale-flow",
    name: "Yellowstone Whale Flow Asymmetry",
    category: "Crypto",
    description:
      "Micro-latency order flow imbalance detector tracking large-holder wallet accumulation and aggressive taker flow streamed via Solana Yellowstone gRPC validator plugins.",
    dataSource: "Yellowstone gRPC Mempool / Jito Block Engine Stream",
    modelProbability: 0.612,
    marketProbability: 0.56,
    statisticalEdge: 0.052,
    edgeDirection: "BUY_YES",
    historicalWinRate: 74.1,
    sharpeRatio: 2.55,
    signalStrength: "STRONG",
    suggestedKellyStakePercent: 4.0,
  },
];

/**
 * Simulates real-time market updates by applying minor micro-tick fluctuations
 * (±0.002) to bid/ask levels and updating calculated divergence & arbitrage flags.
 */
export function generateTickUpdate(pair: NormalizedMarketPair): NormalizedMarketPair {
  const tickDeltaPm = (Math.random() - 0.5) * 0.004;
  const tickDeltaKalshi = (Math.random() - 0.5) * 0.004;

  const newPmYes = Math.min(
    0.99,
    Math.max(0.01, Number((pair.polymarket.yesPrice + tickDeltaPm).toFixed(3)))
  );
  const newPmNo = Number((1 - newPmYes).toFixed(3));

  const newKalshiYes = Math.min(
    0.99,
    Math.max(0.01, Number((pair.kalshi.yesPrice + tickDeltaKalshi).toFixed(3)))
  );
  const newKalshiNo = Number((1 - newKalshiYes).toFixed(3));

  const divergenceBps = calculateSpreadBps(newPmYes, newKalshiYes);
  const arbResult = calculateSyntheticArbitrage(newPmYes, newPmNo, newKalshiYes, newKalshiNo);

  const updatedPolymarket: VenueMarket = {
    ...pair.polymarket,
    yesPrice: newPmYes,
    noPrice: newPmNo,
    bestBid: Math.max(0.01, Number((newPmYes - 0.01).toFixed(2))),
    bestAsk: Math.min(0.99, Number((newPmYes + 0.01).toFixed(2))),
    orderBook: {
      ...pair.polymarket.orderBook,
      lastUpdated: Date.now(),
    },
  };

  const updatedKalshi: VenueMarket = {
    ...pair.kalshi,
    yesPrice: newKalshiYes,
    noPrice: newKalshiNo,
    bestBid: Math.max(0.01, Number((newKalshiYes - 0.01).toFixed(2))),
    bestAsk: Math.min(0.99, Number((newKalshiYes + 0.01).toFixed(2))),
    orderBook: {
      ...pair.kalshi.orderBook,
      lastUpdated: Date.now(),
    },
  };

  return {
    ...pair,
    polymarket: updatedPolymarket,
    kalshi: updatedKalshi,
    divergenceBps,
    hasArbitrage: arbResult.hasArb,
  };
}
