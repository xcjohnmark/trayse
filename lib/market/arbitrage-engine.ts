import { ArbitrageOpportunity, NormalizedMarketPair } from "../types/terminal";

export interface ArbitrageScanOptions {
  /**
   * Normalized taker fee schedule:
   * Polymarket (0.0% / 0 bps) + Kalshi (~$0.01 per contract / 100 bps).
   * Default: 0.01 ($0.01 / contract).
   */
  feeCost?: number;
  /**
   * Maximum effective cost threshold. Pairs with effectiveCost < maxEffectiveCost
   * guarantee positive net return after taker fees.
   * Default: 0.99
   */
  maxEffectiveCost?: number;
}

/**
 * Advanced synthetic risk-free arbitrage calculator between Polymarket & Kalshi.
 * 
 * Mathematical Formulation:
 * A binary prediction contract pays out exactly $1.00 upon event resolution.
 * By buying 1 YES contract and 1 NO contract on the same underlying across opposing venues,
 * an investor guarantees a $1.00 settlement payout regardless of whether YES or NO resolves.
 * 
 * Case A: Buy YES on Kalshi + Buy NO on Polymarket
 *   Raw Cost A = Kalshi_YES + Polymarket_NO
 * 
 * Case B: Buy YES on Polymarket + Buy NO on Kalshi
 *   Raw Cost B = Polymarket_YES + Kalshi_NO
 * 
 * Net Taker Fee:
 *   Polymarket taker fee: 0% standard binary CLOB
 *   Kalshi regulatory taker fee: ~$0.01 per contract
 *   Effective Cost = min(Raw Cost A, Raw Cost B) + feeCost
 * 
 * Arbitrage Condition:
 *   If effectiveCost < 0.99, an investor locks in a guaranteed positive net return on capital.
 */
export function scanForArbitrage(
  pairs: NormalizedMarketPair[],
  options: ArbitrageScanOptions = {}
): ArbitrageOpportunity[] {
  const { feeCost = 0.01, maxEffectiveCost = 0.99 } = options;
  const opportunities: ArbitrageOpportunity[] = [];

  for (const pair of pairs) {
    const pmYes = pair.polymarket.yesPrice;
    const pmNo = pair.polymarket.noPrice;
    const kalshiYes = pair.kalshi.yesPrice;
    const kalshiNo = pair.kalshi.noPrice;

    // Case A: Kalshi YES + Polymarket NO
    const costCaseA = kalshiYes + pmNo;

    // Case B: Polymarket YES + Kalshi NO
    const costCaseB = pmYes + kalshiNo;

    let buyVenueYes: "polymarket" | "kalshi";
    let buyPriceYes: number;
    let buyVenueNo: "polymarket" | "kalshi";
    let buyPriceNo: number;
    let rawCost: number;

    let bestYesSize = 0;
    let bestNoSize = 0;

    if (costCaseA < costCaseB) {
      // Case A is cheaper: Buy YES on Kalshi, Buy NO on Polymarket
      buyVenueYes = "kalshi";
      buyPriceYes = kalshiYes;
      buyVenueNo = "polymarket";
      buyPriceNo = pmNo;
      rawCost = costCaseA;

      bestYesSize = pair.kalshi.orderBook.asks[0]?.size || 3500;
      bestNoSize = pair.polymarket.orderBook.asks[0]?.size || 4000;
    } else {
      // Case B is cheaper: Buy YES on Polymarket, Buy NO on Kalshi
      buyVenueYes = "polymarket";
      buyPriceYes = pmYes;
      buyVenueNo = "kalshi";
      buyPriceNo = kalshiNo;
      rawCost = costCaseB;

      bestYesSize = pair.polymarket.orderBook.asks[0]?.size || 4000;
      bestNoSize = pair.kalshi.orderBook.asks[0]?.size || 3500;
    }

    // Compute effective cost with fee buffer
    const effectiveCost = Number((rawCost + feeCost).toFixed(4));

    // Filter pairs where effectiveCost < 0.99 (guaranteed positive net return)
    if (effectiveCost < maxEffectiveCost) {
      const grossSpreadBps = Math.round((1.0 - rawCost) * 10000);
      const netSpreadBps = Math.round((1.0 - effectiveCost) * 10000);
      const roiPercent = Number((((1.0 - effectiveCost) / effectiveCost) * 100).toFixed(2));
      const maxCapitalCapacityUsd = Math.min(bestYesSize, bestNoSize);

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

  // Sort opportunities by netSpreadBps descending
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
  const grossPayoutUsd = sharesAcquired * 1.0; // Guaranteed $1.00 payout per unit
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
