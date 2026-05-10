# Loustudio.fr — Portfolio Lou (design spec)

**Date :** 2026-05-10
**Auteur :** Hugo (pour Lou Boidin)
**Statut :** validé en brainstorm, prêt pour plan d'implémentation

## 1. Contexte

Lou est maquilleuse et styliste mode (vêtements/looks dans les shootings), auto-entrepreneuse. Elle a besoin d'un portfolio en ligne pour **montrer son travail** (photos + vidéos) à des prospects pros (agences, magazines, photographes). Le site est un **showcase artistique pur** — pas de tunnel de réservation, pas de tarifs. Domaine : `loustudio.fr`.

Le frère de Lou (Hugo) gère la tech et l'ajout de contenu via le repo. Lou n'édite pas le site elle-même.

## 2. Décisions clés (résumé)

| Décision | Choix |
|---|---|
| But | Showcase artistique pur (photos + vidéos) |
| Direction esthétique | Brutalist Editorial (Margiela, Balenciaga, Off-White) |
| Layout home | Full-bleed reveal — 1 projet = 1 plein écran |
| Page projet | Mini-tunnel scrollable dédié `/works/[slug]` |
| Objet 3D signature | Lipstick brut (béton/métal + accent rouge), drag-to-rotate, twist au scroll |
| Sections | Home / Works / About / Contact |
| Volume au lancement | 10 projets |
| Vidéos | Horizontales, self-hosted MP4 |
| Multilingue | FR (default) + EN |
| Stack | Next.js 15 App Router + R3F + drei + GSAP + Tailwind v4 + shadcn/ui (sélectif) + next-intl |
| Édition contenu | MDX dans le repo |
| Form contact | Resend |
| Hosting | Vercel |
| Analytics | Vercel Analytics + Speed Insights |

Palette brutaliste : `#f4ead5` (cream), `#000` (jet), `#ff3b00` (signature red), `#d6f700` (accent acid green).

## 3. Architecture & stack

### Repo

Nouveau projet à `C:\Users\Hugo\Desktop\Portfolio-Lou`, git init dédié, package manager **pnpm**.

### Arborescence

```
loustudio/
├── app/
│   ├── [locale]/                 # next-intl: fr | en
│   │   ├── layout.tsx            # font, metadata, GSAP context provider
│   │   ├── page.tsx              # Home full-bleed reveal
│   │   ├── works/[slug]/page.tsx # Mini-tunnel projet
│   │   ├── about/page.tsx
│   │   └── contact/page.tsx
│   ├── api/contact/route.ts      # POST email via Resend
│   └── globals.css               # Tailwind v4 + brutalist tokens
├── components/
│   ├── three/                    # LipstickCanvas, Lipstick, Stage, useDragRotate
│   ├── motion/                   # ScrollReveal, FullBleedSlide, useGsap
│   ├── ui/                       # Button, Modal (shadcn sélectif)
│   └── layout/                   # Nav, LangSwitcher, CursorBrutalist, Footer
├── content/
│   ├── works/                    # 10 projets MDX (slug.fr.mdx + slug.en.mdx)
│   └── about.{fr,en}.mdx
├── public/
│   ├── videos/works/<slug>/      # MP4 horizontaux par projet
│   ├── images/works/<slug>/      # photos optimisées (next/image gère AVIF/WebP)
│   ├── textures/                 # normal map béton CC0 (Poly Haven) pour le lipstick procédural
│   └── lipstick-fallback.png     # screenshot du canvas en idle (a11y / no-WebGL)
├── messages/                     # next-intl: fr.json, en.json (UI strings)
├── lib/
│   ├── works.ts                  # MDX loader, getAllWorks(locale), getWorkBySlug(slug, locale)
│   └── i18n.ts                   # config next-intl
├── tests/
│   ├── unit/works.test.ts        # vitest
│   └── e2e/home.spec.ts          # playwright (1 smoke test)
└── package.json
```

### Dépendances clés

`next@15`, `react@19`, `@react-three/fiber`, `@react-three/drei`, `three`, `gsap`, `@gsap/react`, `@use-gesture/react`, `tailwindcss@4`, `next-intl`, `next-mdx-remote`, `lucide-react`, `clsx`, `tailwind-merge`, `resend` (côté API).

### Polices

100% gratuit (OFL), via `next/font/google` :
- **Anton** — display brutaliste pour titres XXL
- **JetBrains Mono** — monospace pour les méta, labels, indicateurs

Pas de police payante au MVP. Si Lou veut upgrader vers Druk Wide ou équivalent plus tard, le swap se fait en 1 ligne dans `app/[locale]/layout.tsx`.

