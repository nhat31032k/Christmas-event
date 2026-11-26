"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  christmasCardConfig,
  type ChristmasCardConfig,
} from "@/config/christmasCardConfig";
import { MusicBoxEngine, type SfxType } from "@/lib/audioEngine";
import { clampSlideIndex, detectSwipeDirection } from "@/lib/slideNavigation";
import { SnowCanvas } from "@/components/SnowCanvas";
import { SlideProgressBar } from "@/components/SlideProgressBar";
import { ChiptuneMusicBox } from "@/components/ChiptuneMusicBox";
import { PixelSprite } from "@/components/pixel/PixelSprite";
import {
  CHEVRON_LEFT_SPRITE,
  CHEVRON_RIGHT_SPRITE,
} from "@/components/pixel/sprites";
import { Slide1Cover } from "@/components/slides/Slide1Cover";
import { Slide2Scene } from "@/components/slides/Slide2Scene";
import { Slide3Letter } from "@/components/slides/Slide3Letter";
import { Slide4Wishes } from "@/components/slides/Slide4Wishes";
import { Slide5Gifts } from "@/components/slides/Slide5Gifts";

const TOTAL_SLIDES = 5;

export interface CardContainerProps {
  config?: ChristmasCardConfig;
}

export function CardContainer({
  config = christmasCardConfig,
}: CardContainerProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<MusicBoxEngine | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const engine = new MusicBoxEngine();
    audioRef.current = engine;

    return () => {
      engine.dispose();
      audioRef.current = null;
    };
  }, []);

  const playSfx = useCallback((type: SfxType) => {
    audioRef.current?.playSfx(type);
  }, []);

  const goToSlide = useCallback(
    (targetIndex: number, playSlideSfx = true) => {
      const clamped = clampSlideIndex(targetIndex, TOTAL_SLIDES);
      setActiveSlide((prev) => {
        if (clamped === prev) return prev;
        setDirection(clamped > prev ? 1 : -1);
        if (playSlideSfx) {
          audioRef.current?.playSfx("slide");
        }
        return clamped;
      });
    },
    [],
  );

  const handleToggleAudio = useCallback(() => {
    const engine = audioRef.current;
    if (!engine) return;

    if (!engine.isPlaying()) {
      engine.start();
      setIsMusicPlaying(engine.isPlaying());
      setIsMuted(engine.isMuted());
      engine.playSfx("click");
      return;
    }

    const nextMuted = engine.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      engine.playSfx("click");
    }
  }, []);

  const handleOpenCard = useCallback(() => {
    const engine = audioRef.current;
    if (engine && !engine.isPlaying()) {
      engine.start();
      setIsMusicPlaying(engine.isPlaying());
      setIsMuted(engine.isMuted());
    }
    goToSlide(1, true);
  }, [goToSlide]);

  const handleRestart = useCallback(() => {
    setDirection(-1);
    setActiveSlide(0);
  }, []);

  // Keyboard Left/Right navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        goToSlide(activeSlide + 1);
      } else if (e.key === "ArrowLeft") {
        goToSlide(activeSlide - 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeSlide, goToSlide]);

  const renderActiveSlide = () => {
    switch (activeSlide) {
      case 0:
        return (
          <Slide1Cover
            isActive={activeSlide === 0}
            config={config}
            playSfx={playSfx}
            onOpenCard={handleOpenCard}
          />
        );
      case 1:
        return (
          <Slide2Scene
            isActive={activeSlide === 1}
            config={config}
            playSfx={playSfx}
          />
        );
      case 2:
        return (
          <Slide3Letter
            isActive={activeSlide === 2}
            config={config}
            playSfx={playSfx}
          />
        );
      case 3:
        return (
          <Slide4Wishes
            isActive={activeSlide === 3}
            config={config}
            playSfx={playSfx}
          />
        );
      case 4:
      default:
        return (
          <Slide5Gifts
            isActive={activeSlide === 4}
            config={config}
            playSfx={playSfx}
            onRestart={handleRestart}
          />
        );
    }
  };

  return (
    <div
      onPointerDown={(e) => {
        swipeStartRef.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        const start = swipeStartRef.current;
        swipeStartRef.current = null;
        if (!start) return;
        const step = detectSwipeDirection(
          e.clientX - start.x,
          e.clientY - start.y,
          55,
        );
        if (step !== 0) {
          goToSlide(activeSlide + step);
        }
      }}
      onPointerCancel={() => {
        swipeStartRef.current = null;
      }}
      style={{ touchAction: "manipulation" }}
      className="anime-sky-gradient sm:pixel-frame relative flex h-[100dvh] w-full flex-col overflow-hidden sm:h-[min(850px,92dvh)] sm:max-w-[430px]"
    >
      {/* Shared Card Interior Atmospheric Snow & Bokeh Layer */}
      <SnowCanvas
        isActive={true}
        variant="card"
        showClouds={activeSlide !== 2}
        showStars={true}
        className="absolute z-0"
      />

      {/* Top HUD: Segmented Progress Bar + Pixel Speaker Toggle */}
      <header className="relative z-30 flex shrink-0 items-center gap-3 px-3.5 pt-2.5 pb-1">
        <SlideProgressBar
          totalSlides={TOTAL_SLIDES}
          activeSlide={activeSlide}
          onSelectSlide={(idx) => goToSlide(idx)}
        />
        <ChiptuneMusicBox
          isPlaying={isMusicPlaying}
          isMuted={isMuted}
          onToggle={handleToggleAudio}
        />
      </header>

      {/* Active Slide Stage with Retro Directional Slide-Fade */}
      <div className="relative z-10 min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={activeSlide}
            custom={direction}
            initial={{ opacity: 0, x: direction * 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -32 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="h-full w-full"
          >
            {renderActiveSlide()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom HUD: Pixel < and > Navigation Controls + Slide Indicator */}
      <footer className="relative z-30 flex shrink-0 items-center justify-between px-3.5 pt-1 pb-3">
        <button
          type="button"
          onClick={() => goToSlide(activeSlide - 1)}
          disabled={activeSlide === 0}
          aria-label="Trang trước"
          title="Trang trước"
          className="pixel-btn-ghost h-11 w-11 p-0"
        >
          <PixelSprite
            grid={CHEVRON_LEFT_SPRITE.grid}
            palette={CHEVRON_LEFT_SPRITE.palette}
            className="h-4 w-3.5"
          />
        </button>

        <div className="flex flex-col items-center">
          <span className="font-pixel-display text-xs tracking-widest text-[#fde047]">
            0{activeSlide + 1} / 0{TOTAL_SLIDES}
          </span>
          <span className="font-vn-body text-[10px] text-[#fef3c7]/60">
            Vuốt ngang hoặc bấm &lt; &gt;
          </span>
        </div>

        <button
          type="button"
          onClick={() => goToSlide(activeSlide + 1)}
          disabled={activeSlide === TOTAL_SLIDES - 1}
          aria-label="Trang tiếp theo"
          title="Trang tiếp theo"
          className="pixel-btn-ghost h-11 w-11 p-0"
        >
          <PixelSprite
            grid={CHEVRON_RIGHT_SPRITE.grid}
            palette={CHEVRON_RIGHT_SPRITE.palette}
            className="h-4 w-3.5"
          />
        </button>
      </footer>
    </div>
  );
}
