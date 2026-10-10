/**
 * Polymarket CLOB WebSocket Ingestion Web Worker (Bloomberg-Grade)
 * 
 * Runs off the main UI thread. Handles persistent WSS connection, 10s PING/PONG heartbeats,
 * JSON frame parsing, in-memory L2 book state, and 16.6ms tick conflation (60fps display sync).
 */

const POLYMARKET_WSS_URL = 'wss://ws-subscriptions-clob.polymarket.com/ws/market';
const HEARTBEAT_INTERVAL_MS = 10000;
const CONFLATION_INTERVAL_MS = 16.6; // 60fps refresh window

let socket = null;
let heartbeatTimer = null;
let conflationTimer = null;
let reconnectTimer = null;
let reconnectAttempts = 0;
const subscribedAssets = new Set();

// In-memory cache for latest prices & depth
const priceCache = new Map();
// Pending ticks queue for 16.6ms batch conflation
const pendingConflatedTicks = new Map();

function sendStatus(status, details = '') {
  self.postMessage({
    type: 'STATUS',
    status,
    details,
    timestamp: Date.now(),
  });
}

function initSocket() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  sendStatus('CONNECTING');

  try {
    socket = new WebSocket(POLYMARKET_WSS_URL);

    socket.onopen = () => {
      reconnectAttempts = 0;
      sendStatus('CONNECTED');
      startHeartbeat();

      // Resubscribe to all assets currently tracked
      if (subscribedAssets.size > 0) {
        subscribeToAssets(Array.from(subscribedAssets));
      }
    };

    socket.onmessage = (event) => {
      try {
        if (event.data === 'PONG') {
          return;
        }

        const data = JSON.parse(event.data);
        handleIncomingMessage(data);
      } catch (err) {
        // Fallback or non-JSON frame
      }
    };

    socket.onerror = () => {
      sendStatus('ERROR', 'WebSocket network failure');
    };

    socket.onclose = () => {
      stopHeartbeat();
      sendStatus('RECONNECTING');
      scheduleReconnect();
    };
  } catch (err) {
    sendStatus('ERROR', err.message);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  const delay = Math.min(1000 * Math.pow(1.5, reconnectAttempts), 15000);
  reconnectAttempts++;
  reconnectTimer = setTimeout(() => {
    initSocket();
  }, delay);
}

function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send('PING');
      } catch (e) {
        // Ignore send errors during heartbeat
      }
    }
  }, HEARTBEAT_INTERVAL_MS);
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

function subscribeToAssets(assetIds) {
  if (!assetIds || assetIds.length === 0) return;

  assetIds.forEach((id) => subscribedAssets.add(id));

  if (socket && socket.readyState === WebSocket.OPEN) {
    const payload = {
      assets_ids: assetIds,
      type: 'market',
      custom_feature_enabled: true,
    };
    socket.send(JSON.stringify(payload));
  }
}

function unsubscribeFromAssets(assetIds) {
  if (!assetIds || assetIds.length === 0) return;

  assetIds.forEach((id) => subscribedAssets.delete(id));

  if (socket && socket.readyState === WebSocket.OPEN) {
    const payload = {
      assets_ids: assetIds,
      operation: 'unsubscribe',
    };
    try {
      socket.send(JSON.stringify(payload));
    } catch (e) {
      // Ignored
    }
  }
}

