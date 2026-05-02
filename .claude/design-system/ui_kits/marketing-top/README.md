# Marketing Top — UI Kit

Public landing for BONO. The unauth experience at `/top`.

## Screens / sections reproduced
- **Header** — logo + nav + login/signup
- **Hero** — NEW badge, JP headline, 2 CTAs, 3 fanned roadmap cards
- **GoalNav** — 4 rounded pill goal buttons with 3D Fluent emoji
- **TrainingGrid** — 4 signature training cards (UIUX転職, ユーザー価値, 情報設計, UIビジュアル)
- **Footer** — dark forest green with link columns

## Fidelity
Visuals lifted from `bono-training/src/components/top/*` and `src/components/layout/{Header,Footer}.tsx`. Simplified: the 3D eyecatch rotations inside training cards are replaced with a large italic background word (matching the Figma spec comment in `TrainingCard.tsx`).

## Files
- `index.html` — interactive demo
- `Primitives.jsx` — Header, NewBadge, CTAPrimary/Secondary, GoalPill
- `Hero.jsx` — Hero, GoalNav
- `TrainingGrid.jsx` — TrainingGrid, Footer
