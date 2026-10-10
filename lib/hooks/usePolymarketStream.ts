"use client";

import { useEffect, useState } from "react";
import { polymarketFeed } from "../market/polymarket-feed";
import { WebSocketConnectionStatus, ConflatedMarketTick } from "../types/terminal";

export function usePolymarketStream(assetIds: string[] = []) {
  const [status, setStatus] = useState<WebSocketConnectionStatus>(() =>
    polymarketFeed.getStatus()
  );

  const assetIdsKey = assetIds.join(",");

  useEffect(() => {
    polymarketFeed.init();

    const unsubscribeStatus = polymarketFeed.onStatus((newStatus) => {
      setStatus(newStatus);
    });

    if (assetIds.length > 0) {
      polymarketFeed.subscribe(assetIds);
    }

    return () => {
      unsubscribeStatus();
      if (assetIds.length > 0) {
        polymarketFeed.unsubscribe(assetIds);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetIdsKey]);

  return {
    status,
    subscribe: (ids: string[]) => polymarketFeed.subscribe(ids),
    unsubscribe: (ids: string[]) => polymarketFeed.unsubscribe(ids),
    onTick: (cb: (tick: ConflatedMarketTick) => void) => polymarketFeed.onTick(cb),
  };
}
