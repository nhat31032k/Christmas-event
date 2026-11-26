"use client";

import { useEffect, useState } from "react";
import { CardContainer } from "@/components/CardContainer";
import { SnowCanvas } from "@/components/SnowCanvas";

export default function HomePage() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <main className="anime-sky-gradient relative flex h-[100dvh] w-full items-center justify-center overflow-hidden sm:p-4">
      {/* Ambient Full-Screen Snowy Backdrop on Desktop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden opacity-70 sm:block"
      >
        <SnowCanvas
          isActive={isDesktop}
          variant="backdrop"
          showClouds={true}
          showStars={true}
        />
      </div>

      {/* Centered 9:16 Interactive Anime Pixel E-Card */}
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <CardContainer />
      </div>
    </main>
  );
}
