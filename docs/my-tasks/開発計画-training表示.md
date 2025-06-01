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

## Phase 3 – プラン定義と権限判定ロジック整備（約 1 日）

### 前提と問題点

    1. “Member権限” の定義がずれている
    •	subscriptionPlans.ts の CONTENT_PERMISSIONS において、
    •	member と training に割り当てられたプラン配列が、本来の仕様（['standard','growth','community']）と異なる
    •	useSubscription.ts 内で独自の planMembers フラグを使っているため、「Member権限かどうか」の判定が不明確
    2.	アクセス制御がずれている結果、正しいユーザーにコンテンツを出し分けられていない
    •	free ユーザーでも閲覧すべきでないコンテンツが見えてしまう
    •	standard ユーザーが本来閲覧できるはずのメンバー限定コンテンツに弾かれてしまっている
    •	その結果、Markdown 内の <!-- PREMIUM_ONLY --> を使った出し分けや、動画／ラベル表示の制御が正しく動作していない

⸻

### ゴール

- free/standard/growth/community の各プランを正しく判定し、以降の表示切り替えロジックの前提を整える
- subscriptionPlans.ts と useSubscription.ts を修正して、「hasMemberAccess」「hasTrainingAccess」などのメソッド名で必要な Boolean フラグを返すようにする
- Guard コンポーネントが「Member 権限」ベースで正しく制御できるようにする

### 実装タスク

※以下を参考にして現状のコードを分析して実装タスクを計画してください

1. subscriptionPlans.ts の修正
2. useSubscription.ts（カスタムフック）の修正
3. ガードコンポーネントの更新

### テストゲート（Phase 3 完了チェック）

    1.	プラン定義の検証
    2.	権限判定フックの動作確認
    3.	Guardコンポーネントの動作確認
    4.	全体ビルド確認

## Phase 4 – Markdown 出し分け＆動画／ラベル制御実装（約 1 日）

### 前提

- Phase 3 までで「hasMemberAccess」「hasTrainingAccess」等が正常に返る状態になっている
- Routing で /training/:trainingSlug/:taskSlug から、TaskDetailPage.tsx が呼ばれるようになっている
- loadTaskContent(trainingSlug, taskSlug) で Markdown の content.md と frontmatter が取得できる状態になっている

### ゴール

- タスクページにおいて、<!-- PREMIUM_ONLY --> の位置でコンテンツを切り分け
- free ユーザーと standard/growth/community の "member"権限を持つユーザーで以下を切り替えるを切り替える
  - Markdown の表示範囲
  - 動画(URL) の種類
  - 「メンバー限定コンテンツ」ラベル表示

### 実装タスク

※以下を参考にして現状のコードを分析して実装タスクを計画してください

1. Markdown 本文の分割と表示制御

   1. コンテンツ取得
   2. PREMIUM_ONLY で分割
   3. 表示切り替えロジック
   4. コンポーネント例：TaskDetailContent.tsx

2. TaskDetailPage.tsx の呼び出し／エラーハンドリング
   1. TaskDetailPage.tsx での流れ
   2. 注意点
      • trainingSlug／taskSlug が存在しない場合はエラーページ表示
      • loadTaskContent が null を返したらエラーページ表示
      • データロード中は「読み込み中…」を表示
3. 共通ヘッダーでのラベル表示
   1. TaskHeader.tsx（または TrainingHeader.tsx）の更新例

### テストゲート（Phase 4 完了チェック）

    1.	無料ユーザー（free）の場合
    •	Markdown の前半部分のみ表示
    •	区切り以降はバナー表示
    •	video_preview のみ動作
    •	「メンバー限定コンテンツ」ラベルが表示される
    2.	有料ユーザー（standard/growth/community）の場合
    •	Markdown の全文が表示される（区切り以降も含む）
    •	video_full のみ動作
    •	「メンバー限定コンテンツ」ラベルが非表示
    3.	全体ビルド確認
    •	pnpm tsc --noEmit → 型エラーゼロ
    •	pnpm build && pnpm preview → ブラウザで /training/todo-app/introduction を開いて動作を一通りチェック
    •	コンソールエラーが 0 件

---

## 主要マイルストーン（ここまでで MVP 完了）

1. **PoC 成功** – Phase 1 で JSON API 返却を確認
2. **UI MVP** – Phase 2 でブラウザ表示
3. **Paywall 稼働** – Phase 3 で有料出し分けが機能

> Phase 4（Vercel 自動デプロイ）／Phase 5（運用ガイド）は後日追加予定
