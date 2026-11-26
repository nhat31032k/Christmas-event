# Design Spec: Thiệp Giáng Sinh Anime Pixel Art (Multi-Slide Interactive E-Card)

**Date:** 2026-11-26  
**Workspace:** `c:\Users\nhat3103\Documents\chrismast`  
**Status:** Ready for Review

---

## 1. Overview & Goals

Build a mobile-first, 5-slide interactive Christmas E-Card for a romantic partner in a **32-bit Japanese Anime Visual Novel / Cozy Lo-fi Pixel Art** aesthetic (*Makoto Shinkai / Coffee Talk / A Space for the Unbound*).

### Core Constraints
- **Stack:** Next.js (App Router, TypeScript), Tailwind CSS, Framer Motion.
- **Zero External Image Assets:** All artwork, icons, scenes, particles, and UI decorations are rendered in code via **HTML5 Canvas (`imageSmoothingEnabled = false`)** and **inline SVG Pixel-Grid Sprites (`shape-rendering="crispEdges"`)** with CSS `image-rendering: pixelated`.
- **Vietnamese Typography:** Google Fonts via `next/font/google` — `Pixelify Sans` (display headings, counters, pixel buttons) and `Space Mono` (Vietnamese body wishes, VN dialog, vouchers for crisp diacritics on 375px screens).
- **Synthesized Audio:** Pure Web Audio API lo-fi 8-bit anime music box playing *Silent Night* plus gentle UI/interaction SFX, unlocked cleanly on user interaction, with a persistent top-right pixel speaker toggle.
- **Single-File Personalization:** All editable names, quotes, letter pages, shooting-star wishes, and love vouchers live in `src/config/christmasCardConfig.ts`.

---

## 2. Rendering Architecture (Approach A: Hybrid Layered Canvas + Pixel-Grid SVG Sprites)

To deliver both locked 60fps particle effects on mobile and ultra-crisp, accessible, interactive artwork:

1. **Continuous Atmospheric & Particle Layers (HTML5 Canvas):**
   - Rendered to a low-resolution virtual pixel buffer (e.g., `216×384` logical pixels scaled via CSS `image-rendering: pixelated`, `ctx.imageSmoothingEnabled = false`) so every snowflake, firework spark, shooting star trail, and flying heart snaps to a genuine pixel grid with warm bokeh glow halos.
   - Shared `SnowCanvas` powers both the desktop outer night-sky backdrop and the card interior sky layer (stars, drifting pixel clouds, 2-layer parallax snow with subtle warm/cool bokeh).
   - Slide-local lightweight FX canvases handle burst effects: Slide 1 fireworks, Slide 4 shooting stars, Slide 5 flying pixel hearts.
2. **Hero Subjects & UI Chrome (Pixel-Grid SVG Sprites):**
   - Reusable `PixelSprite` component compiles typed ASCII character grids + 32-bit hex palette maps into `<svg shapeRendering="crispEdges">` `<rect>` elements (combining adjacent horizontal runs of identical colors for lightweight DOM size).
   - Used for the Slide 1 wax-sealed envelope, Slide 2 multi-tier Christmas tree & animated chibi anime couple, Slide 3 warm wooden window, steaming cocoa mug & blinking chibi portrait avatar, Slide 4 winter city skyline silhouettes & crescent moon, Slide 5 voucher emblems, and pixel speaker/arrow icons.
   - Gives instant React state updates (e.g., cycling tree light palettes, blinking eyes, 3D card flips) and native accessible `<button>` hit targets (`>= 44×44px`).

---

## 3. Project Structure & Component Responsibilities

