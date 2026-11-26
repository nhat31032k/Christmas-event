"use client";

import { useEffect, useRef, useState } from "react";
import type { ChristmasCardConfig } from "@/config/christmasCardConfig";
import type { SfxType } from "@/lib/audioEngine";
import { PixelSprite } from "@/components/pixel/PixelSprite";
import {
  SPARKLE_SPRITE,
  VOUCHER_ICONS,
} from "@/components/pixel/sprites";

export interface Slide5GiftsProps {
  isActive: boolean;
  config: ChristmasCardConfig;
  playSfx: (type: SfxType) => void;
  onRestart: () => void;
}

interface HeartParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  wobblePhase: number;
  scale: 1 | 2;
  life: number;
  maxLife: number;
  color: string;
}

interface SparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

const HEART_COLORS = ["#f43f5e", "#fb7185", "#e11d48", "#fde047"];

export function Slide5Gifts({
  isActive,
  config,
  playSfx,
  onRestart,
}: Slide5GiftsProps) {
  const [flippedIds, setFlippedIds] = useState<Record<string, boolean>>({});
  const [heartCount, setHeartCount] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const heartsRef = useRef<HeartParticle[]>([]);
  const sparklesRef = useRef<SparkleParticle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive) {
      heartsRef.current = [];
      sparklesRef.current = [];
      window.cancelAnimationFrame(rafRef.current);
    }
    return () => {
      window.cancelAnimationFrame(rafRef.current);
    };
  }, [isActive]);

  const ensureFxLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (canvas.width !== 216 || canvas.height !== 360) {
      canvas.width = 216;
      canvas.height = 360;
    }
    ctx.imageSmoothingEnabled = false;

    let last = performance.now();

    const drawMiniHeart = (cx: number, cy: number, scale: 1 | 2, color: string) => {
      const px = Math.round(cx);
      const py = Math.round(cy);
      ctx.fillStyle = color;
      // 5x4 crisp pixel heart scaled by 1x or 2x
      ctx.fillRect(px + 1 * scale, py, 1 * scale, 1 * scale);
      ctx.fillRect(px + 3 * scale, py, 1 * scale, 1 * scale);
      ctx.fillRect(px, py + 1 * scale, 5 * scale, 1 * scale);
      ctx.fillRect(px + 1 * scale, py + 2 * scale, 3 * scale, 1 * scale);
      ctx.fillRect(px + 2 * scale, py + 3 * scale, 1 * scale, 1 * scale);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(px + 1 * scale, py + 1 * scale, 1 * scale, 1 * scale);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      const elapsed = now / 1000;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const aliveHearts: HeartParticle[] = [];
      for (const h of heartsRef.current) {
        h.life += dt;
        if (h.life >= h.maxLife) continue;
        h.y += h.vy * dt;
        h.x += (h.vx + Math.sin(elapsed * 4 + h.wobblePhase) * 14) * dt;

        ctx.globalAlpha = Math.max(0, 1 - Math.pow(h.life / h.maxLife, 1.6));
        drawMiniHeart(h.x, h.y, h.scale, h.color);
        aliveHearts.push(h);
      }

      const aliveSparkles: SparkleParticle[] = [];
      for (const s of sparklesRef.current) {
        s.life += dt;
        if (s.life >= s.maxLife) continue;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        ctx.globalAlpha = Math.max(0, 1 - s.life / s.maxLife);
        ctx.fillStyle = s.color;
        ctx.fillRect(Math.round(s.x), Math.round(s.y), 2, 2);
        aliveSparkles.push(s);
      }

      ctx.globalAlpha = 1;
      heartsRef.current = aliveHearts;
      sparklesRef.current = aliveSparkles;

      if ((aliveHearts.length > 0 || aliveSparkles.length > 0) && isActive) {
        rafRef.current = window.requestAnimationFrame(tick);
      } else {
        rafRef.current = 0;
      }
    };

    if (!rafRef.current) {
      rafRef.current = window.requestAnimationFrame(tick);
    }
  };

  const handleCardFlip = (id: string, cardIndex: number, accentColor: string) => {
    playSfx("flip");
    setFlippedIds((prev) => ({ ...prev, [id]: !prev[id] }));

    const cy = 95 + cardIndex * 78;
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14;
      const speed = 22 + (i % 4) * 12;
      sparklesRef.current.push({
        x: 108 + (Math.random() - 0.5) * 60,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.48,
        color: i % 2 === 0 ? "#fde047" : accentColor,
      });
    }
    ensureFxLoop();
  };

  const handleSpamHearts = () => {
    playSfx("heart");
    setHeartCount((prev) => prev + 1);

    for (let i = 0; i < 8; i++) {
      heartsRef.current.push({
        x: 24 + Math.random() * 168,
        y: 325 + Math.random() * 20,
        vx: (Math.random() - 0.5) * 24,
        vy: -(88 + Math.random() * 68),
        wobblePhase: Math.random() * Math.PI * 2,
        scale: i % 3 === 0 ? 2 : 1,
        life: 0,
        maxLife: 1.35 + Math.random() * 0.45,
        color: HEART_COLORS[i % HEART_COLORS.length],
      });
    }
    ensureFxLoop();
  };

  const handleRestartClick = () => {
    playSfx("click");
    onRestart();
  };

  return (
    <section
      aria-label="Quà bí mật và voucher tình yêu"
      className="relative flex h-full w-full flex-col justify-between px-4 pt-1 pb-2"
    >
      {/* Full-Slide Pixel Heart & Sparkle FX Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pixelated pointer-events-none absolute inset-0 z-20 h-full w-full"
      />

      {/* Header */}
      <div className="relative z-10 space-y-0.5 text-center">
        <h2 className="font-vn-body text-base font-bold text-[#fde047] drop-shadow-[0_2px_0_#0b1026] sm:text-lg">
          Quà Bí Mật Dành Riêng Cho Em 🎁
        </h2>
        <p className="font-vn-body text-[11px] text-[#fef3c7]/80">
          Chạm vào từng lá bài để lật mở 3 đặc quyền tình yêu ✨
        </p>
      </div>

      {/* 3 Flippable 3D Anime Pixel Voucher Cards */}
      <div className="relative z-10 my-auto flex w-full flex-col gap-2.5 py-1.5">
        {config.giftTickets.map((ticket, index) => {
          const isFlipped = Boolean(flippedIds[ticket.id]);
          const iconSprite = VOUCHER_ICONS[ticket.icon] ?? VOUCHER_ICONS.wish;

          return (
            <button
              key={ticket.id}
              type="button"
              onClick={() =>
                handleCardFlip(ticket.id, index, ticket.accentColor)
              }
              aria-label={`${ticket.badge}: ${
                isFlipped ? ticket.title : "Voucher bí mật, chạm để lật mở"
              }`}
              className="perspective-1000 group h-[88px] w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-[#fde047] sm:h-[100px]"
            >
              <div
                className={`preserve-3d relative h-full w-full transition-transform duration-500 ${
                  isFlipped ? "rotate-y-180" : ""
                }`}
              >
                {/* Card Front (Mystery Cover) */}
                <div className="backface-hidden vn-panel absolute inset-0 flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#1e1b4b] shadow-[0_0_0_2px_#fde047]">
                      <PixelSprite
                        grid={SPARKLE_SPRITE.grid}
                        palette={SPARKLE_SPRITE.palette}
                        className="h-6 w-6"
                      />
                    </div>
                    <div>
                      <span className="font-pixel-display block text-xs tracking-wider text-[#fde047]">
                        {ticket.badge}
                      </span>
                      <span className="font-vn-body block text-xs font-bold text-[#fef3c7] sm:text-sm">
                        Thẻ Quà Tình Yêu Bí Mật
                      </span>
                    </div>
                  </div>

                  <span className="font-vn-body shrink-0 bg-[#312e81]/90 px-2.5 py-1 text-[11px] font-bold text-[#fde047] shadow-[0_0_0_1px_rgba(253,224,71,0.5)]">
                    Lật thẻ ▶
                  </span>
                </div>

                {/* Card Back (Revealed Love Voucher) */}
                <div className="backface-hidden rotate-y-180 vn-panel-gold absolute inset-0 flex items-center gap-3 px-3.5 py-2">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#0b1026]/90 p-1"
                    style={{
                      boxShadow: `0 0 0 2px ${ticket.accentColor}`,
                    }}
                  >
                    <PixelSprite
                      grid={iconSprite.grid}
                      palette={iconSprite.palette}
                      className="h-9 w-9"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="font-pixel-display text-[11px] tracking-wider"
                        style={{ color: ticket.accentColor }}
                      >
                        {ticket.badge}
                      </span>
                      <span className="font-vn-body text-[10px] text-[#fef3c7]/65">
                        Hiệu lực mãi mãi
                      </span>
                    </div>
                    <p className="font-vn-body truncate text-xs font-bold text-[#fde047] sm:text-sm">
                      {ticket.title}
                    </p>
                    <p className="font-vn-body line-clamp-2 text-[11px] leading-snug text-[#f8fafc]/90">
                      {ticket.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Finale Action Buttons */}
      <div className="relative z-30 flex items-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={handleSpamHearts}
          className="pixel-btn min-h-[46px] flex-1 px-4 text-sm"
        >
          <span className="font-vn-body font-bold">Thả tim ❤️</span>
          {heartCount > 0 ? (
            <span className="font-pixel-display bg-[#0b1026]/45 px-1.5 py-0.5 text-xs text-[#fde047]">
              +{heartCount}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={handleRestartClick}
          className="pixel-btn-ghost min-h-[46px] shrink-0 px-3.5 text-xs font-bold sm:text-sm"
        >
          <span className="font-vn-body">Xem lại từ đầu ↺</span>
        </button>
      </div>
    </section>
  );
}
