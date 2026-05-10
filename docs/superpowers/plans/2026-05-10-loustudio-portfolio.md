# Loustudio.fr Portfolio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build loustudio.fr, a brutalist-editorial showcase portfolio for Lou Boidin (makeup & stylism), with 10 projects, FR/EN i18n, an interactive procedural 3D lipstick hero, GSAP scroll motion, and Vercel deployment.

**Architecture:** Next.js 15 App Router with `[locale]` segment for next-intl i18n. SSG for all 26 pages. Single mounted React Three Fiber `<Canvas>` at root layout, hidden on non-home routes via opacity. MDX files in `content/works/` are the source of truth for projects. Form contact via Resend API route.

**Tech Stack:** Next.js 15 · React 19 · TypeScript strict · React Three Fiber + drei + three · GSAP + ScrollTrigger + @gsap/react · @use-gesture/react · Tailwind v4 · next-intl · next-mdx-remote · Resend · Vitest · Playwright · pnpm · Vercel.

**Spec reference:** `docs/superpowers/specs/2026-05-10-loustudio-portfolio-design.md`

---

## Phase 0 — Bootstrap & tooling

### Task 1: Initialize Next.js 15 project with pnpm

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `.gitattributes`

- [ ] **Step 1: Verify pnpm is installed**

```bash
pnpm --version
```
Expected: a version number (≥9). If missing: `npm install -g pnpm`.

- [ ] **Step 2: Run create-next-app inside the existing repo**

The repo at `C:\Users\Hugo\Desktop\Portfolio-Lou` already exists with `.git`, `.gitignore` and `docs/`. Use `--use-pnpm` and answer the wizard with: TypeScript yes, ESLint yes, Tailwind yes, `src/` no, App Router yes, Turbopack yes, customize import alias `@/*` yes.

```bash
cd /c/Users/Hugo/Desktop/Portfolio-Lou
pnpm create next-app@latest . --typescript --eslint --tailwind --app --use-pnpm --import-alias "@/*" --turbopack --no-src-dir
```
Expected: scaffold is created next to existing `docs/` and `.gitignore` (overwriting `.gitignore` is OK — we'll re-add our entries in step 3).

- [ ] **Step 3: Restore project-level .gitignore additions**

Re-add the block we had before the scaffold:

```gitignore
# Visual companion brainstorm artifacts
.superpowers/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

Append to the generated `.gitignore` (don't replace what create-next-app wrote).

- [ ] **Step 4: Add .gitattributes for line endings**

Create `.gitattributes`:
```
* text=auto eol=lf
*.png binary
*.jpg binary
*.mp4 binary
```

- [ ] **Step 5: Verify dev server starts**

```bash
pnpm dev
```
Expected: dev server on http://localhost:3000, default Next.js page renders. Stop with Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: bootstrap Next.js 15 + Tailwind + TypeScript with pnpm"
```

---

### Task 2: Install runtime dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install 3D + motion + gestures**

```bash
pnpm add three @react-three/fiber @react-three/drei @use-gesture/react gsap @gsap/react
pnpm add -D @types/three
```

- [ ] **Step 2: Install i18n + MDX + form**

```bash
pnpm add next-intl next-mdx-remote gray-matter resend zod clsx tailwind-merge lucide-react
```

- [ ] **Step 3: Install dev dependencies (test + lint)**

```bash
pnpm add -D vitest @vitest/ui @testing-library/jest-dom playwright @playwright/test husky lint-staged prettier prettier-plugin-tailwindcss
```

- [ ] **Step 4: Run install + verify no peer warnings block install**

```bash
pnpm install
```
Expected: completes without errors. Three.js peer warning for R3F is OK.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add runtime + dev dependencies (R3F, GSAP, next-intl, MDX, Resend, Vitest, Playwright)"
```

---

### Task 3: Configure TypeScript strict + ESLint + Prettier + husky

**Files:**
- Modify: `tsconfig.json`, `eslint.config.mjs`
- Create: `.prettierrc.json`, `.prettierignore`, `.husky/pre-commit`

- [ ] **Step 1: Tighten tsconfig.json**

Open `tsconfig.json` and ensure `compilerOptions` contains:
```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "noFallthroughCasesInSwitch": true
}
```
Keep the rest of the file as scaffolded.

- [ ] **Step 2: Create .prettierrc.json**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- [ ] **Step 3: Create .prettierignore**

```
.next
node_modules
public
pnpm-lock.yaml
*.mdx
```

- [ ] **Step 4: Initialize husky + lint-staged**

```bash
pnpm exec husky init
```

Replace `.husky/pre-commit` content with:
```bash
pnpm exec lint-staged
pnpm exec tsc --noEmit
```

Add to `package.json`:
```json
"lint-staged": {
  "*.{ts,tsx,js,jsx}": ["prettier --write", "eslint --fix"],
  "*.{json,md,css}": ["prettier --write"]
}
```

- [ ] **Step 5: Run typecheck to verify**

```bash
pnpm exec tsc --noEmit
```
Expected: completes with no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: enable TypeScript strict mode, configure Prettier + husky pre-commit"
```

---

### Task 4: Configure Tailwind v4 brutalist tokens + fonts

**Files:**
- Modify: `app/globals.css`, `app/layout.tsx`
- Create: `lib/cn.ts`

- [ ] **Step 1: Replace globals.css with brutalist tokens**

```css
@import "tailwindcss";

@theme {
  --color-cream: #f4ead5;
  --color-jet: #000000;
  --color-signal: #ff3b00;
  --color-acid: #d6f700;
  --color-stone-1: #1a1a1a;
  --color-stone-2: #2a2a2a;

  --font-display: var(--font-anton), 'Arial Black', sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, monospace;
  --font-sans: var(--font-jetbrains-mono), ui-monospace, monospace;

  --tracking-brutal: -0.04em;
  --tracking-mono: 0.16em;
}

@layer base {
  html { background: var(--color-jet); color: var(--color-cream); }
  body { font-family: var(--font-mono); font-size: 14px; line-height: 1.5; }
  ::selection { background: var(--color-signal); color: var(--color-cream); }
}

@layer utilities {
  .text-brutal { font-family: var(--font-display); letter-spacing: var(--tracking-brutal); text-transform: uppercase; line-height: 0.9; }
  .text-meta { font-family: var(--font-mono); font-size: 11px; letter-spacing: var(--tracking-mono); text-transform: uppercase; }
}
```

- [ ] **Step 2: Create lib/cn.ts helper**

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Wire fonts in app/layout.tsx**

Replace the body of `app/layout.tsx` font setup with:
```ts
import { Anton, JetBrains_Mono } from 'next/font/google';

const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' });
```

Apply both variables to the `<html>` className: `${anton.variable} ${jetbrainsMono.variable}`.

- [ ] **Step 4: Verify visually**

```bash
pnpm dev
```
Open http://localhost:3000 — page background black, text cream. Stop server.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx lib/cn.ts
git commit -m "feat: brutalist design tokens + Anton / JetBrains Mono fonts"
```

---

## Phase 1 — i18n routing skeleton

### Task 5: next-intl configuration with FR (default) + EN

**Files:**
- Create: `i18n.ts`, `middleware.ts`, `messages/fr.json`, `messages/en.json`
- Create: `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`
- Delete: `app/page.tsx` (will be replaced by `app/[locale]/page.tsx`)

- [ ] **Step 1: Create messages/fr.json**

```json
{
  "Nav": { "works": "Travaux", "about": "À propos", "contact": "Contact" },
  "Footer": { "rights": "Tous droits réservés", "instagram": "Instagram" },
  "Home": { "tagline": "MAKEUP & STYLISM — PARIS", "scroll": "Faire défiler", "vol": "VOL.01" },
  "Contact": { "name": "Nom", "email": "Email", "message": "Message", "send": "Envoyer", "success": "Message envoyé.", "error": "Une erreur est survenue." },
  "Common": { "next": "Projet suivant", "previous": "Projet précédent", "language": "FR" }
}
```

- [ ] **Step 2: Create messages/en.json**

```json
{
  "Nav": { "works": "Works", "about": "About", "contact": "Contact" },
  "Footer": { "rights": "All rights reserved", "instagram": "Instagram" },
  "Home": { "tagline": "MAKEUP & STYLISM — PARIS", "scroll": "Scroll", "vol": "VOL.01" },
  "Contact": { "name": "Name", "email": "Email", "message": "Message", "send": "Send", "success": "Message sent.", "error": "Something went wrong." },
  "Common": { "next": "Next project", "previous": "Previous project", "language": "EN" }
}
```

- [ ] **Step 3: Create i18n.ts**

```ts
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['fr', 'en'] as const;
export const defaultLocale = 'fr';
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();
  return { messages: (await import(`./messages/${locale}.json`)).default };
});
```

- [ ] **Step 4: Create middleware.ts**

```ts
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