### Routing i18n

- `/` redirige vers `/fr`
- Switch langue dans la nav, conserve le path actuel (`/fr/works/bold-lipstick` ↔ `/en/works/bold-lipstick`)
- Slugs identiques entre langues, contenu MDX différent (`bold-lipstick.fr.mdx` + `bold-lipstick.en.mdx`)
- `<html lang>` dynamique, `hreflang` dans `<head>` pour le SEO

## 4. Page Home : full-bleed reveal + lipstick

### Structure

```
[Hero plein écran]
   - Lipstick 3D centré, drag-to-rotate, idle animation
   - "LOU" en typo XXL en filigrane (opacity 0.05)
   - "MAKEUP & STYLISM — PARIS" en mono haut-gauche
   - "2025 — VOL.01" en mono bas-droite
   - Indicateur "scroll ↓" en bas
[Slide projet 01]  100vh, image/vidéo plein cadre + overlay typo
[Slide projet 02..10]
[Footer minimal]   About / Contact / Insta / langue
```

### Comportement scroll (GSAP ScrollTrigger)

- Chaque slide projet = `100vh`, snap au scroll (`scroll-snap-type` CSS + ScrollTrigger pour les anims fines)
- Le **lipstick reste pinné** au-delà du hero, **se tord (twist) et change de couleur** selon le projet courant. Il rétrécit dans le coin haut-droit après le hero.
- Reveal de chaque slide : crop vidéo qui s'agrandit du centre + métadonnées qui glissent (image clip-path, masques)
- Click sur un slide → navigation vers `/works/[slug]` avec **view-transitions-api** (fallback GSAP wipe rouge)

### Hero 3D

- `<Canvas>` R3F en background absolu, `dpr={[1,2]}`, `<Stage>` de drei pour éclairage cinéma (key + rim + fill)
- Lipstick = modèle `.glb` (~150-250 KB compressé) avec PBR brut
- `<OrbitControls>` désactivé → drag custom via `useGesture` avec inertie (lerp velocity ~0.15)
- Idle animation : sin curve (rotation Y de ±0.05 rad sur ~6s)
- Ordre par défaut des projets : **par date desc** (champ `date` dans frontmatter MDX), avec champ `order` optionnel pour forcer manuellement

## 5. Page projet : mini-tunnel scrollable

### Route

`/[locale]/works/[slug]` — 10 slugs × 2 langues = 20 pages SSG via `generateStaticParams`.

### Structure d'un mini-tunnel

```
[Section 0 — Cover]
   100vh, image hero du projet + titre XXL + métadonnées (année, mannequin, photographe)
[Section 1 — Intro texte]
   Un paragraphe court, typo serif XXL, fond uni
[Section 2..N — Médias]
   Mix de blocs photo + vidéo : full-bleed 100vh OU grille 2 cols asymétrique
[Section finale — Crédits + Next project]
   Liste plate des contributeurs, CTA "Project 02 / 10 →"
```

### Frontmatter MDX

```yaml
slug: bold-lipstick
title: Bold Lipstick Series
date: 2025-09-12
order: 1                   # optionnel, override de l'ordre par date
location: Paris
role: Makeup & Styling
team:
  photographer: Jane Doe
  model: John Roe
cover: /images/works/bold-lipstick/cover.jpg
media:
  - { type: image, src: /images/works/bold-lipstick/01.jpg, layout: full }
  - { type: video, src: /videos/works/bold-lipstick/01.mp4, poster: /images/.../01-poster.jpg, layout: full }
  - { type: image, src: /images/.../02.jpg, layout: grid-left }
  - { type: image, src: /images/.../03.jpg, layout: grid-right }
nextSlug: latex-couture
```

### Comportement

- GSAP ScrollTrigger pour les **reveals par bloc** (image clip-path + texte split chars)
- Vidéos : `<video autoPlay muted loop playsInline>`, **lazy-load** via IntersectionObserver, **pause hors viewport**
- Touche flèche droite/gauche → projet suivant/précédent
- Le **lipstick 3D N'EST PAS** sur cette page (focus 100% médias)
- Transition page-to-page : view-transitions-api avec wipe rouge plein écran (signature)

## 6. About + Contact

### About `/[locale]/about`

- 100vh hero : photo de Lou (portrait NB plein cadre) + nom XXL en surimpression
- Bio courte (~120 mots) en serif XXL, fond uni cream/noir, texte dans `content/about.{fr,en}.mdx`
- Liste mono colonnes : "MAKEUP / STYLISM / EDITORIAL / RUNWAY"
- Footer : Insta + email + CV PDF téléchargeable (optionnel, MVP sans)

