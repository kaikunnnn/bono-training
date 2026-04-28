# Next.js App Router アーキテクチャ

## Server/Client 境界

- **デフォルトは Server Component**。`"use client"` はユーザーインタラクション（useState, onClick等）が必要な場合のみ
- サーバー専用ファイルには必ず `import 'server-only'` を追加する
- Client Component から `@/lib/supabase/server` や `next/headers` を import してはいけない（ビルドエラーになる）
- `"use server"` ファイルの関数は Server Action として Client Component から呼び出し可能（Next.js が RPC 境界を自動管理）

## Server Actions の配置

- `src/app/**/actions.ts` — ページ固有のアクション
- `src/lib/services/*.ts` — 共通のデータ操作（progress, bookmarks, viewHistory）
- 全て `"use server"` ディレクティブ付き

## レイアウト

- root layout (`src/app/layout.tsx`) に `LayoutWrapper` が組み込み済み
- 個別ページで Layout を手動ラップする必要はない
- 例外: `(auth)` グループ、`/blog`、`/articles/[slug]`（独自サイドナビ）

## データ取得パターン

- Server Component で Sanity/Supabase から直接データ取得
- Client Component には props 経由でデータを渡す
- Client Component 内でのデータ取得は Server Action 経由で行う

```typescript
// ✅ 正しい: Server Component でデータ取得 → props で渡す
export default async function Page() {
  const data = await fetchData();       // Server で取得
  return <ClientComponent data={data} />; // props で渡す
}

// ❌ 間違い: Client Component で supabase/server を直接使う
"use client";
import { createClient } from "@/lib/supabase/server"; // ビルドエラー
```
