import type { GiftIconKind } from "@/config/christmasCardConfig";

export interface SpriteDefinition {
  grid: readonly string[];
  palette: Readonly<Record<string, string>>;
}

/**
 * 28x20 Christmas Wax-Sealed Envelope with holly leaves & glowing heart stamp
 */
export const ENVELOPE_SPRITE: SpriteDefinition = {
  palette: {
    O: "#0f172a", // dark indigo pixel outline
    P: "#fef3c7", // warm cream paper
    L: "#fffbeb", // paper top highlight
    S: "#fde68a", // warm paper fold shadow
    D: "#f59e0b", // deep fold crease
    R: "#e11d48", // red wax seal base
    H: "#fb7185", // wax seal highlight
    W: "#ffffff", // specular sparkle
    G: "#16a34a", // holly leaf green
    M: "#4ade80", // holly leaf bright
    Y: "#fde047", // gold trim corner
  },
  grid: [
    "...........OO..OO...........",
    "..........OGMOOGMO..........",
    "..OOOOOOOOOOOOOOOOOOOOOOOO..",
    ".OYYYYLLLLLLLLLLLLLLLLYYYYO.",
    ".OYOLLLLLLLLLLLLLLLLLLLLOYO.",
    ".OLLOOLLLLLLLLLLLLLLLLOOLLO.",
    ".OPPSSOOLLLLLLLLLLLLOOSSPPO.",
    ".OPPPPSSOOLLLLLLLLOOSSPPPPO.",
    ".OPPPPPPSSOOHHRHOOSSPPPPPPO.",
    ".OPPPPPPPPOHWRRRRHOPPPPPPPO.",
    ".OPPPPPPPPORRRRRRRROPPPPPPO.",
    ".OPPPPPPPSORRRRRRRROSPPPPPO.",
    ".OPPPPPSSOOHRRRRRRHOSSPPPPO.",
    ".OPPPSSOOPPOHRRRRHOOPPSSPPO.",
    ".OPSSOOPPPPPOHRRHOOPPPPSPSO.",
    ".OSOOPPPPPPPPOHHOOPPPPPPOSO.",
    ".OYOPPPPPPPPPPOOPPPPPPPPOYO.",
    ".OYYYYSSSSSSSSSSSSSSSSYYYYO.",
    "..OOOOOOOOOOOOOOOOOOOOOOOO..",
    "............................",
  ],
};

/**
 * 16x16 Anime Crescent Moon with soft inner shading
 */
export const CRESCENT_MOON_SPRITE: SpriteDefinition = {
  palette: {
    G: "#fde047", // bright moon gold
    W: "#fef9c3", // pale moon rim
    A: "#f59e0b", // warm amber crater shade
  },
  grid: [
    "......WWWW......",
    "....WWGGGGWW....",
    "...WGGGGGGGGW...",
    "..WGGGGWWWGGGW..",
    ".WGGGGW...WGGW..",
    ".WGGGW.....WGW..",
    "WGGGGW..........",
    "WGGGGW..........",
    "WGGGGA..........",
    "WGGGGW..........",
    ".WGGGGW.....WW..",
    ".WGGGGGW...WGW..",
    "..WGGGGGGWWWGGW.",
    "...WGGGGGGGGGW..",
    "....WWGGGGGGW...",
    "......WWWWWW....",
  ],
};

/**
 * 26x30 Multi-tier Snow-Dusted Christmas Tree
 * Symbols 1, 2, 3, 4 represent twinkling ornament channels swapped by palette theme
 */
export const TREE_GRID: readonly string[] = [
  "............YY............",
  "...........YWWY...........",
  ".........YYWWWWYY.........",
  "...........YWWY...........",
  "............OO............",
  "...........OSSO...........",
  "..........OSSSSO..........",
  ".........OGG1GGGO.........",
  "........OGGGGGGGGO........",
  ".......OSSSSGGSSSSO.......",
  "........OGG2GGGGGO........",
  ".......OGGGGGGG3GGO.......",
  "......OGGGGLLLLGGGGO......",
  ".....OSSSSGGGGGGSSSSO.....",
  "......OGG4GGGGGG1GGO......",
  ".....OGGGGGLLLLGGGGGO.....",
  "....OGGG2GGGGGGGG3GGGO....",
  "...OSSSSSGGGGGGGGSSSSSO...",
  "....OGGGGGGG4GGGGGGGGO....",
  "...OGGG1GGGGLLLLGG2GGGO...",
  "..OGGGGGGGGGGGGGGGGGGGGO..",
  ".OSSSSSSGGG3GGGG4GSSSSSSO.",
  "..OGGGGGGGGGGGGGGGGGGGGO..",
  ".OGG2GGGGLLLLLLLLGG1GGGGO.",
  "OSSSSSSSGGGGGGGGGGSSSSSSSO",
  ".OOOOOOOOOOOOOOOOOOOOOOOO.",
  "..........OTTTTO..........",
  "..........OTDDTO..........",
  ".........OOTDDTOO.........",
  "........SSSSSSSSSS........",
];

