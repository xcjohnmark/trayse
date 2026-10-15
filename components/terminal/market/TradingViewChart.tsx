"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  AreaSeries,
  CandlestickSeries,
  ColorType,
  LineStyle,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  Time,
} from "lightweight-charts";

export type ChartTimeframe = "5m" | "15m" | "1h" | "1D" | "1W" | "1M" | "ALL";
export type ChartDisplayMode = "AREA" | "CANDLESTICK";

interface TradingViewChartProps {
  currentPrice: number; // 0.00 - 1.00
  timeframe: ChartTimeframe;
  displayMode?: ChartDisplayMode;
  venue?: "polymarket" | "kalshi";
  className?: string;
  onCrosshairMove?: (price: number | null, time: string | null) => void;
}

// Generate deterministic historical candlestick & area data aligned with current odds
function generateMockHistory(
  basePrice: number,
  timeframe: ChartTimeframe
): {
  areaData: Array<{ time: Time; value: number }>;
  candleData: Array<{ time: Time; open: number; high: number; low: number; close: number }>;
} {
  const now = Math.floor(Date.now() / 1000);
  let stepSeconds = 60;
  let pointsCount = 60;

  switch (timeframe) {
    case "5m":
      stepSeconds = 5;
      pointsCount = 60;
      break;
    case "15m":
      stepSeconds = 15;
      pointsCount = 60;
      break;
    case "1h":
      stepSeconds = 60;
      pointsCount = 60;
      break;
    case "1D":
      stepSeconds = 1440; // 24m
      pointsCount = 60;
      break;
    case "1W":
      stepSeconds = 10080;
      pointsCount = 60;
      break;
    case "1M":
      stepSeconds = 43200;
      pointsCount = 60;
      break;
    case "ALL":
      stepSeconds = 86400;
      pointsCount = 90;
      break;
  }

  const startTime = now - stepSeconds * pointsCount;
  const areaData: Array<{ time: Time; value: number }> = [];
  const candleData: Array<{ time: Time; open: number; high: number; low: number; close: number }> = [];

  // Deterministic seed walk ending at exact basePrice * 100
  const targetCents = Math.round(basePrice * 1000) / 10; // e.g. 78.5
  let running = targetCents - (pointsCount * 0.12 * ((targetCents % 5) - 2.5));

  for (let i = 0; i <= pointsCount; i++) {
    const t = (startTime + i * stepSeconds) as Time;
    const progress = i / pointsCount;
    // interpolate towards current target
    const noise = (Math.sin(i * 0.7) * 1.5 + Math.cos(i * 1.3) * 0.8) * (1 - progress * 0.7);
    const target = running + (targetCents - running) * progress + noise;
    const clampedClose = Math.max(1, Math.min(99, target));

    const open = i === 0 ? clampedClose - 0.2 : areaData[i - 1].value;
    const high = Math.max(open, clampedClose) + Math.abs(noise * 0.4);
    const low = Math.min(open, clampedClose) - Math.abs(noise * 0.4);
    const close = i === pointsCount ? targetCents : clampedClose;

    areaData.push({ time: t, value: Number(close.toFixed(2)) });
    candleData.push({
      time: t,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
    });
  }

  return { areaData, candleData };
}

export function TradingViewChart({
  currentPrice,
  timeframe,
  displayMode = "AREA",
  venue = "polymarket",
  className = "w-full h-full",
  onCrosshairMove,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);

  const [hoveredPoint, setHoveredPoint] = useState<{
    price: number | null;
    time: string | null;
  }>({ price: null, time: null });

  const onCrosshairMoveRef = useRef(onCrosshairMove);
  useEffect(() => {
    onCrosshairMoveRef.current = onCrosshairMove;
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // Palette: Polymarket Jade vs Kalshi Cyan
    const primaryColor = venue === "kalshi" ? "#38BDF8" : "#00D688";
    const topGradient = venue === "kalshi" ? "rgba(56, 189, 248, 0.28)" : "rgba(0, 214, 136, 0.28)";
    const bottomGradient = "rgba(0, 0, 0, 0.0)";

    // 1. Create Chart
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0B0E14" },
        textColor: "#94A3B8",
        fontSize: 11,
        fontFamily: "var(--font-geist-mono), monospace",
      },
      grid: {
        horzLines: { color: "#1E2638", style: LineStyle.Dotted },
        vertLines: { visible: false },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "#3B82F6",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#182030",
        },
        horzLine: {
          color: "#3B82F6",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#182030",
        },
      },
      rightPriceScale: {
        borderColor: "#1E2638",
        autoScale: true,
        scaleMargins: { top: 0.1, bottom: 0.1 },
        ticksVisible: false,
      },
      timeScale: {
        borderColor: "#1E2638",
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return date.toISOString().substring(11, 16);
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // 2. Add Series
    const { areaData, candleData } = generateMockHistory(currentPrice, timeframe);

    if (displayMode === "CANDLESTICK") {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#00D688",
        downColor: "#F43F5E",
        borderVisible: false,
        wickUpColor: "#00D688",
        wickDownColor: "#F43F5E",
        priceFormat: {
          type: "custom",
          formatter: (p: number) => `${p.toFixed(1)}¢`,
        },
      });
      candleSeries.setData(candleData);
      seriesRef.current = candleSeries;
    } else {
      const areaSeries = chart.addSeries(AreaSeries, {
        topColor: topGradient,
        bottomColor: bottomGradient,
        lineColor: primaryColor,
        lineWidth: 2,
        priceFormat: {
          type: "custom",
          formatter: (p: number) => `${p.toFixed(1)}¢`,
        },
      });
      areaSeries.setData(areaData);
      seriesRef.current = areaSeries;
    }

    chart.timeScale().fitContent();

    // 3. Crosshair hover handler
    chart.subscribeCrosshairMove((param) => {
      if (!param.point || !param.time || !seriesRef.current) {
        setHoveredPoint({ price: null, time: null });
        onCrosshairMoveRef.current?.(null, null);
        return;
      }
      const data = param.seriesData.get(seriesRef.current) as any;
      const priceVal = data?.value ?? data?.close ?? null;
      const dateStr = new Date((param.time as number) * 1000).toUTCString();
      setHoveredPoint({ price: priceVal, time: dateStr });
      onCrosshairMoveRef.current?.(priceVal, dateStr);
    });

    // 4. ResizeObserver for responsive layout
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0 && chartRef.current && containerRef.current) {
        const { width, height } = entries[0].contentRect;
        chartRef.current.applyOptions({
          width: Math.max(width, 200),
          height: Math.max(height, 200),
        });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [currentPrice, timeframe, displayMode, venue]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between">
      {/* Floating Hover Price Badge */}
      <div className="absolute top-2.5 left-3 z-20 pointer-events-none flex items-center gap-2 font-mono text-xs">
        {hoveredPoint.price !== null ? (
          <>
            <span className="text-white font-bold tabular-nums">
              {hoveredPoint.price.toFixed(1)}¢ ({hoveredPoint.price.toFixed(1)}%)
            </span>
            <span className="text-zinc-500 text-[11px]">
              {hoveredPoint.time?.substring(17, 22)} UTC
            </span>
          </>
        ) : (
          <span className="text-zinc-500 text-[11px]">
            Hover to inspect historical ticks
          </span>
        )}
      </div>

      {/* Chart Canvas Mount */}
      <div ref={containerRef} className={className} />
    </div>
  );
}
