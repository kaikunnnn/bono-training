# Server/Client モジュール分離パターン

## Supabase クライアントの使い分け

| ファイル | 用途 | 使用場所 |
|---------|------|---------|
| `@/lib/supabase/server` | cookies() でセッション管理 | Server Component, Server Action のみ |
| `@/lib/supabase/client` | ブラウザ側 Supabase | Client Component |

## subscription パターン（模範例）

サーバー専用ロジックと純粋ユーティリティを分離する:

| ファイル | 内容 | import 可能な場所 |
|---------|------|-----------------|
| `@/lib/subscription.ts` | `getSubscriptionStatus()`, `getCurrentUser()` — DB アクセスあり | Server Component / Server Action のみ |
| `@/lib/subscription-utils.ts` | `getPlanDisplayName()`, `canAccessContent()`, `AVAILABLE_PLANS` — 純粋関数・定数 | どこでも |

## 新規モジュール作成時のルール

サーバー依存（DB, cookies, headers）のある関数と、純粋な関数・定数が混在する場合:

1. サーバー専用 → `xxx.ts` に配置、先頭に `import 'server-only'`
2. 純粋関数・定数・型 → `xxx-utils.ts` に配置
3. サーバーファイルから utils を re-export して、Server Component の既存 import を壊さない

## services/ ディレクトリ

`"use server"` 付きファイル（Client Component から Server Action として呼び出し可能）:
- `bookmarks.ts` — ブックマーク CRUD
- `progress.ts` — 記事完了・レッスン進捗
- `viewHistory.ts` — 閲覧履歴

`"use server"` なし（Server Component からのみ使用可能、`import 'server-only'` 付き）:
- `training/*.ts` — トレーニング関連データ取得
- `pricing.ts` — 価格取得（Edge Function 経由）
