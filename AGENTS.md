# AGENTS.md

## Cursor Cloud specific instructions

### Overview

BONO is a Japanese UI/UX design learning platform built with React + Vite + TypeScript. It uses Supabase (cloud-hosted) for auth/database, Sanity CMS for content, and Stripe for payments.

### Services

| Service | Command | Port | Notes |
|---|---|---|---|
| Frontend (Vite dev server) | `npm run dev` | 8080 | Main app; requires `.env` with `VITE_SUPABASE_*` and `VITE_SANITY_*` |
| Sanity Studio | `npm run sanity:dev` | 3333 | Optional; only for CMS content editing |

Ghost CMS (blog) is optional and requires Docker, which is not pre-installed on the Cloud VM.

### Key commands

- **Lint**: `npx eslint .`
- **Test**: `npx jest --passWithNoTests`
- **Build**: `npx vite build`
- **Dev server**: `npm run dev` (starts on port 8080)

See `package.json` scripts for the full list.

### Environment variables

The `.env` file at the project root must contain at minimum:
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (Supabase cloud project)
- `VITE_SANITY_PROJECT_ID` / `VITE_SANITY_DATASET` / `VITE_SANITY_API_VERSION`
- `VITE_SITE_URL=http://localhost:8080`

The Supabase anon key is a public client-side key (found in `scripts/check-subscription-db.js`). The Supabase project URL is `https://fryogvfhymnpiqwssmuu.supabase.co`.

### Gotchas

- The `npm run dev` command first runs `scripts/check-mcp-status.js` before starting Vite. If MCP config files are missing it still proceeds.
- ESLint is configured as flat config (`eslint.config.js`). It ignores `supabase/functions/` and `src/__tests__/`.
- Jest ignores `src/__tests__/` (legacy integration tests) and `test-utils`/`setup` directories.
- The workspace rule prohibits creating/editing `.env` files during normal development. For environment setup, create it with the public Supabase/Sanity values listed above.
- Supabase Edge Functions use Deno runtime and are deployed separately; they do not need to run locally for frontend development.
