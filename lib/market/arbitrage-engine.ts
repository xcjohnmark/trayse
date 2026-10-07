import { ArbitrageOpportunity, NormalizedMarketPair } from "../types/terminal";

export interface ArbitrageScanOptions {
  /**
   * Aggregate estimated fees in basis points (taker fee + blockchain gas buffer).
   * Default: 25 bps (0.25% / $0.0025 per contract).
   */
  estimatedFeeBps?: number;
  /**
   * Minimum positive net ROI required to qualify as an active opportunity.
   * Default: 0.5% (effectiveCost <= 0.995).
   */
  minRoiPercent?: number;
}

/**
 * Advanced synthetic risk-free arbitrage calculator between Polymarket & Kalshi.
 * 
 * Mechanism:
 * In prediction markets, holding 1 YES share and 1 NO share on the exact same underlying
 * binary resolution guarantees a payout of exactly $1.00 at settlement.
 * 
 * If: (Price_YES_VenueA + Price_NO_VenueB + Taker_Fees) < $1.00
 * An investor locks in deterministic, risk-free net profit upon settlement regardless of the outcome.
 */
export function scanForArbitrage(
  pairs: NormalizedMarketPair[],
  options: ArbitrageScanOptions = {}
): ArbitrageOpportunity[] {
  const { estimatedFeeBps = 25, minRoiPercent = 0.5 } = options;
  const feeCost = estimatedFeeBps / 10000;

  const opportunities: ArbitrageOpportunity[] = [];

  for (const pair of pairs) {
    const pmYesPrice = pair.polymarket.yesPrice;
    const pmNoPrice = pair.polymarket.noPrice;
    const kalshiYesPrice = pair.kalshi.yesPrice;
    const kalshiNoPrice = pair.kalshi.noPrice;

    // Case A: Buy YES on Polymarket + Buy NO on Kalshi
    const rawCostCaseA = pmYesPrice + kalshiNoPrice;

    // Case B: Buy YES on Kalshi + Buy NO on Polymarket
    const rawCostCaseB = kalshiYesPrice + pmNoPrice;

    let buyVenueYes: "polymarket" | "kalshi";
    let buyPriceYes: number;
    let buyVenueNo: "polymarket" | "kalshi";
    let buyPriceNo: number;
    let rawCost: number;

    let yesSize = 0;
    let noSize = 0;

    if (rawCostCaseA <= rawCostCaseB) {
      buyVenueYes = "polymarket";
      buyPriceYes = pmYesPrice;
      buyVenueNo = "kalshi";
      buyPriceNo = kalshiNoPrice;
      rawCost = rawCostCaseA;

      yesSize = pair.polymarket.orderBook.asks[0]?.size || 4000;
      noSize = pair.kalshi.orderBook.asks[0]?.size || 3500;
    } else {
      buyVenueYes = "kalshi";
      buyPriceYes = kalshiYesPrice;
      buyVenueNo = "polymarket";
      buyPriceNo = pmNoPrice;
      rawCost = rawCostCaseB;

      yesSize = pair.kalshi.orderBook.asks[0]?.size || 3500;
      noSize = pair.polymarket.orderBook.asks[0]?.size || 4000;
    }

    const effectiveCost = Number((rawCost + feeCost).toFixed(4));

    // Must yield a net profit after all taker fees and gas buffer
    if (effectiveCost < 1.0) {
      const grossSpreadBps = Math.round((1.0 - rawCost) * 10000);
      const netSpreadBps = Math.round((1.0 - effectiveCost) * 10000);
      const roiPercent = Number((((1.0 - effectiveCost) / effectiveCost) * 100).toFixed(2));

      if (roiPercent >= minRoiPercent) {
        // Calculate capital capacity in USD (the lesser of the two legs' top-of-book depth)
        const yesCapacityUsd = yesSize * buyPriceYes;
        const noCapacityUsd = noSize * buyPriceNo;
        const maxCapitalCapacityUsd = Math.round(Math.min(yesCapacityUsd, noCapacityUsd));

        opportunities.push({
          pairId: pair.id,
          canonicalTitle: pair.canonicalTitle,
          buyVenueYes,
          buyPriceYes,
          buyVenueNo,
          buyPriceNo,
          effectiveCost,
          grossSpreadBps,
          netSpreadBps,
          roiPercent,
          maxCapitalCapacityUsd,
          expiryTimestamp: pair.expiryTimestamp,
        });
      }
    }
  }

  // Sort opportunities by highest net spread / ROI descending
  return opportunities.sort((a, b) => b.netSpreadBps - a.netSpreadBps);
}

/**
 * Calculates deterministic payoffs for an arbitrage position sized in USD.
 */
export function calculateArbPositionPayoff(
  opp: ArbitrageOpportunity,
  capitalUsd: number
): {
  sharesAcquired: number;
  totalCostUsd: number;
  grossPayoutUsd: number;
  netProfitUsd: number;
  netRoiPercent: number;
} {
  const sharesAcquired = Math.floor(capitalUsd / opp.effectiveCost);
  const totalCostUsd = Number((sharesAcquired * opp.effectiveCost).toFixed(2));
  const grossPayoutUsd = sharesAcquired * 1.0; // $1.00 guaranteed per share
  const netProfitUsd = Number((grossPayoutUsd - totalCostUsd).toFixed(2));
  const netRoiPercent = opp.roiPercent;

  return {
    sharesAcquired,
    totalCostUsd,
    grossPayoutUsd,
    netProfitUsd,
    netRoiPercent,
  };
}