### Contact `/[locale]/contact`

- Email cliquable géant (mailto) en typo XXL : `hello@loustudio.fr`
- Insta `@loustudio` (icône + handle)
- **Form Resend** :
  - Champs : nom, email, message
  - Validation client (zod) + serveur (zod dans `app/api/contact/route.ts`)
  - Rate limit basique (5 messages / IP / heure, in-memory map suffit pour le volume attendu — Redis hors scope)
  - Honeypot anti-bot (champ caché)
  - Envoi via Resend, destinataire = `CONTACT_EMAIL_TO` env var
  - Feedback visuel : success/error inline brutaliste, pas de toast

## 7. i18n + contenu MDX

### next-intl

- 2 locales : `fr` (default), `en`
- **UI strings** (nav, footer, métas, labels form) → `messages/fr.json` + `messages/en.json`
- **Contenu** → MDX par langue
- `<html lang>` dynamique, `hreflang` dans `<head>`

### Loader contenu

`lib/works.ts` :
```ts
export function getAllWorks(locale: 'fr' | 'en'): Work[]
export function getWorkBySlug(slug: string, locale: 'fr' | 'en'): Work | null
```

Lit les MDX via `next-mdx-remote/rsc` (server components, zéro JS client pour le markdown). Frontmatter parsé via `gray-matter`. Tri par `order` ASC puis `date` DESC.

### SEO par défaut

- `metadata` Next.js (title, description, og:image = cover du projet, twitter card)
- `sitemap.xml` auto avec les 26 pages prerendered ((home + about + contact + 10 projets) × 2 langues)
- `robots.txt` standard (allow tout en prod)

## 8. Le lipstick 3D : modèle, interactions, perfs

### Modèle 3D — 100% procédural R3F (pas de Blender, pas de `.glb`)

Construction par primitives Three.js / drei dans `components/three/Lipstick.tsx` :

- **Tube** (corps) : `<Cylinder>` ~3 cm rayon × 6 cm hauteur, ou `<Lathe>` pour un profil légèrement galbé
- **Bague centrale** : `<Torus>` aplati ou `<Cylinder>` fin coloré rouge
- **Stick** (rouge à lèvres saillant) : `<Lathe>` pour un profil biseauté réaliste, ou `<Cylinder>` + `<Cone>` empilés et bevelés via segments custom
- **Matériaux** :
  - Tube : `<meshStandardMaterial>` avec `roughness` 0.85 + **normal map béton CC0** (Poly Haven `concrete_floor_painted_001` ou équivalent, ~200 KB) téléchargée localement dans `public/textures/`
  - Stick : `<meshStandardMaterial>` color `#ff3b00`, metalness 0.1, roughness 0.3 (glossy waxy)
  - Bague : `<meshStandardMaterial>` métal chrome (metalness 1, roughness 0.15)
- Géométrie totale ~2-3k tris, **zéro fichier asset hors la normal map** (~200 KB)
- Pas de baking AO, on s'appuie sur l'éclairage temps réel (light cheap)

### Interactions

- **Drag-to-rotate** : `@use-gesture/react`, mouse + touch, rotation Y/X avec inertie (lerp velocity ~0.15)
- **Idle animation** : sin curve très douce (rotation Y de ±0.05 rad sur ~6s)
- **Twist au scroll** : ScrollTrigger calcule progress (0→1 sur la home), shader custom déforme le stick (scale Y + bend) et shift la couleur du rouge (`#ff3b00` → `#d6f700` → `#ffffff`) selon le projet courant
- **Hover (desktop)** : lerp légère de la rotation vers le curseur (effet "le lipstick te regarde")

### Architecture R3F

```
components/three/
├── LipstickCanvas.tsx     # <Canvas> wrapper, dpr/antialias/shadows
├── Lipstick.tsx           # mesh principal, drag, idle, twist
├── LipstickMaterial.tsx   # ShaderMaterial custom (twist + color shift)
├── Stage.tsx              # éclairage (key + rim + fill)
└── useDragRotate.ts       # hook réutilisable
```

`<Canvas>` monté **une seule fois au layout root**, invisible sur les pages projets via `opacity: 0; position: fixed; pointer-events: none` (pas de remount entre routes).

### Performance

- **Code split** : `LipstickCanvas` chargé via `next/dynamic` avec `{ ssr: false }` → ~700 KB de Three.js hors du bundle initial
- **Loader** : skeleton brutaliste (carrés noirs animés en CSS, pas de spinner)
- **Mobile** : shadows désactivés, `dpr={[1, 1.5]}` au lieu de 2
- **Fallback total** : si `prefers-reduced-motion: reduce` OU WebGL absent → **screenshot statique** du canvas en idle (PNG capturé une fois, ~50 KB) servi via `<img>` à la place du canvas