```text
src/
├── app/
│   ├── layout.tsx                  # Loads Pixelify Sans & Space Mono via next/font/google, metadata, viewport lock
│   ├── page.tsx                    # Renders desktop night backdrop + centered CardContainer
│   └── globals.css                 # Palette CSS custom properties, pixel borders, 3D flip utilities, reduced-motion rules
├── config/
│   └── christmasCardConfig.ts      # Single-source personalization config (typed + exported defaults)
├── lib/
│   ├── audioEngine.ts              # Pure Web Audio API synthesizer (Silent Night music box + 7 SFX + safe cleanup)
│   ├── slideNavigation.ts          # Pure navigation helpers (clamp index, swipe intent classifier, non-repeating picker)
│   └── pixelGrid.ts                # Compiles ASCII sprite matrices into merged horizontal pixel rect runs
└── components/
    ├── CardContainer.tsx           # Active slide state, swipe/keyboard/button navigation, layout frame, audio orchestration
    ├── SnowCanvas.tsx              # Reusable low-res pixelated Canvas: twinkling stars, pixel clouds, 2-layer bokeh snow
    ├── SlideProgressBar.tsx        # Top Instagram-Stories-style segmented pixel progress bar (5 segments)
    ├── ChiptuneMusicBox.tsx        # Top-right pixel speaker button (44×44px) synced to audioEngine state
    ├── pixel/
    │   ├── PixelSprite.tsx         # Renders compiled pixel runs as crisp SVG
    │   └── sprites.ts              # Hand-crafted 32-bit anime pixel matrices (envelope, tree, chibi couple, avatar, cocoa, skyline, voucher icons, UI icons)
    └── slides/
        ├── Slide1Cover.tsx         # Cover envelope + title + "Mở thiệp 💌" audio trigger & firework burst
        ├── Slide2Scene.tsx         # Christmas tree (tap to cycle lights) + chibi couple (tap for pixel hearts + quotes)
        ├── Slide3Letter.tsx        # Cozy snowy window + steaming cocoa + VN dialog box with blinking chibi avatar & typewriter
        ├── Slide4Wishes.tsx        # Moonlit winter skyline + tap-sky pixel shooting stars & wish popups
        └── Slide5Gifts.tsx         # 3 flippable 3D anime voucher cards + spam "Thả tim ❤️" canvas + "Xem lại từ đầu ↺"
```

---

## 4. Visual System & Responsive Viewport Mechanics

### Palette Tokens (`globals.css`)
- `--sky-deep`: `#0b1026` (night zenith)
- `--sky-mid`: `#1e1b4b` (indigo twilight)
- `--sky-horizon`: `#312e81` (winter glow horizon)
- `--lamp-gold`: `#fde047` (warm streetlamp / fairy lights / highlights)
- `--cream-ink`: `#fef3c7` (VN borders & warm highlight text)
- `--snow-white`: `#f8fafc` (primary legible text)
- `--rose-warm`: `#f43f5e` (wax seal, scarf, hearts, festive accent)
- `--pine-bright`: `#4ade80` / `--pine-deep`: `#15803d` (Christmas tree foliage)
- `--vn-bg`: `rgba(11, 16, 38, 0.80)` with `backdrop-filter: blur(8px)`

### Visual Novel UI Primitives
- **Stepped Pixel Border:** Crisp 2px pixel outer/inner stepped corners (`box-shadow` pixel staircase + `clip-path` or layered pixel border utility) in `--cream-ink` / `--lamp-gold` without blurry default rounded cards.
- **VN Dialog Box:** Translucent dark navy panel (`--vn-bg`), warm stepped pixel border, crisp name badge pill, and blinking `▼` indicator.
- **Pixel Buttons:** Tactile 3D pixel bevel (`box-shadow` bottom ledge that depresses `translateY(2px)` on `:active`), minimum `44×44px` hit target, clear `:focus-visible` warm-gold pixel outline.

### Mobile-First Layout Frame
- **Mobile (`<= 480px`, verified at `375×667`, `390×844`, `430×932`):** Full-viewport `h-[100dvh] w-full overflow-hidden`, zero vertical scrolling, zero horizontal overflow (`overflow-x: clip` on root). Safe padding for mobile browser bars.
- **Desktop (`> 480px`, verified at `1440×900`):** Full-screen ambient snowy night sky background (`SnowCanvas` outer layer) with the interactive card centered as a `9:16` vertical e-card (`w-full max-w-[430px] h-[min(850px,92dvh)]`) framed by a prominent warm pixel border and subtle outer indigo glow.