- [ ] **Step 5: Update next.config.ts**

```ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  experimental: { viewTransition: true },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 6: Move app/page.tsx → app/[locale]/page.tsx**

```bash
mkdir -p "app/[locale]"
mv app/page.tsx "app/[locale]/page.tsx"
```

- [ ] **Step 7: Create app/[locale]/layout.tsx**

```tsx
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
```

- [ ] **Step 8: Run dev + verify both locales render**

```bash
pnpm dev
```
Visit http://localhost:3000 → should redirect to `/fr`. Then http://localhost:3000/en → renders too. Stop server.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: next-intl FR/EN routing with [locale] segment"
```

---

### Task 6: Root layout + html lang dynamic + GSAP context provider

**Files:**
- Modify: `app/layout.tsx`, `app/[locale]/layout.tsx`
- Create: `components/motion/GsapProvider.tsx`

- [ ] **Step 1: Make app/layout.tsx pass-through**

With next-intl + App Router, `<html>` and `<body>` live in `app/[locale]/layout.tsx` so we can set `lang` dynamically. The root `app/layout.tsx` becomes a minimal pass-through:

```tsx
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

This is the documented next-intl pattern when `[locale]` is the first segment.

- [ ] **Step 2: Update app/[locale]/layout.tsx with html + body + fonts**

```tsx
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Anton, JetBrains_Mono } from 'next/font/google';
import { GsapProvider } from '@/components/motion/GsapProvider';
import { locales, type Locale } from '@/i18n';

const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const messages = await getMessages();
  return (
    <html lang={locale} className={`${anton.variable} ${jetbrainsMono.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <GsapProvider>{children}</GsapProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create GsapProvider.tsx**

```tsx
'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function GsapProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);
  return <>{children}</>;
}
```

- [ ] **Step 4: Remove font import from old app/layout.tsx**

After step 1, `app/layout.tsx` should only import globals.css. Remove the Anton/JetBrains imports there (they live in `[locale]/layout.tsx` now).

- [ ] **Step 5: Verify both locales still render**

```bash
pnpm dev
```
Visit /fr and /en, inspect `<html lang>` in devtools — should match the URL.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: locale-aware html lang + GSAP context provider with ScrollTrigger cleanup"
```

---

### Task 7: Nav, LangSwitcher, Footer

**Files:**
- Create: `components/layout/Nav.tsx`, `components/layout/LangSwitcher.tsx`, `components/layout/Footer.tsx`
- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 1: Create Nav.tsx**

```tsx
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LangSwitcher } from './LangSwitcher';

export function Nav({ locale }: { locale: string }) {
  const t = useTranslations('Nav');
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 mix-blend-difference text-cream">
      <Link href={`/${locale}`} className="text-meta">LOU.STUDIO</Link>
      <ul className="flex gap-6 text-meta">
        <li><Link href={`/${locale}/about`}>{t('about')}</Link></li>
        <li><Link href={`/${locale}/contact`}>{t('contact')}</Link></li>
      </ul>
      <LangSwitcher locale={locale} />
    </nav>
  );
}
```

- [ ] **Step 2: Create LangSwitcher.tsx (client component)**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales } from '@/i18n';

export function LangSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();
  const stripped = pathname.replace(/^\/(fr|en)/, '');
  return (
    <div className="flex gap-2 text-meta">
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden>/</span>}
          <Link
            href={`/${l}${stripped}`}
            className={l === locale ? 'opacity-100' : 'opacity-50 hover:opacity-100'}
            aria-current={l === locale ? 'page' : undefined}
          >
            {l.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create Footer.tsx**

```tsx
import { useTranslations } from 'next-intl';

export function Footer({ locale }: { locale: string }) {
  const t = useTranslations('Footer');
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-cream/20 px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-meta">
      <div>© {year} LOU STUDIO</div>
      <div className="text-center">
        <a href="https://instagram.com/loustudio" target="_blank" rel="noopener noreferrer">{t('instagram')}</a>
      </div>
      <div className="text-right opacity-60">{t('rights')} · {locale.toUpperCase()}</div>
    </footer>
  );
}
```

- [ ] **Step 4: Mount Nav + Footer in [locale]/layout.tsx**

In `app/[locale]/layout.tsx`, wrap `{children}` between `<Nav locale={locale} />` and `<Footer locale={locale} />` inside the body.

- [ ] **Step 5: Verify**

```bash
pnpm dev
```
Both /fr and /en show nav + footer with correct strings. Switch language, path changes locale prefix.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Nav + LangSwitcher + Footer with i18n"
```

---

## Phase 2 — MDX content loader (TDD)

### Task 8: lib/works.ts loader (TDD)

**Files:**
- Create: `lib/works.ts`, `lib/works.test.ts`, `vitest.config.ts`
- Create: `tests/fixtures/works/example.fr.mdx`, `tests/fixtures/works/example.en.mdx`

- [ ] **Step 1: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

- [ ] **Step 2: Add test scripts to package.json**

In `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest",
"typecheck": "tsc --noEmit"
```

- [ ] **Step 3: Create test fixture MDX files**

`tests/fixtures/works/example.fr.mdx`:
```mdx
---
slug: example
title: Exemple Série
date: 2025-09-12
order: 1
location: Paris
role: Maquillage & Stylisme
team:
  photographer: Jane Doe
  model: John Roe
cover: /images/works/example/cover.jpg
media:
  - { type: image, src: /images/works/example/01.jpg, layout: full }
nextSlug: latex-couture
---

Texte d'intro français.
```

`tests/fixtures/works/example.en.mdx`: same frontmatter, body `English intro text.`

- [ ] **Step 4: Write failing tests**

`lib/works.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { getAllWorks, getWorkBySlug } from './works';

const FIXTURES = 'tests/fixtures/works';

describe('getAllWorks', () => {
  it('returns FR works sorted by order then date desc', async () => {
    const works = await getAllWorks('fr', FIXTURES);
    expect(works).toHaveLength(1);
    expect(works[0]?.slug).toBe('example');
    expect(works[0]?.title).toBe('Exemple Série');
  });

  it('returns EN works with English content', async () => {
    const works = await getAllWorks('en', FIXTURES);
    expect(works[0]?.title).toBe('Exemple Série');
  });
});

describe('getWorkBySlug', () => {
  it('returns the work for a valid slug + locale', async () => {
    const work = await getWorkBySlug('example', 'fr', FIXTURES);
    expect(work).not.toBeNull();
    expect(work?.team.photographer).toBe('Jane Doe');
    expect(work?.media).toHaveLength(1);
  });

  it('returns null for missing slug', async () => {
    const work = await getWorkBySlug('does-not-exist', 'fr', FIXTURES);
    expect(work).toBeNull();
  });
});
```

- [ ] **Step 5: Run failing tests**

```bash
pnpm test
```
Expected: FAIL — `getAllWorks` / `getWorkBySlug` undefined.

- [ ] **Step 6: Write minimal implementation**

`lib/works.ts`:
```ts
import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export type Locale = 'fr' | 'en';

export interface Media {
  type: 'image' | 'video';
  src: string;
  poster?: string;
  layout: 'full' | 'grid-left' | 'grid-right';
}

export interface Work {
  slug: string;
  title: string;
  date: string;
  order?: number;
  location: string;
  role: string;
  team: { photographer?: string; model?: string; [key: string]: string | undefined };
  cover: string;
  media: Media[];
  nextSlug?: string;
  bodyMdx: string;
}

const DEFAULT_DIR = 'content/works';

async function readWorkFile(filePath: string): Promise<Work | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(raw);
    return {
      slug: data.slug,
      title: data.title,
      date: data.date,
      order: data.order,
      location: data.location,
      role: data.role,
      team: data.team ?? {},
      cover: data.cover,
      media: data.media ?? [],
      nextSlug: data.nextSlug,
      bodyMdx: content,
    };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err;
  }
}

export async function getAllWorks(locale: Locale, dir = DEFAULT_DIR): Promise<Work[]> {
  const entries = await fs.readdir(dir);
  const slugs = new Set<string>();
  for (const entry of entries) {
    const match = entry.match(/^(.+)\.(fr|en)\.mdx$/);
    if (match && match[2] === locale) slugs.add(match[1]);
  }
  const works = await Promise.all(
    [...slugs].map((slug) => readWorkFile(path.join(dir, `${slug}.${locale}.mdx`))),
  );
  return works
    .filter((w): w is Work => w !== null)
    .sort((a, b) => {
      if (a.order != null && b.order != null) return a.order - b.order;
      if (a.order != null) return -1;
      if (b.order != null) return 1;
      return b.date.localeCompare(a.date);
    });
}

