"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

interface AutoScrollCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerRight?: React.ReactNode;
  intervalMs?: number; // Auto-scroll interval, default 4000ms
  emptyMessage?: string;
  className?: string;
}

export function AutoScrollCarousel<T extends { id?: string | number }>({
  items,
  renderItem,
  title,
  subtitle,
  icon,
  headerRight,
  intervalMs = 4200,
  emptyMessage = "હાલમાં કોઈ માહિતી ઉપલબ્ધ નથી.",
  className = "",
}: AutoScrollCarouselProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Responsive items-per-page calculation
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (typeof window === "undefined") return;
      const w = window.innerWidth;
      if (w < 640) {
        setVisibleCount(1);
      } else if (w < 1024) {
        setVisibleCount(2);
      } else if (w < 1280) {
        setVisibleCount(3);
      } else {
        setVisibleCount(3);
      }
    };
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const maxIndex = Math.max(0, items.length - visibleCount);

  // Independent auto-scrolling timer with pause on hover
  useEffect(() => {
    if (items.length <= visibleCount || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [items.length, visibleCount, isHovered, maxIndex, intervalMs]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  // Touch Swipe Handlers for mobile
  const minSwipeDistance = 45;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  if (items.length === 0) {
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

  // Calculate card width percentage based on visibleCount
  // 1 card = 100%, 2 cards = 50%, 3 cards = 33.333%
  const cardWidthPercent = 100 / visibleCount;
  const translateX = -(currentIndex * cardWidthPercent);

  return (
    <section
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header with Title, Controls, and View All link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900">{title}</h2>
            {isHovered && items.length > visibleCount && (
              <span className="text-[10px] bg-ivory-200 text-charcoal-600 px-2 py-0.5 rounded-full font-medium hidden sm:inline-flex items-center gap-1">
                <Pause className="w-2.5 h-2.5" />
                <span>થોભાયેલ</span>
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-charcoal-600 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Navigation Arrow Buttons */}
          {items.length > visibleCount && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                className="p-2 rounded-xl bg-white border border-ivory-300 hover:border-saffron-500 hover:text-saffron-700 text-charcoal-700 shadow-2xs transition-all active:scale-95"
                title="પાછળ"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-2 rounded-xl bg-white border border-ivory-300 hover:border-saffron-500 hover:text-saffron-700 text-charcoal-700 shadow-2xs transition-all active:scale-95"
                title="આગળ"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {headerRight}
        </div>
      </div>

      {/* Overflow Viewport */}
      <div className="overflow-hidden rounded-3xl" ref={containerRef}>
        <div
          className="flex transition-transform duration-600 ease-out"
          style={{
            transform: `translateX(${translateX}%)`,
          }}
        >
          {items.map((item, idx) => (
            <div
              key={item.id ? String(item.id) : `item-${idx}`}
              className="flex-shrink-0 px-2 sm:px-2.5"
              style={{
                width: `${cardWidthPercent}%`,
              }}
            >
              {renderItem(item, idx)}
            </div>
          ))}
        </div>
      </div>

      {/* Dots / Pagination Indicator */}
      {items.length > visibleCount && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === i
                  ? "w-6 bg-saffron-600"
                  : "w-2 bg-ivory-300 hover:bg-ivory-400"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

