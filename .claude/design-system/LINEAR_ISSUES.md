# Linear Issue Templates — Design System Integration

Copy-paste these into Linear. They are written to be **directly executable by Claude Code** without ambiguity.

There are **5 issues**, designed to ship in order. Issues 1–3 are blocking (must be done before per-screen migration). Issues 4–5 run in parallel with screen migration.

Suggested labels: `design-system`, `nextjs-migration`, `claude-code`
Suggested project: your existing Next.js migration project

---

# Issue 1 — `[DS-1]` Install BONO Design System into the Next.js repo

## Why
Establish the design system as the single source of truth for color/type/radii/shadows **before** any screen migration starts. Doing this first prevents per-screen rework later.

## Outcome
A consumer can write `bg-base text-text-primary font-rounded rounded-btn bg-btn-primary` in any component and get the correct visual values, with fonts loaded via `next/font`, with no hard-coded hex anywhere new.

## Pre-reqs
- The Next.js migration repo exists with at least `app/layout.tsx`, `app/globals.css`, `tailwind.config.ts`.
- The folder `.claude/design-system/` from the BONO Design System project has been copied to the repo root (full contents — `SKILL.md`, `INSTALL.md`, `colors_and_type.css`, `assets/`, `fonts/`, `preview/`, `ui_kits/`).

