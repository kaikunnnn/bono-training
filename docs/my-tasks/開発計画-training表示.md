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
3. `pages/training/[slug]/[taskSlug].tsx` に該当するページで、content/[training^-name]/tasks/[task-folder]/content.md の中身を詳細ページとして表示する

### テストゲート

- 一覧ページからクリック → 詳細ページに遷移し、`index.md` のタイトルが表示される

---

## Phase 3 – 出し分けロジック統合（約 2 日）

### ゴール

- 認証済みユーザーの “有料会員かどうか” を判定し、Markdown 内の「PREMIUM_ONLY」以降の表示や動画の種類、ラベル表示を動的に切り替える。

---

### やりたいこと

1. Markdown 本文中の `<!-- PREMIUM_ONLY -->` を区切りとして、無料会員と有料会員で表示する範囲を切り分ける
   - 無料会員：区切りより前のコンテンツのみ表示し、「ここから先はプレミアム会員限定です」などのメッセージを表示
   - 有料会員：区切り以降も含めた全文を表示
2. 動画 URL を出し分ける
   - Markdown frontmatter に定義された `video_preview` と `video_full` のどちらを埋め込むかを切り替える
3. 「難易度」表示の横に “メンバー限定コンテンツ” のラベルを出し分ける
   - 無料会員：ラベルを表示
   - 有料会員：ラベルを非表示

---

### ゴールを達成するための実装タスク

1. **Supabase 側の準備**

   1. `users` テーブルに Boolean 型の `is_premium` 列を追加する
   2. Stripe Webhook をトリガーして、有料契約完了時に Supabase のカラム `is_premium=true` を更新する RPC 関数を用意する

2. **フロントエンドで「有料会員判定フラグ」を取得できるようにする**

   - 例：`useAuth()` や `AuthContext` などを通じて、ログイン中のユーザーオブジェクトから“有料会員かどうか”を判定できる Boolean フラグを取得する
   - 仕様書には具体的なプロパティ名を記載せず、あくまで「AuthContext などから返ってくる Boolean 判定機能を使う」と抽象的に記述する

3. **Markdown の表示ロジックを組み込む**

   1. 各タスクページコンポーネントで Markdown 本文を取得
   2. 下記のように `split('<!-- PREMIUM_ONLY -->')` して、先頭部分とその後のコンテンツを分割
      ```ts
      const [beforePremium, afterPremium] = rawMarkdown.split(
        "<!-- PREMIUM_ONLY -->"
      );
      ```
   3. 取得した“有料会員判定フラグ” をチェックして、
      - 無料会員の場合：`beforePremium` のみをレンダリングし、区切り以降のコンテンツ部分には「ここから先はプレミアム会員限定です…」といったバナーを表示
      - 有料会員の場合：`beforePremium + afterPremium` をそのまま全文レンダリング

4. **動画 URL の切り分け**

   - Markdown frontmatter から `video_preview` と `video_full` をどちらも取得できるようにしておく
   - 表示箇所では“有料会員判定フラグ” を見て、
     - 無料会員：`video_preview` を埋め込む
     - 有料会員：`video_full` を埋め込む

5. **「メンバー限定コンテンツ」ラベルの切り分け**
   - 「難易度」やタイトル付近の UI で、
     - 無料会員の場合：`(メンバー限定コンテンツ)` ラベルを並べて表示
     - 有料会員の場合：ラベルを非表示

---

### テストゲート

- **無料会員の挙動確認**

  1. Stripe で有料プランに加入していないユーザー（`is_premium = false`）でログイン
  2. 有料タスクのページを開くと、
     - Markdown 本文の区切りより後ろの部分は出ず、代わりに「ここから先はプレミアム会員限定です」の案内が表示される
     - 動画は `video_preview` が埋め込まれている
     - 難易度欄の横に「メンバー限定コンテンツ」が表示される

- **有料会員の挙動確認**

  1. Stripe でプレミアムプランに加入しているユーザー（`is_premium = true`）でログイン
  2. 同じタスクページを開くと、
     - Markdown 本文の全文（区切り以降も含む）がすべて表示される
     - 動画は `video_full` が埋め込まれている
     - 難易度欄の横には「メンバー限定コンテンツ」ラベルが表示されない

- **全体チェック**
  - 型チェック（`pnpm tsc --noEmit`）通過
  - ビルドおよびプレビュー（`pnpm build && pnpm preview`）でエラーなし
  - 各ページを実際に操作して、出し分けが正しく機能する

---

### 補足：実装時の注意点

- **有料会員判定フラグの取得方法**
  - 実際のコードでは `session.user.is_premium` のように具体的なキー名を使うかもしれませんが、コード例では「AuthContext などから返ってくる Boolean 判定機能」を参照するように記述すると、実装時にキー名が変わっても柔軟に対応できる
- **`<!-- PREMIUM_ONLY -->` がないファイルへの対応**
  - 区切りマーカーが見つからない場合は全文を「無料コンテンツ」として扱い、動画は `video_preview` を使う（`afterPremium` 部分が空配列扱いになるので、区切り以降の表示がそもそも発生しない）
- **動画 URL が未定義の場合**
  - `video_preview` または `video_full` が frontmatter に存在しないときは、あらかじめ “サムネイルのみ表示” などフォールバックの UI を用意しておく

---

このように記述しておくと、実装者は「AuthContext から Boolean 判定を受け取る箇所」だけを自分のコードベースに合わせて差し替えればよく、混乱を防いだまま Phase 3 の要件を正しく実装できます。```

---

## 主要マイルストーン（ここまでで MVP 完了）

1. **PoC 成功** – Phase 1 で JSON API 返却を確認
2. **UI MVP** – Phase 2 でブラウザ表示
3. **Paywall 稼働** – Phase 3 で有料出し分けが機能

> Phase 4（Vercel 自動デプロイ）／Phase 5（運用ガイド）は後日追加予定
