# Install — BONO Design System into bono-training (Next.js)

One-time setup. Run these steps once after copying `.claude/design-system/` into the repo root. Subsequent updates only require pulling the latest `.claude/design-system/` contents.

> Compatible with Next.js 14+ (App Router). For the legacy Vite app, see "Vite fallback" at the bottom.

---

## 0. Prerequisites

- The folder `.claude/design-system/` exists at the repo root, populated from the BONO Design System project.
- Tailwind CSS is installed (or about to be) in the Next.js app.
- The following packages are installed:
  ```sh
  pnpm add tailwindcss postcss autoprefixer
  pnpm add -D @types/node
  ```

---

## 1. Wire up CSS

### 1a. Import the token sheet

In `app/globals.css` (top of the file, before any `@tailwind` directives):

```css
@import "../.claude/design-system/colors_and_type.css";

@tailwind base;
@tailwind components;
@tailwind utilities;
```

> The relative path assumes `app/` is at the repo root. Adjust `../` depth if your `app/` is nested.

### 1b. Make the file resolvable to webpack/turbopack

Next.js's CSS loader handles relative `@import`s automatically — no extra config needed. Verify by running `pnpm dev` and checking that `getComputedStyle(document.body).getPropertyValue('--text-primary')` resolves in DevTools.

---

## 2. Register fonts via `next/font/local`

Create `app/fonts.ts`:

```ts
import localFont from 'next/font/local';
import { M_PLUS_Rounded_1c, Inter, Noto_Sans_JP } from 'next/font/google';

export const lineSeedJP = localFont({
  src: [
    { path: '../.claude/design-system/fonts/LINESeedJP_OTF_Th.otf', weight: '300', style: 'normal' },
    { path: '../.claude/design-system/fonts/LINESeedJP_OTF_Rg.otf', weight: '400', style: 'normal' },
    { path: '../.claude/design-system/fonts/LINESeedJP_OTF_Bd.otf', weight: '700', style: 'normal' },
    { path: '../.claude/design-system/fonts/LINESeedJP_OTF_Eb.otf', weight: '800', style: 'normal' },
  ],
  variable: '--font-line-seed-jp',
  display: 'swap',
});

export const mPlusRounded = M_PLUS_Rounded_1c({
  weight: ['400', '500', '700', '800'],
  subsets: ['latin'],
  variable: '--font-rounded-next',
  display: 'swap',
});

export const inter = Inter({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-inter-next',
  display: 'swap',
});

export const notoSansJP = Noto_Sans_JP({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-noto-sans-jp-next',
  display: 'swap',
});
```

In `app/layout.tsx`:

```tsx
import { lineSeedJP, mPlusRounded, inter, notoSansJP } from './fonts';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ja"
      className={`${lineSeedJP.variable} ${mPlusRounded.variable} ${inter.variable} ${notoSansJP.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

After this, **delete the `@font-face` and Google `@import` lines from `colors_and_type.css`** if and only if every consumer is on Next.js. If the legacy Vite app still consumes the file, leave them — `next/font` takes precedence anyway.

---

## 3. Tailwind config

### Tailwind v4 (Next.js App Router — current)

Tailwind v4 uses `@theme inline` in `globals.css` instead of `tailwind.config.ts`. Reference design-system tokens via `var()`:

```css
@theme inline {
  /* Colors — reference colors_and_type.css variables */
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-surface: var(--bg-surface);
  --color-warm: var(--bg-warm);
  --color-cta-primary-bg: var(--btn-primary-bg);

  /* Fonts — reference next/font CSS variables */
  --font-rounded-mplus: var(--font-mplus-rounded-var), 'M PLUS Rounded 1c', sans-serif;
  --font-display: var(--font-line-seed-jp), 'LINE Seed JP', sans-serif;
  --font-noto-sans-jp: var(--font-noto-sans-jp-var), 'Noto Sans JP', sans-serif;
}
```

This generates utility classes like `text-text-primary`, `bg-surface`, `font-display` etc.

### Tailwind v3 (legacy Vite app — `tailwind.config.ts`)

Replace `tailwind.config.ts` color/font/radius/shadow values with CSS-variable references.

```ts
import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './.claude/design-system/ui_kits/**/*.{jsx,tsx,html}', // for IntelliSense only; not bundled
  ],
  theme: {
    extend: {
      colors: {
        base:           'var(--bg-base)',
        surface:        'var(--bg-surface)',
        warm:           'var(--bg-warm)',
        muted:          'var(--bg-muted)',
        'muted-strong': 'var(--bg-muted-strong)',
        'text-primary':   'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted':     'var(--text-muted)',
        'text-disabled':  'var(--text-disabled)',
        'text-inverse':   'var(--text-inverse)',
        'text-link':      'var(--text-link)',
        'btn-primary':    'var(--btn-primary-bg)',
        'btn-primary-hover': 'var(--btn-primary-bg-hover)',
        'success': 'var(--text-success)',
        'warning': 'var(--text-warning)',
        'error':   'var(--text-error)',
        // ...add more as you expose them in colors_and_type.css
      },
      fontFamily: {
        rounded: ['var(--font-rounded-next)', 'M PLUS Rounded 1c', 'sans-serif'],
        sans:    ['var(--font-inter-next)', 'Inter', 'system-ui', 'sans-serif'],
        'noto-sans-jp': ['var(--font-noto-sans-jp-next)', 'Noto Sans JP', 'sans-serif'],
        'line-seed-jp': ['var(--font-line-seed-jp)', 'LINE Seed JP', 'sans-serif'],
        display: ['var(--font-line-seed-jp)', 'LINE Seed JP', 'sans-serif'],
      },
      borderRadius: {
        btn:        'var(--radius-btn)',     // 14px
        pill:       'var(--radius-pill)',    // 200px
        'sm-card':  'var(--radius-sm-card)', // 20px
        'md-card':  'var(--radius-md-card)', // 32px
        'lg-card':  'var(--radius-lg-card)', // 48px
        'xl-card':  'var(--radius-xl-card)', // 64px
      },
      boxShadow: {
        cta:    'var(--shadow-cta)',
        card:   'var(--shadow-card)',
        raised: 'var(--shadow-raised)',
      },
      backgroundImage: {
        'roadmap-career':       'var(--gradient-roadmap-career)',
        'roadmap-ui-beginner':  'var(--gradient-roadmap-ui-beginner)',
        'roadmap-ui-visual':    'var(--gradient-roadmap-ui-visual)',
        'roadmap-info-arch':    'var(--gradient-roadmap-info-arch)',
        'roadmap-ux-design':    'var(--gradient-roadmap-ux-design)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
```

**Important**: any existing literal hex values in `tailwind.config.ts` must be deleted — keep the file as references only.

---

## 4. Wire `CLAUDE.md` to read the skill

At the repo root, create or update `CLAUDE.md`:

```md
## Design system

Before adding, editing, or migrating any UI in this repo, **read `.claude/design-system/SKILL.md`**. It is the canonical instruction set for color, type, radii, shadows, components, and the Next.js usage rules.

Key rules (summary — full version in SKILL.md):
- All color/type/radius/shadow values must resolve to a CSS variable defined in `.claude/design-system/colors_and_type.css`.
- No raw hex/rgb in JSX. No arbitrary Tailwind values like `bg-[#102720]` when a token exists.
- Use `next/link`, `next/image`, `next/font` — never `react-router` Link or raw `<img>` for assets.
- Reference `ui_kits/marketing-top/` and `ui_kits/training/` before writing new UI from scratch.
```

---

## 5. Move legacy global CSS

If `src/index.css` (Vite era) still defines duplicate color/font tokens, **delete those duplicate blocks** so the only source of truth is `colors_and_type.css`. Keep app-specific styles (animations, third-party overrides) in `app/globals.css`.

Search for stragglers:

```sh
rg -n "(--bg-|--text-|--btn-|--radius-|--shadow-|--gradient-roadmap-)" src app
```

Each match outside `colors_and_type.css` is a leak — delete and rely on the imported sheet.

---

## 6. Verify

```sh
pnpm dev
```

In a sample page:

```tsx
export default function SmokeTest() {
  return (
    <main className="min-h-screen bg-base text-text-primary font-noto-sans-jp p-8">
      <h1 className="font-rounded text-3xl font-extrabold">タイポ確認</h1>
      <button className="mt-6 inline-flex h-14 items-center rounded-btn bg-btn-primary px-6 text-white text-sm font-bold shadow-cta">
        Primary CTA
      </button>
    </main>
  );
}
```

Expected:
- Background `#F9F9F7` (warm off-white)
- Heading in M PLUS Rounded 1c, 800 weight
- CTA `#102720` fill, 14px radius, soft shadow

If anything is off, check:
1. `colors_and_type.css` is being loaded (DevTools → Computed → `--bg-base`)
2. `next/font` variables are on `<html>`
3. `tailwind.config.ts` references the right variable names

---

## 7. (Optional) Symlink for cross-repo dev

If you maintain the design system in a separate repo:

```sh
# from bono-training/
rm -rf .claude/design-system
ln -s ../../path/to/bono-design-system .claude/design-system
```

Then `git update-index --skip-worktree .claude/design-system` so Git ignores local symlink swaps. Keep one canonical copy on `main`.

---

## Vite fallback

If you are still on Vite during migration:

- Import in `src/index.css`: `@import "../.claude/design-system/colors_and_type.css";`
- Keep the `@font-face` block in `colors_and_type.css` (Vite has no `next/font`)
- Tailwind config is identical to §3 above
- Replace `next/link` references in `SKILL.md` with `react-router-dom`'s `Link` for the time being

When Next.js migration completes, remove the Vite-only paths.

---

## Updating the system later

```sh
# from bono-training/
cd .claude/design-system
# pull / replace / git add the changed files
# bump version in README.md
git add -A && git commit -m "ds: <change summary>"
```

PR checklist:
- [ ] Updated or added a `preview/*.html` card if a token changed
- [ ] Updated `SKILL.md` token table if a name changed
- [ ] Bumped version in `README.md`
- [ ] No app-side changes required (the system absorbed the change)