### Accessibilité

- Canvas `aria-hidden="true"`, hors tabulation
- Toutes les infos importantes en HTML sémantique, accessibles sans le 3D

### Budget perf cible (Lighthouse)

- LCP < 2.5s, CLS < 0.1, INP < 200ms
- LH Perf desktop ≥ 90, mobile ≥ 75

## 9. Tests

- **TypeScript strict** : pas de `any`, `noUncheckedIndexedAccess` activé
- **Type-check CI** : `tsc --noEmit` sur chaque PR
- **ESLint + Prettier** : config Next.js, `husky` + `lint-staged` au pre-commit
- **Unit (Vitest)** : utilitaires purs uniquement (`lib/works.ts` loader MDX, helpers i18n) — **pas de tests UI**
- **E2E (Playwright)** : 1 smoke test, ouvre la home FR + EN, capture screenshot, valide que le canvas mount sans erreur
- **Lighthouse CI** : action GitHub sur la preview Vercel à chaque PR, fail si Perf desktop < 85

## 10. Déploiement & ops

- **Provider** : Vercel (free tier)
- **Build** : `pnpm build` → SSG (26 pages prerendered : (home + about + contact + 10 projets) × 2 langues)
- **Domaine** : `loustudio.fr` configuré dans Vercel (DNS chez le registrar — OVH ou Gandi probablement)
- **Preview deploys** : chaque PR → URL `loustudio-git-<branch>.vercel.app`
- **Branch model** : `main` = prod, `develop` = staging permanent, `feat/*` pour les features
- **Slash commands** : adapter `/merge-feature` et `/promote-to-prod` du repo FreshStock pour ce repo
- **Env vars** :
  - `RESEND_API_KEY`
  - `CONTACT_EMAIL_TO` (où arrivent les messages du form)

### Analytics & monitoring

- **Vercel Analytics** activé
- **Vercel Speed Insights** activé
- Erreurs front : hors scope MVP (Sentry plus tard si besoin)

### Workflow d'ajout d'un projet

```
1. cd content/works
2. créer <slug>.fr.mdx + <slug>.en.mdx avec le frontmatter
3. déposer images dans public/images/works/<slug>/
4. déposer vidéos dans public/videos/works/<slug>/
5. git commit + push sur develop → preview Vercel
6. /promote-to-prod → loustudio.fr live
```

## 11. Hors scope MVP (Phase 2 si besoin)

- CMS Sanity/Tina (Lou édite elle-même)
- Mux pour vidéos (si > 50 projets ou besoin de HLS adaptatif)
- Toggle dark/light utilisateur (le site est dark par défaut, mode unique pour l'identité)
- Page `/press` (mentions presse, magazines)
- Newsletter
- CV PDF dans le footer About
- Sentry / monitoring d'erreurs front
- Tests UI / visual regression complets

## 12. Risques & dépendances

| Risque | Impact | Mitigation |
|---|---|---|
| Vidéos lourdes dégradent le LCP mobile | Perf | `preload="none"` + poster + lazy-load IntersectionObserver |
| Lipstick procédural moins "premium" qu'un .glb | Esthétique | Soigner les materials (normal map béton CC0) + lighting Stage drei + bevels propres ; possibilité de remplacer plus tard par un .glb sans changer l'API du composant |
| Resend free tier limité | Form contact peut casser | 100 emails/jour gratuit, suffit largement ; alerte si quota atteint |
| Domaine `loustudio.fr` déjà pris | Bloque la marque | Vérifier dispo avant tout dev (OVH/Gandi WHOIS) |
| Photos NB lourdes en pleine bleed | LCP | next/image obligatoire, AVIF/WebP, blur placeholder |

## 13. Critères d'acceptation MVP

- [ ] Home FR + EN s'ouvre, lipstick 3D visible et draggable, scroll fluide entre les 10 slides
- [ ] 10 mini-tunnels projets, chacun avec photos + vidéos qui s'affichent sans erreur
- [ ] Switch FR/EN fonctionnel sur toutes les pages, conservation du path
- [ ] Form contact envoie un email à `CONTACT_EMAIL_TO` via Resend
- [ ] LH Perf desktop ≥ 90, mobile ≥ 75
- [ ] Site déployé sur `loustudio.fr` avec TLS auto
- [ ] Vercel Analytics enregistre les visites
- [ ] `prefers-reduced-motion` désactive proprement les animations lourdes
- [ ] Site lisible et utilisable sans JavaScript (contenu MDX en SSG, pas le 3D évidemment)