export interface TreeTheme {
  id: string;
  label: string;
  frameA: Readonly<Record<string, string>>;
  frameB: Readonly<Record<string, string>>;
}

const TREE_BASE_COLORS = {
  O: "#0b1026",
  G: "#15803d",
  L: "#22c55e",
  S: "#f8fafc",
  T: "#78350f",
  D: "#451a03",
  Y: "#fde047",
  W: "#fef9c3",
};

export const TREE_THEMES: readonly TreeTheme[] = [
  {
    id: "warm-gold",
    label: "Đèn Vàng Ấm",
    frameA: {
      ...TREE_BASE_COLORS,
      "1": "#fde047",
      "2": "#fef9c3",
      "3": "#f59e0b",
      "4": "#fde68a",
    },
    frameB: {
      ...TREE_BASE_COLORS,
      "1": "#f59e0b",
      "2": "#fde047",
      "3": "#fef9c3",
      "4": "#fbbf24",
    },
  },
  {
    id: "classic-noel",
    label: "Đỏ Xanh Noel",
    frameA: {
      ...TREE_BASE_COLORS,
      "1": "#f43f5e",
      "2": "#fde047",
      "3": "#38bdf8",
      "4": "#fb7185",
    },
    frameB: {
      ...TREE_BASE_COLORS,
      "1": "#fde047",
      "2": "#f43f5e",
      "3": "#fb7185",
      "4": "#38bdf8",
    },
  },
  {
    id: "anime-pastel",
    label: "Pastel Anime",
    frameA: {
      ...TREE_BASE_COLORS,
      "1": "#f9a8d4",
      "2": "#a5f3fc",
      "3": "#ddd6fe",
      "4": "#fef08a",
    },
    frameB: {
      ...TREE_BASE_COLORS,
      "1": "#a5f3fc",
      "2": "#f472b6",
      "3": "#fef08a",
      "4": "#c4b5fd",
    },
  },
  {
    id: "winter-rainbow",
    label: "Lấp Lánh Đa Sắc",
    frameA: {
      ...TREE_BASE_COLORS,
      "1": "#fb7185",
      "2": "#4ade80",
      "3": "#60a5fa",
      "4": "#fde047",
    },
    frameB: {
      ...TREE_BASE_COLORS,
      "1": "#60a5fa",
      "2": "#fde047",
      "3": "#fb7185",
      "4": "#a78bfa",
    },
  },
];

/**
 * 32x26 Chibi Anime Couple in Winter Coats, Santa Hats & Red Scarves Holding Hands
 * Left: Boy (short dark hair, navy coat) | Right: Girl (long chestnut hair, cream winter coat)
 */
export const CHIBI_COUPLE_PALETTE: Readonly<Record<string, string>> = {
  O: "#0f172a", // crisp pixel outline
  W: "#f8fafc", // white Santa hat trim & pom-pom
  R: "#e11d48", // Santa hat & cozy red scarf
  P: "#fb7185", // scarf highlight / rosy blush
  K: "#1e293b", // boy dark anime hair
  H: "#7c2d12", // girl warm chestnut hair
  M: "#9a3412", // girl hair highlight
  F: "#fde68a", // warm anime skin tone
  E: "#0b1026", // eyes
  B: "#1e3a8a", // boy navy winter coat
  C: "#3b82f6", // boy coat rim highlight
  V: "#fef3c7", // girl cream wool coat
  S: "#fde047", // coat buttons
  N: "#334155", // winter boots/leggings
};

