# 15分フィードバック応募フォーム - 実装状況

**最終更新**: 2025-02-23

---

## 実装完了

### 作成・更新したファイル

| ファイル | 内容 |
|---------|------|
| `src/pages/feedback-apply/submit.tsx` | 応募フォームUI（Figmaデザイン反映） |
| `api/feedback-apply/submit.ts` | APIエンドポイント + Slack通知 |
| `.env.local` | `SLACK_FEEDBACK_WEBHOOK_URL` 追加 |

---

## フォーム仕様

### Step 1: URL入力
- 記事URL（必須）
- Slackアカウント名（必須）
  - 例: あきら(青い背景の犬のアイコン)

### Step 2: 詳細入力
- 学んだBONOコンテンツ（必須・自由入力）
  - 例: ゼロからはじめる情報設計
  - 将来的にはレッスン/ロードマップから選択できるようにする
- 該当項目チェック（必須・複数選択可）
  - Notice（気づき・変化）
  - Before/After（修正過程）
  - Why（なぜそうしたか）

### 完了画面
- チェックアイコン + アニメーション
- 「応募が完了しました」メッセージ
- Slack通知の説明（1-3日以内に通知が届く）
- 入力内容の確認表示

---

## Slack連携

### 設定
- 環境変数: `SLACK_FEEDBACK_WEBHOOK_URL`
- 設定場所: Vercel環境変数（本番のみ）
- 注意: Webhook URLは秘密情報のためリポジトリに含めないこと

### 通知フォーマット
```
📝 15分フィードバック新規応募

👤 Slackアカウント名: [入力値]
📚 学んだBONOコンテンツ: [入力値]
🔗 記事URL: [入力値]
✅ 該当項目:
• Notice（気づき・変化）
• Before/After（修正過程）
• Why（なぜそうしたか）

応募日時: 2025-02-23 15:30:00
```

---

## UIデザイン（Figma参照）

- Figmaファイル: `7OtaRLVF2yIlAqddrB11lY`
- Step 1画面: `node-id=26-3697`
- Step 2画面: `node-id=28-3707`

### デザイン要素
- プログレスバー（上部）
- カード: 角丸40px、白背景、影付き
- ステップバッジ: ピル型（ステップ1、ステップ2）
- 入力欄: 高さ48px、角丸16px
- チェックボックス: タイトル + 説明文付き、角丸16px
- ボタン: 「もどる」（テキスト）、「次へ」/「応募する」（黒背景）

---

## 動作確認方法

### ローカル環境
```bash
# ターミナル1: フロントエンド
npm run dev

# ターミナル2: API（環境変数を読み込んで起動）
export $(grep -v '^#' .env.local | xargs)
vercel dev --listen 3001
```

### 確認URL
- フォーム: http://localhost:8080/feedback-apply/submit
- 説明ページ: http://localhost:8080/feedback-apply

---

## 今後の課題

1. **Webhook URL確認**: 古い可能性あり、通知テストが必要
2. **レッスン連携**: 将来的に「学んだBONOコンテンツ」をレッスン/ロードマップから選択できるようにする
3. **データ保存**: 現在はSlack通知のみ。必要に応じてSupabase/Sanityに保存する機能を追加

---

## 関連ドキュメント

- 仕様書: `.claude/docs/features/community/15feedback/pagedetail.md`
- UX分析: `.claude/docs/features/community/15feedback/UX-ANALYSIS.md`