### Navigation & Transitions
- **Progress Bar (`SlideProgressBar`):** 5 stepped pixel segments pinned across the top safe area; filled segments glow warm gold (`#fde047`), active segment pulses subtly, and segments are clickable to jump directly to any slide.
- **Swipe Gesture:** Horizontal touch/pointer swipe handled cleanly in `CardContainer`:
  - Triggers slide transition only when `|dx| >= 55px` and `|dx| > |dy| * 1.25`, preventing accidental slide changes when tapping Slide 2 sprites, Slide 3 dialog, Slide 4 sky, or Slide 5 cards.
- **Navigation Buttons:** Pixel `<` and `>` controls pinned cleanly in the bottom footer bar (`44×44px` minimum hit target), disabled/hidden gracefully at slide bounds (`0` and `4`), plus slide indicator (`1 / 5`). Keyboard `ArrowLeft` / `ArrowRight` also supported.
- **Transition Effect:** Framer Motion `AnimatePresence mode="wait"` (or overlapping `popLayout`) directional slide-fade (`x: direction * 36`, `opacity: 0 -> 1`, duration `0.32s`) paired with a brief pixel shutter glint for a crisp retro visual-novel scene cut.

---

## 5. Audio System (`audioEngine.ts` & `ChiptuneMusicBox.tsx`)

- **Music Box Synthesis:**
  - Plays **Silent Night (Stille Nacht)** in 3/4 waltz meter at a cozy ~84 BPM (lo-fi anime music box tempo).
  - Dual-voice polyphonic synthesis: melody voice (`triangle` wave + soft octave `sine` bell overtone) + warm arpeggiated bass harmony (`sine` wave) routed through a `BiquadFilterNode` (`lowpass` at ~2400Hz) and subtle master `GainNode` (`0.22`) so mobile speakers sound gentle and chime-like rather than harsh.
  - Uses Web Audio lookahead scheduling (`setInterval` 80ms queuing notes 150ms ahead against `ctx.currentTime`) so tempo stays rock-solid even during slide transitions.
- **Sound Effects (SFX):**
  - `slide`: soft two-note ascending/descending chime
  - `click`: crisp 8-bit tactile tap
  - `firework`: sparkling rising sweep + soft pixel pops (Slide 1 open)
  - `twinkle`: bright pentatonic arpeggio (Slide 2 tree light change)
  - `heart`: cute pitch-up bloop (Slide 2 chibi & Slide 5 heart spam)
  - `type`: ultra-soft subtle key tick (Slide 3 typewriter, throttled so it stays cozy)
  - `star`: descending/shimmering harp glissando (Slide 4 shooting star)
  - `flip`: warm magical triad chime (Slide 5 voucher 3D flip)
- **Autoplay & Lifecycle Safety:**
  - Lazily constructs `AudioContext` inside the first user gesture (`"Mở thiệp 💌"` button or speaker toggle).
  - Gracefully degrades to silent no-op if `AudioContext` is unavailable or throws.
  - Exposes `start()`, `toggleMute()`, `playSfx(type)`, `isPlaying`, `isMuted`, and `dispose()` (stops scheduler timer, disconnects nodes, closes `AudioContext` on unmount).

---

## 6. Customization Config (`src/config/christmasCardConfig.ts`)

```ts
export interface GiftTicket {
  id: string;
  badge: string;        // e.g., "TICKET 01"
  title: string;        // e.g., "1 Chầu Ăn Ngon Tùy Chọn"
  subtitle: string;     // Short sweet description
  icon: "food" | "hug" | "wish";
  accentColor: string;  // Warm pixel accent for card back
}

export interface ChristmasCardConfig {
  recipientName: string;        // "[Tên người yêu]"
  senderName: string;           // "[Tên của bạn]"
  coverTitle: string;           // "Giáng Sinh An Lành"
  chibiQuotes: string[];        // 3 warm Vietnamese quotes for Slide 2
  letterPages: string[];        // 4 warm, natural Vietnamese paragraphs for Slide 3
  shootingStarWishes: string[]; // 5 sweet wishes/promises for Slide 4
  giftTickets: GiftTicket[];    // 3 love vouchers for Slide 5
}
```

Default copy uses `"[Tên người yêu]"` and `"[Tên của bạn]"` per user confirmation, paired with warm, natural, non-cliché Vietnamese messages ready to use out of the box or customize in seconds.

---

