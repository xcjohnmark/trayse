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
  const tagStr = (tags?.map((t) => `${t.label} ${t.slug}`).join(" ") || "").toLowerCase();
  const titleStr = (title || "").toLowerCase();
  const text = `${tagStr} ${titleStr}`;

  // 1. Physical & Weather (check tags and keywords first)
  const isWeatherTag = tags?.some((t) => {
    const s = t.slug.toLowerCase();
    return s === "weather" || s === "climate" || s === "natural-disasters" || s === "hurricanes" || s === "earthquakes";
  });
  if (
    isWeatherTag ||
    /\b(weather|hurricane|hurricanes|temperature|temperatures|climate|earthquake|earthquakes|volcano|tornado|drought|snow|rain|rainfall|storm|wildfire|blizzard)\b/i.test(text) ||
    text.includes("hottest year") ||
    text.includes("el niño") ||
    text.includes("natural disaster")
  ) {
    return "Physical & Weather";
  }

  // 2. Crypto
  if (
    tags?.some((t) => ["crypto", "bitcoin", "ethereum", "solana", "altcoins"].includes(t.slug.toLowerCase())) ||
    text.includes("crypto") ||
    text.includes("bitcoin") ||
    text.includes("btc") ||
    text.includes("ethereum") ||
    text.includes("eth") ||
    text.includes("solana") ||
    text.includes("token") ||
    text.includes("altcoin")
  ) {
    return "Crypto";
  }

  // 3. Sports
  if (
    tags?.some((t) => ["sports", "nba", "nfl", "soccer", "champions-league", "premier-league", "tennis", "formula-1", "baseball", "cricket"].includes(t.slug.toLowerCase())) ||
    text.includes("vs.") ||
    text.includes("nba") ||
    text.includes("nfl") ||
    text.includes("premier league") ||
    text.includes("champions league") ||
    text.includes("uefa") ||
    text.includes("fifa") ||
    text.includes("fc ") ||
    text.includes("serie a") ||
    text.includes("laliga") ||
    text.includes("bundesliga") ||
    text.includes("super bowl") ||
    text.includes("playoffs")
  ) {
    return "Sports";
  }

  // 4. Macro & Finance
  if (
    tags?.some((t) => ["economy", "finance", "business", "fed", "macro"].includes(t.slug.toLowerCase())) ||
    text.includes("fed ") ||
    text.includes("rate cut") ||
    text.includes("rate hike") ||
    text.includes("inflation") ||
    text.includes("gdp") ||
    text.includes("economy") ||
    text.includes("cpi") ||
    text.includes("interest rate") ||
    text.includes("recession") ||
    text.includes("unemployment") ||
    text.includes("central bank")
  ) {
    return "Macro";
  }

  // 5. Tech & Science
  if (
    tags?.some((t) => ["tech", "science", "ai", "spacex", "openai"].includes(t.slug.toLowerCase())) ||
    text.includes("spacex") ||
    text.includes("starship") ||
    text.includes("ai ") ||
    text.includes("artificial intelligence") ||
    text.includes("openai") ||
    text.includes("nvidia") ||
    text.includes("apple") ||
    text.includes("tesla") ||
    text.includes("google") ||
    text.includes("quantum") ||
    text.includes("robot") ||
    text.includes("nasa") ||
    text.includes("moon landing")
  ) {
    return "Tech & Equities";
  }

  // 6. Politics
  if (
    tags?.some((t) => ["politics", "elections", "geopolitics", "world"].includes(t.slug.toLowerCase())) ||
    text.includes("politic") ||
    text.includes("elect") ||
    text.includes("president") ||
    text.includes("senate") ||
    text.includes("house of representatives") ||
    text.includes("trump") ||
    text.includes("biden") ||
    text.includes("macron") ||
    text.includes("prime minister") ||
    text.includes("congress") ||
    text.includes("ceasefire") ||
    text.includes("nato")
  ) {
    return "Politics";
  }

  return "Politics";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category") || "";

    const fetchPromises: Promise<PolymarketGammaEvent[]>[] = [];

    // 1. Fetch top volume / trending events across exchange
    fetchPromises.push(
      fetch("https://gamma-api.polymarket.com/events?closed=false&limit=60&order=volume24hr&ascending=false", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      })
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => [])
    );

    // 2. Fetch specific category tags in parallel to guarantee rich catalogs in all sections
    const categoryTags = [
      "weather",
      "climate",
      "science",
      "tech",
      "crypto",
      "politics",
      "economy",
      "finance",
      "sports",
    ];

    for (const tagSlug of categoryTags) {
      fetchPromises.push(
        fetch(`https://gamma-api.polymarket.com/events?closed=false&limit=40&tag_slug=${tagSlug}`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        })
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => [])
      );
    }

    const eventArrays = await Promise.all(fetchPromises);
    const rawEvents = eventArrays.flat();

    // Deduplicate by event.id
    const seenEventIds = new Set<string>();
    const events: PolymarketGammaEvent[] = [];
    for (const ev of rawEvents) {
      if (ev && ev.id && !seenEventIds.has(ev.id)) {
        seenEventIds.add(ev.id);
        events.push(ev);
      }
    }

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
