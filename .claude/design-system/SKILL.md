# BONO Design System — Skill (for Claude Code)

This file is the canonical instruction set for **Claude Code** when adding, editing, or migrating UI in the bono-training codebase. Read this file before touching any UI.

---

## Where this system lives

```
.claude/design-system/
├── SKILL.md                  ← you are reading this
├── INSTALL.md                ← one-time setup steps
├── README.md                 ← human-readable overview
├── colors_and_type.css       ← source of truth for tokens
├── assets/
│   ├── bono-logo.svg / .png
│   ├── favicon-dev.svg
│   └── emoji/                ← hand-drawn 3D emoji set
├── fonts/                    ← LINE Seed JP (.otf, all weights)
├── preview/                  ← visual reference cards (HTML, do not import)
└── ui_kits/
    ├── marketing-top/        ← /top page kit (Hero, GoalButtons, TrainingCards, GoalSection)
    └── training/             ← lesson/training detail kit
```

`preview/*.html` are **documentation only** — never import them into the app.
`ui_kits/*.jsx` are **reference code** — copy into the app and adapt; do not import directly.

---

## The single rule

> **All colors, type, radii, shadows, and spacing in product code must resolve to a token defined in `colors_and_type.css`. No raw hex, rgb, or px values for these properties in components.**

If a value you need is missing from the tokens, add it to `colors_and_type.css` first, then use it. Do not bypass.

---

## Setup expectations

The host app is **Next.js (App Router)**. The system also works for the legacy Vite/CRA app during migration. See `INSTALL.md` for the one-time setup. After setup the following is true:

- `app/globals.css` imports `.claude/design-system/colors_and_type.css`
- LINE Seed JP is registered via `next/font/local` from `.claude/design-system/fonts/`
- `tailwind.config.ts` color/font/radius/shadow tokens reference CSS variables (`var(--text-primary)`, etc.) — **never hex**
- `CLAUDE.md` at the repo root tells Claude Code to read this file before UI work

---

## How to use the system

### 1. Pick the right token, every time

| You want… | Use this token | Tailwind class |
|---|---|---|
| App background | `--bg-base` | `bg-base` |
| Card surface | `--bg-surface` | `bg-surface` |
| Primary text | `--text-primary` | `text-text-primary` |
| Muted text | `--text-muted` | `text-text-muted` |
| Primary CTA fill | `--btn-primary-bg` (`#102720`) | `bg-btn-primary` |
| Outlined CTA stroke | `--text-primary` | `border-text-primary` |
| Heading font (JP) | `--font-rounded` | `font-rounded` |
| Body font (JP) | `--font-sans-jp` | `font-noto-sans-jp` |
| Display font (Latin) | `--font-display` (LINE Seed JP) | `font-display` |
| Card radius (md) | `--radius-md` (`32px`) | `rounded-md-card` |
| Card radius (xl) | `--radius-xl` (`64px`) | `rounded-xl-card` |
| Button radius | `--radius-btn` (`14px`) | `rounded-btn` |
| Pill (goal buttons) | `--radius-pill` (`200px`) | `rounded-pill` |

(See `colors_and_type.css` for the full list.)

### 2. Look at the kit before writing new UI

Before writing a hero, CTA, card, badge, or section header from scratch, check:

- `ui_kits/marketing-top/index.html` for `/top`-style marketing surfaces
- `ui_kits/training/` for training/lesson surfaces
- `preview/buttons.html`, `preview/cards.html`, `preview/badges.html` for atom-level reference

If a matching pattern exists, **copy it and adapt**. Do not invent a new variant.

### 3. Canonical button shapes (committed to memory)

| Variant | Height | Radius | Fill | Text |
|---|---|---|---|---|
| Primary CTA (large) | `h-14` (56px) | `rounded-[14px]` | `#102720` | `#fff` |
| Primary CTA (small) | `h-12` (48px) | `rounded-[14px]` | `#081C17` | `#fff` |
| Secondary outlined | `h-14` | `rounded-[14px]` | transparent | `#0F172A` + `border-2` |
| On-dark primary | `h-12` | `rounded-[14px]` | `#fff` | `#081C17` |
| On-dark secondary | `h-12` | `rounded-[14px]` | transparent | `#fff` + `inset 0 0 0 1px #fff` |
| Goal button (pill) | `h-[117px]` | `rounded-[200px]` | `bg-surface` | per content |

The legacy `rounded-full` PrimaryButton component is **deprecated** — do not propagate it.

### 4. Canonical card radii

- Outer marketing cards (Goal Section): `rounded-[64px]` lg / `48px` sm / `32px` mobile
- Goal-section content blocks (`bg-[rgba(70,87,83,0.04)]`): `rounded-[40px]` / `32px` / `24px`
- Training cards: `rounded-[32px]` lg / `28px` mobile
- RoadmapCardV2 outer: `rounded-[64px]` lg with 2.5px white padding ring
- Inner thumbnail in roadmap card: `rounded-[30px]` lg / `22px` md / `16px` sm
- Standard content surfaces (article, lesson): `rounded-[20px]`

### 5. Roadmap gradients (use the preset, never improvise)

There are **5 canonical roadmap gradients** in `colors_and_type.css` (`--gradient-roadmap-*`). Each maps to a slug:

| Slug | Token |
|---|---|
| `uiux-career-change` | `--gradient-roadmap-career` |
| `ui-beginner` | `--gradient-roadmap-ui-beginner` |
| `ui-visual` | `--gradient-roadmap-ui-visual` |
| `information-architecture` | `--gradient-roadmap-info-arch` |
| `ux-design-basic` | `--gradient-roadmap-ux-design` |

