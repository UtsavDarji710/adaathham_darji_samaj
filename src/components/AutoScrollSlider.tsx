"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

interface AutoScrollSliderProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerRight?: React.ReactNode;
  speedSeconds?: number; // Duration for one full loop, e.g. 25s (faster), 45s (slower for reading)
  direction?: "left" | "right";
  emptyMessage?: string;
  className?: string;
}

export function AutoScrollSlider<T extends { id?: string | number }>({
  items,
  renderItem,
  title,
  subtitle,
  icon,
  headerRight,
  speedSeconds = 35,
  direction = "left",
  emptyMessage = "હાલમાં કોઈ માહિતી ઉપલબ્ધ નથી.",
  className = "",
}: AutoScrollSliderProps<T>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [manualOffset, setManualOffset] = useState(0);

  // Touch tracking for mobile swipe/drag
  const touchStartXRef = useRef<number | null>(null);
  const touchCurrentXRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchCurrentXRef.current = e.touches[0].clientX;
    setIsTouching(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    touchCurrentXRef.current = e.touches[0].clientX;
    const deltaX = touchCurrentXRef.current - touchStartXRef.current;
    setManualOffset((prev) => prev + deltaX * 0.5);
    touchStartXRef.current = touchCurrentXRef.current;
  };

  const handleTouchEnd = () => {
    touchStartXRef.current = null;
    touchCurrentXRef.current = null;
    // Resume auto-scrolling 2.5 seconds after user stops touching
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsTouching(false);
    }, 2500);
  };

  // Manual Nudge with arrow buttons
  const nudge = useCallback((direction: "left" | "right") => {
    setIsTouching(true);
    const amount = direction === "left" ? 320 : -320;
    setManualOffset((prev) => prev + amount);

    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsTouching(false);
    }, 3500);
  }, []);

  if (!items || items.length === 0) {
    return (
      <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900">{title}</h2>
          </div>
          {headerRight}
        </div>
        <div className="p-8 text-center bg-white rounded-3xl border border-ivory-300 text-charcoal-500 text-xs">
          {emptyMessage}
        </div>
      </section>
    );
  }

  // To achieve a 100% gapless infinite loop, duplicate items so the track width is at least 200% of viewport
  // If items length is small (e.g. 2-3 items), repeat 4 times; otherwise repeat 2 times.
  const repeatCount = items.length <= 3 ? 4 : 2;
  const loopItems: { item: T; key: string }[] = [];
  for (let r = 0; r < repeatCount; r++) {
    items.forEach((item, idx) => {
      loopItems.push({
        item,
        key: `${item.id || idx}-repeat-${r}`,
      });
    });
  }

  const isAnimationPaused = isHovered || isPaused || isTouching;

  return (
    <section
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 group-slider select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header with Title, Controls, and View All link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-xl sm:text-2xl font-black text-charcoal-900 tracking-tight">
              {title}
            </h2>

            {/* Hover / Pause Status Indicator Pill */}
            {isAnimationPaused && (
              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-2xs animate-pulse">
                <Pause className="w-2.5 h-2.5" />
                <span>ઓટો-સ્ક્રોલ થોભાયેલ છે</span>
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-charcoal-600 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Manual Play / Pause Toggle Button */}
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            className={`p-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs flex items-center gap-1 ${
              isPaused
                ? "bg-amber-500 text-white border-amber-600"
                : "bg-white border-ivory-300 text-charcoal-700 hover:border-saffron-500"
            }`}
            title={isPaused ? "ઓટો-સ્ક્રોલ ચાલુ કરો" : "ઓટો-સ્ક્રોલ થોભાવો"}
            aria-label="Toggle pause"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span className="text-[10px] hidden md:inline">
              {isPaused ? "ચાલુ કરો" : "થોભાવો"}
            </span>
          </button>

          {/* Previous / Next Arrow Buttons for manual control */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => nudge("left")}
              className="p-1.5 rounded-xl bg-white border border-ivory-300 hover:border-saffron-500 hover:text-saffron-700 text-charcoal-700 shadow-2xs transition-all active:scale-95"
              title="પાછળ ખસેડો"
              aria-label="Scroll backward"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => nudge("right")}
              className="p-1.5 rounded-xl bg-white border border-ivory-300 hover:border-saffron-500 hover:text-saffron-700 text-charcoal-700 shadow-2xs transition-all active:scale-95"
              title="આગળ ખસેડો"
              aria-label="Scroll forward"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {headerRight}
        </div>
      </div>

      {/* Marquee Viewport with Edge Fade Gradients */}
      <div className="relative overflow-hidden rounded-3xl" ref={scrollContainerRef}>
        {/* Left Fade Gradient Mask */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-ivory-50 via-ivory-50/70 to-transparent z-10" />

        {/* Right Fade Gradient Mask */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-ivory-50 via-ivory-50/70 to-transparent z-10" />

        {/* Continuous Infinite Marquee Track */}
        <div
          className={`flex flex-nowrap items-stretch gap-4 sm:gap-5 py-2 px-1 ${
            direction === "right"
              ? "animate-slider-marquee-right"
              : "animate-slider-marquee-left"
          } ${isAnimationPaused ? "slider-paused" : ""}`}
          style={
            {
              "--slider-speed": `${speedSeconds}s`,
              ...(manualOffset !== 0
                ? { transform: `translate3d(${manualOffset}px, 0, 0)` }
                : {}),
            } as React.CSSProperties
          }
        >
          {loopItems.map(({ item, key }, idx) => (
            <div
              key={key}
              className="flex-shrink-0 transition-transform duration-200 hover:-translate-y-1"
            >
              {renderItem(item, idx % items.length)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

