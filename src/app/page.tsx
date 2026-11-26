import { christmasCardConfig } from "@/config/christmasCardConfig";

export default function HomePage() {
  return (
    <main className="anime-sky-gradient flex h-[100dvh] w-full items-center justify-center">
      <p className="font-pixel-display text-xl text-[#fde047]">
        {christmasCardConfig.coverTitle}
      </p>
    </main>
  );
}