export const CHIBI_COUPLE_OPEN: readonly string[] = [
  ".....OOOO..............OOOO.....",
  "....ORRRROO..........OORRRRO....",
  "...ORRRRRRROWW....WWORRRRRRRO...",
  "..ORRRRRRRROWWO..OWWORRRRRRRRO..",
  "..OWWWWWWWWWOO....OOWWWWWWWWW0..".replace("0", "O"),
  ".OOKKKKKKKKOO......OOHHHHHHHHOO.",
  ".OKKKFFFFKKKO......OHHMFFFFMHHO.",
  ".OKKFFFFFFKKO......OHHFFFFFFHHO.",
  ".OKFFEFFFEKKO......OHFFEFFFEHHO.",
  ".OKFPFFFFPKKO......OHFPFFFFPHHO.",
  "..OOFFFFFFOO.......OHHFFFFFFHHO.",
  "...OOPRRROO........OHHOPRRROHHO.",
  "..OORRRRRROO......OHHORRRRRROHO.",
  ".OOBBBRRRBBBOO..OOHHVVVRRRVVVHO.",
  ".OBBCBBRBBCCBO..OHVVVVVRVVVVVHO.",
  ".OBBBBBBBBBBBOPPOVVVVVSVVVVVVHO.",
  ".OBBBBBBSBBBBORRROVVVVVVVVVVVO..",
  "..OBBBBBBBBBBO..OVVVVVSVVVVVVO..",
  "..OBBBBBBBBBBO..OVVVVVVVVVVVVO..",
  "...OOOOOOOOOO....OOOOOOOOOOOO...",
  "....ONNOONNO......ONNO..ONNO....",
  "....ONNOONNO......ONNO..ONNO....",
  "...OOONOONOOO....OOONO..ONOOO...",
  "...OOOOOOOOOO....OOOOO..OOOOO...",
  "..WWWWWWWWWWWWWWWWWWWWWWWWWWWW..",
  "....WWWWWWWWWWWWWWWWWWWWWWWW....",
];

export const CHIBI_COUPLE_BLINK: readonly string[] = [
  ".....OOOO..............OOOO.....",
  "....ORRRROO..........OORRRRO....",
  "...ORRRRRRROWW....WWORRRRRRRO...",
  "..ORRRRRRRROWWO..OWWORRRRRRRRO..",
  "..OWWWWWWWWWOO....OOWWWWWWWWWO..",
  ".OOKKKKKKKKOO......OOHHHHHHHHOO.",
  ".OKKKFFFFKKKO......OHHMFFFFMHHO.",
  ".OKKFFFFFFKKO......OHHFFFFFFHHO.",
  ".OKFFOFFFOKKO......OHFFOFFFOHHO.",
  ".OKFPFFFFPKKO......OHFPFFFFPHHO.",
  "..OOFFFFFFOO.......OHHFFFFFFHHO.",
  "...OOPRRROO........OHHOPRRROHHO.",
  "..OORRRRRROO......OHHORRRRRROHO.",
  ".OOBBBRRRBBBOO..OOHHVVVRRRVVVHO.",
  ".OBBCBBRBBCCBO..OHVVVVVRVVVVVHO.",
  ".OBBBBBBBBBBBOPPOVVVVVSVVVVVVHO.",
  ".OBBBBBBSBBBBORRROVVVVVVVVVVVO..",
  "..OBBBBBBBBBBO..OVVVVVSVVVVVVO..",
  "..OBBBBBBBBBBO..OVVVVVVVVVVVVO..",
  "...OOOOOOOOOO....OOOOOOOOOOOO...",
  "....ONNOONNO......ONNO..ONNO....",
  "....ONNOONNO......ONNO..ONNO....",
  "...OOONOONOOO....OOONO..ONOOO...",
  "...OOOOOOOOOO....OOOOO..OOOOO...",
  "..WWWWWWWWWWWWWWWWWWWWWWWWWWWW..",
  "....WWWWWWWWWWWWWWWWWWWWWWWW....",
];

/**
 * 16x16 Visual Novel Chibi Avatar Portrait (Slide 3)
 */
export const CHIBI_AVATAR_PALETTE: Readonly<Record<string, string>> = {
  O: "#0f172a",
  R: "#e11d48",
  P: "#fb7185",
  W: "#f8fafc",
  K: "#1e293b",
  F: "#fde68a",
  E: "#0b1026",
  B: "#1e3a8a",
};

export const CHIBI_AVATAR_OPEN: readonly string[] = [
  "....OOOOOO......",
  "...ORRRRRROO....",
  "..ORRRRRRRROWWO.",
  ".OWWWWWWWWWWOO..",
  ".OKKKKKKKKKKOO..",
  "OKKKFFFFFFKKKO..",
  "OKKFFFFFFFFKKO..",
  "OKFFEFFFFEKKKO..",
  "OKFPFFFFFFPKKO..",
  ".OOFFFFFFFFOO...",
  "..OOPRRRRRPOO...",
  ".OOBRRRRRRRBOO..",
  "OBBBBRRRRRBBBBO.",
  "OBBBBBBRBBBBBBBO",
  "OBBBBBBBBBBBBBBO",
  "OOOOOOOOOOOOOOOO",
];

