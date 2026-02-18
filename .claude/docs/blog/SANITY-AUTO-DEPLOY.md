# Sanity → Vercel 自動デプロイ設定

ブログ記事を公開したら自動でVercelが再デプロイされるように設定する手順です。

## なぜ必要？

OGPファイル（SNSシェア時の画像・タイトル表示）は **ビルド時に静的生成** されます。
Sanityで記事を追加しても、再デプロイしないとOGPファイルは生成されません。

この設定をすると、記事公開 → 自動デプロイ → OGP生成 が自動化されます。

---

## 設定手順

### Step 1: Vercelで Deploy Hook を作成

1. [Vercelダッシュボード](https://vercel.com/) にアクセス
2. `bono-training` プロジェクトを選択
3. **Settings** → **Git** に移動
4. 下にスクロールして「**Deploy Hooks**」セクションを見つける
5. 「**Create Hook**」をクリック
6. 以下を入力：
   - **Name**: `sanity-publish`
   - **Branch**: `main`
7. 「**Create Hook**」ボタンをクリック
8. 生成されたURLをコピー
   - 形式: `https://api.vercel.com/v1/integrations/deploy/prj_xxxx/yyyy`

---

### Step 2: SanityでWebhookを設定

1. [Sanity管理画面](https://www.sanity.io/manage) にアクセス
2. `bono-training` プロジェクトを選択
3. **API** タブをクリック
4. 下にスクロールして「**Webhooks**」セクションを見つける
5. 「**Create webhook**」をクリック
6. 以下を入力：
   - **Name**: `Vercel Deploy`
   - **URL**: Step 1でコピーしたVercelのDeploy Hook URL
   - **Dataset**: `production`
   - **Trigger on**: `Create`, `Update`, `Delete` にチェック
   - **Filter**: `_type == "blogPost"` （ブログ記事のみに限定）
   - **HTTP method**: `POST`
7. 「**Save**」をクリック

---

## 動作確認

1. Sanityでブログ記事を公開（または既存記事を更新）
2. Vercelダッシュボード → Deployments を確認
3. 自動でデプロイが開始されていればOK

---

## 注意点

- **デプロイ頻度**: 記事を頻繁に更新すると、その都度デプロイが走ります
- **ビルド時間**: 約30秒かかります
- **Vercel無料枠**: Hobbyプランは月100デプロイまで（通常は十分）

---

## トラブルシューティング

### Webhookが発火しない
- Sanity側でWebhookのステータスを確認（API → Webhooks → 履歴）
- Dataset が `production` になっているか確認

### OGPが更新されない
- ビルドログで `✅ Generated: /ogp/xxx.html` を確認
- Facebookシェアデバッガーで「もう一度スクレイピング」を実行

---

## 関連ファイル

- `scripts/generate-ogp.js` - OGPファイル生成スクリプト
- `vercel.json` - クローラー向けリダイレクト設定