export async function getWorkBySlug(slug: string, locale: Locale, dir = DEFAULT_DIR): Promise<Work | null> {
  return readWorkFile(path.join(dir, `${slug}.${locale}.mdx`));
}
```

- [ ] **Step 7: Run tests pass**

```bash
pnpm test
```
Expected: 4 tests pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: lib/works.ts MDX loader with frontmatter parsing + sort by order/date"
```

---

### Task 9: Seed 2 placeholder MDX projects

**Files:**
- Create: `content/works/bold-lipstick.fr.mdx`, `content/works/bold-lipstick.en.mdx`
- Create: `content/works/latex-couture.fr.mdx`, `content/works/latex-couture.en.mdx`
- Create: `public/images/works/bold-lipstick/cover.jpg` (placeholder solid red 1920×1080 PNG named .jpg)
- Create: `public/images/works/latex-couture/cover.jpg`

- [ ] **Step 1: Create cover placeholders**

Generate 2 solid-color cover placeholders. From a bash terminal with ImageMagick or any tool — but to keep it minimal, write a quick Node script `scripts/make-placeholders.mjs`:

```js
import { writeFileSync, mkdirSync } from 'node:fs';
import { Buffer } from 'node:buffer';

// 1×1 red JPEG (covers will be replaced with real photos later — this is just to make next/image not crash)
const RED_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AL+AB//Z',
  'base64',
);

const slugs = ['bold-lipstick', 'latex-couture'];
for (const slug of slugs) {
  mkdirSync(`public/images/works/${slug}`, { recursive: true });
  writeFileSync(`public/images/works/${slug}/cover.jpg`, RED_JPEG);
  writeFileSync(`public/images/works/${slug}/01.jpg`, RED_JPEG);
}
console.log('Placeholders created.');
```

Run:
```bash
node scripts/make-placeholders.mjs
```

- [ ] **Step 2: Create bold-lipstick.fr.mdx**

```mdx
---
slug: bold-lipstick
title: Bold Lipstick
date: 2025-09-12
order: 1
location: Paris
role: Maquillage & Stylisme
team:
  photographer: À renseigner
  model: À renseigner
cover: /images/works/bold-lipstick/cover.jpg
media:
  - { type: image, src: /images/works/bold-lipstick/01.jpg, layout: full }
nextSlug: latex-couture
---

Une série éditoriale autour du rouge à lèvres comme arme graphique.
```

- [ ] **Step 3: Create bold-lipstick.en.mdx**

Same frontmatter as above (locale-shared text translated):
```mdx
---
slug: bold-lipstick
title: Bold Lipstick
date: 2025-09-12
order: 1
location: Paris
role: Makeup & Stylism
team:
  photographer: TBD
  model: TBD
cover: /images/works/bold-lipstick/cover.jpg
media:
  - { type: image, src: /images/works/bold-lipstick/01.jpg, layout: full }
nextSlug: latex-couture
---

An editorial series around lipstick as a graphic weapon.
```

- [ ] **Step 4: Create latex-couture.fr.mdx**

```mdx
---
slug: latex-couture
title: Latex Couture
date: 2025-07-04
order: 2
location: Paris
role: Maquillage & Stylisme
team:
  photographer: À renseigner
cover: /images/works/latex-couture/cover.jpg
media:
  - { type: image, src: /images/works/latex-couture/01.jpg, layout: full }
nextSlug: bold-lipstick
---

Latex et peau, contraste matière.
```

- [ ] **Step 5: Create latex-couture.en.mdx**

```mdx
---
slug: latex-couture
title: Latex Couture
date: 2025-07-04
order: 2
location: Paris
role: Makeup & Stylism
team:
  photographer: TBD
cover: /images/works/latex-couture/cover.jpg
media:
  - { type: image, src: /images/works/latex-couture/01.jpg, layout: full }
nextSlug: bold-lipstick
---

Latex against skin, material contrast.
```

- [ ] **Step 6: Verify loader picks them up**

Add a temporary integration test to `lib/works.test.ts`:
```ts
it('reads real content/works directory', async () => {
  const works = await getAllWorks('fr');
  expect(works.length).toBeGreaterThanOrEqual(2);
  expect(works.map((w) => w.slug)).toContain('bold-lipstick');
});
```

```bash
pnpm test
```
Expected: passes.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: seed bold-lipstick + latex-couture placeholder projects (FR + EN)"
```

---

## Phase 3 — Lipstick 3D

### Task 10: LipstickCanvas wrapper (dynamic import, ssr:false)

**Files:**
- Create: `components/three/LipstickCanvas.tsx`, `components/three/LipstickFallback.tsx`
- Create: `public/lipstick-fallback.png` (will be replaced later, use a 1×1 placeholder for now)

- [ ] **Step 1: Create LipstickFallback.tsx**

```tsx
import Image from 'next/image';

export function LipstickFallback() {
  return (
    <div aria-hidden className="absolute inset-0 grid place-items-center">
      <Image
        src="/lipstick-fallback.png"
        alt=""
        width={400}
        height={600}
        priority
        className="opacity-90"
      />
    </div>
  );
}
```

- [ ] **Step 2: Add a 1×1 placeholder PNG to public/**

Add to `scripts/make-placeholders.mjs`:
```js
const RED_PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
  'base64',
);
writeFileSync('public/lipstick-fallback.png', RED_PNG_1X1);
```
Re-run: `node scripts/make-placeholders.mjs`.

- [ ] **Step 3: Create LipstickCanvas.tsx**

```tsx
'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import { LipstickFallback } from './LipstickFallback';

const Scene = dynamic(() => import('./LipstickScene').then((m) => m.LipstickScene), {
  ssr: false,
  loading: () => <LipstickFallback />,
});

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

function useWebGL() {
  const [supported, setSupported] = useState(true);
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      setSupported(!!gl);
    } catch {
      setSupported(false);
    }
  }, []);
  return supported;
}

export function LipstickCanvas() {
  const reduced = useReducedMotion();
  const webgl = useWebGL();
  if (reduced || !webgl) return <LipstickFallback />;
  return (
    <Suspense fallback={<LipstickFallback />}>
      <Scene />
    </Suspense>
  );
}
```

- [ ] **Step 4: Stub LipstickScene to compile**

Create `components/three/LipstickScene.tsx`:
```tsx
'use client';
export function LipstickScene() {
  return null; // implemented in Task 11
}
```

- [ ] **Step 5: Verify dev compiles**

```bash
pnpm dev
```
No runtime errors. Stop server.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: LipstickCanvas wrapper with dynamic import + reduced-motion + WebGL fallbacks"
```

---

### Task 11: Lipstick procedural geometry + materials

**Files:**
- Modify: `components/three/LipstickScene.tsx`
- Create: `components/three/Stage.tsx`, `components/three/Lipstick.tsx`
- Add: `public/textures/concrete-normal.jpg` (CC0, manually downloaded — note in plan)

- [ ] **Step 1: Download CC0 concrete normal map**