function handleIncomingMessage(data) {
  if (!data) return;

  const eventType = data.event_type;
  const assetId = data.asset_id;

  if (!assetId) return;

  let cached = priceCache.get(assetId) || {
    assetId,
    yesPrice: 0.50,
    noPrice: 0.50,
    bestBid: 0.49,
    bestAsk: 0.51,
    volume24h: 0,
    lastTradePrice: 0.50,
    timestamp: Date.now(),
    tickDirection: 'FLAT',
  };

  let hasChanged = false;
  let newDirection = 'FLAT';

  if (eventType === 'book' && data.bids && data.asks) {
    if (data.bids.length > 0) {
      const topBid = parseFloat(data.bids[0].price);
      if (!isNaN(topBid)) cached.bestBid = topBid;
    }
    if (data.asks.length > 0) {
      const topAsk = parseFloat(data.asks[0].price);
      if (!isNaN(topAsk)) cached.bestAsk = topAsk;
    }
    cached.yesPrice = parseFloat(((cached.bestBid + cached.bestAsk) / 2).toFixed(3));
    cached.noPrice = parseFloat((1 - cached.yesPrice).toFixed(3));
    hasChanged = true;
  } else if (eventType === 'price_change' && Array.isArray(data.price_changes)) {
    for (const change of data.price_changes) {
      const p = parseFloat(change.price);
      if (!isNaN(p)) {
        if (p > cached.yesPrice) newDirection = 'UP';
        else if (p < cached.yesPrice) newDirection = 'DOWN';

        cached.yesPrice = p;
        cached.noPrice = parseFloat((1 - p).toFixed(3));
        if (change.best_bid) cached.bestBid = parseFloat(change.best_bid);
        if (change.best_ask) cached.bestAsk = parseFloat(change.best_ask);
        hasChanged = true;
      }
    }
  } else if (eventType === 'last_trade_price') {
    const p = parseFloat(data.price);
    if (!isNaN(p)) {
      if (p > cached.yesPrice) newDirection = 'UP';
      else if (p < cached.yesPrice) newDirection = 'DOWN';

      cached.lastTradePrice = p;
      cached.yesPrice = p;
      cached.noPrice = parseFloat((1 - p).toFixed(3));
      hasChanged = true;
    }
  } else if (eventType === 'best_bid_ask') {
    if (data.best_bid) cached.bestBid = parseFloat(data.best_bid);
    if (data.best_ask) cached.bestAsk = parseFloat(data.best_ask);
    cached.yesPrice = parseFloat(((cached.bestBid + cached.bestAsk) / 2).toFixed(3));
    cached.noPrice = parseFloat((1 - cached.yesPrice).toFixed(3));
    hasChanged = true;
  }

  if (hasChanged) {
    cached.timestamp = Date.now();
    cached.tickDirection = newDirection;
    priceCache.set(assetId, cached);
    // Buffer for 16.6ms conflation dispatch
    pendingConflatedTicks.set(assetId, { ...cached });
  }
}

// 16.6ms Conflation Engine Timer: flushes batched updates to main thread
function startConflator() {
  if (conflationTimer) clearInterval(conflationTimer);
  conflationTimer = setInterval(() => {
    if (pendingConflatedTicks.size > 0) {
      const ticks = Array.from(pendingConflatedTicks.values());
      pendingConflatedTicks.clear();
      self.postMessage({
        type: 'CONFLATED_TICKS',
        ticks,
      });
    }
  }, CONFLATION_INTERVAL_MS);
}

// Simulated fallback tick generator for sandbox / demo mode or test runs
let simulationTimer = null;
function startSimulation(pairAssetMap) {
  if (simulationTimer) clearInterval(simulationTimer);
  simulationTimer = setInterval(() => {
    if (subscribedAssets.size === 0) return;

    // Pick 1-2 random subscribed assets and simulate high-frequency micro-ticks
    const assetList = Array.from(subscribedAssets);
    const targetAsset = assetList[Math.floor(Math.random() * assetList.length)];
    if (!targetAsset) return;

    let cur = priceCache.get(targetAsset) || {
      assetId: targetAsset,
      yesPrice: 0.50,
      noPrice: 0.50,
      bestBid: 0.49,
      bestAsk: 0.51,
      volume24h: 1200000,
      timestamp: Date.now(),
      tickDirection: 'FLAT',
    };

    // Micro delta: -0.01, 0, or +0.01
    const delta = (Math.random() > 0.5 ? 0.01 : -0.01);
    const newYes = Math.min(0.98, Math.max(0.02, parseFloat((cur.yesPrice + delta).toFixed(3))));
    const direction = newYes > cur.yesPrice ? 'UP' : 'DOWN';

    cur = {
      ...cur,
      yesPrice: newYes,
      noPrice: parseFloat((1 - newYes).toFixed(3)),
      bestBid: Math.max(0.01, parseFloat((newYes - 0.01).toFixed(2))),
      bestAsk: Math.min(0.99, parseFloat((newYes + 0.01).toFixed(2))),
      timestamp: Date.now(),
      tickDirection: direction,
    };

    priceCache.set(targetAsset, cur);
    pendingConflatedTicks.set(targetAsset, cur);
  }, 1200);
}

// Main thread message handler
self.onmessage = (e) => {
  const { command, payload } = e.data || {};

  switch (command) {
    case 'CONNECT':
      initSocket();
      startConflator();
      break;

    case 'SUBSCRIBE':
      subscribeToAssets(payload.assetIds || []);
      break;

    case 'UNSUBSCRIBE':
      unsubscribeFromAssets(payload.assetIds || []);
      break;

    case 'START_SIMULATION':
      startSimulation(payload);
      break;

    case 'STOP_SIMULATION':
      if (simulationTimer) {
        clearInterval(simulationTimer);
        simulationTimer = null;
      }
      break;

    case 'DISCONNECT':
      stopHeartbeat();
      if (conflationTimer) clearInterval(conflationTimer);
      if (simulationTimer) clearInterval(simulationTimer);
      if (socket) socket.close();
      sendStatus('DISCONNECTED');
      break;

    default:
      break;
  }
};
