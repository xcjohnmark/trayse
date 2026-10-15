import { NextResponse } from "next/server";
import { NormalizedMarketPair, MarketCategory, SubMarketOutcome } from "@/lib/types/terminal";

export const revalidate = 15; // 15-second edge revalidation for high-frequency sync

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
  closed?: boolean;
  active?: boolean;
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
    oneDayPriceChange?: number;
  }>;
}

function mapTagToCategory(tags?: Array<{ label: string; slug: string }>, title?: string): MarketCategory {
  const tagStr = (tags?.map((t) => `${t.label} ${t.slug}`).join(" ") || "").toLowerCase();
  const titleStr = (title || "").toLowerCase();
  const text = `${tagStr} ${titleStr}`;

  // 1. Iran
  if (
    tags?.some((t) => t.slug.toLowerCase().includes("iran")) ||
    /\b(iran|tehran|khamenei|irgc|israel-iran)\b/i.test(text)
  ) {
    return "Iran";
  }

  // 2. Mentions
  if (
    tags?.some((t) => ["mention-markets", "elon-tweets", "tweets-markets", "tweet"].includes(t.slug.toLowerCase())) ||
    text.includes("what will elon post") ||
    text.includes("what will trump say") ||
    text.includes("what will trump post") ||
    text.includes("what will the announcers say") ||
    /\b(mention|mentions|tweet|tweets|truth social)\b/i.test(text)
  ) {
    return "Mentions";
  }

  // 3. Esports
  if (
    tags?.some((t) => ["esports", "league-of-legends", "dota", "cs2", "counter-strike"].includes(t.slug.toLowerCase())) ||
    /\b(esport|esports|cblol|lck|lpl|lec|lcs|dota|cs2|counter-strike|overwatch|valorant)\b/i.test(text)
  ) {
    return "Esports";
  }

  // 4. Culture
  if (
    tags?.some((t) => ["pop-culture", "culture", "entertainment", "movies", "music", "box-office", "oscars"].includes(t.slug.toLowerCase())) ||
    /\b(movie|box office|grammy|oscar|celebrity|album|hollywood|netflix|spotify|billboard)\b/i.test(text)
  ) {
    return "Culture";
  }

  // 5. Weather
  if (
    tags?.some((t) => ["weather", "climate", "natural-disasters", "hurricanes", "earthquakes"].includes(t.slug.toLowerCase())) ||
    /\b(weather|hurricane|hurricanes|temperature|temperatures|climate|earthquake|earthquakes|volcano|tornado|drought|snow|rain|rainfall|storm|wildfire|blizzard)\b/i.test(text) ||
    text.includes("hottest year") ||
    text.includes("el niño") ||
    text.includes("natural disaster")
  ) {
    return "Weather";
  }

  // 6. Crypto
  if (
    tags?.some((t) => ["crypto", "bitcoin", "ethereum", "solana", "altcoins"].includes(t.slug.toLowerCase())) ||
    /\b(crypto|bitcoin|btc|ethereum|eth|solana|sol|token|altcoin|memecoin)\b/i.test(text)
  ) {
    return "Crypto";
  }

  // 7. Elections
  if (
    tags?.some((t) => ["elections", "election"].includes(t.slug.toLowerCase())) ||
    /\b(election|presidential election|midterm|midterms|senate race|governor race|vote share)\b/i.test(text) ||
    text.includes("next french presidential") ||
    text.includes("presidential-election")
  ) {
    return "Elections";
  }

  // 8. Geopolitics
  if (
    tags?.some((t) => ["geopolitics", "world", "war"].includes(t.slug.toLowerCase())) ||
    /\b(geopolitic|geopolitics|ceasefire|nato|taiwan|ukraine|russia|military clash|un security)\b/i.test(text)
  ) {
    return "Geopolitics";
  }

  // 9. Finance
  if (
    tags?.some((t) => ["finance", "business", "commodities", "oil"].includes(t.slug.toLowerCase())) ||
    /\b(crude oil|wti|treasury|bonds|stock|nasdaq|s&p|sp500|dow jones|yield|ipo|oil hit)\b/i.test(text)
  ) {
    return "Finance";
  }

  // 10. Economy
  if (
    tags?.some((t) => ["economy", "macro", "fed", "cpi"].includes(t.slug.toLowerCase())) ||
    /\b(fed |rate cut|rate hike|inflation|cpi|interest rate|recession|unemployment|gdp|central bank)\b/i.test(text)
  ) {
    return "Economy";
  }

  // 11. Tech
  if (
    tags?.some((t) => ["tech", "ai", "science", "big-tech"].includes(t.slug.toLowerCase())) ||
    /\b(ai |artificial intelligence|openai|anthropic|nvidia|apple|spacex|tesla|google|microsoft|quantum|semiconductor|robot)\b/i.test(text)
  ) {
    return "Tech";
  }

  // 12. Sports
  if (
    tags?.some((t) => ["sports", "nba", "nfl", "soccer", "cfb", "premier-league", "tennis", "baseball"].includes(t.slug.toLowerCase())) ||
    text.includes("vs.") ||
    /\b(nfl|cfb|nba|soccer|premier league|champions league|uefa|fifa|serie a|laliga|bundesliga|ufc|super bowl|playoffs|atp|wta)\b/i.test(text)
  ) {
    return "Sports";
  }

  // 13. Politics
  if (
    tags?.some((t) => ["politics", "white-house", "congress"].includes(t.slug.toLowerCase())) ||
    /\b(politic|politics|president|senate|congress|house of representatives|trump|biden|macron|kamala|vance)\b/i.test(text)
  ) {
    return "Politics";
  }

  return "Politics";
}

