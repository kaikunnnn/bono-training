# BONO Design System

BONO (ビーノ) is a **design training service** from Japan. Users are aspiring
designers with no prior experience, plus junior designers already working in the
field. The product delivers video courses organized into **skill roadmaps** and
**challenge-style training assignments** ("お題") — the goal is not just
tutorial completion, but getting learners to build genuinely interesting
products that break past the design-by-the-book mindset.

**Tagline (from the top page):**
> ワクワクするものつくるために体系的にスキルフルになろう
> (Let's get systematically skillful so we can make exciting things.)

**Subheadline:**
> ユーザー価値から考えてデザインするスキルを身につける人のためのトレーニングサービスです
> (A training service for people building the skill to design from user value.)

## Product surfaces

BONO Training is a single product with several distinct surfaces. The UI kit
reflects the two biggest ones:

| Surface                 | Purpose                                                       |
| ----------------------- | ------------------------------------------------------------- |
| **Marketing Top (`/top`)**  | Public landing — hero, roadmap cards, goal-nav, training grid |
| **Training (`/training`)**  | Logged-in learner — training lesson detail, quest list, tasks |
| Roadmap (`/roadmaps/:slug`) | One roadmap and its ordered lessons                           |
| Lesson detail              | Video player + task list + AI chat sidebar                     |
| Blog / guide / account     | Secondary content surfaces                                     |

## Sources (read-only, mounted codebase)

All visual and type decisions in this system trace back to the `bono-training`
repo the user attached via the Import menu (Lovable project
`2c82edfd-7abe-4c05-aead-23c33ce3ad78`, Vite + React + TypeScript + Tailwind +
shadcn-ui).

Key files read:
- `tailwind.config.ts` — color tokens, font stacks, shadows, radii, safelist for
  the roadmap gradient presets.
- `src/index.css` — the canonical CSS variable set (`--bg-base`,
  `--text-primary`, `--training-gradient-*`, etc.) and global font loading.
- `src/components/top/*` — `TopHeroSection`, `TrainingCard`, `GoalButton`,
  `GoalNavSection`, `PartnerBanner`, `ContentCard`.
- `src/components/training/*` — `TrainingHero`, `TrainingCard`, `LessonCard`,
  `TaskHeader`, `SectionHeading`, `ChallengeMeritSection`.
- `src/components/layout/*` — `Header`, `Footer`, `Layout`.
- `src/components/ui/button.tsx` — shadcn button variants (`action-secondary`,
  `action-tertiary`, sizes `large` / `medium` / `small`).
- `public/images/`, `public/assets/`, `public/shapes/` — logos, 3D goal
  emoji, hand-drawn SVG emoji, roadmap hero wave masks, avatar SVGs.

## Content fundamentals

BONO's copy is warm, casual-but-direct Japanese, written person-to-person by the
founder rather than a marketing team.

- **Language:** primarily Japanese. Small bursts of stylized English
  (`NEW!`, `BONO`, `UIUX`, `UIビジュアル`) used as typographic accents,
  not running copy.
- **Tone:** encouraging, slightly playful, slightly teacher-like. Calls to
  action talk to the user like a friend ("はじめ方を見る",
  "レッスン内容へ", "トレーニングを見る").
- **Casing:** Latin words stay as proper nouns ("Figma", "BONO", "UIUX"). All-
  caps is reserved for tiny labels like `NEW!` in pills.
- **Pronouns:** neither "私" nor "you/あなた" heavy. Copy addresses the
  reader via verb form — "〜しよう", "〜になろう", "〜を見る" — which reads
  as shared invitation rather than instruction.
- **Emoji:** yes, used *lightly* as sentence punctuation, e.g.
  `各コースで身につけたことをアウトプットするお題を並べています🙋`. The brand
  *also* ships its own **hand-drawn black-outline SVG emoji set** (see
  `assets/emoji/`) that replaces Unicode in key spots like section headers.
- **Vibe in one line:** "筋トレ" meets design school. Real vocabulary from the
  product: 筋トレ部位 (muscle-training area), 難易度 (difficulty), ロードマップ
  (roadmap), お題 (assignment), チャレンジ (challenge), クエスト (quest).
- **Never:** corporate-speak, bullet-heavy marketing, exclamation-heavy hype.

**Example voice samples (from the actual product):**
- `トレーニング。それは"可能性"をひらく扉。`
- `ワクワクするものつくるために\n体系的にスキルフルになろう`
- `目的に合わせたロードマップでデザインの楽しさを探究しよう`
- `各コースで身につけたことをアウトプットするお題を並べています🙋`

## Visual foundations

- **Color vibe:** warm off-white (`#F9F9F7`) app background, with a single
  deep-forest primary (`#102720`) for CTAs. Surfaces are near-white; tinted
  pastel gradients (blue-lavender, peach, mint, lilac) provide color only on
  hero sections and roadmap cards.
- **Typography:** Japanese headings use **M PLUS Rounded 1c** — the round,
  slightly playful body — at 700/800. Latin body + metadata use **Inter**.
  `Luckiest Guy` and `DotGothic16` appear as display accents. LINE Seed JP is
  provided as an alternative geometric-rounded face.
- **Backgrounds:** NOT gradient-by-default. The app is flat off-white. Hero
  areas receive a soft top-down gradient (`#E0E5F8 → #FAF4F0 → transparent`).
  Roadmap cards get saturated linear gradients (see `gradients` presets).
  Full-bleed photo imagery is rare; illustrations and 3D emoji do the heavy
  lifting instead.
- **Hand-drawn motifs:** the SVG emoji set (`assets/emoji/`) uses thick
  black strokes with a slightly wobbly, marker-drawn quality. Avatar SVGs
  follow the same language.
- **Animation:** calm. `fade-in` is `0.6s ease-out`; roadmap gradients slide
  in over `1.2s–2.0s cubic-bezier(0.215, 0.61, 0.355, 1)`. Cards lift on
  hover via `transform: scale(1.02)` over `0.3s–0.6s` with a spring curve
  (`cubic-bezier(0.34, 1.56, 0.64, 1)` for training cards).
- **Hover states:** primary buttons darken one step (`#102720 → #1A3A30`).
  Outline buttons pick up a very light gray fill (`#F5F5F5`). Cards lift
  and shadow-bloom (`shadow-sm → shadow-lift`).
- **Press states:** no explicit scale-down — press is handled by the
  background step (`active:bg-[rgba(229,229,228,1)]` on secondary).
- **Borders:** thin, warm-gray. `--border-light #D4D6CC`, `--border-default
  #C3C5BB`, `--border-strong #A8AAA0`. On dark CTAs the border disappears.
  Some marketing cards use a 2px `#374151` contour instead.
- **Corner radii:** the signature is *generously rounded*. Pills
  (`border-radius: 200px`) for nav buttons. Cards at 24–32px. Only the
  smallest elements (badges, inputs) sit at 8–12px. Big roadmap cards use a
  `320px 320px 32px 32px` arch on the top.
- **Shadows:** always soft, always low-opacity. `0 4px 20px rgba(0,0,0,0.08)`
  is the default card shadow. CTAs carry a sharper `0 4px 4px rgba(0,0,0,0.25)`
  drop.
- **Transparency / blur:** used in training cards — a blurred `filter: blur(8.89px)`
  copy of the thumbnail sits behind the main image. Hero gradients use alpha
  to fade into the base background.
- **Layout rules:** 2rem container padding; breakpoints `sm 640 / md 768 /
  lg 1024 / xl 1280 / 2xl 1400`. Content maxes around 1148–1400px. Sticky
  top header at 64px height; everything below breathes with generous
  vertical rhythm.
- **Imagery vibe:** warm, slightly faded pastels. Photos are rare; when they
  appear they're thumbnailed into cards with blur-backdrops.
- **Cards:** white surface, rounded-[24px]/[32px], thin border OR soft shadow
  (rarely both). Meta tags are pill-shaped, 10px bold text in a muted gray
  bg (`#F1F5F9`).

## Iconography

BONO uses a *mix* of four icon systems:

1. **Lucide React** (`lucide-react`) — the default workhorse for UI icons
   (Menu, Briefcase, chevrons, etc). Stroke-based, consistent weight. This
   system is CDN-available; the UI kit links it via
   `https://unpkg.com/lucide-static@latest/font/lucide.css` for non-React
   surfaces. No substitution flag needed.
2. **Hand-drawn SVG emoji** (`assets/emoji/*.svg`) — a small custom set
   (book, building, check, circus, coffee, dancer, home, muscle, parent,
   watch, wolf) drawn with thick black strokes. Used in section headings and
   decorative callouts. These **must be used as-is** — do not redraw them.
3. **3D rendered emoji PNGs** (`assets/goal-buttons/*.png`) — Microsoft
   Fluent Emoji 3D-style renders (flying-saucer, joystick, magic-wand,
   parachute) used only inside the top "goal" pill buttons. Copied from the
   codebase.
4. **Unicode emoji sprinkled in copy** — `🙋`, `✨`, `🔥` used for *tone*,
   one per paragraph at most.

**Never:** invent new SVG icons, use a third icon set (Heroicons /
Phosphor / FontAwesome), or replace hand-drawn emoji with Unicode.

**Logo:** `assets/bono-logo.svg` — wordmark. Use at small sizes only
(header: ~24px height). `assets/bono-logo.png` is the raster fallback.

## Font substitution note

No substitution required for the *runtime* stack — M PLUS Rounded 1c, Inter,
Noto Sans JP, DotGothic16 and Luckiest Guy are all on Google Fonts and are
loaded via `colors_and_type.css`. The four `LINESeedJP_OTF_*.otf` files you
uploaded are registered under the family `"LINE Seed JP"` for use as an
alternative display face — I did **not** swap it in for the product-defined
stack. Let me know if you'd like LINE Seed JP promoted to primary.

## Index — what lives in this project

```
README.md                  — this file
SKILL.md                   — Agent Skill manifest (user-invocable)
colors_and_type.css        — all CSS variables + semantic type classes

assets/
  bono-logo.svg | .png     — wordmark
  favicon.ico | favicon-dev.svg | og-default.svg
  emoji/*.svg              — hand-drawn brand emoji set
  goal-buttons/*.png       — 3D Fluent emoji used in goal pills
  avatars/avatar-01..07.svg — illustrated user avatars
  training-cards/*.png     — hero thumbnails for roadmap training cards
  shapes/*.svg             — roadmap hero wave mask + card thumbnail wave
  textures/noise.svg       — subtle grain overlay
  roadmap-hero-bg.png      — full-bleed roadmap hero background
  left-arrow.svg           — generic back arrow

fonts/
  LINESeedJP_OTF_{Th,Rg,Bd,Eb}.otf — LINE Seed JP (user-provided)

preview/                   — Design System tab cards
ui_kits/
  marketing-top/           — public landing UI kit (hero, cards, goals, footer)
  training/                — logged-in learner UI kit (lesson detail, quests)
```

## How to use

- Reference tokens from `colors_and_type.css` — never hardcode hex values.
- Pull components and patterns from the relevant UI kit under `ui_kits/`.
- Copy assets out of `assets/` into your artifact rather than hot-linking.
- For Japanese headings, pick `var(--font-rounded)`. For Latin body, Inter.
- Keep radii generous (24–32px on cards, pills on nav).
- Primary CTA = solid `#102720` on white; secondary = outline `#0F172A`.