## One-time human setup (do this before assigning to Claude Code — 5 min)
1. Download the BONO Design System project ZIP (from the design system project's download card).
2. From the repo root: `mkdir -p .claude && unzip ~/Downloads/bono-design-system.zip -d .claude/design-system`
3. `git add .claude/design-system && git commit -m "ds: bootstrap design system v1.0" && git push`
4. Verify `.claude/design-system/SKILL.md` exists on `main`. **All subsequent work in this issue and beyond runs entirely in Claude Code.**

## Tasks (Claude Code: do these in order)

1. **Verify the system is present.** Run `ls .claude/design-system` and confirm `SKILL.md`, `INSTALL.md`, `colors_and_type.css`, `fonts/`, `assets/`, `ui_kits/`, `preview/` all exist. If any are missing, stop and post a comment listing what is missing.

2. **Read** `.claude/design-system/SKILL.md` and `.claude/design-system/INSTALL.md` end-to-end.

3. **Wire CSS.** In `app/globals.css`, add at the very top (before `@tailwind` directives):
   ```css
   @import "../.claude/design-system/colors_and_type.css";
   ```
   Adjust the relative path if `app/` is nested deeper.

4. **Register fonts.** Create `app/fonts.ts` exactly as specified in `INSTALL.md` §2. Update `app/layout.tsx` to attach all four font CSS variables to `<html>`.

5. **Tailwind config.** Replace color/font/radius/shadow/backgroundImage values in `tailwind.config.ts` with the CSS-variable references from `INSTALL.md` §3. **Delete every literal hex value** from the file. Add `'./.claude/design-system/ui_kits/**/*.{jsx,tsx,html}'` to `content` for IntelliSense.

6. **CLAUDE.md.** Append (or create) the design system block from `INSTALL.md` §4 to the repo-root `CLAUDE.md`.

7. **Smoke test page.** Create `app/_smoke/design-system/page.tsx` with the snippet from `INSTALL.md` §6 plus:
   - 5 buttons covering primary / primary-sm / secondary / on-dark-primary / on-dark-secondary using token classes only
   - 3 headings at `font-rounded` 800 / 700 / 500
   - 5 colored swatches (`bg-base`, `bg-surface`, `bg-warm`, `bg-muted`, `bg-btn-primary`)
   - 5 roadmap gradient swatches using `bg-roadmap-career`, `bg-roadmap-ui-beginner`, etc.
   Take a screenshot at `1440×900` viewport and attach to the PR.

8. **Run the leak check.** Execute:
   ```sh
   rg -nE "(--bg-|--text-|--btn-|--radius-|--shadow-|--gradient-roadmap-)" app components
   ```
   Every match outside `app/globals.css` (which only imports the sheet) is a leak. Delete duplicates.

## Done criteria
- [ ] `pnpm dev` starts without warnings about missing CSS variables or fonts.
- [ ] Smoke page renders correctly (CTA `#102720`, heading rounded geometric, app bg `#F9F9F7`).
- [ ] DevTools Computed shows `--text-primary: #021710` on `<body>`.
- [ ] `tailwind.config.ts` contains zero hex literals for color/font/radius/shadow tokens.
- [ ] CLAUDE.md references `.claude/design-system/SKILL.md`.
- [ ] PR includes the smoke page screenshot.

## Out of scope
Migrating real screens. That is `[DS-4]` and beyond.

---

# Issue 2 — `[DS-2]` Migrate fonts to `next/font/local` and remove `@font-face` from app code

## Why
`@font-face` in app code blocks `next/font`'s automatic optimization (preload, CLS prevention, subset). After `[DS-1]` we have both routes; this issue removes the duplicate.

## Pre-reqs
`[DS-1]` is merged.

## Tasks
1. Search the repo for any `@font-face` blocks inside `app/` or `components/` (not inside `.claude/design-system/`):
   ```sh
   rg -n "@font-face" app components
   ```
2. Delete each. The `next/font/local` registration in `app/fonts.ts` covers all four LINE Seed JP weights.
3. Search for any `<link rel="stylesheet" href="https://fonts.googleapis.com/...">` in `app/layout.tsx` or any `<head>` and remove. `next/font/google` from `app/fonts.ts` covers M PLUS Rounded 1c, Inter, Noto Sans JP.
4. **Do not touch** `.claude/design-system/colors_and_type.css` — its `@font-face` and `@import` lines remain so the file still works in non-Next contexts (Vite, Storybook, the design-system project itself). `next/font` overrides them at runtime.
5. Verify in DevTools → Network: only `next/font` font requests appear; no `fonts.googleapis.com` or `.otf` requests from app code.

## Done criteria
- [ ] No `@font-face` in `app/` or `components/`.
- [ ] No external Google Fonts `<link>` tags in any layout.
- [ ] Network panel shows fonts served from `/_next/static/media/`.
- [ ] Lighthouse "Avoid font display: optional" warning gone; no CLS from fonts.

---

# Issue 3 — `[DS-3]` Replace `react-router` with `next/link` in design-system-touching code

## Why
The Vite app uses `react-router-dom`'s `<Link>`. The Next.js app must use `next/link`. Mixed imports cause runtime errors and TypeScript noise.

## Pre-reqs
`[DS-1]` is merged.

## Tasks
1. Find every `react-router-dom` import in the **Next.js app folder** (not the legacy Vite source if it still exists in a sibling folder):
   ```sh
   rg -n "from 'react-router-dom'" app components
   ```
2. For each match:
   - `import { Link } from 'react-router-dom'` → `import Link from 'next/link'`
   - `<Link to="...">` → `<Link href="...">`
   - `useNavigate()` → `useRouter()` from `next/navigation` (must be inside a `'use client'` component)
   - `useLocation()` → `usePathname()` / `useSearchParams()` from `next/navigation`
3. Remove `react-router-dom` from `package.json` once the Next.js app no longer references it. **Only remove if** the legacy Vite code is fully decommissioned or in a separate repo.

## Done criteria
- [ ] `rg -n "react-router" app components` returns zero results.
- [ ] All internal links work (manually click 5 random ones).
- [ ] Build succeeds with no TS errors.

---

# Issue 4 — `[DS-4]` Migrate `/top` (TopPageNew) to Next.js using the marketing-top UI kit

## Why
`/top` is the highest-traffic marketing surface and the canonical reference for our marketing aesthetic. Doing it first proves the design system end-to-end and gives us a reference implementation for all future marketing pages.

## Pre-reqs
`[DS-1]`, `[DS-2]`, `[DS-3]` merged.

## Reference materials
- Source: `bono-training/src/pages/dev/TopPageNew.tsx` (Vite-era implementation, 844 lines)
- Design kit: `.claude/design-system/ui_kits/marketing-top/index.html`
- Component references: `bono-training/src/components/top/{TopHeroSection,TrainingCard,GoalButton,GoalSection,ContentCard}.tsx`
- Roadmap card: `bono-training/src/components/roadmap/RoadmapCardV2.tsx`

## Tasks

### Setup
1. Create route `app/top/page.tsx` (Server Component).
2. Create `app/top/_components/` for page-local pieces.

### Section-by-section

**Hero (Server + small Client island for entry animation)**
- Static markup is Server. Wrap the framer-motion scaling-fade-in into `app/top/_components/HeroAnimateIn.tsx` with `'use client'`.
- NEW badge: copy structure from `TopPageNew.tsx` `NewBadge`. Use token classes; no inline hex.
- Headings: `font-line-seed-jp` for the main copy (size as in source: `text-[40px] sm:text-[56px]`, weight 700). Subcopy: `font-noto-sans-jp` `text-base sm:text-xl`.
- CTA buttons: use the canonical primary/secondary from `SKILL.md` §3 — `rounded-btn` + `bg-btn-primary` + `shadow-cta` for primary; `border-2 border-text-primary` for secondary.

**Training cards horizontal scroll (Client)**
- File: `app/top/_components/TrainingCardScroller.tsx` `'use client'`.
- Carry over the scroll/center logic from `TopPageNew.tsx` (`scrollContainerRef`, `isScrolledLeft`, `shouldCenterCards`).
- Card data: copy `TRAINING_CARDS_DATA` from `bono-training/src/components/top/TrainingCard.tsx` to `app/top/_components/trainingCardsData.ts`. **Do not change values.** Background colors and category colors stay literal here because they are *content data*, not design tokens.
- Eyecatch images: copy the four `*Eyecatch.tsx` files into `app/top/_components/eyecatch/`. Replace `<img src="/images/...">` with `<Image>` from `next/image`. Add `width`, `height`, `alt`. Mark each `'use client'` only if it has hover state.

**Partnership strip (Server)**
- Direct port. Use `<Image>` for the GMO logo with explicit `width={149} height={61}`.

**Goal Selection (Server + Client GoalButtons)**
- Outer card: `bg-surface` `rounded-xl-card` `lg:rounded-xl-card sm:rounded-lg-card rounded-md-card`.
- `GoalButton` component → `app/top/_components/GoalButton.tsx`. The button uses `rounded-pill` (`200px`) and `bg-surface border border-black/12`. Anchor-link click handler → `'use client'`.
- `GOAL_BUTTONS_DATA` and `goalFluentIcons` map carry over verbatim. Icons live at `public/images/goal-buttons/*_3d.png` — copy from `bono-training/public/images/goal-buttons/`.

**Goal sections (career / ux / ui)** (Server)
- Each section: `bg-[rgba(70,87,83,0.04)] rounded-md-card sm:rounded-md-card lg:rounded-lg-card pt-6 pb-6` (consider exposing this background as `--bg-section-soft` token if used elsewhere).
- `GoalSectionHeader` → `app/top/_components/GoalSectionHeader.tsx`. Server.
- Roadmap card: use `RoadmapCardV2` (migrate as separate component in `components/roadmap/RoadmapCardV2.tsx`). Resolve gradient by slug using the `bg-roadmap-*` Tailwind classes from §3 of `INSTALL.md`. **Never inline a gradient.**
- `ContentCard` from the Vite app ports as Server.

### Sanity data
- Replace `useRoadmaps` hook with a Server-side fetch in `app/top/page.tsx`:
  ```tsx
  import { sanityClient } from '@/lib/sanity';
  const roadmaps = await sanityClient.fetch(ROADMAPS_QUERY);
  ```
- Pass results down as props. No data hooks in Server Components.

### Self-checks (run before opening PR)
```sh
# No raw hex in app/top:
rg -nE "#[0-9a-fA-F]{3,8}" app/top
# No react-router:
rg -n "react-router" app/top
# No <img> for assets:
rg -n "<img " app/top
```
All three must return zero (data-file hex codes in `trainingCardsData.ts` are allowed — they are content, not design tokens; document each at the top of that file).

## Done criteria
- [ ] `/top` renders identically to the Vite version at desktop, tablet, mobile.
- [ ] Visual diff against the kit (`ui_kits/marketing-top/index.html`) shows no token drift.
- [ ] Lighthouse perf ≥ 90 on desktop.
- [ ] No raw hex in JSX outside `trainingCardsData.ts`.
- [ ] All buttons match `SKILL.md` §3 canonical button shapes.
- [ ] PR includes desktop + mobile screenshots side-by-side with the legacy Vite version.

---

# Issue 5 — `[DS-5]` Per-screen migration playbook (template — clone for each screen)

## Why
Provide one issue per screen during migration so each gets a clean PR with consistent design-system enforcement. Clone this template, fill in `<<screen>>`, attach to the migration project.

## Title pattern
`[DS-mig-N] Migrate <<screen path>> to Next.js using design system`

## Per-issue tasks (clone & fill)

1. **Read** `.claude/design-system/SKILL.md`, especially "Workflow for Claude Code" and "Anti-patterns".
2. **Identify the kit reference**: which file in `.claude/design-system/ui_kits/` covers this screen pattern? If none, comment in the issue and stop — the kit must be extended first (open a `[DS-kit]` issue).
3. **Plan Server vs Client boundaries**. List each component you intend to create and tag it `(server)` / `(client)`. Post the plan as a Linear comment before writing code.
4. **Port the screen**:
   - Replace `react-router` → `next/link`
   - Replace `<img>` → `next/image`
   - Replace data hooks → Server-side `sanityClient.fetch`
   - Replace any inline hex → token classes (or extend tokens via a `[DS-token]` issue if missing)
5. **Self-check** with these greps in the new screen folder:
   ```sh
   rg -nE "#[0-9a-fA-F]{3,8}" app/<<screen>>
   rg -n "react-router" app/<<screen>>
   rg -n "<img " app/<<screen>>
   rg -n "useEffect|useState" app/<<screen>>   # any hook = must be in 'use client'
   ```
6. **Visual diff**: side-by-side screenshot vs the Vite version, posted in PR description.

## Done criteria (per screen)
- [ ] All four greps clean (or each remaining match documented).
- [ ] PR has plan + screenshot diff + `git diff --stat` summary.
- [ ] No new tokens added without a sibling `[DS-token]` PR.
- [ ] CTA, card, badge shapes match `SKILL.md` canonical tables.

---

# Sequencing diagram

```
[DS-1] Install ──┐
                 ├── [DS-4] /top migration ───┐
[DS-2] next/font ┤                            ├── [DS-5] each screen
                 │                            │
[DS-3] next/link ┘                            │
                                              │
                          [DS-kit] / [DS-token] (as needed, parallel)
```

`[DS-1]`, `[DS-2]`, `[DS-3]` are blocking. `[DS-4]` proves the system. `[DS-5]` is cloned per remaining screen.

---

# Notes for the human assigning these

- Each issue is intentionally small enough to fit in one Claude Code session.
- `[DS-1]` is the most procedural and lowest-risk — start there to validate the workflow.
- `[DS-4]` is the highest-value validation — once `/top` lands cleanly, the rest of the migration becomes pattern-matching.
- For tokens that don't exist yet (e.g. you find a screen needs a color we never defined), open a small `[DS-token]` issue against the **design system project**, not the app repo. Merge there first, pull `.claude/design-system/` into the app, then continue.
