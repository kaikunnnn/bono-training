<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Performance regression checks

For changes to the top pages, shared layout, or their data fetching, read `docs/performance.md` and run `npm run test:performance`. Preserve the synchronous top shell and independent CMS streaming boundaries. Do not shared-cache member data. Unit tests and HTTP timings do not replace production-build browser checks for member navigation, layout shifts, and SEO.