Manual step (one-time). Download `concrete_floor_painted_001_nor_gl_1k.jpg` from Poly Haven (https://polyhaven.com/a/concrete_floor_painted_001), or any CC0 concrete normal map. Save as `public/textures/concrete-normal.jpg` (~200 KB).

If the agent cannot fetch it, leave a placeholder solid-gray 1px JPG and document the manual replacement in `public/textures/README.md`.

- [ ] **Step 2: Create Stage.tsx**

```tsx
'use client';

import { Environment } from '@react-three/drei';

export function Stage() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 3, -3]} intensity={0.4} color="#ff3b00" />
      <Environment preset="studio" environmentIntensity={0.4} />
    </>
  );
}
```

- [ ] **Step 3: Create Lipstick.tsx**

```tsx
'use client';

import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, RepeatWrapping, Group } from 'three';
import * as THREE from 'three';

export function Lipstick() {
  const group = useRef<Group>(null!);
  const normalMap = useLoader(TextureLoader, '/textures/concrete-normal.jpg');
  normalMap.wrapS = normalMap.wrapT = RepeatWrapping;
  normalMap.repeat.set(2, 2);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.6) * 0.05;
  });

  return (
    <group ref={group} position={[0, 0, 0]} scale={1.2}>
      {/* Tube (concrete) */}
      <mesh castShadow receiveShadow position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1.2, 64]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.85} metalness={0.05} normalMap={normalMap} normalScale={new THREE.Vector2(0.6, 0.6)} />
      </mesh>
      {/* Ring (chrome) */}
      <mesh castShadow position={[0, 0.05, 0]}>
        <torusGeometry args={[0.5, 0.05, 16, 64]} />
        <meshStandardMaterial color="#cccccc" metalness={1} roughness={0.15} />
      </mesh>
      {/* Stick (red) */}
      <mesh castShadow position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.42, 0.45, 1.0, 64]} />
        <meshStandardMaterial color="#ff3b00" metalness={0.1} roughness={0.3} />
      </mesh>
      {/* Stick tip (cone) */}
      <mesh castShadow position={[0, 1.4, 0]}>
        <coneGeometry args={[0.42, 0.5, 64]} />
        <meshStandardMaterial color="#ff3b00" metalness={0.1} roughness={0.3} />
      </mesh>
    </group>
  );
}
```

- [ ] **Step 4: Replace LipstickScene.tsx with full canvas (responsive dpr + shadows)**

```tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { Stage } from './Stage';
import { Lipstick } from './Lipstick';

export function LipstickScene() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return (
    <Canvas
      camera={{ position: [0, 0.5, 4.5], fov: 32 }}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      shadows={!isMobile}
    >
      <Stage />
      <Lipstick />
    </Canvas>
  );
}
```

Mobile gets `dpr={[1, 1.5]}` and shadows disabled per the spec's perf budget (Section 8 — Performance).

- [ ] **Step 5: Mount on home page (temporary verify)**

Edit `app/[locale]/page.tsx`:
```tsx
import { LipstickCanvas } from '@/components/three/LipstickCanvas';

export default function Home() {
  return (
    <main className="relative h-screen">
      <LipstickCanvas />
    </main>
  );
}
```

- [ ] **Step 6: Verify**

```bash
pnpm dev
```
Open /fr — lipstick visible, idle oscillation. Stop server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: procedural lipstick (cylinder + torus + cone) with concrete normal map + studio lighting"
```

---

### Task 12: Drag-to-rotate hook (TDD)

**Files:**
- Create: `components/three/useDragRotate.ts`, `components/three/useDragRotate.test.ts`
- Modify: `components/three/Lipstick.tsx`

- [ ] **Step 1: Write failing test**

`components/three/useDragRotate.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { applyDragDelta } from './useDragRotate';

describe('applyDragDelta', () => {
  it('converts pixel delta to radians and accumulates', () => {
    const next = applyDragDelta({ x: 0, y: 0 }, [100, 50]);
    expect(next.y).toBeCloseTo(100 * 0.005);
    expect(next.x).toBeCloseTo(50 * 0.005);
  });

  it('clamps X rotation to ±π/2', () => {
    const next = applyDragDelta({ x: 0, y: 0 }, [0, 1000]);
    expect(next.x).toBeCloseTo(Math.PI / 2);
  });
});
```

- [ ] **Step 2: Run failing test**

```bash
pnpm test useDragRotate
```
Expected: FAIL — `applyDragDelta` not defined.

- [ ] **Step 3: Implement useDragRotate.ts**

```ts
'use client';

import { useRef } from 'react';
import { useDrag } from '@use-gesture/react';

export interface Rotation {
  x: number;
  y: number;
}

const PIXEL_TO_RAD = 0.005;
const X_CLAMP = Math.PI / 2;

export function applyDragDelta(current: Rotation, [dx, dy]: [number, number]): Rotation {
  return {
    y: current.y + dx * PIXEL_TO_RAD,
    x: Math.max(-X_CLAMP, Math.min(X_CLAMP, current.x + dy * PIXEL_TO_RAD)),
  };
}

export function useDragRotate() {
  const target = useRef<Rotation>({ x: 0, y: 0 });
  const current = useRef<Rotation>({ x: 0, y: 0 });

  const bind = useDrag(({ delta }) => {
    target.current = applyDragDelta(target.current, delta as [number, number]);
  });

  return { bind, target, current };
}
```

- [ ] **Step 4: Run test pass**

```bash
pnpm test useDragRotate
```
Expected: 2 tests pass.

- [ ] **Step 5: Wire into Lipstick.tsx**

Update `Lipstick.tsx` to apply drag rotation with lerp inertia:

```tsx
'use client';

import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, RepeatWrapping, Group, Vector2 } from 'three';
import { useDragRotate } from './useDragRotate';

export function Lipstick() {
  const group = useRef<Group>(null!);
  const normalMap = useLoader(TextureLoader, '/textures/concrete-normal.jpg');
  normalMap.wrapS = normalMap.wrapT = RepeatWrapping;
  normalMap.repeat.set(2, 2);
  const { bind, target, current } = useDragRotate();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Lerp current toward target
    current.current.x += (target.current.x - current.current.x) * 0.15;
    current.current.y += (target.current.y - current.current.y) * 0.15;
    // Idle oscillation only when no drag input recently
    const idle = Math.sin(t * 0.6) * 0.05;
    group.current.rotation.x = current.current.x;
    group.current.rotation.y = current.current.y + idle;
  });

  return (
    <group ref={group} {...(bind() as any)} position={[0, 0, 0]} scale={1.2}>
      <mesh castShadow receiveShadow position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1.2, 64]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.85} metalness={0.05} normalMap={normalMap} normalScale={new Vector2(0.6, 0.6)} />
      </mesh>
      <mesh castShadow position={[0, 0.05, 0]}>
        <torusGeometry args={[0.5, 0.05, 16, 64]} />
        <meshStandardMaterial color="#cccccc" metalness={1} roughness={0.15} />
      </mesh>
      <mesh castShadow position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.42, 0.45, 1.0, 64]} />
        <meshStandardMaterial color="#ff3b00" metalness={0.1} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[0, 1.4, 0]}>
        <coneGeometry args={[0.42, 0.5, 64]} />
        <meshStandardMaterial color="#ff3b00" metalness={0.1} roughness={0.3} />
      </mesh>
    </group>
  );
}
```

- [ ] **Step 6: Verify drag works**

```bash
pnpm dev
```
Drag the lipstick — it rotates with inertia. Stop server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: drag-to-rotate the lipstick with @use-gesture + clamped X axis + lerp inertia"
```

- [ ] **Step 8: Add desktop hover lerp ("lipstick looks at cursor")**

In `Lipstick.tsx`, track pointer X/Y normalized and bias `target` rotation toward it on desktop only. Add to component:

```tsx
import { useEffect } from 'react';

const pointer = useRef<Rotation>({ x: 0, y: 0 });

useEffect(() => {
  if (window.matchMedia('(max-width: 768px)').matches) return;
  const handler = (e: PointerEvent) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;   // -1..1
    const ny = (e.clientY / window.innerHeight) * 2 - 1;  // -1..1
    pointer.current.y = nx * 0.25;  // ±0.25 rad gentle bias
    pointer.current.x = ny * 0.15;
  };
  window.addEventListener('pointermove', handler);
  return () => window.removeEventListener('pointermove', handler);
}, []);
```

In `useFrame`, before applying current → group:
```tsx
// Blend pointer bias into the target with low weight so drag still wins
const blendedY = target.current.y + pointer.current.y * 0.3;
const blendedX = target.current.x + pointer.current.x * 0.3;
current.current.x += (blendedX - current.current.x) * 0.08;
current.current.y += (blendedY - current.current.y) * 0.08;
```

(Replaces the previous lerp lines.)

- [ ] **Step 9: Verify on desktop**

```bash
pnpm dev
```
Move the cursor around the hero — lipstick rotates subtly toward it. Drag still overrides cleanly. On mobile (DevTools toggle device toolbar) the hover effect is disabled.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: lipstick hover lerp toward cursor on desktop (disabled on mobile)"
```

---

### Task 13: ScrollTrigger twist + color shift

**Files:**
- Create: `components/three/useScrollProgress.ts`
- Modify: `components/three/Lipstick.tsx`

- [ ] **Step 1: Create useScrollProgress hook**

```ts
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function useScrollProgress() {
  const progress = useRef(0);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        progress.current = self.progress;
      },
    });
    return () => {
      trigger.kill();
    };
  }, []);

  return progress;
}
```

- [ ] **Step 2: Apply twist + color shift in Lipstick.tsx**

In the `useFrame` callback, add:
```tsx
const progress = useScrollProgress();
// inside useFrame:
const p = progress.current;
group.current.scale.y = 1.2 - p * 0.1; // slight squash on scroll
group.current.position.y = -p * 0.5;   // slight downward drift
group.current.rotation.z = p * 0.2;    // twist
```

For color shift, expose the stick material via ref and lerp its color:
```tsx
import { Color } from 'three';
import { MeshStandardMaterial } from 'three';

const stickMatRef = useRef<MeshStandardMaterial>(null!);
const targetColor = new Color('#ff3b00');
const altColor = new Color('#d6f700');