export const CHIBI_AVATAR_BLINK: readonly string[] = [
  "....OOOOOO......",
  "...ORRRRRROO....",
  "..ORRRRRRRROWWO.",
  ".OWWWWWWWWWWOO..",
  ".OKKKKKKKKKKOO..",
  "OKKKFFFFFFKKKO..",
  "OKKFFFFFFFFKKO..",
  "OKFFOFFFFOKKKO..",
  "OKFPFFFFFFPKKO..",
  ".OOFFFFFFFFOO...",
  "..OOPRRRRRPOO...",
  ".OOBRRRRRRRBOO..",
  "OBBBBRRRRRBBBBO.",
  "OBBBBBBRBBBBBBBO",
  "OBBBBBBBBBBBBBBO",
  "OOOOOOOOOOOOOOOO",
];

/**
 * 18x20 Steaming Hot Cocoa Mug (2 steam animation frames)
 */
export const COCOA_MUG_PALETTE: Readonly<Record<string, string>> = {
  S: "#e2e8f0", // soft pixel steam
  W: "#ffffff", // marshmallow & highlight
  O: "#0f172a", // dark outline
  C: "#78350f", // rich cocoa surface
  R: "#e11d48", // red ceramic mug
  H: "#fb7185", // ceramic highlight
  Y: "#fde047", // gold pixel heart on mug
  A: "#94a3b8", // saucer shade
};

export const COCOA_MUG_FRAME_A: readonly string[] = [
  ".....SS...SS......",
  "....SS...SS.......",
  "......SS...SS.....",
  ".....SS...SS......",
  "..................",
  "..OOOOOOOOOOOO....",
  ".OWWCCCCCCCCWWO...",
  ".OCCCWWWWWCCCCO...",
  ".ORRRRRRRRRRRROOO.",
  ".OHRRRRRRRRRRRROO.",
  ".OHRRRYYRYYRRRROWO",
  ".OHRRYYYYYYYRRROWO",
  ".OHRRRYYYYYRRRROWO",
  ".OHRRRRYYYRRRRROO.",
  ".ORRRRRRYRRRRROOO.",
  "..ORRRRRRRRRRRO...",
  "...OOOOOOOOOOO....",
  ".OOOOOOOOOOOOOOO..",
  "OWWWWWWWWWWWWWWWO.",
  ".OOOOOOOOOOOOOOO..",
];

export const COCOA_MUG_FRAME_B: readonly string[] = [
  "......SS...SS.....",
  ".....SS...SS......",
  "....SS...SS.......",
  "......SS...SS.....",
  "..................",
  "..OOOOOOOOOOOO....",
  ".OWWCCCCCCCCWWO...",
  ".OCCCWWWWWCCCCO...",
  ".ORRRRRRRRRRRROOO.",
  ".OHRRRRRRRRRRRROO.",
  ".OHRRRYYRYYRRRROWO",
  ".OHRRYYYYYYYRRROWO",
  ".OHRRRYYYYYRRRROWO",
  ".OHRRRRYYYRRRRROO.",
  ".ORRRRRRYRRRRROOO.",
  "..ORRRRRRRRRRRO...",
  "...OOOOOOOOOOO....",
  ".OOOOOOOOOOOOOOO..",
  "OWWWWWWWWWWWWWWWO.",
  ".OOOOOOOOOOOOOOO..",
];

/**
 * 10x14 Warm Flickering Pixel Candle
 */
export const CANDLE_PALETTE: Readonly<Record<string, string>> = {
  W: "#ffffff",
  Y: "#fde047",
  A: "#f59e0b",
  O: "#0f172a",
  C: "#fef3c7",
  S: "#fde68a",
  G: "#d97706",
};

export const CANDLE_FRAME_A: readonly string[] = [
  "....YY....",
  "...YWWY...",
  "...YWWY...",
  "....AA....",
  "...OOOO...",
  "...OCCO...",
  "...OCSO...",
  "...OCSO...",
  "...OCSO...",
  "...OCSO...",
  "..OOOOOO..",
  ".OGGGGGGO.",
  "..OOOOOO..",
  "..........",
];

export const CANDLE_FRAME_B: readonly string[] = [
  ".....Y....",
  "...YYWY...",
  "...YWWY...",
  "....AA....",
  "...OOOO...",
  "...OCCO...",
  "...OCSO...",
  "...OCSO...",
  "...OCSO...",
  "...OCSO...",
  "..OOOOOO..",
  ".OGGGGGGO.",
  "..OOOOOO..",
  "..........",
];

