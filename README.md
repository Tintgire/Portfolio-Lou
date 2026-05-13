# LOU STUDIO

> 🇬🇧 **English** · 🇫🇷 [Lire en français](README.fr.md)

[![CI](https://github.com/Tintgire/Portfolio-Lou/actions/workflows/ci.yml/badge.svg)](https://github.com/Tintgire/Portfolio-Lou/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16.2-000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.184-000?logo=threedotjs&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0080?logo=framer&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-deployed-000?logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-All_Rights_Reserved-red)

Portfolio site for **Lou Boidin** — Paris-based makeup artist and stylist.
Brutalist editorial direction, cinematic scroll, custom 3D, bilingual.

**Instagram** · [@lou.boidin](https://www.instagram.com/lou.boidin/)
**Live** · `loustudio.fr` _(deployed on Vercel)_

---

## ⚡ Stack

### Core

- **[Next.js 16.2](https://nextjs.org)** — App Router, React Server Components, streaming, Image Optimization
- **[React 19](https://react.dev)** — concurrent features, Suspense
- **[TypeScript 5](https://www.typescriptlang.org)** — `strict` mode, no `any` allowed
- **[Tailwind CSS v4](https://tailwindcss.com)** — `@theme` token system, no config file, JIT
- **[pnpm 10](https://pnpm.io)** — workspace package manager

### Content & i18n

- **[next-intl 4.11](https://next-intl-docs.vercel.app)** — FR (default) / EN routing under `[locale]` segment
- **[next-mdx-remote](https://github.com/hashicorp/next-mdx-remote)** — MDX content for project pages + About
- **[gray-matter](https://github.com/jonschlinkert/gray-matter)** — YAML frontmatter parsing

### Animation & motion

- **[Framer Motion 12](https://motion.dev)** (`motion/react`) — `useScroll`, `useTransform`, `AnimatePresence`, char-stagger reveals, scroll-driven manifesto crossfade
- **[Lenis 1.3](https://lenis.darkroom.engineering)** — buttery smooth wheel-scroll, bridged into the React tree
- **[GSAP 3.15](https://gsap.com) + ScrollTrigger** — bridged with Lenis via a custom provider for scroll-driven animations
- Custom **`requestAnimationFrame`-polled scroll hook** in Hero — desktop-reliable replacement for `useScroll` where Lenis could miss narrow keyframe windows

### 3D / WebGL

- **[Three.js 0.184](https://threejs.org)** — base 3D engine
- **[@react-three/fiber 9.6](https://r3f.docs.pmnd.rs)** — React renderer for Three
- **[@react-three/drei 10.7](https://drei.pmnd.rs)** — `useGLTF`, `useTexture`, `OrbitControls`, `ContactShadows`, `Environment` HDRI presets
- **`DecalGeometry`** (Three.js examples) — projects custom canvas textures onto the actual surface of a glTF iPhone mesh

### Tooling & quality

- **[ESLint 9](https://eslint.org)** + `eslint-config-next` — lint
- **[Prettier 3.8](https://prettier.io)** + `prettier-plugin-tailwindcss` — auto-sorted Tailwind classes
- **[Husky 9](https://typicode.github.io/husky/)** + **[lint-staged 17](https://github.com/lint-staged/lint-staged)** — pre-commit format + lint hooks
- **[Vitest 4](https://vitest.dev)** — unit tests (MDX content loaders, helpers)
- **[Playwright 1.59](https://playwright.dev)** — end-to-end tests (locale routing, project navigation)

---

## 🌐 Hosting & infrastructure

| Service                                                        | Role                                                                                                                                      |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **[Vercel](https://vercel.com)**                               | Production deployment, edge CDN, preview deployments per PR, automatic image optimization (AVIF / WebP), Edge middleware for i18n routing |
| **[GitHub](https://github.com/Tintgire/Portfolio-Lou)**        | Source control, CI on push (typecheck + lint + tests + build)                                                                             |
| **[Google Fonts](https://fonts.google.com)** (via `next/font`) | Self-hosted, optimized font delivery (no FOIT, no external request at runtime)                                                            |
| **[Sketchfab](https://sketchfab.com)**                         | Source of the iPhone 14 Pro 3D model                                                                                                      |

---

## 🎨 Visual & interaction features

### Hero

- **Frame-sequence canvas player** — pre-decoded WebP frames swapped through a `<canvas>` based on scroll position. Replaces `<video>` scrubbing (which stutters on most browsers) with frame-precise scroll-scrub.
- **Sticky-pinned cinematic section** (300vh tall) — inner `position: sticky h-screen` keeps the visual layer fixed while scroll drives the timeline
- **Brutalist LOU intro** — outline-only `-webkit-text-stroke` typography, character-by-character stagger reveal, fades out by 12% of scroll
- **Manifesto crossfade** — `MAKEUP` holds 30% of the scroll, then crossfades into `STYLISM` which stays visible to the end
- **Scroll cue** with infinite gentle vertical bounce, fades out on first scroll
- **Ambient audio** — auto-plays on first user gesture (browser policy-compliant), togglable via chip in bottom-left

### Gallery

- **Sticky-pinned editorial slideshow** — 20 photos × 30vh = 600vh section, single active slide computed from scroll progress
- **Keyed component remount** instead of `AnimatePresence` queue, so fast scrolls never skip a frame
- **Persistent ambient blur** background with `src` binding to the active photo
- **Lightbox** with keyboard navigation (ESC / arrow keys), body scroll lock

### Project pages — _Carmin_, _Seconde Peau_, _Hors Champ_

- **Alternating layout** (image right / left / right) with massive ghost project number behind the typography
- **`NumberCounter`** that interpolates to the project index on intersection
- **Vertical scrolling label** along the page edge (CSS `writing-mode: vertical-rl`)
- **Film grain** texture via inline SVG `feTurbulence` (no network round-trip, no asset weight)
- **Looping autoplay video covers** with poster image fallback
- **Keyboard navigation** between projects (← / →)

### Contact

- **Interactive 3D iPhone** — real Sketchfab glTF/GLB model (CC-BY 4.0)
- **Custom texture projection** — Lou's Instagram screenshot composed into a canvas with a rounded-rectangle mask, then projected onto the iPhone's actual screen mesh via `DecalGeometry`. The texture _is_ the surface; no parallax, no "sticker" feel when rotating
- **`OrbitControls`** drag-to-rotate, polar angle constrained for a natural-feeling tilt
- **HDRI studio environment** for realistic reflections on the titanium body
- **Clickable iPhone screen** opens the IG profile in a new tab — the 3D becomes interactive, not decorative

### Navigation

- **`mix-blend-difference`** nav text — inverts against the page background per pixel for legibility on any photo
- **TextScramble** hover effect — characters cycle through random glyphs before settling on the original (custom hook, configurable duration)
- **Top-fade gradient** on About + Works pages (where light covers would sink the cream nav into the background)
- **Language switcher** with active-locale dim / hover-brighten state

### Loading & first paint

- **`LoadingScreen`** with tap-to-enter splash — gates audio + scroll until the user opts in
- `history.scrollRestoration = 'manual'` + Lenis `scrollTo(0, { immediate: true })` so a reload from mid-page always lands at the top
- **Critical resource preload** — the 16 MB iPhone GLB fires via `<link rel="preload" as="fetch" type="model/gltf-binary">` so it's already cached when the 3D scene mounts

---

## 🧠 Engineering decisions / skills demonstrated

- **3D pipeline diagnosis** — manual GLB parser (`scripts/inspect-gltf.mjs`) to compute the true world bbox after composed node matrices, used to calibrate the iPhone overlay sizing
- **Canvas-based texture compositing** — IG image clipped to a rounded-rectangle alpha mask, mirrored horizontally to cancel out the projector's Math.PI Y rotation
- **`DecalGeometry` mastery** — discovered (via source-reading) that output vertices are in world space, so the decal must attach to the top-level scene (not the target mesh) to avoid double-applying `matrixWorld`
- **Custom scroll hook** when `useScroll` + Lenis under-tracked on narrow keyframe windows — `requestAnimationFrame` polling guarantees a read every frame
- **Two-axis 3D scaling** for responsive canvas sizing — `Math.min(scaleByHeight, scaleByWidth)` so the iPhone never overflows a narrow canvas
- **Fluid typography** — `clamp(min, vw, max)` instead of stepped breakpoints, no overflow at any viewport
- **Server / Client component split** — server-rendered SEO metadata + content loading, client components only for interactive motion
- **Test-driven content loaders** — Vitest fixtures cover the MDX pipeline; Playwright covers locale routing + navigation
- **Performance-conscious throughout** — RAF polling vs scroll listeners, persistent component vs `AnimatePresence` queue, DPR cap on 3D, lazy-loaded heavy chunks via `next/dynamic` with `ssr: false`

---

## 🎭 Style direction

- **Brutalism × editorial** — raw typography, sharp contrast, photographic dominance, no UI chrome
- **Inspirations** — Awwwards Site of the Day-tier editorial portfolios (Locomotive, Resn), Vogue Hommes Paris layout grids, Numéro magazine typography ratios

### Palette

| Token    | Value     | Use                                  |
| -------- | --------- | ------------------------------------ |
| `cream`  | `#f4ead5` | Primary text + bg accent             |
| `jet`    | `#000000` | Dominant background                  |
| `signal` | `#ff3b00` | Accent: hover states, dots, dividers |
| `acid`   | `#d6f700` | Secondary accent (rarely used)       |

### Typography

| Family                                                                 | Class          | Role                                               |
| ---------------------------------------------------------------------- | -------------- | -------------------------------------------------- |
| **[Anton](https://fonts.google.com/specimen/Anton)**                   | `.text-brutal` | Display — condensed, uppercase, `-0.04em` tracking |
| **[JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)** | `.text-meta`   | UI / metadata / captions — `0.16em` tracking       |

### Animation language

- Cinematic easing `[0.76, 0, 0.24, 1]` everywhere — sharp in, slow out
- Slow Ken Burns push-in (6s linear) on Gallery slides
- Char-stagger reveals on titles (110% Y mask → 0%)
- Motion durations 0.6-1.4s for hero moments, ~0.4s for micro-interactions

---

## 📦 External resources

| Resource                                                                                                                                                 | Used for                 | License                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | -------------------------------- |
| [iPhone 14 Pro model](https://sketchfab.com/3d-models/iphone-14-pro-5cb0778041a34f09b409a38c687bb1d4) by [mister dude](https://sketchfab.com/misterdude) | 3D model on Contact page | CC-BY 4.0 — credited in-page     |
| [Anton](https://fonts.google.com/specimen/Anton)                                                                                                         | Display typography       | SIL Open Font License            |
| [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)                                                                                       | Monospace typography     | SIL Open Font License            |
| HDRI `studio` preset                                                                                                                                     | iPhone scene lighting    | Bundled with `@react-three/drei` |

---

## 🚀 Local development

```bash
pnpm install         # install deps
pnpm dev             # http://localhost:3000
pnpm typecheck       # tsc --noEmit
pnpm test            # vitest run
pnpm test:e2e        # playwright
pnpm build           # production build
pnpm start           # serve the production build locally
```

Root `/` redirects to `/fr` via `next-intl` middleware (locale picked from `Accept-Language`). Force EN with `/en`.

---

## 📂 Project structure

```
app/
  [locale]/
    layout.tsx              # Locale layout: providers, nav, footer, audio
    page.tsx                # Home: Hero → Marquee → AlternatingProject ×3 → ProjectGrid → Gallery → Marquee
    about/page.tsx          # Portrait fullscreen + first-person MDX intro
    contact/page.tsx        # Email + IG + 3D iPhone with IG screen
    works/[slug]/page.tsx   # Project detail page (Cover + Intro + Media + Credits + NextProject)

components/
  contact/      # IPhoneGLB (DecalGeometry projection), IPhoneGLBLazy (dynamic import)
  home/         # Hero, ScrollFrames, Gallery, AlternatingProject, ProjectGrid, NumberCounter, TextScramble
  layout/       # Nav, LangSwitcher, Footer
  motion/       # LenisProvider, GsapProvider
  ui/           # LoadingScreen, AmbientAudio, Marquee
  work/         # Cover, Intro, Credits, MediaBlock, NextProject, KeyboardNav

content/
  about.fr.mdx / about.en.mdx
  works/
    carmin.{fr,en}.mdx
    seconde-peau.{fr,en}.mdx
    hors-champ.{fr,en}.mdx

lib/
  about.ts      # MDX loader for About copy
  works.ts      # MDX loader for projects (+ getAllWorks, getWorkBySlug)
  cn.ts         # className merger (clsx + tailwind-merge)

messages/
  fr.json / en.json   # i18n strings (nav labels, gallery copy, etc.)

public/
  models/iphone_14_pro.glb       # 16 MB Sketchfab model
  works/{slug}/cover.{jpg,mp4}   # Per-project covers + video loops
  contact/lou-instagram.jpeg     # Texture for iPhone screen decal
  gallery/01-20.jpg              # Editorial gallery
  audio/cyberpunk.mp3            # Ambient track
  videos/frames/                 # Pre-decoded Hero frames (WebP sequence)

scripts/
  inspect-gltf.mjs               # Manual GLB parser (debug)
  make-placeholders.mjs          # Generate red 1×1 cover placeholders

tests/
  e2e/home.spec.ts               # Playwright navigation tests
  fixtures/works/                # Isolated MDX fixtures for unit tests
```

---

## 🪪 Credits

**Site design & development** · Hugo Boidin
**Featured artist** · Lou Boidin — [@lou.boidin](https://www.instagram.com/lou.boidin/)
**iPhone 14 Pro 3D model** · [mister dude](https://sketchfab.com/misterdude) on Sketchfab, CC-BY 4.0

---

_Made in Paris, 2026._