function isEventResolved(event: PolymarketGammaEvent): boolean {
  // 1. Explicit closed or inactive flags on event
  if (event.closed === true || event.active === false) return true;

  // 2. End date in the past (e.g. yesterday's sporting events or past elections)
  if (event.endDate) {
    const endMs = new Date(event.endDate).getTime();
    if (!isNaN(endMs) && endMs <= Date.now()) return true;
  }

  // 3. Markets array validation
  if (!event.markets || event.markets.length === 0) return true;
  const activeUnclosed = event.markets.filter((m) => {
    if (m.closed === true || m.active === false) return false;
    // Check if prices already settled to 0.0 or 1.0 terminal state
    try {
      if (m.outcomePrices) {
        const prices = JSON.parse(m.outcomePrices);
        if (Array.isArray(prices) && prices.length >= 2) {
          const p0 = Number(prices[0]);
          const p1 = Number(prices[1]);
          if ((p0 >= 0.999 && p1 <= 0.001) || (p0 <= 0.001 && p1 >= 0.999)) {
            return false;
          }
        }
      }
    } catch {
      // Ignore parse errors
    }
    return true;
  });

  return activeUnclosed.length === 0;
}

function formatTimeToResolution(endDateStr?: string): { timeToResolution: string; isUrgentResolution: boolean } {
  if (!endDateStr) return { timeToResolution: "Active", isUrgentResolution: false };
  const endMs = new Date(endDateStr).getTime();
  if (isNaN(endMs)) return { timeToResolution: "Active", isUrgentResolution: false };

  const diffMs = endMs - Date.now();
  if (diffMs <= 0) return { timeToResolution: "Expired", isUrgentResolution: true };

  const totalMinutes = Math.floor(diffMs / 60000);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;
  const remainingMinutes = totalMinutes % 60;

  if (days >= 30) {
    const months = Math.floor(days / 30);
    const remDays = days % 30;
    return { timeToResolution: `${months}mo ${remDays}d`, isUrgentResolution: false };
  }
  if (days > 0) {
    return { timeToResolution: `${days}d ${remainingHours}h`, isUrgentResolution: days <= 1 };
  }
  if (totalHours > 0) {
    return { timeToResolution: `${totalHours}h ${remainingMinutes}m`, isUrgentResolution: true };
  }
  return { timeToResolution: `${totalMinutes}m`, isUrgentResolution: true };
}

function calculateActivityScore(volume24h: number, liquidityUsd: number, oneDayPriceChange?: number): number {
  const volScore = Math.min(100, (Math.log(1 + Math.max(0, volume24h)) / Math.log(1 + 10_000_000)) * 100);
  const absPriceChange = Math.abs(oneDayPriceChange ?? 0);
  const volatilityScore = Math.min(100, absPriceChange * 200);
  const liqScore = Math.min(100, (Math.log(1 + Math.max(0, liquidityUsd)) / Math.log(1 + 1_000_000)) * 100);
  const composite = 0.40 * volScore + 0.35 * volatilityScore + 0.25 * liqScore;
  return Math.round(Math.min(100, Math.max(0, composite)));
}

