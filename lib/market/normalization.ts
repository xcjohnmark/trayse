import { OddsFormat } from "../types/terminal";

/**
 * Normalizes an integer cents price from Kalshi (e.g. 64) into a decimal probability (0.640).
 * Clamps safely between 0.001 and 0.999 to prevent division-by-zero or infinite odds.
 */
export function normalizeKalshiPrice(cents: number): number {
  const prob = cents / 100;
  return Math.min(Math.max(Number(prob.toFixed(3)), 0.001), 0.999);
}

/**
 * Formats a probability (0.000 - 1.000) across standard financial/prediction formats:
 * - PROBABILITY: "64.0%"
 * - DECIMAL: "1.56x" (Gross payout multiple = 1 / probability)
 * - AMERICAN: "-178" or "+150"
 * - CENTS: "64¢"
 */
export function convertOdds(probability: number, format: OddsFormat): string {
  // Clamp probability to valid non-zero domain
  const clampedProb = Math.min(Math.max(probability, 0.001), 0.999);

  switch (format) {
    case "PROBABILITY":
      return `${(clampedProb * 100).toFixed(1)}%`;

    case "DECIMAL": {
      const payoutMultiplier = 1 / clampedProb;
      return `${payoutMultiplier.toFixed(2)}x`;
    }

    case "AMERICAN": {
      if (clampedProb >= 0.5) {
        // Favorite: - (p / (1 - p)) * 100
        const moneyline = Math.round(-(clampedProb / (1 - clampedProb)) * 100);
        return `${moneyline}`;
      } else {
        // Underdog: + ((1 - p) / p) * 100
        const moneyline = Math.round(((1 - clampedProb) / clampedProb) * 100);
        return `+${moneyline}`;
      }
    }

    case "CENTS": {
      const cents = Math.round(clampedProb * 100);
      return `${cents}¢`;
    }

    default:
      return `${(clampedProb * 100).toFixed(1)}%`;
  }
}

/**
 * Returns the absolute pricing difference between two probabilities in basis points (bps).
 * 1% spread = 100 bps.
 */
export function calculateSpreadBps(priceA: number, priceB: number): number {
  return Math.round(Math.abs(priceA - priceB) * 10000);
}

export interface SyntheticArbitrageResult {
  hasArb: boolean;
  buyVenueYes: "polymarket" | "kalshi";
  buyPriceYes: number;
  buyVenueNo: "polymarket" | "kalshi";
  buyPriceNo: number;
  rawCost: number;
  feeCost: number;
  effectiveCost: number;
  grossSpreadBps: number;
  netSpreadBps: number;
  roiPercent: number;
}

/**
 * Evaluates cross-platform synthetic risk-free arbitrage opportunities between Polymarket & Kalshi.
 * 
 * In prediction markets, holding YES + NO on the same underlying guarantees a $1.00 payout at resolution.
 * If (BestYes + BestNo + TakerFees) < $1.00, an investor can lock in risk-free basis return.
 * 
 * Case 1: Buy YES on Polymarket + Buy NO on Kalshi
 * Case 2: Buy YES on Kalshi + Buy NO on Polymarket
 */
export function calculateSyntheticArbitrage(
  pmYes: number,
  pmNo: number,
  kalshiYes: number,
  kalshiNo: number,
  feeTakerBps: number = 30
): SyntheticArbitrageResult {
  const feeCost = feeTakerBps / 10000;

  const costCase1 = pmYes + kalshiNo;
  const costCase2 = kalshiYes + pmNo;

  let buyVenueYes: "polymarket" | "kalshi";
  let buyPriceYes: number;
  let buyVenueNo: "polymarket" | "kalshi";
  let buyPriceNo: number;
  let rawCost: number;

  if (costCase1 <= costCase2) {
    buyVenueYes = "polymarket";
    buyPriceYes = pmYes;
    buyVenueNo = "kalshi";
    buyPriceNo = kalshiNo;
    rawCost = costCase1;
  } else {
    buyVenueYes = "kalshi";
    buyPriceYes = kalshiYes;
    buyVenueNo = "polymarket";
    buyPriceNo = pmNo;
    rawCost = costCase2;
  }

  const effectiveCost = Number((rawCost + feeCost).toFixed(4));
  const hasArb = effectiveCost < 1.0;
  const grossSpreadBps = Math.round((1.0 - rawCost) * 10000);
  const netSpreadBps = Math.round((1.0 - effectiveCost) * 10000);
  const roiPercent =
    effectiveCost > 0
      ? Number((((1.0 - effectiveCost) / effectiveCost) * 100).toFixed(2))
      : 0;

  return {
    hasArb,
    buyVenueYes,
    buyPriceYes,
    buyVenueNo,
    buyPriceNo,
    rawCost: Number(rawCost.toFixed(4)),
    feeCost: Number(feeCost.toFixed(4)),
    effectiveCost,
    grossSpreadBps,
    netSpreadBps,
    roiPercent,
  };
}

/**
 * Common English and finance boilerplate stop-words to strip for canonical title matching.
 */
const STOP_WORDS = new Set([
  "will",
  "the",
  "in",
  "of",
  "at",
  "to",
  "a",
  "an",
  "on",
  "by",
  "for",
  "is",
  "be",
  "or",
  "and",
  "before",
  "after",
  "during",
  "market",
  "contracts",
  "price",
  "target",
]);

/**
 * Cleans a market title string by removing punctuation, digits/special chars formatting,
 * and stop-words, returning a set of normalized root keyword tokens.
 */
function tokenizeTitle(title: string): Set<string> {
  const cleaned = title
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned.split(" ").filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  return new Set(words);
}

/**
 * Computes a token similarity coefficient (0.0 to 1.0) between two market titles.
 * Uses the Dice similarity coefficient over filtered entity keywords.
 * 
 * Example:
 * Title A: "Will the Fed cut rates in November 2026?"
 * Title B: "Fed interest rate cut November 2026 decision"
 * Overlapping tokens: ["fed", "rate", "cut", "november", "2026"] -> score ~ 0.83
 */
export function fuzzyEntityMatch(titleA: string, titleB: string): number {
  const tokensA = tokenizeTitle(titleA);
  const tokensB = tokenizeTitle(titleB);

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersectionCount = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersectionCount++;
    }
  }

  // Dice coefficient: (2 * |A ∩ B|) / (|A| + |B|)
  const score = (2 * intersectionCount) / (tokensA.size + tokensB.size);
  return Number(score.toFixed(3));
}