// inside useFrame, after computing p:
const c = targetColor.clone().lerp(altColor, p);
if (stickMatRef.current) stickMatRef.current.color.copy(c);
```

Attach `ref={stickMatRef}` to the stick `<meshStandardMaterial>`.

- [ ] **Step 3: Verify scroll twist**

Make `<main>` taller so we can scroll. In `app/[locale]/page.tsx`:
```tsx
<main className="relative">
  <section className="h-screen"><LipstickCanvas /></section>
  <section className="h-screen bg-stone-900" />
  <section className="h-screen bg-stone-800" />
</main>
```

```bash
pnpm dev
```
Scroll — lipstick tilts, color shifts toward acid green. Stop.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: ScrollTrigger-driven twist + color shift on the lipstick"
```

---

### Task 14: Mount LipstickCanvas in root layout, hide on non-home routes

**Files:**
- Create: `components/three/LipstickRoot.tsx`
- Modify: `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`

- [ ] **Step 1: Create LipstickRoot.tsx**

```tsx
'use client';

import { usePathname } from 'next/navigation';
import { LipstickCanvas } from './LipstickCanvas';

export function LipstickRoot() {
  const pathname = usePathname();
  const isHome = /^\/(fr|en)\/?$/.test(pathname);
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-auto transition-opacity duration-300"
      style={{ opacity: isHome ? 1 : 0, pointerEvents: isHome ? 'auto' : 'none' }}
      aria-hidden
    >
      <LipstickCanvas />
    </div>
  );
}
```

- [ ] **Step 2: Mount in [locale]/layout.tsx**

Inside the `<body>`, before `<Nav>`:
```tsx
<LipstickRoot />
```

- [ ] **Step 3: Remove LipstickCanvas from page.tsx**

`app/[locale]/page.tsx` becomes:
```tsx
export default function Home() {
  return <main className="relative" />;
}
```
(Real home content comes in Task 15.)

- [ ] **Step 4: Verify**

```bash
pnpm dev
```
/fr shows lipstick. Navigate to /fr/about (will 404 until Task 22, but the layout still renders) — lipstick fades out.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: mount LipstickCanvas at root layout, fade out on non-home routes"
```

---

## Phase 4 — Home full-bleed reveal

### Task 15: Hero section + typography overlay

**Files:**
- Create: `components/home/Hero.tsx`
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Create Hero.tsx**

```tsx
import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('Home');
  return (
    <section className="relative h-screen w-full">
      <span className="absolute top-6 left-6 text-meta z-10">{t('tagline')}</span>
      <span className="absolute bottom-6 right-6 text-meta z-10">2025 — {t('vol')}</span>
      <h1
        aria-label="LOU"
        className="absolute inset-0 grid place-items-center text-brutal text-[28vw] text-cream/[0.04] pointer-events-none select-none z-0"
      >
        LOU
      </h1>
      <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-meta z-10 animate-pulse">
        ↓ {t('scroll')}
      </span>
    </section>
  );
}
```

- [ ] **Step 2: Mount in page.tsx**

```tsx
import { Hero } from '@/components/home/Hero';

export default function Home() {
  return (
    <main className="relative">
      <Hero />
    </main>
  );
}
```

- [ ] **Step 3: Verify**

```bash
pnpm dev
```
Hero visible, lipstick centered behind transparent typo. Stop.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: home Hero with brutalist typography overlay"
```

---

### Task 16: FullBleedSlide component + reveal animation

**Files:**
- Create: `components/home/FullBleedSlide.tsx`

- [ ] **Step 1: Create FullBleedSlide.tsx**

```tsx
'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import type { Work } from '@/lib/works';

interface Props {
  work: Work;
  index: number;
  total: number;
  locale: string;
}

export function FullBleedSlide({ work, index, total, locale }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      gsap.from(el.querySelector('[data-img]'), {
        clipPath: 'inset(20%)',
        scale: 1.1,
        ease: 'power2.out',
        duration: 1,
        scrollTrigger: { trigger: el, start: 'top 70%' },
      });
      gsap.from(el.querySelectorAll('[data-line]'), {
        yPercent: 100,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 70%' },
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className="relative h-screen w-full overflow-hidden snap-start"
      aria-labelledby={`slide-${work.slug}`}
    >
      <div data-img className="absolute inset-0">
        <Image src={work.cover} alt="" fill priority={index === 0} className="object-cover" />
      </div>
      <Link
        href={`/${locale}/works/${work.slug}`}
        className="absolute inset-0 flex flex-col justify-end p-10 z-10 group"
      >
        <span className="text-meta opacity-70 mb-4">
          PROJECT {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <div className="overflow-hidden">
          <h2 id={`slide-${work.slug}`} data-line className="text-brutal text-7xl md:text-9xl">
            {work.title}
          </h2>
        </div>
        <div className="overflow-hidden mt-3">
          <span data-line className="text-meta opacity-80">
            {work.role} · {work.location} · {new Date(work.date).getFullYear()}
          </span>
        </div>
      </Link>
    </section>
  );
}
```

- [ ] **Step 2: Mount slides in page.tsx**

```tsx
import { Hero } from '@/components/home/Hero';
import { FullBleedSlide } from '@/components/home/FullBleedSlide';
import { getAllWorks, type Locale } from '@/lib/works';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const works = await getAllWorks(locale as Locale);
  return (
    <main className="relative snap-y snap-mandatory h-screen overflow-y-scroll">
      <Hero />
      {works.map((work, i) => (
        <FullBleedSlide key={work.slug} work={work} index={i} total={works.length} locale={locale} />
      ))}
    </main>
  );
}
```

- [ ] **Step 3: Verify**

```bash
pnpm dev
```
Scroll-snap between hero + 2 slides. Each slide reveals on scroll. Stop.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: home FullBleedSlide with GSAP clip-path reveal + snap-scroll"
```

---

### Task 17: Click slide → /works/[slug] with view-transitions

**Files:**
- Modify: `components/home/FullBleedSlide.tsx`

- [ ] **Step 1: Add view-transition-name to slide image**

In the slide's `<Image>` wrapper, add inline style:
```tsx
<div data-img className="absolute inset-0" style={{ viewTransitionName: `cover-${work.slug}` }}>
```

- [ ] **Step 2: Add a CSS transition for view-transitions**

In `app/globals.css`, append:
```css
@layer base {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 0.4s;
  }
}
```

- [ ] **Step 3: Use Link prefetch + router**

`Link` already triggers View Transitions in Next 15 with `experimental.viewTransition: true`. Verify by clicking a slide and seeing a smooth transition. (Page `/works/[slug]` will 404 until Task 18 — confirmed in next phase.)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: view-transition cover handoff between home and project page"
```

---

## Phase 5 — Mini-tunnel projet

### Task 18: /works/[slug] route + generateStaticParams

**Files:**
- Create: `app/[locale]/works/[slug]/page.tsx`

- [ ] **Step 1: Create the route**

```tsx
import { notFound } from 'next/navigation';
import { getAllWorks, getWorkBySlug, type Locale } from '@/lib/works';
import { locales } from '@/i18n';

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    const works = await getAllWorks(locale);
    for (const w of works) params.push({ locale, slug: w.slug });
  }
  return params;
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const work = await getWorkBySlug(slug, locale as Locale);
  if (!work) notFound();
  return (
    <main className="relative bg-jet text-cream">
      <h1 className="text-brutal text-7xl p-10">{work.title}</h1>
      <pre className="p-10 text-xs">{JSON.stringify(work, null, 2)}</pre>
    </main>
  );
}
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```
Click a slide on /fr → navigates to /fr/works/bold-lipstick → shows title + JSON dump. Stop.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: /works/[slug] route with SSG generateStaticParams"
```

---

### Task 19: Cover + intro + crédits sections

**Files:**
- Create: `components/work/Cover.tsx`, `components/work/Intro.tsx`, `components/work/Credits.tsx`
- Modify: `app/[locale]/works/[slug]/page.tsx`

- [ ] **Step 1: Create Cover.tsx**

```tsx
import Image from 'next/image';
import type { Work } from '@/lib/works';

