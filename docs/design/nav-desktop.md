# Desktop Global Navigation (Sidebar) – Design Spec

Source
- Figma file: `product---new-BONO-ui-2026`
- Node: `navigation` (node-id `628:22706`)
- URL: `https://www.figma.com/design/oNJwxeYUNaRWggDGAUi94D/product---new-BONO-ui-2026?node-id=628-22706&m=dev`

Scope
- Desktop only (current layout renders `Sidebar` for `lg` and above).
- Mobile/tablet continue to use the Sheet-based sidebar unless explicitly updated later.

Decisions (User)
- Icon set: keep `MenuIcons` (iconsax-react) as the design system source for all navigation icons.
- Desktop width: keep 200px.
- “工事中” badge: keep it visible on desktop.
- Hover/Focus: create a dedicated test page comparing (a) Figma-baseline and (b) accessibility-enhanced patterns.

Component Mapping (Code ↔︎ Figma)
- `src/components/layout/Sidebar/index.tsx` ↔︎ Navigation container
- `src/components/layout/Sidebar/SidebarLogo.tsx` ↔︎ Logo area
- `src/components/layout/Sidebar/SidebarMenuGroup.tsx` ↔︎ Menu group blocks
- `src/components/layout/Sidebar/SidebarMenuItem.tsx` ↔︎ Menu items + states
- `src/components/layout/Sidebar/SidebarGroupLabel.tsx` ↔︎ “その他” group label
- `src/components/layout/Layout.tsx` ↔︎ Desktop-only placement and width

Visual Specs (Figma)

Navigation Container
- Layout: vertical stack
- Gap between sections: 1px (Figma shows `gap-px` at root)
- Width: not specified in node; keep current 200px unless design dictates otherwise
- Background: not specified in node (inherits page background)

Logo Area
- Padding: 26px horizontal, 33px vertical
- Logo size: 81px × ~24px
- No status badge shown in Figma (current “工事中” pill likely removed for desktop)

Main Menu Block
- Horizontal padding: 15px
- Vertical gap between groups: 16px
- Item stack gap: 8px

Menu Item (Default)
- Layout: icon + label
- Padding: 14px (x), 9px (y)
- Gap between icon and text: 10px
- Corner radius: 20px
- Icon size: 20px
- Text color: #2F3037
- Font: Noto Sans JP Medium
- Text size: 13px (one item shows 14px with tracking -0.35; confirm if intentional)

Menu Item (Active / Current URL)
- Border: 1px solid rgba(47, 48, 55, 0.08)
- Background: linear gradient 109.265deg
  - From: rgba(47, 48, 55, 0.08) at 9.1965%
  - To: rgba(47, 48, 55, 0.03) at 79.127%
- Text color: #2F3037 (unchanged)
- Icon color: matches text color

Menu Item (Focus)
- Not explicitly present in node.
- TODO: confirm focus/keyboard state from Figma or define a11y-friendly focus style aligned with the active border/gradient.

Group Label (“その他”)
- Height: 32px
- Padding: 6px (x)
- Radius: 8px
- Text: #74798B
- Font: Helvetica Bold
- Size: 10px
- Line height: 16px

Assets (Figma-provided)
- Logo and icons are provided as SVG assets in the Figma node.
- Current implementation uses Iconsax (`MenuIcons`). Decide whether to:
  - Keep existing icons and match sizes/colors, or
  - Replace with Figma SVGs for 1:1 fidelity.

Differences vs Current Implementation
- Current active style: solid white background + extra bold text. Figma uses gradient + subtle border, no bold shift.
- Current font sizes: 12px in sidebar. Figma uses 13px (and one 14px) with Noto Sans JP.
- Current spacing/padding: px-4 py-2.5 and rounded-2xl; Figma uses px-14 py-9 and radius 20.
- Current label (“その他”) style: text-black/70, font-medium; Figma uses Helvetica Bold, #74798B.
- Current logo area includes “工事中” pill; Figma does not.

Implementation Checklist (Desktop-only)
- Update `Sidebar` and related components with `lg:` scoped classes to avoid affecting mobile.
- Align menu item padding, radius, icon size, and text styles to Figma.
- Implement active state gradient + border for current URL.
- Define focus/keyboard style if Figma does not specify.
- Keep icon source as existing Iconsax (`MenuIcons`).
- Add a dev/test page to compare baseline vs accessibility-enhanced patterns.

Open Questions
- Should the desktop sidebar width remain 200px or match a new Figma width?
- Should the “工事中” badge be removed entirely or only hidden on desktop?
- Do we need separate hover state specs, or can we derive from active style?
- Confirm whether the 14px “発見” label size is intentional or a one-off.

Missing Specs to Provide in Figma
- Hover state for non-active items (background, border, text/icon color).
- Focus-visible state for keyboard navigation (outline color/width, radius, offset).
- Pressed/active (mouse down) state, if different from hover.
- Disabled state (if any items can be disabled).
- Clarify whether the item typography is consistently 13px or if 14px/letter-spacing is intentional.
- Confirm whether labels/routes should remain current (ロードマップ/レッスン/ガイド/トレーニング/ログイン/設定/ログアウト) or switch to the new Figma labels (マイページ/発見/コース/トレーニング/設定/ログアウト).

Draft Ideas Implemented in Dev Test Page
- Baseline (Figma-like) hover: `bg rgba(47,48,55,0.04)`
- Baseline pressed: `bg rgba(47,48,55,0.08)`
- Baseline focus: `ring 1px rgba(47,48,55,0.35)`, offset 2px
- A11y hover: `bg rgba(47,48,55,0.08)`
- A11y pressed: `bg rgba(47,48,55,0.12)`
- A11y focus: `ring 2px #3B82F6`, offset 2px
- Disabled: text/icon `#9AA0AE`, `opacity 0.7`, no background
- Active (current URL) uses Figma gradient + border; a11y variant uses slightly stronger border/gradient
- IA comparison: “現行IA” vs “Figma IA” shown side-by-side
- Typography test: 13px vs 14px (tracking -0.35) shown side-by-side

Dev/Test Page Plan (for states)
- Create a dev page that renders:
  - Baseline Figma style (matching the node).
  - Accessibility-enhanced variant (strong focus-visible, higher contrast hover).
- Include a keyboard navigation note and example states side-by-side.

Change Log
- 2026-02-04: Initial Figma analysis and mapping created.
- 2026-02-04: Added user decisions and missing-specs list; test page requirement documented.