function calculateCompositeTrendingScore(
  volume24h: number,
  liquidityUsd: number,
  oneDayPriceChange?: number,
  spreadCents?: number
): number {
  // Volume score (0-100)
  const volScore = Math.min(100, (Math.log(1 + Math.max(0, volume24h)) / Math.log(1 + 10_000_000)) * 100);
  // Real-time price velocity / volatility score (0-100)
  const absPriceChange = Math.abs(oneDayPriceChange ?? 0);
  const velocityScore = Math.min(100, absPriceChange * 250 + (volume24h > 200_000 ? 15 : 0));
  // Spread score: tighter spread = higher institutional score
  const spread = spreadCents ?? 0.01;
  const spreadScore = Math.max(0, Math.min(100, 100 - spread * 1000));
  // Liquidity depth score (0-100)
  const liqScore = Math.min(100, (Math.log(1 + Math.max(0, liquidityUsd)) / Math.log(1 + 1_000_000)) * 100);

  // Balanced composite: 35% Volume, 35% Activity/Volatility, 15% Spread, 15% Liquidity
  const composite = 0.35 * volScore + 0.35 * velocityScore + 0.15 * spreadScore + 0.15 * liqScore;
  return Math.round(Math.min(100, Math.max(0, composite)));
}

const CATEGORY_SPECS: Array<{ category: MarketCategory; slug: string }> = [
  { category: "Politics", slug: "politics" },
  { category: "Sports", slug: "sports" },
  { category: "Crypto", slug: "crypto" },
  { category: "Esports", slug: "esports" },
  { category: "Iran", slug: "iran" },
  { category: "Finance", slug: "finance" },
  { category: "Geopolitics", slug: "geopolitics" },
  { category: "Tech", slug: "tech" },
  { category: "Culture", slug: "pop-culture" },
  { category: "Economy", slug: "economy" },
  { category: "Weather", slug: "weather" },
  { category: "Elections", slug: "elections" },
  { category: "Mentions", slug: "mention-markets" },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category") || "";

    // 1. Fetch global top volume leaders
    const globalTrendingPromise = fetch(
      "https://gamma-api.polymarket.com/events?closed=false&limit=80&order=volume24hr&ascending=false",
      {
        cache: "no-store",
        headers: { Accept: "application/json" },
      }
    )
      .then((r) => (r.ok ? (r.json() as Promise<PolymarketGammaEvent[]>) : []))
      .catch(() => []);

    // 2. Fetch top events for all 13 categories in parallel
    const categoryPromises = CATEGORY_SPECS.map((spec) =>
      fetch(
        `https://gamma-api.polymarket.com/events?closed=false&limit=20&order=volume24hr&ascending=false&tag_slug=${spec.slug}`,
        {
          cache: "no-store",
          headers: { Accept: "application/json" },
        }
      )
        .then((r) => (r.ok ? (r.json() as Promise<PolymarketGammaEvent[]>) : []))
        .then((events) => ({ category: spec.category, events: Array.isArray(events) ? events : [] }))
        .catch(() => ({ category: spec.category, events: [] }))
    );

    const [globalTrendingEvents, categoryResults] = await Promise.all([
      globalTrendingPromise,
      Promise.all(categoryPromises),
    ]);

    // Filter out all resolved / past / settled events across all pools
    const activeGlobalEvents = globalTrendingEvents.filter((ev) => !isEventResolved(ev));
    const activeCategoryResults = categoryResults.map((cr) => ({
      category: cr.category,
      events: cr.events.filter((ev) => !isEventResolved(ev)),
    }));

    // Balanced Stratified Reservoir Selection:
    // Pass 1: Guarantee top 2 active unique leaders per category (13 * 2 = 26 events guaranteed)
    const selectedTrendingMap = new Map<string, PolymarketGammaEvent>();

    for (const cr of activeCategoryResults) {
      for (const ev of cr.events.slice(0, 2)) {
        if (ev && ev.id && !selectedTrendingMap.has(ev.id)) {
          selectedTrendingMap.set(ev.id, ev);
        }
      }
    }

    // Pass 2: Aggregate all candidate unclosed events
    const allCandidateEvents = [
      ...activeGlobalEvents,
      ...activeCategoryResults.flatMap((cr) => cr.events),
    ];

    const seenCandidateIds = new Set<string>();
    const sortedCandidates: PolymarketGammaEvent[] = [];
    for (const ev of allCandidateEvents) {
      if (ev && ev.id && !seenCandidateIds.has(ev.id)) {
        seenCandidateIds.add(ev.id);
        sortedCandidates.push(ev);
      }
    }

    // Sort candidate pool by composite activity & volume score for fair representation
    sortedCandidates.sort((a, b) => {
      const pA = a.markets?.[0];
      const pB = b.markets?.[0];
      const scoreA = calculateCompositeTrendingScore(
        a.volume24hr ?? pA?.volume24hr ?? 0,
        a.liquidity ?? pA?.liquidity ?? 0,
        pA?.oneDayPriceChange,
        pA ? Math.abs((pA.bestAsk ?? 0.5) - (pA.bestBid ?? 0.5)) : 0.01
      );
      const scoreB = calculateCompositeTrendingScore(
        b.volume24hr ?? pB?.volume24hr ?? 0,
        b.liquidity ?? pB?.liquidity ?? 0,
        pB?.oneDayPriceChange,
        pB ? Math.abs((pB.bestAsk ?? 0.5) - (pB.bestBid ?? 0.5)) : 0.01
      );
      return scoreB - scoreA;
    });

    for (const ev of sortedCandidates) {
      if (selectedTrendingMap.size >= 50) break;
      if (!selectedTrendingMap.has(ev.id)) {
        selectedTrendingMap.set(ev.id, ev);
      }
    }

    // Pass 3: Sort the final 50 trending events strictly by composite score descending
    const trending50 = Array.from(selectedTrendingMap.values());
    trending50.sort((a, b) => {
      const pA = a.markets?.[0];
      const pB = b.markets?.[0];
      const scoreA = calculateCompositeTrendingScore(
        a.volume24hr ?? pA?.volume24hr ?? 0,
        a.liquidity ?? pA?.liquidity ?? 0,
        pA?.oneDayPriceChange,
        pA ? Math.abs((pA.bestAsk ?? 0.5) - (pA.bestBid ?? 0.5)) : 0.01
      );
      const scoreB = calculateCompositeTrendingScore(
        b.volume24hr ?? pB?.volume24hr ?? 0,
        b.liquidity ?? pB?.liquidity ?? 0,
        pB?.oneDayPriceChange,
        pB ? Math.abs((pB.bestAsk ?? 0.5) - (pB.bestBid ?? 0.5)) : 0.01
      );
      return scoreB - scoreA;
    });

    // Build trending rank map (1..50)
    const trendingRankMap = new Map<string, number>();
    trending50.forEach((ev, idx) => {
      trendingRankMap.set(ev.id, idx + 1);
    });

    // Final consolidated list of events: trending 50 strictly first, followed by remaining category events
    const finalEventMap = new Map<string, PolymarketGammaEvent>();
    trending50.forEach((ev) => finalEventMap.set(ev.id, ev));
    sortedCandidates.forEach((ev) => {
      if (!finalEventMap.has(ev.id)) {
        finalEventMap.set(ev.id, ev);
      }
    });

    const events = Array.from(finalEventMap.values());

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
      const totalVolumeUsd = Math.round(event.volume ?? (volume24h * 3.5));
      const oneDayPriceChange = primaryMarket.oneDayPriceChange;
      const spreadCents = Number(
        Math.abs(
          (primaryMarket.bestAsk ?? Math.min(0.99, Number((yesPrice + 0.01).toFixed(2)))) -
          (primaryMarket.bestBid ?? Math.max(0.01, Number((yesPrice - 0.01).toFixed(2))))
        ).toFixed(3)
      );
      const activityScore = calculateActivityScore(volume24h, liquidityUsd, oneDayPriceChange);
      const compositeTrendingScore = calculateCompositeTrendingScore(volume24h, liquidityUsd, oneDayPriceChange, spreadCents);
      const { timeToResolution, isUrgentResolution } = formatTimeToResolution(event.endDate);

      const trendingRank = trendingRankMap.get(event.id);
      const isTrending = trendingRank !== undefined && trendingRank <= 50;

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
        timeToResolution,
        isUrgentResolution,
        image: event.image,
        icon: event.icon,
        submarkets: submarkets.length > 0 ? submarkets : undefined,
        isTrending,
        trendingRank,
        activityScore,
        compositeTrendingScore,
        oneDayPriceChange,
        totalVolumeUsd,
        spreadCents,
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
          totalVolumeUsd,
          spreadCents,
          liquidityUsd: Math.round(liquidityUsd),
          image: event.image,
          icon: event.icon,
          externalUrl: `https://polymarket.com/event/${event.slug}`,
          oneDayPriceChange,
          activityScore,
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

    const resultPairs = categoryParam === "Trending"
      ? normalizedPairs.filter((p) => p.isTrending)
      : normalizedPairs;

    return NextResponse.json({
      success: true,
      count: resultPairs.length,
      pairs: resultPairs,
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
