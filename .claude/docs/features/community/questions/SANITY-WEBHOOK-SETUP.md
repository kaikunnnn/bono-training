# Sanity Webhook 設定手順

**目的**: 質問に回答（ステータス変更）した時に、自動でユーザーにメール通知を送る

---

## 設定手順

### Step 1: Sanity管理画面にアクセス

```
https://www.sanity.io/manage/project/[PROJECT_ID]/api/webhooks
```

または、Sanity Studioのメニューから「Project settings」→「API」→「Webhooks」

---

### Step 2: 新しいWebhookを作成

**「Create webhook」** をクリック

---

### Step 3: 設定項目を入力

| 項目 | 値 |
|------|-----|
| **Name** | `Question Answer Notification` |
| **URL** | `https://bono-training.vercel.app/api/questions/answer-notification` |
| **Dataset** | `production` |
| **Trigger on** | `Update` のみチェック |
| **Filter** | `_type == "question" && status == "answered" && isPublic == true` |
| **Projection** | `{_id, _type, title, slug, status, isPublic, author}` |
| **HTTP method** | `POST` |
| **HTTP headers** | （任意でSecret設定可能） |
| **Status** | `Enabled` |

---

### Step 4: Secretの設定（推奨）

セキュリティのため、Webhook Secretを設定：

1. Sanity Webhookの「Secret」欄に任意の文字列を入力
2. Vercel環境変数に追加：
   ```
   SANITY_WEBHOOK_SECRET=your-secret-here
   ```

---

### Step 5: 保存

**「Save」** をクリックして保存

---

## 動作確認

1. Sanity Studioで質問を開く
2. ステータスを「回答済み」に変更
3. 公開をONにして保存
4. 投稿者のメールに通知が届くか確認

---

## トラブルシューティング

### 通知が届かない

1. **Webhook URL確認**: 正しいURLになっているか
2. **Filter確認**: `status == "answered"` と `isPublic == true` の両方が必要
3. **Vercelログ確認**: APIのエラーログを確認
4. **Resend確認**: メール送信が成功しているか

### Webhook履歴の確認

Sanity管理画面 → Webhooks → 該当Webhook → 「Activity」タブでリクエスト履歴を確認可能

---

## 関連ファイル

- `api/questions/answer-notification.ts` - 通知API
- `.claude/docs/features/community/questions/ANSWER-WORKFLOW-MANUAL.md` - 回答マニュアル
