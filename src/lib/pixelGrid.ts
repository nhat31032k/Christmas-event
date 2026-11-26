export interface PixelRect {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}

export interface CompiledPixelGrid {
  width: number;
  height: number;
  rects: PixelRect[];
}

export function compilePixelGrid(
  rows: readonly string[],
  palette: Readonly<Record<string, string>>,
): CompiledPixelGrid {
  if (rows.length === 0) {
    return { width: 0, height: 0, rects: [] };
  }

  let width = 0;
  const rects: PixelRect[] = [];

  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    if (row.length > width) {
      width = row.length;
    }

    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (
        ch === "." ||
        ch === " " ||
        !Object.prototype.hasOwnProperty.call(palette, ch)
      ) {
        x += 1;
        continue;
      }

      const fill = palette[ch];
      if (!fill) {
        x += 1;
        continue;
      }

      let end = x + 1;
      while (end < row.length && row[end] === ch) {
        end += 1;
      }

      rects.push({
        x,
        y,
        width: end - x,
        height: 1,
        fill,
      });

      x = end;
    }
  }

  return {
    width,
    height: rows.length,
    rects,
  };
}
