# LOU STUDIO

> 🇫🇷 **Français** · 🇬🇧 [Read in English](README.md)

https://github.com/user-attachments/assets/4e8c940f-ffd0-4a99-9aea-5b7e3a1cc59a

Site portfolio de **Lou Boidin** — maquilleuse et styliste basée à Paris.
Direction artistique brutalist éditoriale, scroll cinématique, 3D sur-mesure, bilingue.

**Instagram** · [@lou.boidin](https://www.instagram.com/lou.boidin/) — **Live** · [portfolio-lou-six.vercel.app](https://portfolio-lou-six.vercel.app/fr) _(déployé sur Vercel — `/fr` par défaut, `/en` pour l'anglais)_

[![CI](https://github.com/Tintgire/Portfolio-Lou/actions/workflows/ci.yml/badge.svg)](https://github.com/Tintgire/Portfolio-Lou/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16.2-000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.184-000?logo=threedotjs&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0080?logo=framer&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-deployed-000?logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-All_Rights_Reserved-red)

---

## ⚡ Stack technique

### Core

- **[Next.js 16.2](https://nextjs.org)** — App Router, React Server Components, streaming, Image Optimization
- **[React 19](https://react.dev)** — concurrent features, Suspense
- **[TypeScript 5](https://www.typescriptlang.org)** — mode `strict`, aucun `any` autorisé
- **[Tailwind CSS v4](https://tailwindcss.com)** — système de tokens via `@theme`, sans fichier de config, JIT
- **[pnpm 10](https://pnpm.io)** — gestionnaire de paquets

### Contenu & i18n

- **[next-intl 4.11](https://next-intl-docs.vercel.app)** — routage FR (par défaut) / EN sous le segment `[locale]`
- **[next-mdx-remote](https://github.com/hashicorp/next-mdx-remote)** — contenu MDX pour les pages projets et About
- **[gray-matter](https://github.com/jonschlinkert/gray-matter)** — parsing YAML frontmatter

### Animation & motion

- **[Framer Motion 12](https://motion.dev)** (`motion/react`) — `useScroll`, `useTransform`, `AnimatePresence`, char-stagger reveals, crossfade scroll-driven du manifesto
- **[Lenis 1.3](https://lenis.darkroom.engineering)** — scroll desktop ultra-fluide, branché dans l'arbre React
- **[GSAP 3.15](https://gsap.com) + ScrollTrigger** — bridgé avec Lenis via un provider custom pour les animations scroll-driven
- Hook custom **`requestAnimationFrame`-polled** dans le Hero — remplacement desktop-fiable de `useScroll` quand Lenis ratait des fenêtres de keyframes étroites

### 3D / WebGL

- **[Three.js 0.184](https://threejs.org)** — moteur 3D de base
- **[@react-three/fiber 9.6](https://r3f.docs.pmnd.rs)** — renderer React pour Three
- **[@react-three/drei 10.7](https://drei.pmnd.rs)** — `useGLTF`, `useTexture`, `OrbitControls`, `ContactShadows`, presets HDRI `Environment`
- **`DecalGeometry`** (exemples Three.js) — projette des textures canvas custom sur la surface réelle d'une mesh glTF d'iPhone

### Outillage & qualité

- **[ESLint 9](https://eslint.org)** + `eslint-config-next` — lint
- **[Prettier 3.8](https://prettier.io)** + `prettier-plugin-tailwindcss` — tri automatique des classes Tailwind
- **[Husky 9](https://typicode.github.io/husky/)** + **[lint-staged 17](https://github.com/lint-staged/lint-staged)** — hooks de pre-commit (format + lint)
- **[Vitest 4](https://vitest.dev)** — tests unitaires (loaders MDX, helpers)
- **[Playwright 1.59](https://playwright.dev)** — tests end-to-end (routage i18n, navigation entre projets)

---

## 🌐 Hébergement & infrastructure

| Service                                                        | Rôle                                                                                                                                 |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **[Vercel](https://vercel.com)**                               | Déploiement prod, CDN edge, preview deploys par PR, optimisation auto des images (AVIF / WebP), middleware Edge pour le routage i18n |
| **[GitHub](https://github.com/Tintgire/Portfolio-Lou)**        | Versioning, CI à chaque push (typecheck + lint + tests + build)                                                                      |
| **[Google Fonts](https://fonts.google.com)** (via `next/font`) | Polices self-hostées, optimisées, sans FOIT et sans requête externe au runtime                                                       |
| **[Sketchfab](https://sketchfab.com)**                         | Source du modèle 3D iPhone 14 Pro                                                                                                    |

---

## 🎨 Effets visuels & interactions

### Hero

- **Frame-sequence canvas player** — frames WebP pré-décodées swappées dans un `<canvas>` selon la position de scroll. Remplace le scrub d'une `<video>` HTML5 (qui saccade sur la plupart des navigateurs) par un scrub frame-précis.
- **Section sticky-pinned cinématique** (300vh de haut) — `position: sticky h-screen` interne qui garde le visuel fixe pendant que le scroll fait avancer la timeline
- **Intro LOU brutaliste** — typographie outline-only (`-webkit-text-stroke`), reveal char-stagger caractère par caractère, fade-out à 12% du scroll
- **Crossfade manifesto** — `MAKEUP` reste 30% du scroll, puis crossfade dans `STYLISM` qui reste visible jusqu'à la fin
- **Indice de scroll** avec rebond vertical doux infini, fade-out au premier scroll
- **Audio d'ambiance** — autoplay au premier geste utilisateur (compatible policy navigateur), toggle via chip en bas à gauche

### Galerie

- **Slideshow éditorial sticky-pinned** — 20 photos × 30vh = section de 600vh, une seule slide active calculée selon le scroll progress
- **Remount via key** au lieu d'une queue `AnimatePresence`, donc un scroll rapide ne saute jamais de frame
- **Fond flou ambient persistant** avec binding du `src` sur la photo active
- **Lightbox** avec navigation clavier (ESC / flèches), scroll body bloqué

### Pages projets — _Carmin_, _Seconde Peau_, _Hors Champ_

- **Layout alterné** (image à droite / gauche / droite) avec un énorme numéro ghost derrière la typographie
- **`NumberCounter`** qui interpole vers l'index du projet quand il entre en vue
- **Label vertical** qui défile sur le bord de la page (CSS `writing-mode: vertical-rl`)
- **Film grain** via SVG `feTurbulence` inline (aucune requête réseau, aucun poids d'asset)
- **Couverture vidéo autoplay en boucle** avec poster image en fallback
- **Navigation clavier** entre projets (← / →)

### Contact

- **iPhone 3D interactif** — vrai modèle Sketchfab glTF/GLB (CC-BY 4.0)
- **Projection de texture custom** — le screenshot Instagram de Lou est composé dans un canvas avec masque rounded-rectangle, puis projeté sur la mesh réelle de l'écran de l'iPhone via `DecalGeometry`. La texture _est_ la surface ; aucun parallax, aucun effet "sticker" quand on tourne le téléphone
- **`OrbitControls`** drag-to-rotate, angle polaire contraint pour un tilt naturel
- **Environnement HDRI studio** pour des reflets réalistes sur le corps en titane
- **Écran iPhone cliquable** — clic ouvre le profil IG dans un nouvel onglet : la 3D devient interactive, pas décorative

### Navigation

- **`mix-blend-difference`** sur le texte du nav — inversion par pixel contre le bg de la page pour rester lisible sur n'importe quelle photo
- **TextScramble** au survol — les caractères cyclent à travers des glyphes aléatoires avant de se fixer sur l'original (hook custom, durée configurable)
- **Gradient fade-out en haut** sur les pages About + Works (où les couvertures claires sinkaient les liens cream du nav)
- **Switcher de langue** avec dim sur la locale active et brighten au hover

### Loading & premier paint

- **`LoadingScreen`** avec splash tap-to-enter — bloque l'audio et le scroll jusqu'au geste utilisateur
- `history.scrollRestoration = 'manual'` + Lenis `scrollTo(0, { immediate: true })` pour qu'un reload mid-page revienne toujours en haut
- **Preload ressources critiques** — le GLB de 16 Mo de l'iPhone est fetch via `<link rel="preload" as="fetch" type="model/gltf-binary">` pour qu'il soit en cache quand la scène 3D monte

---

## 🧠 Choix techniques / compétences mises en œuvre

- **Diagnostic pipeline 3D** — parser GLB manuel (`scripts/inspect-gltf.mjs`) pour calculer la vraie bbox world après composition des matrices de nœuds, utilisé pour calibrer la taille de l'overlay iPhone
- **Compositing texture canvas** — image IG clippée à un masque alpha rounded-rectangle, miroir horizontal pour annuler la rotation Math.PI Y du projector
- **Maîtrise de `DecalGeometry`** — découvert (en lisant le source) que les vertices de sortie sont en world space, donc le décal doit s'attacher à la scène top-level (pas à la mesh cible) pour éviter de double-appliquer `matrixWorld`
- **Hook scroll custom** quand `useScroll` + Lenis sous-trackait sur des fenêtres de keyframes étroites — un polling `requestAnimationFrame` garantit une lecture à chaque frame
- **Scaling 3D deux axes** pour responsive canvas — `Math.min(scaleByHeight, scaleByWidth)` pour que l'iPhone ne déborde jamais d'un canvas étroit
- **Typographie fluide** — `clamp(min, vw, max)` au lieu de breakpoints crantés, aucun overflow sur aucune taille d'écran
- **Split Server / Client components** — metadata SEO et chargement de contenu en SSR, client components uniquement pour les motions interactives
- **TDD sur les loaders de contenu** — fixtures Vitest qui couvrent le pipeline MDX ; Playwright qui couvre le routage i18n + navigation
- **Performance-conscious partout** — polling RAF vs scroll listeners, composant persistant vs queue `AnimatePresence`, cap DPR sur la 3D, lazy-load des chunks lourds via `next/dynamic` avec `ssr: false`

---

## 🎭 Direction artistique

- **Brutalisme × éditorial** — typographie brute, fort contraste, dominance photographique, zéro chrome UI
- **Inspirations** — portfolios éditoriaux Awwwards Site of the Day (Locomotive, Resn), grilles de layout Vogue Hommes Paris, ratios typographiques magazine Numéro

### Palette

| Token    | Valeur    | Usage                                |
| -------- | --------- | ------------------------------------ |
| `cream`  | `#f4ead5` | Texte principal + accent fond        |
| `jet`    | `#000000` | Fond dominant                        |
| `signal` | `#ff3b00` | Accent : hover, dots, dividers       |
| `acid`   | `#d6f700` | Accent secondaire (rarement utilisé) |

### Typographie

| Famille                                                                | Classe         | Rôle                                               |
| ---------------------------------------------------------------------- | -------------- | -------------------------------------------------- |
| **[Anton](https://fonts.google.com/specimen/Anton)**                   | `.text-brutal` | Display — condensée, uppercase, tracking `-0.04em` |
| **[JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)** | `.text-meta`   | UI / metadata / captions — tracking `0.16em`       |

### Langage d'animation

- Easing cinéma `[0.76, 0, 0.24, 1]` partout — entrée nette, sortie lente
- Push-in Ken Burns lent (6s linéaire) sur les slides Galerie
- Char-stagger sur les titres (mask 110% Y → 0%)
- Durées 0.6-1.4s pour les moments hero, ~0.4s pour les micro-interactions

---

## 📦 Ressources externes

| Ressource                                                                                                                                                  | Usage                        | Licence                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------- |
| [Modèle iPhone 14 Pro](https://sketchfab.com/3d-models/iphone-14-pro-5cb0778041a34f09b409a38c687bb1d4) par [mister dude](https://sketchfab.com/misterdude) | Modèle 3D page Contact       | CC-BY 4.0 — crédité dans la page |
| [Anton](https://fonts.google.com/specimen/Anton)                                                                                                           | Typographie display          | SIL Open Font License            |
| [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)                                                                                         | Typographie monospace        | SIL Open Font License            |
| Preset HDRI `studio`                                                                                                                                       | Éclairage de la scène iPhone | Bundle dans `@react-three/drei`  |

---

## 🚀 Développement local

```bash
pnpm install         # installer les deps
pnpm dev             # http://localhost:3000
pnpm typecheck       # tsc --noEmit
pnpm test            # vitest run
pnpm test:e2e        # playwright
pnpm build           # build production
pnpm start           # servir le build prod en local
```

La racine `/` redirige vers `/fr` via le middleware `next-intl` (locale détectée depuis `Accept-Language`). Forcer EN avec `/en`.

---

## 📂 Arborescence du projet

```
app/
  [locale]/
    layout.tsx              # Layout par locale : providers, nav, footer, audio
    page.tsx                # Home : Hero → Marquee → AlternatingProject ×3 → ProjectGrid → Galerie → Marquee
    about/page.tsx          # Portrait plein écran + intro MDX première personne
    contact/page.tsx        # Email + IG + iPhone 3D avec écran IG
    works/[slug]/page.tsx   # Page détail projet (Cover + Intro + Media + Credits + NextProject)

components/
  contact/      # IPhoneGLB (projection DecalGeometry), IPhoneGLBLazy (import dynamique)
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
  about.ts      # Loader MDX pour About
  works.ts      # Loader MDX pour projets (+ getAllWorks, getWorkBySlug)
  cn.ts         # Merger de className (clsx + tailwind-merge)

messages/
  fr.json / en.json   # Chaînes i18n (labels nav, copy galerie, etc.)

public/
  models/iphone_14_pro.glb       # Modèle Sketchfab 16 Mo
  works/{slug}/cover.{jpg,mp4}   # Couvertures + boucles vidéo par projet
  contact/lou-instagram.jpeg     # Texture pour le décal écran iPhone
  gallery/01-20.jpg              # Galerie éditoriale
  audio/cyberpunk.mp3            # Piste d'ambiance
  videos/frames/                 # Frames Hero pré-décodées (séquence WebP)

scripts/
  inspect-gltf.mjs               # Parser GLB manuel (debug)
  make-placeholders.mjs          # Générateur de placeholders rouges 1×1

tests/
  e2e/home.spec.ts               # Tests Playwright de navigation
  fixtures/works/                # Fixtures MDX isolées pour les tests unitaires
```

---

## 🪪 Crédits

**Design & développement** · Hugo Boidin — [boidinhugo14@gmail.com](mailto:boidinhugo14@gmail.com)
**Artiste mise en avant** · Lou Boidin — [@lou.boidin](https://www.instagram.com/lou.boidin/) · [lou.boidin@gmail.com](mailto:lou.boidin@gmail.com)
**Modèle 3D iPhone 14 Pro** · [mister dude](https://sketchfab.com/misterdude) sur Sketchfab, CC-BY 4.0

> Disponible pour freelance / collaboration — n'hésitez pas à me contacter sur la stack, les animations, ou pour commander un portfolio éditorial similaire.

---

_Fait à Paris, 2026._
