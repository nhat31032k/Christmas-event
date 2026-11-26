"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ChristmasCardConfig } from "@/config/christmasCardConfig";
import type { SfxType } from "@/lib/audioEngine";
import { pickNextQuoteIndex } from "@/lib/slideNavigation";
import { PixelSprite } from "@/components/pixel/PixelSprite";
import {
  CHIBI_COUPLE_BLINK,
  CHIBI_COUPLE_OPEN,
  CHIBI_COUPLE_PALETTE,
  HEART_PIXEL_SPRITE,
  SPARKLE_SPRITE,
  TREE_GRID,
  TREE_THEMES,
} from "@/components/pixel/sprites";

export interface Slide2SceneProps {
  isActive: boolean;
  config: ChristmasCardConfig;
  playSfx: (type: SfxType) => void;
}

interface FloatingHeart {
  id: number;
  offsetX: number;
  scale: number;
}

export function Slide2Scene({ isActive, config, playSfx }: Slide2SceneProps) {
  const [treeThemeIdx, setTreeThemeIdx] = useState(0);
  const [twinkleAlt, setTwinkleAlt] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState<number | null>(null);
  const [quoteSeq, setQuoteSeq] = useState(0);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  const heartIdRef = useRef(1);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isActive) {
      setIsBlinking(false);
      if (bubbleTimerRef.current) {
        clearTimeout(bubbleTimerRef.current);
        bubbleTimerRef.current = null;
      }
      return;
    }

    const twinkleTimer = setInterval(() => {
      setTwinkleAlt((prev) => !prev);
    }, 620);

    let blinkTimeout: ReturnType<typeof setTimeout> | null = null;
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      blinkTimeout = setTimeout(() => {
        setIsBlinking(false);
      }, 170);
    }, 3200);

    return () => {
      clearInterval(twinkleTimer);
      clearInterval(blinkInterval);
      if (blinkTimeout) clearTimeout(blinkTimeout);
    };
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (bubbleTimerRef.current) {
        clearTimeout(bubbleTimerRef.current);
      }
    };
  }, []);

  const currentTreeTheme = TREE_THEMES[treeThemeIdx % TREE_THEMES.length];
  const treePalette = twinkleAlt
    ? currentTreeTheme.frameB
    : currentTreeTheme.frameA;

  const handleTreeTap = () => {
    setTreeThemeIdx((prev) => (prev + 1) % TREE_THEMES.length);
    playSfx("twinkle");
  };

  const handleCoupleTap = () => {
    playSfx("heart");
    const nextIdx = pickNextQuoteIndex(config.chibiQuotes.length, quoteIdx);
    setQuoteIdx(nextIdx);
    setQuoteSeq((prev) => prev + 1);

    const batch: FloatingHeart[] = [
      { id: heartIdRef.current++, offsetX: -26, scale: 0.9 },
      { id: heartIdRef.current++, offsetX: 0, scale: 1.15 },
      { id: heartIdRef.current++, offsetX: 24, scale: 0.85 },
    ];
    setHearts((prev) => [...prev.slice(-9), ...batch]);

    if (bubbleTimerRef.current) {
      clearTimeout(bubbleTimerRef.current);
    }
    bubbleTimerRef.current = setTimeout(() => {
      setQuoteIdx(null);
    }, 4200);
  };

  const activeQuote =
    quoteIdx !== null && config.chibiQuotes[quoteIdx]
      ? config.chibiQuotes[quoteIdx]
      : null;

  return (
    <section
      aria-label="Khung cảnh đêm Noel ấm áp"
      className="relative flex h-full w-full flex-col justify-between px-4 pt-2 pb-2"
    >
      {/* Top Interactive Guidance Pill + Tree Mode Tag */}
      <div className="relative z-20 flex flex-col items-center gap-1.5">
        <div className="vn-panel flex items-center gap-1.5 px-3 py-1.5 text-center text-[11px] text-[#fef3c7]">
          <PixelSprite
            grid={SPARKLE_SPRITE.grid}
            palette={SPARKLE_SPRITE.palette}
            className="h-3 w-3 shrink-0"
          />
          <span className="font-vn-body">
            Chạm cây thông đổi đèn • Chạm cặp đôi nhận tim
          </span>
        </div>

        <span className="font-vn-body inline-block bg-[#0b1026]/75 px-2.5 py-0.5 text-[11px] font-bold text-[#fde047] shadow-[0_0_0_1px_rgba(253,224,71,0.4)]">
          ✦ {currentTreeTheme.label}
        </span>
      </div>

      {/* Speech Bubble Zone */}
      <div className="relative z-20 flex min-h-[76px] items-center justify-center px-2">
        <AnimatePresence mode="wait">
          {activeQuote ? (
            <motion.div
              key={quoteSeq}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="vn-panel-gold relative max-w-[330px] px-4 py-2.5 text-center"
            >
              <p className="font-vn-body text-xs font-bold leading-relaxed text-[#fef3c7] sm:text-sm">
                “{activeQuote}”
              </p>
              {/* Pixel speech pointer */}
              <span
                aria-hidden="true"
                className="absolute right-14 -bottom-2 h-2 w-3 bg-[#fde047]"
              />
            </motion.div>
          ) : (
            <motion.p
              key="idle-caption"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-vn-body text-center text-xs text-[#fef3c7]/75"
            >
              Đêm Giáng Sinh dưới ánh đèn đường vàng ấm...
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Winter Park Stage: Warm Streetlamp + Christmas Tree + Chibi Couple */}
      <div className="relative z-10 mt-auto flex w-full flex-col items-center">
        {/* Warm Japanese Streetlamp Glow Cone */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 left-1/2 h-56 w-72 -translate-x-1/2 rounded-full bg-[#fde047]/12 blur-2xl"
        />

        {/* Background Pixel Streetlamp on Left */}
        <svg
          viewBox="0 0 24 64"
          shapeRendering="crispEdges"
          aria-hidden="true"
          className="pixelated pointer-events-none absolute bottom-5 left-2 h-44 w-16 opacity-90 sm:left-4 sm:h-48"
        >
          {/* Lamp post */}
          <rect x="5" y="10" width="2" height="50" fill="#1e293b" />
          <rect x="4" y="56" width="4" height="4" fill="#0f172a" />
          <rect x="5" y="8" width="11" height="2" fill="#334155" />
          {/* Warm glowing lantern housing */}
          <rect x="13" y="10" width="6" height="2" fill="#0f172a" />
          <rect x="14" y="12" width="4" height="5" fill="#fde047" />
          <rect x="15" y="13" width="2" height="3" fill="#ffffff" />
          <rect x="13" y="17" width="6" height="1" fill="#0f172a" />
        </svg>

        {/* Interactive Heroes Side by Side */}
        <div className="relative z-10 flex w-full items-end justify-center gap-1 px-1 sm:gap-3">
          {/* Interactive Christmas Tree */}
          <button
            type="button"
            onClick={handleTreeTap}
            aria-label={`Đổi màu đèn cây thông Noel (hiện tại: ${currentTreeTheme.label})`}
            className="group relative flex cursor-pointer flex-col items-center p-1 transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-[#fde047]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1 h-12 w-12 rounded-full bg-[#fde047]/30 blur-md transition-opacity group-hover:opacity-100"
            />
            <PixelSprite
              grid={TREE_GRID}
              palette={treePalette}
              className="w-32 drop-shadow-[0_6px_0_rgba(11,16,38,0.65)] sm:w-36"
            />
          </button>

          {/* Interactive Chibi Anime Couple */}
          <div className="relative flex flex-col items-center">
            {/* Floating Pixel Hearts Layer */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-10 left-1/2 z-20 -translate-x-1/2"
            >
              <AnimatePresence>
                {hearts.map((heart) => (
                  <motion.div
                    key={heart.id}
                    initial={{ opacity: 1, y: 8, x: heart.offsetX, scale: 0.6 }}
                    animate={{
                      opacity: 0,
                      y: -46,
                      x: heart.offsetX + (heart.id % 2 === 0 ? 8 : -8),
                      scale: heart.scale,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.05, ease: "easeOut" }}
                    onAnimationComplete={() => {
                      setHearts((prev) =>
                        prev.filter((item) => item.id !== heart.id),
                      );
                    }}
                    className="absolute top-0 left-0"
                  >
                    <PixelSprite
                      grid={HEART_PIXEL_SPRITE.grid}
                      palette={HEART_PIXEL_SPRITE.palette}
                      className="h-5 w-5"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={handleCoupleTap}
              aria-label="Chạm vào cặp đôi chibi để thả tim và xem lời nhắn dễ thương"
              className="group relative flex cursor-pointer flex-col items-center p-1 transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-[#fde047]"
            >
              <PixelSprite
                grid={isBlinking ? CHIBI_COUPLE_BLINK : CHIBI_COUPLE_OPEN}
                palette={CHIBI_COUPLE_PALETTE}
                className="w-36 drop-shadow-[0_6px_0_rgba(11,16,38,0.65)] sm:w-40"
              />
            </button>
          </div>
        </div>

        {/* Snowy Park Ground Ledge */}
        <svg
          viewBox="0 0 160 14"
          shapeRendering="crispEdges"
          aria-hidden="true"
          className="pixelated -mt-2 h-6 w-full"
          preserveAspectRatio="none"
        >
          <rect x="0" y="3" width="160" height="11" fill="#e2e8f0" />
          <rect x="6" y="1" width="148" height="4" fill="#f8fafc" />
          <rect x="0" y="10" width="160" height="4" fill="#94a3b8" />
        </svg>
      </div>
    </section>
  );
}
