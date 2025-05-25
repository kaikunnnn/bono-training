# Git ベースでの Training コンテンツ管理計画

**（Phase 3 まで・テーブル無し版）**

---

## Phase 0 – リポジトリ初期化 & 旧 Storage コード掃除（0.5–1 日）

### ゴール

- GitHub に雛形を push し、Supabase Storage 依存のビルドエラーが 0 になる。

### 具体タスク

1. **リポジトリ作成 & 雛形配置**
   - `content/` ディレクトリをコミット
   - ダミー `todo-app/index.md` と `tasks/01-introduction.md` を追加
2. **旧 Edge Function を完全削除**
   - `supabase/functions/get-training-*` 系 6 本
   - `supabase/config.toml` から上記 Function 定義を削除
3. **ソース修正（TODO 化）**
   - `src/utils/mdxLoader.ts` の `supabase.functions.invoke()` 呼び出しをコメントアウト
   - `src/services/training.ts` の Storage 依存関数を TODO に置換
4. **CI セットアップ**
   - GitHub Action で `pnpm typecheck && pnpm lint && pnpm build` を回す

### PR チェックリスト

- [ ] Edge Function の残骸が 0
- [ ] `config.toml` から該当行を削除
- [ ] ビルド／typecheck／lint が緑

### テストゲート

- `npm run build` が成功し、GitHub Actions が緑で通過する

---

## Phase 1 – Markdown 静的読み込み PoC（1 日）

### ゴール

- `import.meta.glob()` で `content/` 配下の Markdown を取り込み、JSON を返す API が動く。

### タスク

1. `lib/getTrainings.ts` を実装（front-matter 抽出）
2. API ルート `/api/debug-training` を作り、Training 配列を返す

### テストゲート

- ブラウザで `http://localhost:3000/api/debug-training` を叩くと `todo-app` が含まれる JSON が返る

---

## Phase 2 – UI プロトタイプ（1.5 日）

### ゴール

- 最低限の画面で一覧ページ `/training` と詳細ページ `/training/[slug]` が表示できる。

### タスク

1. `pages/training/index.tsx` で一覧カード表示
2. `pages/training/[slug].tsx` で Markdown をレンダリング
3. TailwindCSS で簡易スタイリング

### テストゲート

- 一覧ページからクリック → 詳細ページに遷移し、`index.md` のタイトルが表示される

---

## Phase 3 – 出し分けロジック統合（2 日）

### ゴール

- Supabase Auth + Stripe Webhook で `is_premium` を設定し、無料／有料の表示が切り替わる。

### タスク

1. Supabase DB に `users.is_premium` 列を追加
2. Stripe Webhook → Supabase RPC で `is_premium=true` を更新
3. フロントで `session.user.is_premium` を取得
4. Markdown 本文を `<!-- PREMIUM_ONLY -->` で `split()` し、
   - 無料ユーザー: 前半のみ＋ `video_preview`
   - 有料ユーザー: 全文＋ `video_full`

### テストゲート

- 無料ユーザーで有料タスクを開くと Paywall が出る
- 有料ユーザーで同ページを開くと全文が表示される

---

## 主要マイルストーン（ここまでで MVP 完了）

1. **PoC 成功** – Phase 1 で JSON API 返却を確認
2. **UI MVP** – Phase 2 でブラウザ表示
3. **Paywall 稼働** – Phase 3 で有料出し分けが機能

> Phase 4（Vercel 自動デプロイ）／Phase 5（運用ガイド）は後日追加予定
