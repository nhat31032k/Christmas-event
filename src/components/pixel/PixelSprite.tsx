"use client";

import { useMemo } from "react";
import { compilePixelGrid } from "@/lib/pixelGrid";

export interface PixelSpriteProps {
  grid: readonly string[];
  palette: Readonly<Record<string, string>>;
  className?: string;
  title?: string;
  ariaHidden?: boolean;
}

export function PixelSprite({
  grid,
  palette,
  className,
  title,
  ariaHidden = true,
}: PixelSpriteProps) {
  const compiled = useMemo(
    () => compilePixelGrid(grid, palette),
    [grid, palette],
  );

  if (compiled.width === 0 || compiled.height === 0) {
    return null;
  }

  return (
    <svg
      viewBox={`0 0 ${compiled.width} ${compiled.height}`}
      shapeRendering="crispEdges"
      aria-hidden={title ? undefined : ariaHidden}
      role={title ? "img" : undefined}
      className={`pixelated select-none${className ? ` ${className}` : ""}`}
    >
      {title ? <title>{title}</title> : null}
      {compiled.rects.map((rect, idx) => (
        <rect
          key={`${rect.x}-${rect.y}-${idx}`}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          fill={rect.fill}
        />
      ))}
    </svg>
  );
}