## 7. Detailed Slide Specifications

### Slide 1: Bìa Thiệp (`Slide1Cover`)
- **Scene:** Deep anime night sky with glowing pixel crescent moon, twinkling stars, snow ground silhouette with miniature pixel pine trees along the horizon, and a centered **32-bit pixel Christmas envelope sealed with a red heart wax stamp** floating gently up and down.
- **Copy:** Eyebrow badge (`NOEL 2026` / `coverTitle`), main `Pixelify Sans` title `"Merry Christmas, [Tên người yêu] ✨"`.
- **Interaction:** Primary pixel CTA **"Mở thiệp 💌"** (`min-h-[48px]`): triggers `onOpenCard()` which starts the *Silent Night* music box, fires a 650ms pixel firework burst on Slide 1's local FX canvas around the envelope, plays the `firework` SFX, and transitions smoothly to Slide 2.

### Slide 2: Khung Cảnh Đêm Noel (`Slide2Scene`)
- **Scene:** Cozy snowy Japanese winter park illuminated by a warm glowing pixel streetlamp (`#fde047`). Foreground ground snow holds two distinct interactive pixel hero subjects side by side:
  1. **Multi-tier Christmas Tree** topped with a glowing pixel star, garlands, and animated twinkling ornament lights.
  2. **Chibi Anime Couple** (boy with short black hair, girl with long chestnut-brown hair; both in winter coats, Santa hats, and red scarves; periodic eye-blink sprite frames).
- **Interactions:**
  - Tapping the **Christmas Tree** cycles through 4 ornament color modes (`Warm Gold`, `Classic Red & Green`, `Anime Pastel`, `Winter Rainbow`), updates a small subtle status sparkle, and plays `twinkle` SFX.
  - Tapping the **Chibi Couple** spawns rising **pixel hearts** above their heads, plays `heart` SFX, and pops a Visual Novel speech bubble with a non-repeating quote from `chibiQuotes` (auto-hiding after 3.5s or refreshing immediately on tap).
  - Subtle hint badge at top: *"Chạm vào cây thông hoặc cặp đôi nhé ✨"*.

### Slide 3: Bức Thư Giáng Sinh (`Slide3Letter`)
- **Scene (Top ~44%):** Warm wooden bedroom window looking out onto falling night snow and crescent moon; fairy lights strung across the top frame; a wooden windowsill holding a **pixel hot cocoa mug** with animated rising pixel steam frames and a tiny flickering candle.
- **UI & Interaction (Bottom ~56%):** Classic **Anime Visual Novel dialog panel**:
  - Left/top header strip with a framed **blinking chibi pixel avatar**, sender name tag (`senderName`), and page indicator (`1 / 4`).
  - Vietnamese `Space Mono` letter body revealed via **Typewriter effect** (`28ms` per character, pausing cleanly when `!isActive`).
  - Tapping anywhere on the dialog panel completes the current paragraph if still typing, or advances to the next paragraph when finished (looping cleanly from final page back to page 1 with a warm signature footer `"— Gửi trọn yêu thương, [Tên của bạn]"`).
  - Explicit **"Hiện hết"** pixel mini-button (`min-h-[36px]`, comfortable touch spacing) visible while typing; blinking `▼` prompt visible once the paragraph completes.

### Slide 4: Bầu Trời Điều Ước (`Slide4Wishes`)
- **Scene:** Wide panoramic winter night sky (~72% height) with a large glowing pixel moon, faint constellation sparkles, and a detailed **Japanese winter city skyline** along the bottom edge featuring warm glowing pixel apartment windows that subtly flicker.
- **Interaction:**
  - Top floating pill prompt: *"Chạm lên bầu trời để thả sao băng & nhận lời chúc ✨"* plus wish counter (`0 / 5`).
  - Tapping anywhere in the sky area computes the tap coordinate on Slide 4's local pixel FX Canvas, launches a glowing **pixel shooting star** arcing diagonally across the sky with a pixelated stardust tail, plays `star` SFX, and animates a Visual Novel wish banner in the lower zone showing the next message from `shootingStarWishes` (cycles seamlessly after all 5 are discovered so users can keep making wishes).

