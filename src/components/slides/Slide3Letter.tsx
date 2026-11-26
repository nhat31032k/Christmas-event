"use client";

import { useEffect, useState } from "react";
import type { ChristmasCardConfig } from "@/config/christmasCardConfig";
import type { SfxType } from "@/lib/audioEngine";
import { PixelSprite } from "@/components/pixel/PixelSprite";
import {
  CANDLE_FRAME_A,
  CANDLE_FRAME_B,
  CANDLE_PALETTE,
  CHIBI_AVATAR_BLINK,
  CHIBI_AVATAR_OPEN,
  CHIBI_AVATAR_PALETTE,
  COCOA_MUG_FRAME_A,
  COCOA_MUG_FRAME_B,
  COCOA_MUG_PALETTE,
  CRESCENT_MOON_SPRITE,
} from "@/components/pixel/sprites";

export interface Slide3LetterProps {
  isActive: boolean;
  config: ChristmasCardConfig;
  playSfx: (type: SfxType) => void;
}

const FAIRY_BULB_COLORS = ["#fde047", "#fb7185", "#4ade80", "#38bdf8", "#fde047"];

export function Slide3Letter({ isActive, config, playSfx }: Slide3LetterProps) {
  const pages = config.letterPages;
  const totalPages = Math.max(1, pages.length);

  const [pageIdx, setPageIdx] = useState(0);
  const [visibleChars, setVisibleChars] = useState(0);
  const [steamFrameAlt, setSteamFrameAlt] = useState(false);
  const [avatarBlink, setAvatarBlink] = useState(false);

  const currentText = pages[pageIdx] ?? "";
  const isTyping = visibleChars < currentText.length;
  const isLastPage = pageIdx >= totalPages - 1;

  // Reset typing when changing page
  useEffect(() => {
    setVisibleChars(0);
  }, [pageIdx]);

  // Typewriter character interval (paused when slide is inactive)
  useEffect(() => {
    if (!isActive || visibleChars >= currentText.length) {
      return;
    }

    const reducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      setVisibleChars(currentText.length);
      return;
    }

    const timer = setTimeout(() => {
      const nextCount = visibleChars + 1;
      setVisibleChars(nextCount);
      const nextChar = currentText[visibleChars];
      if (nextChar && nextChar !== " " && nextCount % 4 === 0) {
        playSfx("type");
      }
    }, 26);

    return () => clearTimeout(timer);
  }, [currentText, isActive, playSfx, visibleChars]);

  // Cozy cocoa steam, candle flicker & chibi avatar eye blink
  useEffect(() => {
    if (!isActive) {
      setAvatarBlink(false);
      return;
    }

    const cozyTimer = setInterval(() => {
      setSteamFrameAlt((prev) => !prev);
    }, 560);

    let blinkTimeout: ReturnType<typeof setTimeout> | null = null;
    const blinkInterval = setInterval(() => {
      setAvatarBlink(true);
      blinkTimeout = setTimeout(() => {
        setAvatarBlink(false);
      }, 160);
    }, 2900);

    return () => {
      clearInterval(cozyTimer);
      clearInterval(blinkInterval);
      if (blinkTimeout) clearTimeout(blinkTimeout);
    };
  }, [isActive]);

  const handleRevealAll = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    playSfx("click");
    setVisibleChars(currentText.length);
  };

  const handleDialogAdvance = () => {
    if (isTyping) {
      playSfx("click");
      setVisibleChars(currentText.length);
      return;
    }

    playSfx("slide");
    setPageIdx((prev) => (prev + 1) % totalPages);
  };

  return (
    <section
      aria-label="Bức thư Giáng Sinh Visual Novel"
      className="relative flex h-full w-full flex-col justify-between gap-2.5 px-4 pt-1 pb-2"
    >
      {/* Upper Scene: Warm Wooden Bedroom Window + Falling Snow + Hot Cocoa */}
      <div className="relative flex h-[39%] min-h-[162px] max-h-[235px] w-full flex-col justify-end overflow-hidden bg-[#1e1b4b]/65 shadow-[0_0_0_3px_#78350f,inset_0_0_0_3px_#451a03]">
        {/* Warm Room Curtain Sides */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-[#7f1d1d]/75 shadow-[2px_0_0_#450a0a]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-[#7f1d1d]/75 shadow-[-2px_0_0_#450a0a]"
        />

        {/* Window Cross Mullions */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-2 -translate-x-1/2 bg-[#451a03] shadow-[inset_1px_0_0_#78350f]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-2 -translate-y-1/2 bg-[#451a03] shadow-[inset_0_1px_0_#78350f]"
        />

        {/* String of Twinkling Pixel Fairy Lights along Window Top */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-2 z-20 flex items-center justify-around"
        >
          {FAIRY_BULB_COLORS.map((color, idx) => {
            const lit = (idx % 2 === 0) !== steamFrameAlt;
            return (
              <span
                key={idx}
                className="h-2.5 w-2.5 transition-opacity duration-300"
                style={{
                  backgroundColor: color,
                  opacity: lit ? 1 : 0.45,
                  boxShadow: lit ? `0 0 8px ${color}` : "none",
                }}
              />
            );
          })}
        </div>

        {/* Outside Moon & Frosty Glass Corner */}
        <div className="pointer-events-none absolute top-5 right-9 z-0 opacity-90">
          <PixelSprite
            grid={CRESCENT_MOON_SPRITE.grid}
            palette={CRESCENT_MOON_SPRITE.palette}
            className="h-10 w-10"
          />
        </div>

        {/* Sill Props: Steaming Hot Cocoa Mug + Flickering Candle */}
        <div className="relative z-20 flex items-end justify-between px-9 pb-0.5">
          <div className="relative flex items-end">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-3 rounded-full bg-[#fde047]/20 blur-md"
            />
            <PixelSprite
              grid={steamFrameAlt ? CANDLE_FRAME_B : CANDLE_FRAME_A}
              palette={CANDLE_PALETTE}
              className="relative h-11 w-8"
              title="Nến thơm Giáng Sinh"
            />
          </div>

          <PixelSprite
            grid={steamFrameAlt ? COCOA_MUG_FRAME_B : COCOA_MUG_FRAME_A}
            palette={COCOA_MUG_PALETTE}
            className="h-16 w-14 drop-shadow-[0_3px_0_rgba(11,16,38,0.65)] sm:h-20 sm:w-16"
            title="Ly cacao nóng bốc khói"
          />
        </div>

        {/* Wooden Windowsill */}
        <div
          aria-hidden="true"
          className="relative z-20 h-3.5 w-full bg-[#78350f] shadow-[inset_0_2px_0_#b45309,0_-2px_0_#0f172a]"
        />
      </div>

      {/* Lower Visual Novel Dialog Box */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleDialogAdvance}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleDialogAdvance();
          }
        }}
        aria-label="Khung thư Giáng Sinh — chạm để hiện hết chữ hoặc đọc đoạn tiếp theo"
        className="vn-panel relative flex min-h-0 flex-1 cursor-pointer flex-col justify-between p-3.5 text-left focus-visible:outline-2 focus-visible:outline-[#fde047]"
      >
        {/* VN Speaker Header Strip */}
        <div className="flex items-center justify-between gap-2 border-b border-[#fef3c7]/20 pb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#1e1b4b] p-0.5 shadow-[0_0_0_2px_#fde047]">
              <PixelSprite
                grid={avatarBlink ? CHIBI_AVATAR_BLINK : CHIBI_AVATAR_OPEN}
                palette={CHIBI_AVATAR_PALETTE}
                className="h-full w-full"
                title="Avatar người gửi"
              />
            </div>

            <div className="min-w-0">
              <p className="font-vn-body truncate text-xs font-bold text-[#fde047] sm:text-sm">
                {config.senderName}
              </p>
              <p className="font-vn-body text-[10px] text-[#fef3c7]/70">
                Thư đêm Giáng Sinh 💌
              </p>
            </div>
          </div>

          <span className="font-pixel-display shrink-0 bg-[#1e1b4b] px-2 py-0.5 text-xs text-[#fef3c7] shadow-[0_0_0_1px_rgba(254,243,199,0.5)]">
            {pageIdx + 1}/{totalPages}
          </span>
        </div>

        {/* Typewriter Letter Body */}
        <div className="my-2 min-h-0 flex-1 overflow-y-auto pr-0.5">
          <p className="font-vn-body text-[13px] leading-relaxed text-[#f8fafc] sm:text-sm">
            {currentText.slice(0, visibleChars)}
            {isTyping ? (
              <span
                aria-hidden="true"
                className="ml-0.5 inline-block h-3.5 w-2 translate-y-0.5 bg-[#fde047]"
              />
            ) : null}
          </p>

          {!isTyping && isLastPage ? (
            <p className="font-vn-body mt-2.5 text-right text-xs font-bold text-[#fde047]">
              — Thương gửi em, {config.senderName} ❤️
            </p>
          ) : null}
        </div>

        {/* VN Dialog Footer Controls */}
        <div className="flex min-h-[36px] items-center justify-between gap-2 border-t border-[#fef3c7]/15 pt-2">
          {isTyping ? (
            <>
              <span className="font-vn-body text-[11px] text-[#fef3c7]/70">
                Đang viết thư...
              </span>
              <button
                type="button"
                onClick={handleRevealAll}
                className="pixel-btn-ghost min-h-[36px] px-3 py-1 text-xs font-bold text-[#fde047]"
              >
                Hiện hết
              </button>
            </>
          ) : (
            <div className="ml-auto flex items-center gap-1.5 text-xs font-bold text-[#fde047]">
              <span className="font-vn-body">
                {isLastPage ? "Đọc lại từ đoạn đầu" : "Chạm để đọc tiếp"}
              </span>
              <span aria-hidden="true" className="animate-pixel-blink text-sm">
                ▼
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
