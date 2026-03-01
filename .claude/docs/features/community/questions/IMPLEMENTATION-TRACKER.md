# 質問機能 実装トラッカー

**作成日**: 2024-03-01
**最終更新**: 2024-03-01

---

## 概要

ユーザーが質問を投稿し、管理者（Kaiくん）がCMSで回答できる機能。

---

## フェーズ一覧

| フェーズ | 内容 | ステータス |
|---------|------|-----------|
| Phase 1 | 質問投稿 → CMS回答 | 🔴 未完了 |
| Phase 2 | Slack通知連携 | ⚪ 未着手 |
| Phase 3 | サービス上で回答投稿 | ⚪ 未着手 |

---

## Phase 1: 質問投稿 → CMS回答

### 現状

| コンポーネント | ステータス | 詳細 |
|---------------|-----------|------|
| フロントエンドフォーム | ✅ 完了 | `StepQuestionForm.tsx` 4ステップフォーム |
| Sanityスキーマ | ✅ 完了 | `question.ts`, `questionCategory.ts` |
| 質問一覧ページ | ✅ 完了 | `/questions` |
| 質問詳細ページ | ✅ 完了 | `/questions/:slug` |
| **APIエンドポイント** | ✅ 完了 | `api/questions/submit.ts` 実装済み |
| **vercel.json設定** | ✅ 完了 | `/api/*` を rewrites から除外 |
| 回答通知メール | ✅ 完了 | Webhook + Resend |
| Slack通知 | ✅ 完了 | 質問投稿時に自動通知 |

### TODOs

- [x] **Task 1.1**: `/api/questions/submit` エンドポイント実装 ✅
  - Vercel Serverless Function として作成済み
  - Sanity Write Token を使用
  - バリデーション実装済み
  - Slack通知も実装済み

- [x] **Task 1.2**: vercel.json 設定修正 ✅
  - `/:path((?!api/)(?!images/).*)"` に修正
  - `/api/*` が `/index.html` にリダイレクトされなくなった

- [ ] **Task 1.3**: 環境変数設定 ⏳
  - `SANITY_WRITE_TOKEN` を `.env.local` と Vercel に設定

  **設定手順**:
  1. Sanity管理画面を開く: https://www.sanity.io/manage
  2. プロジェクト「bono-training」を選択
  3. 「API」→「Tokens」を開く
  4. 「Add API token」をクリック
  5. 名前: `Write Token (Questions)`
  6. 権限: `Editor` を選択
  7. トークンをコピー
  8. `.env.local` に追加:
     ```
     SANITY_WRITE_TOKEN=your_token_here
     ```
  9. Vercel にも同様に設定

- [ ] **Task 1.4**: 動作確認
  - `npm run dev:vercel` でローカルテスト
  - Sanity Studio で質問が保存されることを確認

---

## Phase 2: Slack通知連携

### TODOs

- [ ] **Task 2.1**: 新規質問のSlack通知
  - Sanity Webhook → Slack Incoming Webhook

- [ ] **Task 2.2**: 回答完了のSlack通知
  - status が "answered" に変更時

---

## Phase 3: サービス上で回答投稿

### TODOs

- [ ] **Task 3.1**: 回答投稿フォームUI
- [ ] **Task 3.2**: 回答投稿API
- [ ] **Task 3.3**: 権限管理（管理者のみ）

---

## 技術スタック

```
Frontend: React + TypeScript + Vite
API: Vercel Serverless Functions
CMS: Sanity
Auth: Supabase
通知: Slack Webhook, Resend (メール)
```

---

## 関連ファイル

### フロントエンド
- `src/pages/questions/new.tsx` - 投稿ページ
- `src/components/questions/StepQuestionForm.tsx` - フォーム
- `src/pages/questions/QuestionList.tsx` - 一覧
- `src/pages/questions/QuestionDetail.tsx` - 詳細

### API
- `api/questions/submit.ts` - **これを作成する**
- `api/questions/answer-notification.ts` - 回答通知（実装済み）

### Sanity
- `sanity-studio/schemaTypes/question.ts`
- `sanity-studio/schemaTypes/questionCategory.ts`

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2024-03-01 | ドキュメント作成、Phase 1 調査完了 |