### Slide 5: Quà Bí Mật & Kết Thiệp (`Slide5Gifts`)
- **Scene & Cards:** Header *"Quà Bí Mật Dành Riêng Cho Em 🎁"* followed by **3 Anime Pixel Love Voucher Cards** arranged in a compact, non-scrolling vertical stack (or 1+2 / 3-row responsive stack guaranteed to fit `375×667` cleanly without clipping).
  - **Front (Unflipped):** Deep starry indigo pixel card with gold corner ornaments, secret ribbon/question crest, ticket number (`TICKET 01..03`), and hint *"Chạm để mở"*.
  - **Back (Flipped):** Warm festive card face displaying its dedicated pixel icon (`food`, `hug`, `wish`), voucher title, and sweet subtitle from `giftTickets`.
- **Interactions:**
  - Tapping any card performs a smooth **3D Y-axis flip** (`rotateY(180deg)` with `transform-style: preserve-3d`), bursts pixel sparkles around the card, and plays `flip` SFX.
  - Bottom action bar:
    - **"Thả tim ❤️"** button: supports rapid repeated taps, spawning multi-size rising pixel hearts across Slide 5's transparent full-card FX Canvas with a live heart counter badge and `heart` SFX.
    - **"Xem lại từ đầu ↺"** button: plays `click` SFX and resets smoothly back to Slide 1 (`activeSlide = 0`).

---

## 8. Performance, Accessibility & Error Handling

- **Inactive Slide Suspension:** Every slide receives `isActive: boolean`. Local `requestAnimationFrame` loops (Slides 1, 4, 5), typewriter timers (Slide 3), and sprite blink/twinkle timers (Slides 2, 3) immediately pause and cancel handles when `isActive === false` or on unmount.
- **Reduced Motion:** Respects `prefers-reduced-motion: reduce` by lowering snow velocity, disabling envelope bobbing/bouncy springs, and revealing typewriter text faster.
- **Touch & Layout Safety:** Prevents accidental zoom/scroll bounce inside the card; all interactive buttons meet `>= 44×44px` tap targets (with compact secondary buttons properly padded); high contrast (`>= 7:1`) on `#f8fafc` text over `rgba(11,16,38,0.82)` panels.
- **Error Resilience:** Web Audio API is fully guarded with `try/catch` and browser vendor prefix fallback (`AudioContext || webkitAudioContext`); Canvas contexts check for null before drawing.

---

## 9. Verification & Testing Plan

1. **Automated Unit Tests (Vitest):**
   - `christmasCardConfig.test.ts`: Validates all required config fields exist, non-empty arrays (`chibiQuotes`, `letterPages`, `shootingStarWishes`, `giftTickets` length 3).
   - `slideNavigation.test.ts`: Tests slide clamping (`0..4`), swipe intent detection (horizontal vs vertical/tap noise), and non-repeating random quote selection.
   - `pixelGrid.test.ts`: Tests ASCII matrix parsing and horizontal run-length merging accuracy.
   - `audioEngine.test.ts`: Tests with mocked `AudioContext` — lazy unlock, mute toggle, SFX firing, graceful failure when `AudioContext` throws, and clean `dispose()` timer/context cleanup.
2. **Typecheck & Production Build:**
   - `npx tsc --noEmit` and `npm run build` must succeed with zero errors.
3. **Real Browser Visual & Interactive Verification:**
   - Start local Next.js dev server and inspect in real Chrome via the browser agent across **Mobile (`375×667`, `390×844`)** and **Desktop (`1440×900`)**:
     - Verify zero vertical scrollbars and zero horizontal overflow on all 5 slides.
     - Verify Vietnamese diacritics render cleanly in `Pixelify Sans` and `Space Mono`.
     - Exercise every slide interaction: Slide 1 `"Mở thiệp 💌"`, Slide 2 tree color cycle + chibi couple hearts/quotes, Slide 3 typewriter + `"Hiện hết"` + page advance, Slide 4 sky tap shooting stars + wish cards, Slide 5 3D card flips + `"Thả tim ❤️"` + `"Xem lại từ đầu ↺"`, speaker mute toggle, and `<` `>` navigation.
     - Verify zero console errors and zero broken asset requests.