When rendering a roadmap detail hero or card with `variant="gradient"`, resolve the gradient by slug. **Never hard-code a gradient inline.**

### 6. Iconography

- Hand-drawn 3D emoji live in `assets/emoji/`. They are **PNG-baked SVGs** (one per file). Always use them via a path, never inline base64 in components.
- Goal buttons use Fluent 3D emoji at `/images/goal-buttons/*_3d.png`. Match the `goalFluentIcons` mapping.
- Lucide icons are allowed for utility (chevrons, checkmarks, close). Stroke width `2.5` for primary CTAs.

---

## Next.js-specific rules

### Server vs Client Components

UI kit files in `ui_kits/` are written as plain JSX. When copying into the app:

- **Server Component (default)**: static marketing UI (Hero copy, GoalSection layout, training card chrome). Strip any `useState` / `useEffect` / `motion.*` and convert to plain elements.
- **Client Component (`'use client'`)**: anything with state, scroll listeners, framer-motion, click handlers that don't navigate, or `localStorage`. The TopPageNew Hero's intro animation belongs here — split it into a small Client wrapper around an otherwise-Server tree.

**Pattern**: keep the page Server, push interactivity to the smallest leaf Client component.

### Imports & assets

| Concern | Use |
|---|---|
| `<a href="...">` internal | `import Link from 'next/link'` |
| `<img src="...">` | `import Image from 'next/image'` (always pass `alt`, `width`, `height` or `fill`) |
| Local fonts | `next/font/local` from `.claude/design-system/fonts/`. Do **not** add a `@font-face` block in CSS. |
| Google Fonts | `next/font/google` for M PLUS Rounded 1c, Inter, Noto Sans JP. The `@import` line in `colors_and_type.css` is a fallback for non-Next environments — leave it; `next/font` takes precedence in Next. |
| Sanity fetches | Server Components with `client.fetch(...)`. No `useRoadmaps`/`useLessons` hooks in Server trees. |
| react-router `<Link>` | Replace with `next/link` `<Link>`. The `to=` prop becomes `href=`. |

### Tailwind config

`tailwind.config.ts` must reference CSS variables, not literals:

```ts
// good
colors: { 'text-primary': 'var(--text-primary)' }
// bad
colors: { 'text-primary': '#021710' }
```

This keeps the design system as the single source of truth and lets us flip themes later.

---

## Workflow for Claude Code

When asked to build or migrate a screen:

1. **Read this file** (`.claude/design-system/SKILL.md`) and `INSTALL.md` if setup is unclear.
2. **Open the relevant UI kit** (`ui_kits/marketing-top/index.html` or `ui_kits/training/`). Identify the closest existing pattern.
3. **Open the relevant preview cards** to confirm token usage (e.g. `preview/buttons.html` before placing a CTA).
4. **Decide Server vs Client** for each component you produce.
5. **Write the component** using token-backed Tailwind classes only. No raw hex/rgb/px for color/type/radius/shadow.
6. **If a token is missing**, add it to `colors_and_type.css` (and to `tailwind.config.ts` if it needs a Tailwind alias), then use it.
7. **Self-check**:
   - [ ] No raw hex/rgb in JSX (`grep -nE '#[0-9a-f]{3,8}|rgb\(' src/**/*.{tsx,ts,css}` should return nothing new)
   - [ ] No `react-router` imports left in migrated files
   - [ ] No `<img>` for static assets — use `next/image`
   - [ ] Buttons match the canonical shape table above
   - [ ] Radii match the canonical card radii table above

---

## Updating the design system

The system itself can be edited directly via Claude Code. Rules:

- **Adding a token**: edit `colors_and_type.css` → add to `tailwind.config.ts` if needed → update or add a `preview/*.html` card → update the table in this file.
- **Adding a UI kit pattern**: add to `ui_kits/<kit>/` with a sibling note in the kit's README. Reference it from this file's "kit before writing" section.
- **Deprecating a pattern**: mark it `@deprecated` in the kit file with a one-line replacement note. Do not delete immediately — give consumers a migration window.
- **Versioning**: bump the version line at the top of `README.md`. Use semver: minor for additions, major for breaking token renames.
- **Commits**: prefix with `ds:` (e.g. `ds: add danger-strong color token`). PR description must list affected tokens and a screenshot of the updated preview card.

---

## Anti-patterns (do not do these)

- Inline `style={{ color: '#021710' }}` — use the token.
- `bg-[#102720]` Tailwind arbitrary values when a token exists — use `bg-btn-primary`.
- Importing from `ui_kits/` directly — copy into the app instead.
- Adding a new gradient inline on a roadmap card — extend `--gradient-roadmap-*` and reference by slug.
- Inventing a 7th button shape — extend the table in §3 above and add a preview.
- Using `react-router` `Link` in any migrated file — `next/link` only.
- Using emoji as text glyphs (e.g. `🎯`) when the design calls for hand-drawn 3D — use the asset from `assets/emoji/` or `/images/goal-buttons/*`.
- Hardcoding LINE Seed JP via `@font-face` in app code — use `next/font/local` once, in `app/fonts.ts`.

---

## Quick reference — common tasks

**"Add a new marketing CTA"**
→ `preview/buttons.html` → primary or secondary → copy class names → token-backed.

**"Build a new training detail page"**
→ `ui_kits/training/` → identify which sections you need → Server Component shell, Client islands for tabs/accordions.

**"Add a new roadmap"**
→ Pick or add a `--gradient-roadmap-*` → wire slug → use `RoadmapCardV2` with `variant="gradient"`.

**"Theme tweak (color shift)"**
→ Edit `colors_and_type.css` only. No code changes elsewhere should be required. If they are, the consumer was bypassing the system — fix that consumer.
