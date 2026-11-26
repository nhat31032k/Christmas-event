import { describe, expect, it } from "vitest";
import { compilePixelGrid } from "../pixelGrid";

describe("compilePixelGrid", () => {
  it("returns an empty grid for empty rows", () => {
    expect(compilePixelGrid([], { R: "#ef4444" })).toEqual({
      width: 0,
      height: 0,
      rects: [],
    });
  });

  it("merges consecutive horizontal runs of identical characters", () => {
    const rows = ["RRRGG", "G.RRR", "B"];
    const palette = {
      R: "#ef4444",
      G: "#22c55e",
      B: "#38bdf8",
    };

    const result = compilePixelGrid(rows, palette);

    expect(result).toEqual({
      width: 5,
      height: 3,
      rects: [
        { x: 0, y: 0, width: 3, height: 1, fill: "#ef4444" },
        { x: 3, y: 0, width: 2, height: 1, fill: "#22c55e" },
        { x: 0, y: 1, width: 1, height: 1, fill: "#22c55e" },
        { x: 2, y: 1, width: 3, height: 1, fill: "#ef4444" },
        { x: 0, y: 2, width: 1, height: 1, fill: "#38bdf8" },
      ],
    });
  });

  it("splits runs of the same character separated by transparent pixels", () => {
    const result = compilePixelGrid(["AA.AA AA"], { A: "#fde047" });

    expect(result).toEqual({
      width: 8,
      height: 1,
      rects: [
        { x: 0, y: 0, width: 2, height: 1, fill: "#fde047" },
        { x: 3, y: 0, width: 2, height: 1, fill: "#fde047" },
        { x: 6, y: 0, width: 2, height: 1, fill: "#fde047" },
      ],
    });
  });

  it("treats '.', ' ', unknown characters, and empty palette values as transparent", () => {
    const rows = [". ?E#A "];
    const palette = {
      ".": "#ffffff",
      " ": "#000000",
      E: "",
      A: "#fb7185",
    };

    const result = compilePixelGrid(rows, palette);

    expect(result).toEqual({
      width: 7,
      height: 1,
      rects: [{ x: 5, y: 0, width: 1, height: 1, fill: "#fb7185" }],
    });
  });

  it("uses maximum row width across uneven rows and preserves dimensions for all-transparent grids", () => {
    const uneven = compilePixelGrid(["R", "....GG", ""], {
      R: "#ef4444",
      G: "#22c55e",
    });

    expect(uneven).toEqual({
      width: 6,
      height: 3,
      rects: [
        { x: 0, y: 0, width: 1, height: 1, fill: "#ef4444" },
        { x: 4, y: 1, width: 2, height: 1, fill: "#22c55e" },
      ],
    });

    const transparentOnly = compilePixelGrid(["...", "     "], { R: "#ef4444" });
    expect(transparentOnly).toEqual({
      width: 5,
      height: 2,
      rects: [],
    });
  });
});
