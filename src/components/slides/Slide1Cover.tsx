"use client";

import { useEffect, useRef, useState } from "react";
import type { ChristmasCardConfig } from "@/config/christmasCardConfig";
import type { SfxType } from "@/lib/audioEngine";
import { PixelSprite } from "@/components/pixel/PixelSprite";
import {
  CRESCENT_MOON_SPRITE,
  ENVELOPE_SPRITE,
  SPARKLE_SPRITE,
} from "@/components/pixel/sprites";

export interface Slide1CoverProps {
  isActive: boolean;
  config: ChristmasCardConfig;
  playSfx: (type: SfxType) => void;
  onOpenCard: () => void;
}

interface FireworkSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: 1 | 2;
}

const FIREWORK_COLORS = [
  "#fde047",
  "#fef9c3",
  "#fb7185",
  "#f43f5e",
  "#38bdf8",
  "#4ade80",
];

export function Slide1Cover({
  isActive,
  config,
  playSfx,
  onOpenCard,
}: Slide1CoverProps) {
  const [isOpening, setIsOpening] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparksRef = useRef<FireworkSpark[]>([]);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isActive) {
      setIsOpening(false);
      sparksRef.current = [];
      window.cancelAnimationFrame(rafRef.current);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isActive]);

  useEffect(() => {
    return () => {
      window.cancelAnimationFrame(rafRef.current);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const launchFireworks = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 180;
    const height = 300;
    canvas.width = width;
    canvas.height = height;
    ctx.imageSmoothingEnabled = false;

    const origins = [
      { cx: 90, cy: 132 },
      { cx: 48, cy: 96 },
      { cx: 134, cy: 102 },
    ];

    const spawned: FireworkSpark[] = [];
    origins.forEach((origin, burstIdx) => {
      const count = burstIdx === 0 ? 28 : 18;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + burstIdx * 0.25;
        const speed = 28 + ((i * 19) % 42);
        spawned.push({
          x: origin.cx,
          y: origin.cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 8,
          life: 0,
          maxLife: 0.55 + (i % 4) * 0.08,
          color: FIREWORK_COLORS[(i + burstIdx) % FIREWORK_COLORS.length],
          size: i % 3 === 0 ? 2 : 1,
        });
      }
    });

    sparksRef.current = spawned;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;

      ctx.clearRect(0, 0, width, height);
      const alive: FireworkSpark[] = [];

      for (const s of sparksRef.current) {
        s.life += dt;
        if (s.life >= s.maxLife) continue;
        s.vy += 58 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;

        const progress = s.life / s.maxLife;
        ctx.globalAlpha = Math.max(0, 1 - progress * 0.85);
        ctx.fillStyle = s.color;
        ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
        alive.push(s);
      }

      ctx.globalAlpha = 1;
      sparksRef.current = alive;

      if (alive.length > 0 && isActive) {
        rafRef.current = window.requestAnimationFrame(step);
      }
    };

    window.cancelAnimationFrame(rafRef.current);
    rafRef.current = window.requestAnimationFrame(step);
  };

  const handleOpenClick = () => {
    if (isOpening) return;
    setIsOpening(true);
    playSfx("firework");
    launchFireworks();

    timerRef.current = setTimeout(() => {
      onOpenCard();
    }, 640);
  };

  return (
    <section
      aria-label="Bìa thiệp Giáng Sinh"
      className="relative flex h-full w-full flex-col items-center justify-between px-5 pt-2 pb-4 text-center"
    >
      {/* Local Pixel Fireworks Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pixelated pointer-events-none absolute inset-0 z-20 h-full w-full"
      />

      {/* Top Crescent Moon & Sparkles */}
      <div className="relative z-10 flex w-full items-start justify-between px-1 pt-1">
        <div className="vn-panel inline-flex items-center gap-1.5 px-3 py-1 text-[11px] tracking-wider text-[#fef3c7]">
          <PixelSprite
            grid={SPARKLE_SPRITE.grid}
            palette={SPARKLE_SPRITE.palette}
            className="h-3 w-3"
          />
          <span className="font-vn-body font-bold uppercase">
            {config.coverTitle}
          </span>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-3 rounded-full bg-[#fde047]/15 blur-md"
          />
          <PixelSprite
            grid={CRESCENT_MOON_SPRITE.grid}
            palette={CRESCENT_MOON_SPRITE.palette}
            className="relative h-12 w-12 sm:h-14 sm:w-14"
            title="Trăng khuyết đêm đông"
          />
        </div>
      </div>

      {/* Center Wax-Sealed Pixel Envelope + Greeting */}
      <div className="relative z-10 my-auto flex w-full flex-col items-center gap-4">
        <div className="relative flex items-center justify-center py-2">
          <div
            aria-hidden="true"
            className="absolute h-28 w-44 rounded-full bg-[#fde047]/15 blur-xl"
          />
          <div
            className={`relative transition-transform duration-300 ${
              isOpening ? "scale-110" : "animate-pixel-float"
            }`}
          >
            <PixelSprite
              grid={ENVELOPE_SPRITE.grid}
              palette={ENVELOPE_SPRITE.palette}
              className="w-44 drop-shadow-[0_8px_0_rgba(11,16,38,0.65)] sm:w-52"
              title="Phong thư Giáng Sinh đóng dấu sáp trái tim"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="font-pixel-display text-2xl leading-tight tracking-wide text-[#fef3c7] drop-shadow-[0_2px_0_#0b1026] sm:text-3xl">
            Merry Christmas,
          </p>
          <h1 className="font-vn-body text-xl font-bold leading-snug text-[#fde047] drop-shadow-[0_2px_0_#0b1026] break-words sm:text-2xl">
            {config.recipientName} ✨
          </h1>
          <p className="font-vn-body mx-auto max-w-[290px] pt-1 text-xs leading-relaxed text-[#f8fafc]/80">
            Một tấm thiệp nhỏ ấm áp gửi đến người thương giữa đêm tuyết rơi.
          </p>
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={handleOpenClick}
            disabled={isOpening}
            className="pixel-btn min-h-[48px] px-7 py-2.5 text-base tracking-wide"
          >
            <span className="font-vn-body font-bold">
              {isOpening ? "Đang mở thiệp... ✨" : "Mở thiệp 💌"}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Distant Snowy Horizon & Mini Pixel Pines */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative z-0 w-full pt-2"
      >
        <svg
          viewBox="0 0 120 18"
          shapeRendering="crispEdges"
          className="pixelated h-9 w-full"
          preserveAspectRatio="none"
        >
          {/* Mini pixel pines */}
          <g fill="#1e1b4b">
            <rect x="10" y="6" width="2" height="8" />
            <rect x="8" y="9" width="6" height="4" />
            <rect x="22" y="8" width="2" height="6" />
            <rect x="20" y="10" width="6" height="3" />
            <rect x="94" y="7" width="2" height="7" />
            <rect x="92" y="9" width="6" height="4" />
            <rect x="106" y="5" width="2" height="9" />
            <rect x="103" y="8" width="8" height="5" />
          </g>
          {/* Warm snow hill */}
          <rect x="0" y="14" width="120" height="4" fill="#cbd5e1" />
          <rect x="8" y="13" width="38" height="2" fill="#f8fafc" />
          <rect x="68" y="13" width="44" height="2" fill="#f8fafc" />
        </svg>
      </div>
    </section>
  );
}
