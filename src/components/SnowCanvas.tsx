"use client";

import { useEffect, useRef } from "react";

export interface SnowCanvasProps {
  isActive?: boolean;
  variant?: "card" | "backdrop";
  showClouds?: boolean;
  showStars?: boolean;
  className?: string;
}

interface StarParticle {
  x: number;
  y: number;
  size: 1 | 2;
  phase: number;
  speed: number;
  warm: boolean;
}

interface SnowParticle {
  x: number;
  y: number;
  vy: number;
  vx: number;
  driftPhase: number;
  layer: 0 | 1; // 0 = far crisp pixel, 1 = foreground bokeh pixel
  warmGlow: boolean;
}

interface CloudSprite {
  x: number;
  y: number;
  width: number;
  speed: number;
  alpha: number;
}

export function SnowCanvas({
  isActive = true,
  variant = "card",
  showClouds = true,
  showStars = true,
  className,
}: SnowCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const width = variant === "card" ? 216 : 320;
    const height = variant === "card" ? 384 : 200;
    canvas.width = width;
    canvas.height = height;
    ctx.imageSmoothingEnabled = false;

    const reducedMotionQuery =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    const motionFactor = reducedMotionQuery?.matches ? 0.25 : 1;

    const starCount = variant === "card" ? 34 : 46;
    const stars: StarParticle[] = Array.from({ length: starCount }, (_, i) => ({
      x: Math.floor(((i * 53 + 17) % 997) / 997 * width),
      y: Math.floor(((i * 97 + 31) % 991) / 991 * (height * 0.68)),
      size: i % 5 === 0 ? 2 : 1,
      phase: (i * 0.9) % (Math.PI * 2),
      speed: 1.1 + (i % 4) * 0.45,
      warm: i % 3 === 0,
    }));

    const clouds: CloudSprite[] = showClouds
      ? [
          { x: 18, y: Math.floor(height * 0.16), width: 52, speed: 2.2, alpha: 0.16 },
          { x: 126, y: Math.floor(height * 0.27), width: 64, speed: 1.5, alpha: 0.13 },
          { x: 64, y: Math.floor(height * 0.41), width: 44, speed: 1.9, alpha: 0.11 },
        ]
      : [];

    const snowCount = variant === "card" ? 52 : 64;
    const flakes: SnowParticle[] = Array.from({ length: snowCount }, (_, i) => {
      const layer: 0 | 1 = i % 3 === 0 ? 1 : 0;
      return {
        x: ((i * 71 + 13) % 1000) / 1000 * width,
        y: ((i * 131 + 29) % 1000) / 1000 * height,
        vy: (layer === 1 ? 18 + (i % 5) * 3.2 : 9 + (i % 4) * 2.4) * motionFactor,
        vx: ((i % 3) - 1) * 3.2 * motionFactor,
        driftPhase: (i * 0.7) % (Math.PI * 2),
        layer,
        warmGlow: i % 6 === 0,
      };
    });

    let rafId = 0;
    let lastTime = performance.now();

    const drawPixelCloud = (cx: number, cy: number, w: number, alpha: number) => {
      const px = Math.round(cx);
      const py = Math.round(cy);
      ctx.fillStyle = `rgba(165, 180, 252, ${alpha})`;
      ctx.fillRect(px + 8, py, w - 16, 3);
      ctx.fillRect(px + 3, py + 3, w - 6, 4);
      ctx.fillRect(px, py + 7, w, 3);
      ctx.fillStyle = `rgba(254, 243, 199, ${alpha * 0.45})`;
      ctx.fillRect(px + 10, py, Math.max(8, w - 26), 1);
    };

    const render = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      const elapsed = now / 1000;

      ctx.clearRect(0, 0, width, height);

      if (showStars) {
        for (const star of stars) {
          const twinkle =
            0.35 + 0.65 * (0.5 + 0.5 * Math.sin(elapsed * star.speed + star.phase));
          ctx.fillStyle = star.warm
            ? `rgba(253, 224, 71, ${twinkle.toFixed(2)})`
            : `rgba(248, 250, 252, ${twinkle.toFixed(2)})`;

          if (star.size === 2 && twinkle > 0.72) {
            ctx.fillRect(star.x, star.y, 1, 1);
            ctx.fillRect(star.x - 1, star.y, 3, 1);
            ctx.fillRect(star.x, star.y - 1, 1, 3);
          } else {
            ctx.fillRect(star.x, star.y, 1, 1);
          }
        }
      }

      if (showClouds) {
        for (const cloud of clouds) {
          cloud.x += cloud.speed * motionFactor * dt;
          if (cloud.x > width + 12) {
            cloud.x = -cloud.width - 10;
          }
          drawPixelCloud(cloud.x, cloud.y, cloud.width, cloud.alpha);
        }
      }

      for (const flake of flakes) {
        flake.y += flake.vy * dt;
        flake.x +=
          (flake.vx + Math.sin(elapsed * 1.4 + flake.driftPhase) * 4.5 * motionFactor) *
          dt;

        if (flake.y > height + 4) {
          flake.y = -4;
          flake.x = (flake.x + width * 0.37) % width;
        }
        if (flake.x < -4) flake.x += width + 8;
        if (flake.x > width + 4) flake.x -= width + 8;

        const fx = Math.round(flake.x);
        const fy = Math.round(flake.y);

        if (flake.layer === 0) {
          ctx.fillStyle = "rgba(226, 232, 240, 0.68)";
          ctx.fillRect(fx, fy, 1, 1);
        } else {
          // Soft bokeh pixel halo + bright core
          ctx.fillStyle = flake.warmGlow
            ? "rgba(253, 224, 71, 0.16)"
            : "rgba(186, 230, 253, 0.18)";
          ctx.fillRect(fx - 1, fy - 1, 4, 4);
          ctx.fillStyle = "rgba(248, 250, 252, 0.92)";
          ctx.fillRect(fx, fy, 2, 2);
        }
      }

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [isActive, showClouds, showStars, variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pixelated pointer-events-none inset-0 h-full w-full${className ? ` ${className}` : ""}`}
    />
  );
}
