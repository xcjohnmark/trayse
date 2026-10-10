import { NextResponse } from "next/server";
import { NormalizedMarketPair, MarketCategory, SubMarketOutcome } from "@/lib/types/terminal";

export const revalidate = 30; // 30-second edge revalidation

interface PolymarketGammaEvent {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  volume24hr?: number;
  volume?: number;
  liquidity?: number;
  endDate?: string;
  tags?: Array<{ label: string; slug: string }>;
  markets?: Array<{
    id: string;
    question: string;
    slug?: string;
    image?: string;
    icon?: string;
    groupItemTitle?: string;
    outcomes?: string;
    outcomePrices?: string;
    clobTokenIds?: string;
    bestBid?: number;
    bestAsk?: number;
    lastTradePrice?: number;
    volume24hr?: number;
    liquidity?: number;
    closed?: boolean;
    active?: boolean;
  }>;
}

function mapTagToCategory(tags?: Array<{ label: string; slug: string }>, title?: string): MarketCategory {
  const text = `${tags?.map((t) => `${t.label} ${t.slug}`).join(" ") || ""} ${title || ""}`.toLowerCase();

  if (text.includes("crypto") || text.includes("bitcoin") || text.includes("btc") || text.includes("eth") || text.includes("solana")) {
    return "Crypto";
  }
  if (text.includes("politic") || text.includes("elect") || text.includes("president") || text.includes("senate") || text.includes("house") || text.includes("trump") || text.includes("biden") || text.includes("macron") || text.includes("france")) {
    return "Politics";
  }
  if (text.includes("fed") || text.includes("rate") || text.includes("inflation") || text.includes("gdp") || text.includes("economy") || text.includes("cpi") || text.includes("macro") || text.includes("finance")) {
    return "Macro";
  }
  if (text.includes("tech") || text.includes("ai") || text.includes("nvidia") || text.includes("apple") || text.includes("tesla") || text.includes("meta") || text.includes("google") || text.includes("stock") || text.includes("nasdaq") || text.includes("equity")) {
    return "Tech & Equities";
  }
  if (text.includes("weather") || text.includes("hurricane") || text.includes("temp") || text.includes("climate") || text.includes("rain") || text.includes("storm")) {
    return "Physical & Weather";
  }

  return "Politics"; // Default fallback
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "60";
    const tag = searchParams.get("tag") || "";

    const url = new URL("https://gamma-api.polymarket.com/events");
    url.searchParams.set("closed", "false");
    url.searchParams.set("limit", limit);
    url.searchParams.set("order", "volume24hr");
    url.searchParams.set("ascending", "false");
    if (tag) url.searchParams.set("tag_id", tag);

    const res = await fetch(url.toString(), {
      next: { revalidate: 30 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Polymarket Gamma API returned status ${res.status}`);
    }

    const events: PolymarketGammaEvent[] = await res.json();

    const normalizedPairs: NormalizedMarketPair[] = [];

    for (const event of events) {
      if (!event.markets || event.markets.length === 0) continue;

      const activeMarkets = event.markets.filter((m) => !m.closed);
      if (activeMarkets.length === 0) continue;

      const primaryMarket = activeMarkets[0];

      // Parse outcome prices
      let yesPrice = 0.5;
      let noPrice = 0.5;
      try {
        if (primaryMarket.outcomePrices) {
          const prices = JSON.parse(primaryMarket.outcomePrices);
          if (Array.isArray(prices) && prices.length >= 2) {
            yesPrice = Number(prices[0]) || 0.5;
            noPrice = Number(prices[1]) || 1 - yesPrice;
          }
        }
      } catch {
        // Fallback to lastTradePrice or 0.5
        yesPrice = primaryMarket.lastTradePrice ?? 0.5;
        noPrice = 1 - yesPrice;
      }

      // Parse CLOB Token IDs for WebSocket streaming
      let yesAssetId: string | undefined;
      try {
        if (primaryMarket.clobTokenIds) {
          const ids = JSON.parse(primaryMarket.clobTokenIds);
          if (Array.isArray(ids) && ids.length > 0) {
            yesAssetId = ids[0];
          }
        }
      } catch {
        // Ignore
      }

      // Parse submarkets (e.g. for multi-candidate elections or multiple outcomes)
      const submarkets: SubMarketOutcome[] = [];
      if (activeMarkets.length > 1) {
        for (const sub of activeMarkets.slice(0, 6)) {
          let subYesPrice = 0.5;
          let subAssetId: string | undefined;
          try {
            if (sub.outcomePrices) {
              const p = JSON.parse(sub.outcomePrices);
              if (Array.isArray(p) && p.length > 0) subYesPrice = Number(p[0]) || 0.5;
            }
            if (sub.clobTokenIds) {
              const ids = JSON.parse(sub.clobTokenIds);
              if (Array.isArray(ids) && ids.length > 0) subAssetId = ids[0];
            }
          } catch {
            // Ignore
          }

          submarkets.push({
            id: sub.id,
            title: sub.groupItemTitle || sub.question.replace(event.title, "").trim() || sub.question,
            yesPrice: subYesPrice,
            noPrice: Number((1 - subYesPrice).toFixed(3)),
            image: sub.image || event.image,
            icon: sub.icon || event.icon,
            assetId: subAssetId,
          });
        }
      }

      const expiryTimestamp = event.endDate ? new Date(event.endDate).getTime() : Date.now() + 86400000 * 30;
      const expiryDateFormatted = event.endDate
        ? new Date(event.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "Active";

      const category = mapTagToCategory(event.tags, event.title);
      const volume24h = event.volume24hr ?? primaryMarket.volume24hr ?? 10000;
      const liquidityUsd = event.liquidity ?? primaryMarket.liquidity ?? 50000;

      // Synthetic Kalshi counterpart for arbitrage calculation comparison
      const syntheticKalshiOffset = (Math.sin(parseInt(event.id.slice(-4) || "1", 10)) * 0.04);
      const kalshiYesPrice = Math.max(0.01, Math.min(0.99, Number((yesPrice + syntheticKalshiOffset).toFixed(2))));
      const kalshiNoPrice = Number((1 - kalshiYesPrice).toFixed(2));
      const divergenceBps = Math.round(Math.abs(yesPrice - kalshiYesPrice) * 10000);

      const pair: NormalizedMarketPair = {
        id: `pm-${event.id}`,
        canonicalTitle: event.title,
        category,
        expiryTimestamp,
        expiryDateFormatted,
        image: event.image,
        icon: event.icon,
        submarkets: submarkets.length > 0 ? submarkets : undefined,
        polymarket: {
          venue: "polymarket",
          marketId: primaryMarket.id,
          ticker: `PM-${event.slug.slice(0, 10).toUpperCase()}`,
          assetId: yesAssetId,
          yesPrice: Number(yesPrice.toFixed(3)),
          noPrice: Number(noPrice.toFixed(3)),
          bestBid: primaryMarket.bestBid ?? Math.max(0.01, Number((yesPrice - 0.01).toFixed(2))),
          bestAsk: primaryMarket.bestAsk ?? Math.min(0.99, Number((yesPrice + 0.01).toFixed(2))),
          volume24h: Math.round(volume24h),
          liquidityUsd: Math.round(liquidityUsd),
          image: event.image,
          icon: event.icon,
          externalUrl: `https://polymarket.com/event/${event.slug}`,
          orderBook: {
            bids: [
              { price: Number((yesPrice - 0.01).toFixed(2)), size: 12000, total: 12000 },
              { price: Number((yesPrice - 0.02).toFixed(2)), size: 25000, total: 37000 },
            ],
            asks: [
              { price: Number((yesPrice + 0.01).toFixed(2)), size: 15000, total: 15000 },
              { price: Number((yesPrice + 0.02).toFixed(2)), size: 30000, total: 45000 },
            ],
            lastUpdated: Date.now(),
          },
        },
        kalshi: {
          venue: "kalshi",
          marketId: `k-${event.id}`,
          ticker: `KX-${event.slug.slice(0, 8).toUpperCase()}`,
          yesPrice: kalshiYesPrice,
          noPrice: kalshiNoPrice,
          bestBid: Math.max(0.01, Number((kalshiYesPrice - 0.01).toFixed(2))),
          bestAsk: Math.min(0.99, Number((kalshiYesPrice + 0.01).toFixed(2))),
          volume24h: Math.round(volume24h * 0.75),
          liquidityUsd: Math.round(liquidityUsd * 0.65),
          image: event.image,
          icon: event.icon,
          externalUrl: `https://kalshi.com`,
          orderBook: {
            bids: [{ price: Number((kalshiYesPrice - 0.01).toFixed(2)), size: 8000, total: 8000 }],
            asks: [{ price: Number((kalshiYesPrice + 0.01).toFixed(2)), size: 10000, total: 10000 }],
            lastUpdated: Date.now(),
          },
        },
        divergenceBps,
        hasArbitrage: divergenceBps >= 250,
      };

      normalizedPairs.push(pair);
    }

    return NextResponse.json({
      success: true,
      count: normalizedPairs.length,
      pairs: normalizedPairs,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch Polymarket markets",
      },
      { status: 500 }
    );
  }
}
