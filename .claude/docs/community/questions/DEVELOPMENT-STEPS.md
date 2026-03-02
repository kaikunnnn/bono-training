# 質問ページ 開発ステップ

**作成日**: 2026-02-18

---

## 開発の進め方

1ステップずつ実装 → 確認 → 次のステップへ

---

## Step 1: Sanity Schema作成

### 1-1. questionCategory スキーマ
```
ファイル: sanity-studio/schemaTypes/questionCategory.ts
```
- title (カテゴリ名)
- slug
- order (表示順)
- color (テーマカラー)

### 1-2. question スキーマ
```
ファイル: sanity-studio/schemaTypes/question.ts
```
- title
- slug
- category (questionCategoryへの参照)
- questionContent (リッチテキスト・画像対応)
- answerContent (リッチテキスト・画像対応)
- publishedAt

### 1-3. index.tsに登録
```
ファイル: sanity-studio/schemaTypes/index.ts
```

### 確認ポイント
- [ ] Sanity Studioで「質問カテゴリ」「質問」が表示される
- [ ] テストデータを1件入力できる

---

## Step 2: Sanity クエリ作成

### 2-1. lib/sanity.ts に追加
- getAllQuestions() - 質問一覧取得
- getQuestion(slug) - 質問詳細取得
- getQuestionsByCategory(categorySlug) - カテゴリ別取得
- getQuestionCategories() - カテゴリ一覧取得
- getRecentQuestions(limit, excludeSlug) - 最近の質問取得
- getRelatedQuestions(categorySlug, excludeSlug, limit) - 関連質問取得

### 確認ポイント
- [ ] クエリが正しく動作する（console.logで確認）

---

## Step 3: 型定義

### 3-1. types/sanity.ts に追加
- Question 型
- QuestionCategory 型

### 確認ポイント
- [ ] TypeScriptエラーがない

---

## Step 4: 質問詳細ページ

### 4-1. ページコンポーネント作成
```
ファイル: src/pages/questions/QuestionDetail.tsx
```

構成:
- ヘッダー（タイトル、カテゴリ、公開日）
- 質問ブロック（固定アイコン + BONOメンバー）
- 回答ブロック（Kaiアイコン + Kai）
- 関連質問セクション
- 最近の質問セクション

### 4-2. ルーティング追加
```
ファイル: src/App.tsx または該当のルーターファイル
```
- /questions/:slug

### 確認ポイント
- [ ] テストデータが正しく表示される
- [ ] マークダウンが正しくレンダリングされる
- [ ] 画像が表示される

---

## Step 5: 質問一覧ページ

### 5-1. ページコンポーネント作成
```
ファイル: src/pages/questions/QuestionList.tsx
```

構成:
- ヘッダー（ページタイトル）
- カテゴリフィルター
- 質問カード一覧

### 5-2. ルーティング追加
- /questions

### 確認ポイント
- [ ] 一覧が表示される
- [ ] カテゴリフィルターが動作する
- [ ] カードから詳細ページに遷移できる

---

## Step 6: ナビゲーション追加

### 6-1. サイドバーに「質問」を追加
- コミュニティセクションに配置

### 確認ポイント
- [ ] ナビゲーションから質問ページにアクセスできる

---

## Step 7: 「質問ありがとう」スタンプ機能

### 7-1. Supabaseテーブル作成
```sql
question_thanks (
  id, user_id, question_slug, created_at
)
```

### 7-2. API/フック作成
- useQuestionThanks(slug) - スタンプ状態・数を取得
- toggleThanks(slug) - スタンプのトグル

### 7-3. UIコンポーネント
- ThanksButton コンポーネント
- ログインユーザーのみクリック可能
- 非ログインは数だけ表示

### 確認ポイント
- [ ] ログインユーザーがスタンプを押せる
- [ ] スタンプ数が表示される
- [ ] 再度押すと取り消せる

---

## Step 8: OGP設定

### 8-1. メタタグ設定
- title: 質問タイトル
- description: 質問の冒頭テキスト（自動抽出）
- og:image: 固定のOGP画像

### 8-2. 固定OGP画像
- 質問ページ共通の画像を用意
- または動的生成（タイトル埋め込み）

### 確認ポイント
- [ ] SNSシェア時にOGPが表示される

---

## Step 9: デザイン調整

ユーザーと一緒にデザインを確認・調整

### 確認ポイント
- [ ] /eventsと同じ幅・フォント感
- [ ] QAサービスのようなコミュニティ感
- [ ] 質問ブロック・回答ブロックの見た目
- [ ] スタンプボタンの見た目

---

## ステップ一覧

| Step | 内容 | ステータス |
|------|------|-----------|
| 1 | Sanity Schema作成 | ⏳ 次 |
| 2 | Sanity クエリ作成 | - |
| 3 | 型定義 | - |
| 4 | 質問詳細ページ | - |
| 5 | 質問一覧ページ | - |
| 6 | ナビゲーション追加 | - |
| 7 | スタンプ機能 | - |
| 8 | OGP設定 | - |
| 9 | デザイン調整 | - |

---

## 現在のステップ

**→ Step 1から開始**

---

## 参考ファイル

| 用途 | ファイル |
|------|---------|
| デザイン参考 | src/pages/events/EventDetail.tsx |
| Schema参考 | sanity-studio/schemaTypes/article.ts |
| リッチテキスト | src/components/article/RichTextSection.tsx |
| Sanityクエリ | src/lib/sanity.ts |
| 型定義 | src/types/sanity.ts |
