"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ChristmasCardConfig } from "@/config/christmasCardConfig";
import type { SfxType } from "@/lib/audioEngine";
import { PixelSprite } from "@/components/pixel/PixelSprite";
import {
  CRESCENT_MOON_SPRITE,
  SPARKLE_SPRITE,
} from "@/components/pixel/sprites";

export interface Slide4WishesProps {
  isActive: boolean;
  config: ChristmasCardConfig;
  playSfx: (type: SfxType) => void;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  trail: Array<{ x: number; y: number }>;
}

interface StarDust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export function Slide4Wishes({ isActive, config, playSfx }: Slide4WishesProps) {
  const wishes = config.shootingStarWishes;
  const totalWishes = Math.max(1, wishes.length);

  const [tapCount, setTapCount] = useState(0);
  const [windowBlinkAlt, setWindowBlinkAlt] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<ShootingStar[]>([]);
  const dustRef = useRef<StarDust[]>([]);
  const rafRef = useRef<number>(0);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!isActive) {
      starsRef.current = [];
      dustRef.current = [];
      window.cancelAnimationFrame(rafRef.current);
      return;
    }

    const skylineTimer = setInterval(() => {
      setWindowBlinkAlt((prev) => !prev);
    }, 1100);

    return () => {
      clearInterval(skylineTimer);
      window.cancelAnimationFrame(rafRef.current);
    };
  }, [isActive]);

  const startStarLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (canvas.width !== 216 || canvas.height !== 320) {
      canvas.width = 216;
      canvas.height = 320;
    }
    ctx.imageSmoothingEnabled = false;

    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const nextStars: ShootingStar[] = [];
      for (const star of starsRef.current) {
        star.life += dt;
        if (star.life >= star.maxLife) continue;

        star.trail.unshift({ x: star.x, y: star.y });
        if (star.trail.length > 14) {
          star.trail.pop();
        }

        star.x += star.vx * dt;
        star.y += star.vy * dt;

        // Spawn occasional pixel stardust
        if (Math.random() < 0.65) {
          dustRef.current.push({
            x: star.x + (Math.random() - 0.5) * 3,
            y: star.y + (Math.random() - 0.5) * 3,
            vx: (Math.random() - 0.5) * 14,
            vy: 6 + Math.random() * 14,
            life: 0,
            maxLife: 0.45,
            color: Math.random() > 0.4 ? "#fde047" : "#bae6fd",
          });
        }

        // Draw pixelated tail
        for (let i = 0; i < star.trail.length; i++) {
          const pt = star.trail[i];
          const fade = 1 - i / star.trail.length;
          ctx.fillStyle =
            i < 4
              ? `rgba(253, 224, 71, ${(fade * 0.92).toFixed(2)})`
              : `rgba(56, 189, 248, ${(fade * 0.65).toFixed(2)})`;
          const sz = i < 3 ? 2 : 1;
          ctx.fillRect(Math.round(pt.x), Math.round(pt.y), sz, sz);
        }

        // Bright pixel star head + cross flare
        const hx = Math.round(star.x);
        const hy = Math.round(star.y);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(hx - 1, hy, 3, 1);
        ctx.fillRect(hx, hy - 1, 1, 3);
        ctx.fillStyle = "#fde047";
        ctx.fillRect(hx + 1, hy + 1, 1, 1);

        nextStars.push(star);
      }

      const nextDust: StarDust[] = [];
      for (const d of dustRef.current) {
        d.life += dt;
        if (d.life >= d.maxLife) continue;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        ctx.globalAlpha = Math.max(0, 1 - d.life / d.maxLife);
        ctx.fillStyle = d.color;
        ctx.fillRect(Math.round(d.x), Math.round(d.y), 1, 1);
        nextDust.push(d);
      }
      ctx.globalAlpha = 1;

      starsRef.current = nextStars;
      dustRef.current = nextDust;

      if ((nextStars.length > 0 || nextDust.length > 0) && isActive) {
        rafRef.current = window.requestAnimationFrame(frame);
      } else {
        rafRef.current = 0;
      }
    };

    if (!rafRef.current) {
      rafRef.current = window.requestAnimationFrame(frame);
    }
  };

  const spawnShootingStarAt = (clientX: number, clientY: number, rect: DOMRect) => {
    const relX = Math.max(0.12, Math.min(0.88, (clientX - rect.left) / rect.width));
    const relY = Math.max(0.12, Math.min(0.62, (clientY - rect.top) / rect.height));

    // Start slightly up-right so the star streaks across the tapped sky spot
    const startX = Math.min(206, relX * 216 + 38);
    const startY = Math.max(12, relY * 320 - 26);

    starsRef.current.push({
      x: startX,
      y: startY,
      vx: -138 - Math.random() * 26,
      vy: 74 + Math.random() * 20,
      life: 0,
      maxLife: 0.92,
      trail: [],
    });

    playSfx("star");
    setTapCount((prev) => prev + 1);
    startStarLoop();
  };

  const currentWishIndex = tapCount > 0 ? (tapCount - 1) % totalWishes : null;
  const currentWish =
    currentWishIndex !== null ? wishes[currentWishIndex] : null;
  const discoveredCount = Math.min(tapCount, totalWishes);

  return (
    <section
      aria-label="Bầu trời điều ước sao băng"
      onPointerDown={(e) => {
        pointerStartRef.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        const start = pointerStartRef.current;
        pointerStartRef.current = null;
        if (!start) return;
        const dx = Math.abs(e.clientX - start.x);
        const dy = Math.abs(e.clientY - start.y);
        if (dx < 18 && dy < 18) {
          spawnShootingStarAt(
            e.clientX,
            e.clientY,
            e.currentTarget.getBoundingClientRect(),
          );
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const rect = e.currentTarget.getBoundingClientRect();
          spawnShootingStarAt(
            rect.left + rect.width * 0.55,
            rect.top + rect.height * 0.3,
            rect,
          );
        }
      }}
      role="button"
      tabIndex={0}
      className="relative flex h-full w-full cursor-pointer flex-col justify-between overflow-hidden pt-2 focus-visible:outline-2 focus-visible:outline-[#fde047]"
    >
      {/* Shooting Star Pixel FX Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pixelated pointer-events-none absolute inset-0 z-10 h-full w-full"
      />

      {/* Top Instruction Banner + Discovered Wish Counter */}
      <div className="relative z-20 flex items-center justify-between gap-2 px-4">
        <div className="vn-panel flex flex-1 items-center gap-2 px-3 py-1.5 text-left text-[11px] text-[#fef3c7]">
          <PixelSprite
            grid={SPARKLE_SPRITE.grid}
            palette={SPARKLE_SPRITE.palette}
            className="h-3.5 w-3.5 shrink-0"
          />
          <span className="font-vn-body leading-snug">
            Chạm lên bầu trời để thả sao băng &amp; nhận lời chúc ✨
          </span>
        </div>

        <span className="vn-panel-gold font-pixel-display shrink-0 px-2.5 py-1.5 text-xs text-[#fde047]">
          ★ {discoveredCount}/{totalWishes}
        </span>
      </div>

      {/* Moon & Open Sky */}
      <div className="pointer-events-none relative z-0 flex flex-1 items-start justify-between px-7 pt-5">
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-4 rounded-full bg-[#fde047]/18 blur-xl"
          />
          <PixelSprite
            grid={CRESCENT_MOON_SPRITE.grid}
            palette={CRESCENT_MOON_SPRITE.palette}
            className="relative h-14 w-14 sm:h-16 sm:w-16"
          />
        </div>
      </div>

      {/* Wish Card Overlay Above City Skyline */}
      <div className="relative z-20 px-4 pb-2">
        <AnimatePresence mode="wait">
          {currentWish ? (
            <motion.div
              key={tapCount}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              className="vn-panel-gold p-3.5 text-left"
            >
              <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-[#fde047]">
                <span className="font-vn-body">
                  ✨ ĐIỀU ƯỚC #{((tapCount - 1) % totalWishes) + 1}
                </span>
                <span className="font-vn-body text-[#fef3c7]/70">
                  Chạm tiếp để thả thêm sao
                </span>
              </div>
              <p className="font-vn-body text-xs leading-relaxed text-[#f8fafc] sm:text-sm">
                “{currentWish}”
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="empty-wish"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="vn-panel mx-auto max-w-[310px] px-4 py-2.5 text-center"
            >
              <p className="font-vn-body text-xs text-[#fef3c7]/85">
                Bầu trời đêm đang chờ điều ước đầu tiên của em... ✨
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Japanese Winter City Skyline Silhouette */}
      <div aria-hidden="true" className="pointer-events-none relative z-10 w-full">
        <svg
          viewBox="0 0 180 42"
          shapeRendering="crispEdges"
          className="pixelated block h-20 w-full sm:h-24"
          preserveAspectRatio="none"
        >
          {/* Distant indigo skyline */}
          <g fill="#17153b">
            <rect x="4" y="18" width="18" height="24" />
            <rect x="26" y="12" width="22" height="30" />
            <rect x="54" y="20" width="16" height="22" />
            <rect x="92" y="14" width="24" height="28" />
            <rect x="122" y="19" width="20" height="23" />
            <rect x="148" y="11" width="24" height="31" />
          </g>

          {/* Distant Tokyo-style winter radio tower */}
          <rect x="78" y="6" width="2" height="34" fill="#312e81" />
          <rect x="76" y="16" width="6" height="10" fill="#312e81" />
          <rect x="74" y="26" width="10" height="14" fill="#1e1b4b" />
          <rect
            x="78"
            y="4"
            width="2"
            height="2"
            fill={windowBlinkAlt ? "#f43f5e" : "#fb7185"}
          />

          {/* Foreground dark silhouettes */}
          <g fill="#0b1026">
            <rect x="0" y="25" width="24" height="17" />
            <rect x="20" y="21" width="28" height="21" />
            <rect x="46" y="27" width="26" height="15" />
            <rect x="70" y="29" width="22" height="13" />
            <rect x="90" y="22" width="30" height="20" />
            <rect x="118" y="26" width="28" height="16" />
            <rect x="144" y="20" width="36" height="22" />
          </g>

          {/* Snow-dusted roofs */}
          <g fill="#e2e8f0">
            <rect x="20" y="20" width="28" height="1" />
            <rect x="90" y="21" width="30" height="1" />
            <rect x="144" y="19" width="36" height="1" />
          </g>

          {/* Warm glowing apartment windows */}
          <g fill="#fde047">
            <rect x="6" y="29" width="2" height="3" />
            <rect x="12" y="33" width="2" height="3" />
            <rect x="25" y="25" width="3" height="3" />
            <rect x="31" y="25" width="3" height="3" />
            <rect x="25" y="31" width="3" height="3" />
            <rect x="38" y="29" width="3" height="3" />
            <rect x="53" y="31" width="3" height="3" />
            <rect x="95" y="26" width="3" height="3" />
            <rect x="102" y="26" width="3" height="3" />
            <rect x="109" y="32" width="3" height="3" />
            <rect x="126" y="30" width="3" height="3" />
            <rect x="150" y="24" width="3" height="3" />
            <rect x="157" y="24" width="3" height="3" />
            <rect x="165" y="30" width="3" height="3" />
          </g>
          {windowBlinkAlt ? (
            <g fill="#fef9c3">
              <rect x="31" y="31" width="3" height="3" />
              <rect x="95" y="32" width="3" height="3" />
              <rect x="157" y="30" width="3" height="3" />
            </g>
          ) : (
            <g fill="#f59e0b">
              <rect x="12" y="29" width="2" height="3" />
              <rect x="60" y="31" width="3" height="3" />
              <rect x="133" y="30" width="3" height="3" />
            </g>
          )}
        </svg>
      </div>
    </section>
  );
}
