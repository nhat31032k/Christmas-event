"use client";

export interface ChiptuneMusicBoxProps {
  isPlaying: boolean;
  isMuted: boolean;
  onToggle: () => void;
  className?: string;
}

export function ChiptuneMusicBox({
  isPlaying,
  isMuted,
  onToggle,
  className,
}: ChiptuneMusicBoxProps) {
  const isActive = isPlaying && !isMuted;
  const label = isActive ? "Tắt nhạc nền" : "Bật nhạc nền";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className={`pixel-btn-ghost h-11 w-11 shrink-0 p-0${className ? ` ${className}` : ""}`}
    >
      <svg
        viewBox="0 0 16 16"
        shapeRendering="crispEdges"
        aria-hidden="true"
        className={`pixelated h-8 w-8${isActive ? " drop-shadow-[0_0_4px_rgba(253,224,71,0.7)]" : ""}`}
      >
        {/* Pixel speaker cabinet and cone */}
        <g fill="#fef3c7" fillOpacity={isActive ? 1 : 0.45}>
          <rect x="2" y="6" width="3" height="4" />
          <rect x="5" y="5" width="1" height="6" />
          <rect x="6" y="4" width="1" height="8" />
          <rect x="7" y="3" width="2" height="10" />
        </g>

        {isActive ? (
          <>
            {/* Crisp snow-white pixel glint on active speaker */}
            <g fill="#f8fafc">
              <rect x="3" y="6" width="1" height="1" />
              <rect x="7" y="4" width="1" height="2" />
            </g>

            {/* Inner warm gold animated pixel sound wave */}
            <g fill="#fde047" className="animate-pixel-blink">
              <rect x="10" y="5" width="1" height="1" />
              <rect x="11" y="6" width="1" height="4" />
              <rect x="10" y="10" width="1" height="1" />
            </g>

            {/* Outer warm gold animated pixel sound wave */}
            <g
              fill="#fde047"
              className="animate-pixel-blink"
              style={{ animationDelay: "250ms" }}
            >
              <rect x="12" y="3" width="1" height="1" />
              <rect x="13" y="4" width="1" height="2" />
              <rect x="14" y="6" width="1" height="4" />
              <rect x="13" y="10" width="1" height="2" />
              <rect x="12" y="12" width="1" height="1" />
            </g>
          </>
        ) : (
          /* Crisp rose-red pixel X when off or muted */
          <g fill="#f43f5e">
            <rect x="10" y="6" width="1" height="1" />
            <rect x="14" y="6" width="1" height="1" />
            <rect x="11" y="7" width="1" height="1" />
            <rect x="13" y="7" width="1" height="1" />
            <rect x="12" y="8" width="1" height="1" />
            <rect x="11" y="9" width="1" height="1" />
            <rect x="13" y="9" width="1" height="1" />
            <rect x="10" y="10" width="1" height="1" />
            <rect x="14" y="10" width="1" height="1" />
          </g>
        )}
      </svg>
    </button>
  );
}