/**
 * 11x10 Pixel Heart with Specular Glint
 */
export const HEART_PIXEL_SPRITE: SpriteDefinition = {
  palette: {
    O: "#0f172a",
    R: "#f43f5e",
    D: "#be123c",
    W: "#ffffff",
  },
  grid: [
    ".OOO...OOO.",
    "ORRR O ORRRO".replace(/ /g, ""),
    "ORWWRORRRRO",
    "ORWRRRRRRDO",
    "ORRRRRRRRDO",
    ".ORRRRRRDO.",
    "..ORRRRDO..",
    "...ORRDO...",
    "....ODO....",
    ".....O.....",
  ],
};

/**
 * 9x9 Golden 4-Point Anime Sparkle
 */
export const SPARKLE_SPRITE: SpriteDefinition = {
  palette: {
    Y: "#fde047",
    W: "#ffffff",
  },
  grid: [
    "....Y....",
    "....Y....",
    "..Y.W.Y..",
    "...WWW...",
    "YYWWWWWWY",
    "...WWW...",
    "..Y.W.Y..",
    "....Y....",
    "....Y....",
  ],
};

/**
 * 16x16 Voucher Emblem Sprites for Slide 5 (food, hug, wish)
 */
export const VOUCHER_ICONS: Readonly<Record<GiftIconKind, SpriteDefinition>> = {
  food: {
    palette: {
      O: "#0f172a",
      S: "#fde68a",
      W: "#f8fafc",
      R: "#f43f5e",
      Y: "#fde047",
      G: "#4ade80",
      B: "#d97706",
    },
    grid: [
      "....S...S.......",
      "...S...S...OOOO.",
      "....S...S.OBBBBO",
      ".........OBB....",
      "..OOOOOOOOOOOO..",
      ".OWWWYYYYGGWWWO.",
      ".OSSSSSSSSSSSSO.",
      "OORRRRRRRRRRRROO",
      "ORRRRRYYYYRRRRRO",
      ".ORRRRRRRRRRRRO.",
      "..ORRRRRRRRRRO..",
      "...OOOOOOOOOO...",
      "....OWWWWWWO....",
      "...OOOOOOOOOO...",
      "................",
      "................",
    ],
  },
  hug: {
    palette: {
      O: "#0f172a",
      R: "#f43f5e",
      P: "#fb7185",
      W: "#ffffff",
      Y: "#fde047",
    },
    grid: [
      ".......YY.......",
      "......YWWY......",
      ".OOO...YY...OOO.",
      "OPPPO.OOOO.ORRRO",
      "OPWPPORRRROPRRRO",
      "OPPPPRRRRRRPRRRO",
      ".OPPRRRRRRRRPPO.",
      "..OPRRRRRRRRPO..",
      "...OPRRRRRRPO...",
      "....OPRRRRPO....",
      ".....OPRRPO.....",
      "......OPPO......",
      ".......OO.......",
      "................",
      "................",
      "................",
    ],
  },
  wish: {
    palette: {
      O: "#0f172a",
      Y: "#fde047",
      W: "#ffffff",
      C: "#38bdf8",
      B: "#bae6fd",
    },
    grid: [
      ".........Y......",
      "........YWY.....",
      "......YYWWWY....",
      ".......YWWWWY...",
      "......YYWWWY....",
      ".....CC.YWY.C...",
      "....CCB..Y......",
      "...CCB..........",
      "..CCB...Y.......",
      ".CCB...YWY......",
      "CCB.....Y.......",
      "CB..............",
      "................",
      "................",
      "................",
      "................",
    ],
  },
};

/**
 * 9x11 Pixel Navigation Arrows (< and >)
 */
export const CHEVRON_LEFT_SPRITE: SpriteDefinition = {
  palette: {
    C: "#fef3c7",
    G: "#fde047",
  },
  grid: [
    ".....CC..",
    "....CCG..",
    "...CCG...",
    "..CCG....",
    ".CCG.....",
    "CCG......",
    ".CCG.....",
    "..CCG....",
    "...CCG...",
    "....CCG..",
    ".....CC..",
  ],
};

export const CHEVRON_RIGHT_SPRITE: SpriteDefinition = {
  palette: {
    C: "#fef3c7",
    G: "#fde047",
  },
  grid: [
    "..CC.....",
    "..GCC....",
    "...GCC...",
    "....GCC..",
    ".....GCC.",
    "......GCC",
    ".....GCC.",
    "....GCC..",
    "...GCC...",
    "..GCC....",
    "..CC.....",
  ],
};