export function Cover({ work }: { work: Work }) {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <Image
        src={work.cover}
        alt=""
        fill
        priority
        className="object-cover"
        style={{ viewTransitionName: `cover-${work.slug}` }}
      />
      <div className="absolute inset-0 flex flex-col justify-end p-10 bg-gradient-to-t from-jet/80 to-transparent">
        <h1 className="text-brutal text-7xl md:text-[12vw]">{work.title}</h1>
        <span className="text-meta mt-4 opacity-80">
          {work.role} · {work.location} · {new Date(work.date).getFullYear()}
        </span>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create Intro.tsx**

```tsx
import { MDXRemote } from 'next-mdx-remote/rsc';

export function Intro({ body }: { body: string }) {
  return (
    <section className="px-6 md:px-20 py-24">
      <div className="max-w-3xl text-3xl md:text-5xl leading-tight font-display">
        <MDXRemote source={body} />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create Credits.tsx**

```tsx
import type { Work } from '@/lib/works';

export function Credits({ work }: { work: Work }) {
  const entries = Object.entries(work.team).filter(([, v]) => v);
  return (
    <section className="px-6 md:px-20 py-16 border-t border-cream/20">
      <h2 className="text-meta opacity-60 mb-6">CREDITS</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3">
        {entries.map(([role, name]) => (
          <li key={role} className="flex justify-between border-b border-cream/10 py-3">
            <span className="text-meta opacity-70">{role.toUpperCase()}</span>
            <span>{name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 4: Wire into page.tsx**

```tsx
import { Cover } from '@/components/work/Cover';
import { Intro } from '@/components/work/Intro';
import { Credits } from '@/components/work/Credits';
// ... existing imports

export default async function WorkPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const work = await getWorkBySlug(slug, locale as Locale);
  if (!work) notFound();
  return (
    <main className="relative bg-jet text-cream">
      <Cover work={work} />
      <Intro body={work.bodyMdx} />
      <Credits work={work} />
    </main>
  );
}
```

- [ ] **Step 5: Verify**

```bash
pnpm dev
```
/fr/works/bold-lipstick → cover + intro + credits visible. Stop.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: project page Cover + Intro (MDX) + Credits sections"
```

---

### Task 20: MediaBlock + VideoBlock with lazy-load + viewport pause

**Files:**
- Create: `components/work/MediaBlock.tsx`, `components/work/VideoBlock.tsx`
- Modify: `app/[locale]/works/[slug]/page.tsx`

- [ ] **Step 1: Create VideoBlock.tsx (client)**

```tsx
'use client';

import { useEffect, useRef } from 'react';

interface Props { src: string; poster?: string; className?: string }

export function VideoBlock({ src, poster, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) el.play().catch(() => {});
          else el.pause();
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      className={className}
    />
  );
}
```

- [ ] **Step 2: Create MediaBlock.tsx**

```tsx
import Image from 'next/image';
import { cn } from '@/lib/cn';
import type { Media } from '@/lib/works';
import { VideoBlock } from './VideoBlock';

const layoutClass: Record<Media['layout'], string> = {
  full: 'col-span-12 h-screen',
  'grid-left': 'col-span-7 aspect-[3/4]',
  'grid-right': 'col-span-5 col-start-8 aspect-[3/4]',
};

export function MediaBlock({ media }: { media: Media }) {
  const wrapper = cn('relative overflow-hidden', layoutClass[media.layout]);
  if (media.type === 'image') {
    return (
      <div className={wrapper}>
        <Image src={media.src} alt="" fill className="object-cover" sizes="100vw" />
      </div>
    );
  }
  return (
    <div className={wrapper}>
      <VideoBlock src={media.src} poster={media.poster} className="absolute inset-0 w-full h-full object-cover" />
    </div>
  );
}
```

- [ ] **Step 3: Render media list in page.tsx**

Between `<Intro>` and `<Credits>`:
```tsx
<section className="grid grid-cols-12 gap-2 px-2 md:px-4">
  {work.media.map((m, i) => (<MediaBlock key={i} media={m} />))}
</section>
```

- [ ] **Step 4: Verify**

```bash
pnpm dev
```
Project page shows media layout. Add a fake video by dropping a small `01.mp4` in `public/videos/works/bold-lipstick/` and adding a `media` entry — confirm autoplay-on-scroll, pause-off-screen.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: MediaBlock layouts (full / grid-left / grid-right) + VideoBlock lazy autoplay"
```

---

### Task 21: Keyboard nav + next project link

**Files:**
- Create: `components/work/NextProject.tsx`, `components/work/KeyboardNav.tsx`
- Modify: `app/[locale]/works/[slug]/page.tsx`

- [ ] **Step 1: Create NextProject.tsx**

```tsx
import Link from 'next/link';
import type { Work } from '@/lib/works';

export function NextProject({ work, locale }: { work: Work; locale: string }) {
  if (!work.nextSlug) return null;
  return (
    <section className="px-6 md:px-20 py-32 border-t border-cream/20">
      <Link href={`/${locale}/works/${work.nextSlug}`} className="block group">
        <span className="text-meta opacity-60">NEXT</span>
        <h2 className="text-brutal text-6xl md:text-9xl mt-4 group-hover:text-signal transition-colors">
          {work.nextSlug.replace(/-/g, ' ')} →
        </h2>
      </Link>
    </section>
  );
}
```

- [ ] **Step 2: Create KeyboardNav.tsx (client)**

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function KeyboardNav({ nextHref, prevHref }: { nextHref?: string; prevHref?: string }) {
  const router = useRouter();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && nextHref) router.push(nextHref);
      if (e.key === 'ArrowLeft' && prevHref) router.push(prevHref);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router, nextHref, prevHref]);
  return null;
}
```

- [ ] **Step 3: Wire up in page.tsx**

Compute prev work and use both:
```tsx
const all = await getAllWorks(locale as Locale);
const idx = all.findIndex((w) => w.slug === slug);
const prev = idx > 0 ? all[idx - 1] : undefined;
const next = work.nextSlug ? await getWorkBySlug(work.nextSlug, locale as Locale) : undefined;
```

Add at end of `<main>`:
```tsx
<NextProject work={work} locale={locale} />
<KeyboardNav
  nextHref={next ? `/${locale}/works/${next.slug}` : undefined}
  prevHref={prev ? `/${locale}/works/${prev.slug}` : undefined}
/>
```

- [ ] **Step 4: Verify**

```bash
pnpm dev
```
Project page → arrow right → next project. Click "NEXT" → also goes there. Stop.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: project page keyboard nav (←/→) + NextProject link"
```

---

## Phase 6 — About + Contact

### Task 22: /about page

**Files:**
- Create: `app/[locale]/about/page.tsx`, `content/about.fr.mdx`, `content/about.en.mdx`
- Create: `lib/about.ts`

- [ ] **Step 1: Create lib/about.ts**

```ts
import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { Locale } from './works';

export interface About {
  bodyMdx: string;
  data: { name: string; portrait: string };
}

export async function getAbout(locale: Locale): Promise<About> {
  const raw = await fs.readFile(path.join('content', `about.${locale}.mdx`), 'utf-8');
  const { data, content } = matter(raw);
  return { bodyMdx: content, data: { name: data.name, portrait: data.portrait } };
}
```

- [ ] **Step 2: Create content/about.fr.mdx**

```mdx
---
name: Lou Boidin
portrait: /images/about/portrait.jpg
---

Lou est maquilleuse et styliste basée à Paris. Elle travaille pour l'éditorial, le défilé et les campagnes — une approche brute, frontale, où le maquillage devient sculpture et le vêtement devient peau.
```

- [ ] **Step 3: Create content/about.en.mdx**

```mdx
---
name: Lou Boidin
portrait: /images/about/portrait.jpg
---

Lou is a makeup artist and stylist based in Paris. She works on editorial, runway and campaign projects — a raw, frontal approach where makeup becomes sculpture and clothing becomes skin.
```

- [ ] **Step 4: Create the page**

```tsx
import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { locales } from '@/i18n';
import { getAbout } from '@/lib/about';
import type { Locale } from '@/lib/works';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const about = await getAbout(locale as Locale);
  return (
    <main className="relative bg-jet text-cream">
      <section className="relative h-screen">
        <Image src={about.data.portrait} alt={about.data.name} fill priority className="object-cover" />
        <h1 className="absolute bottom-10 left-10 text-brutal text-7xl md:text-[10vw]">{about.data.name}</h1>
      </section>
      <section className="px-6 md:px-20 py-24">
        <div className="max-w-3xl text-3xl md:text-5xl leading-tight font-display">
          <MDXRemote source={about.bodyMdx} />
        </div>
      </section>
      <section className="px-6 md:px-20 py-16 border-t border-cream/20">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 text-meta">
          <li>MAKEUP</li><li>STYLISM</li><li>EDITORIAL</li><li>RUNWAY</li>
        </ul>
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Add a portrait placeholder**

In `scripts/make-placeholders.mjs`, add:
```js
mkdirSync('public/images/about', { recursive: true });
writeFileSync('public/images/about/portrait.jpg', RED_JPEG);
```
Re-run: `node scripts/make-placeholders.mjs`.

- [ ] **Step 6: Verify**

```bash
pnpm dev
```
/fr/about → portrait + bio + skills. /en/about → English bio.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: /about page with MDX bio + portrait + skills"
```

---

### Task 23: /contact page + Resend form (TDD API route)

**Files:**
- Create: `app/[locale]/contact/page.tsx`, `app/[locale]/contact/ContactForm.tsx`
- Create: `app/api/contact/route.ts`, `app/api/contact/route.test.ts`
- Modify: `package.json` (add Resend env types)

- [ ] **Step 1: Write failing test for /api/contact**

`app/api/contact/route.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendMock = vi.fn();
vi.mock('resend', () => ({
  Resend: vi.fn(() => ({ emails: { send: sendMock } })),
}));

import { POST } from './route';

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    sendMock.mockReset();
    process.env.RESEND_API_KEY = 'test_key';
    process.env.CONTACT_EMAIL_TO = 'lou@example.com';
  });

  it('rejects invalid payload with 400', async () => {
    const res = await POST(makeRequest({ name: '' }));
    expect(res.status).toBe(400);
  });

  it('rejects honeypot-filled submissions silently with 200', async () => {
    const res = await POST(makeRequest({
      name: 'Bot', email: 'b@b.com', message: 'spam', website: 'http://spam.com',
    }));
    expect(res.status).toBe(200);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('sends email via Resend on valid submission', async () => {
    sendMock.mockResolvedValue({ data: { id: 'abc' }, error: null });
    const res = await POST(makeRequest({
      name: 'Alice', email: 'a@a.com', message: 'Hello', website: '',
    }));
    expect(res.status).toBe(200);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0]?.[0]).toMatchObject({ to: 'lou@example.com' });
  });
});
```

- [ ] **Step 2: Run failing test**

```bash
pnpm test contact
```
Expected: FAIL — route module missing.

- [ ] **Step 3: Implement route.ts**

```ts
import { Resend } from 'resend';
import { z } from 'zod';

const Schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
  website: z.string().optional(),
});

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

function checkRate(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT) return false;
  bucket.count++;
  return true;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  if (!checkRate(ip)) return new Response('Too many requests', { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return new Response('Invalid payload', { status: 400 });

  // Honeypot — silently succeed without sending
  if (parsed.data.website && parsed.data.website.length > 0) {
    return new Response(null, { status: 200 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO;
  if (!apiKey || !to) return new Response('Server misconfigured', { status: 500 });

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: 'noreply@loustudio.fr',
    to,
    replyTo: parsed.data.email,
    subject: `[loustudio.fr] Message de ${parsed.data.name}`,
    text: `${parsed.data.message}\n\n— ${parsed.data.name} <${parsed.data.email}>`,
  });
  if (error) return new Response('Send failed', { status: 502 });
  return new Response(null, { status: 200 });
}
```

- [ ] **Step 4: Run tests pass**

```bash
pnpm test contact
```
Expected: 3 tests pass.

- [ ] **Step 5: Create ContactForm.tsx (client)**

```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function ContactForm() {
  const t = useTranslations('Contact');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    });
    setStatus(res.ok ? 'success' : 'error');
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 max-w-xl">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="grid gap-2">
        <span className="text-meta">{t('name')}</span>
        <input name="name" required className="bg-transparent border-b border-cream/30 py-2 outline-none focus:border-signal" />
      </label>
      <label className="grid gap-2">
        <span className="text-meta">{t('email')}</span>
        <input type="email" name="email" required className="bg-transparent border-b border-cream/30 py-2 outline-none focus:border-signal" />
      </label>
      <label className="grid gap-2">
        <span className="text-meta">{t('message')}</span>
        <textarea name="message" required rows={6} className="bg-transparent border-b border-cream/30 py-2 outline-none focus:border-signal resize-none" />
      </label>
      <button type="submit" disabled={status === 'sending'} className="text-brutal text-3xl text-left hover:text-signal transition-colors disabled:opacity-50">
        {t('send')} →
      </button>
      {status === 'success' && <p className="text-acid text-meta">{t('success')}</p>}
      {status === 'error' && <p className="text-signal text-meta">{t('error')}</p>}
    </form>
  );
}
```

- [ ] **Step 6: Create contact/page.tsx**

```tsx
import { ContactForm } from './ContactForm';
import { locales } from '@/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function ContactPage() {
  return (
    <main className="relative bg-jet text-cream min-h-screen px-6 md:px-20 pt-32 pb-16">
      <h1 className="text-brutal text-7xl md:text-[14vw] mb-16">CONTACT</h1>
      <a href="mailto:hello@loustudio.fr" className="block text-brutal text-4xl md:text-6xl hover:text-signal mb-16">
        hello@loustudio.fr
      </a>
      <a href="https://instagram.com/loustudio" target="_blank" rel="noopener noreferrer" className="text-meta opacity-80 hover:opacity-100 mb-24 block">
        @LOUSTUDIO →
      </a>
      <ContactForm />
    </main>
  );
}
```

- [ ] **Step 7: Verify**

```bash
pnpm dev
```
/fr/contact → form + email link visible. Submitting without RESEND_API_KEY → "Server misconfigured" expected (we'll set the env var at deploy time). Stop.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: /contact page with mailto + Resend form (zod validation, honeypot, rate-limit)"
```

---

## Phase 7 — SEO & meta

### Task 24: metadata, og:image, sitemap, robots, hreflang

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`
- Modify: `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`, `app/[locale]/works/[slug]/page.tsx`, `app/[locale]/about/page.tsx`, `app/[locale]/contact/page.tsx`

- [ ] **Step 1: Add generateMetadata to home**

In `app/[locale]/page.tsx`:
```ts
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isFr = locale === 'fr';
  return {
    title: 'LOU STUDIO — ' + (isFr ? 'Maquillage & Stylisme' : 'Makeup & Stylism'),
    description: isFr
      ? 'Portfolio de Lou Boidin — maquillage et stylisme éditorial à Paris.'
      : 'Portfolio of Lou Boidin — editorial makeup and stylism in Paris.',
    alternates: { canonical: `/${locale}`, languages: { fr: '/fr', en: '/en' } },
    openGraph: { title: 'LOU STUDIO', images: ['/og/home.jpg'], locale, type: 'website' },
  };
}
```

- [ ] **Step 2: Add generateMetadata to works/[slug]**

```ts
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const work = await getWorkBySlug(slug, locale as Locale);
  if (!work) return {};
  return {
    title: `${work.title} — LOU STUDIO`,
    description: `${work.role} · ${work.location} · ${new Date(work.date).getFullYear()}`,
    alternates: {
      canonical: `/${locale}/works/${slug}`,
      languages: { fr: `/fr/works/${slug}`, en: `/en/works/${slug}` },
    },
    openGraph: { title: work.title, images: [work.cover], locale, type: 'article' },
  };
}
```

- [ ] **Step 3: Similar metadata for /about and /contact**

About:
```ts
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: 'About — LOU STUDIO',
    alternates: { canonical: `/${locale}/about`, languages: { fr: '/fr/about', en: '/en/about' } },
  };
}
```
Contact: same pattern.

- [ ] **Step 4: Create sitemap.ts**

```ts
import type { MetadataRoute } from 'next';
import { getAllWorks } from '@/lib/works';
import { locales } from '@/i18n';

const BASE = 'https://loustudio.fr';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    entries.push({ url: `${BASE}/${locale}`, changeFrequency: 'monthly', priority: 1 });
    entries.push({ url: `${BASE}/${locale}/about`, changeFrequency: 'yearly', priority: 0.6 });
    entries.push({ url: `${BASE}/${locale}/contact`, changeFrequency: 'yearly', priority: 0.6 });
    const works = await getAllWorks(locale);
    for (const w of works) {
      entries.push({ url: `${BASE}/${locale}/works/${w.slug}`, lastModified: w.date, changeFrequency: 'monthly', priority: 0.8 });
    }
  }
  return entries;
}
```

- [ ] **Step 5: Create robots.ts**

```ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://loustudio.fr/sitemap.xml',
  };
}
```

- [ ] **Step 6: Verify build emits sitemap**

```bash
pnpm build
```
Expected: build succeeds, output mentions `sitemap.xml` and `robots.txt`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: per-page metadata + sitemap + robots + hreflang alternates"
```

---

## Phase 8 — Tests & CI

### Task 25: Playwright smoke test

**Files:**
- Create: `tests/e2e/home.spec.ts`, `playwright.config.ts`

- [ ] **Step 1: Configure Playwright**

```bash
pnpm exec playwright install --with-deps chromium
```

Create `playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  webServer: {
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

Add to `package.json` scripts:
```json
"test:e2e": "playwright test"
```

- [ ] **Step 2: Write smoke test**

```ts
import { test, expect } from '@playwright/test';

test('home FR loads, redirects from root, lipstick canvas mounts', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBeLessThan(400);
  await expect(page).toHaveURL(/\/fr$/);
  // Allow time for client-side dynamic import
  await page.waitForTimeout(1500);
  const canvasCount = await page.locator('canvas').count();
  expect(canvasCount).toBeGreaterThanOrEqual(1);
});

test('home EN renders English nav', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('nav')).toContainText('About');
});

test('project page accessible', async ({ page }) => {
  await page.goto('/fr/works/bold-lipstick');
  await expect(page.locator('h1')).toContainText('Bold Lipstick');
});
```

- [ ] **Step 3: Run E2E**

```bash
pnpm test:e2e
```
Expected: 3 tests pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test: Playwright smoke tests for home FR/EN + project page"
```

---

### Task 26: GitHub Actions CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create workflow**

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint-typecheck-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec prettier --check .
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
  e2e:
    runs-on: ubuntu-latest
    needs: lint-typecheck-test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e
        env:
          RESEND_API_KEY: dummy
          CONTACT_EMAIL_TO: dummy@example.com
  lighthouse:
    runs-on: ubuntu-latest
    needs: lint-typecheck-test
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - name: Build
        run: pnpm build
        env:
          RESEND_API_KEY: dummy
          CONTACT_EMAIL_TO: dummy@example.com
      - name: Run Lighthouse CI
        run: |
          pnpm dlx @lhci/cli@0.13.x autorun \
            --collect.startServerCommand="pnpm start" \
            --collect.url="http://localhost:3000/fr" \
            --collect.numberOfRuns=1 \
            --assert.preset="lighthouse:recommended" \
            --assert.assertions.categories:performance="['error', { minScore: 0.85 }]"
```

- [ ] **Step 2: Commit + push to a branch to verify**

```bash
git checkout -b feat/ci
git add .github/workflows/ci.yml
git commit -m "ci: GitHub Actions workflow (prettier, lint, typecheck, vitest, playwright)"
git push -u origin feat/ci
```
Expected: GitHub Actions runs, all jobs green. Merge after green.

---

## Phase 9 — Deploy

### Task 27: Vercel project + custom domain

**Files:** none (Vercel UI / CLI)

- [ ] **Step 1: Verify loustudio.fr availability and register**

Manual prerequisite: WHOIS check on OVH or Gandi, then register `loustudio.fr` (~7€/year). If unavailable, agree on an alternative (e.g. `lou-studio.fr`, `loustudio.com`) and search-replace `loustudio.fr` across the repo.

- [ ] **Step 2: Push repo to GitHub**

```bash
gh repo create loustudio --private --source=. --push
```

- [ ] **Step 3: Import to Vercel**

Manual:
1. https://vercel.com/new → import the GitHub repo
2. Framework preset: Next.js (auto)
3. Root directory: `.`
4. Build command: `pnpm build`
5. Output directory: `.next` (auto)

- [ ] **Step 4: Set environment variables in Vercel**

In Project → Settings → Environment Variables, add for **Production + Preview**:
- `RESEND_API_KEY` — from resend.com dashboard (free tier)
- `CONTACT_EMAIL_TO` — `lou@example.com` (replace with real)

- [ ] **Step 5: Add custom domain**

Project → Settings → Domains → add `loustudio.fr`. Configure DNS at OVH/Gandi:
- `A` record `@` → `76.76.21.21`
- `CNAME` `www` → `cname.vercel-dns.com.`

Wait for verification (≤24h, often minutes).

- [ ] **Step 6: Verify**

Visit https://loustudio.fr — site loads with TLS. Test contact form submit (real email).

- [ ] **Step 7: Enable Vercel Analytics + Speed Insights**

In `app/[locale]/layout.tsx`, add inside `<body>`:
```tsx
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
// ...
<Analytics />
<SpeedInsights />
```

```bash
pnpm add @vercel/analytics @vercel/speed-insights
git add -A
git commit -m "chore: enable Vercel Analytics + Speed Insights"
git push
```

---

### Task 28: Slash commands `/merge-feature` + `/promote-to-prod` adapted

**Files:**
- Create: `.claude/commands/merge-feature.md`, `.claude/commands/promote-to-prod.md`

- [ ] **Step 1: Adapt /merge-feature**

Copy from FreshStock IA repo (`C:\Users\Hugo\Desktop\IA-pour-la-gestion-des-stocks\.claude\commands\merge-feature.md`) and adapt:
- Replace pytest reference with `pnpm test && pnpm test:e2e`
- Base branch `develop` (default), target `main` for `/promote-to-prod`
- Remove FreshStock-specific Railway monitoring; add Vercel deployment polling instead (`vercel ls --token` or skip and rely on the GitHub PR check)

- [ ] **Step 2: Adapt /promote-to-prod**

Same pattern. Verify CI green via `gh pr checks`, run tests locally, then squash-merge `develop → main`.

- [ ] **Step 3: Document in CLAUDE.md**

Create `CLAUDE.md` at the root with project context, branch model, and references to the slash commands.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: adapt /merge-feature + /promote-to-prod slash commands for loustudio"
```

---

## Phase 10 — Polish & launch checklist

### Task 29: Replace placeholder assets

**Files:** `public/images/works/<slug>/...`, `public/videos/works/<slug>/...`, `public/textures/concrete-normal.jpg`, `public/lipstick-fallback.png`

- [ ] **Step 1: Receive real photos + videos from Lou**

10 projects × ~5-10 media each. Optimize:
- Photos → AVIF + JPG fallback via next/image (auto)
- Videos → H.264 720p, max 4 MB each, generate poster (`ffmpeg -i in.mp4 -vframes 1 poster.jpg`)

- [ ] **Step 2: Replace cover-only placeholders**

For each `<slug>` in `content/works/`, copy media files into `public/images/works/<slug>/` and `public/videos/works/<slug>/`. Update `media:` array in MDX.

- [ ] **Step 3: Generate lipstick-fallback.png**

```bash
pnpm dev  # let canvas mount and render idle
# In browser devtools, screenshot the canvas at 800×600
# Save to public/lipstick-fallback.png (replace placeholder)
```

- [ ] **Step 4: Replace concrete-normal.jpg if still placeholder**

Download a real Poly Haven concrete normal map (CC0).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: real photos, videos, fallback PNG, concrete normal map"
```

---

### Task 30: Lighthouse audit + perf tuning

- [ ] **Step 1: Run Lighthouse on production**

```bash
pnpm exec lighthouse https://loustudio.fr/fr --view
pnpm exec lighthouse https://loustudio.fr/fr --preset desktop --view
```

- [ ] **Step 2: Verify thresholds**

- Mobile Perf ≥ 75
- Desktop Perf ≥ 90
- LCP < 2.5s, CLS < 0.1, INP < 200ms

- [ ] **Step 3: If under threshold, common fixes**

- Reduce hero photo dimensions (`sizes="100vw"` + max 2000px source)
- `priority` only on first slide cover
- `dpr={[1, 1.5]}` on mobile (already in spec)
- Lazy-load videos (already done)
- Audit `lipstick-fallback.png` size (≤ 80 KB after optipng)

- [ ] **Step 4: Commit any tuning**

```bash
git add -A
git commit -m "perf: Lighthouse-driven tuning of media sizes and priority hints"
```

---

### Task 31: Final acceptance walkthrough

- [ ] Home FR + EN loads, lipstick draggable, scroll smooth between 10 slides
- [ ] /works/[slug] for each of 10 projects renders with all media
- [ ] Switch FR ↔ EN preserves path
- [ ] Contact form sends an email to `CONTACT_EMAIL_TO`
- [ ] LH Perf desktop ≥ 90, mobile ≥ 75
- [ ] `prefers-reduced-motion` swaps to fallback PNG
- [ ] Site lisible et utilisable sans JS (curl /fr → HTML contains hero text and project titles)
- [ ] Vercel Analytics records the test visit
- [ ] sitemap.xml served at /sitemap.xml, contains 26 URLs
- [ ] hreflang `<link>` tags present in `<head>` for both locales

Mark MVP shipped. Open PR `develop → main` via `/promote-to-prod` for final cut.

---

## Notes pour l'agent d'exécution

- TDD strict pour tout `lib/*` et `app/api/*` (utils + API routes). UI = pas de TDD, vérification visuelle dans le navigateur.
- Frequent commits : un commit par tâche minimum, plus si une tâche dépasse ~10 min de travail réel.
- Les "manual" steps (Vercel UI, DNS, Resend dashboard) sont signalés explicitement — ne pas tenter d'automatiser.
- En cas de blocage sur un step, ouvrir une issue GitHub et passer au step suivant si indépendant.
- Le `LipstickRoot` ne doit JAMAIS être remonté. Si tu vois le canvas re-créer entre les routes, vérifier que c'est bien dans `[locale]/layout.tsx` et pas dans une page.
- La spec (`docs/superpowers/specs/2026-05-10-loustudio-portfolio-design.md`) est la source de vérité — si une décision n'est pas couverte ici, va la chercher là.
