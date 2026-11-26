"use client";

export interface SlideProgressBarProps {
  totalSlides: number;
  activeSlide: number;
  onSelectSlide: (index: number) => void;
}

export function SlideProgressBar({
  totalSlides,
  activeSlide,
  onSelectSlide,
}: SlideProgressBarProps) {
  return (
    <nav
      aria-label="Tiến trình các trang thiệp"
      className="flex flex-1 items-center gap-1.5"
    >
      {Array.from({ length: totalSlides }, (_, idx) => {
        const isCompleted = idx < activeSlide;
        const isCurrent = idx === activeSlide;

        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectSlide(idx)}
            aria-label={`Chuyển tới trang ${idx + 1}`}
            aria-current={isCurrent ? "step" : undefined}
            className="group flex h-8 flex-1 cursor-pointer items-center focus-visible:outline-2 focus-visible:outline-[#fde047]"
          >
            <span
              className={`relative block h-2 w-full transition-colors duration-200 ${
                isCurrent
                  ? "bg-[#fde047] shadow-[0_0_8px_rgba(253,224,71,0.75)]"
                  : isCompleted
                    ? "bg-[#fde047]/80"
                    : "bg-[#fef3c7]/25 group-hover:bg-[#fef3c7]/45"
              }`}
              style={{
                boxShadow: isCurrent
                  ? "0 -1px 0 0 #fef9c3, 0 1px 0 0 #f59e0b, 0 0 8px rgba(253,224,71,0.7)"
                  : "0 -1px 0 0 rgba(15,23,42,0.7), 0 1px 0 0 rgba(15,23,42,0.7)",
              }}
            />
          </button>
        );
      })}
    </nav>
  );
}
