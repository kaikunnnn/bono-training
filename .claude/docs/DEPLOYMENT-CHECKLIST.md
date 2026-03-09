# デプロイチェックリスト

**作成日**: 2025-03-03
**目的**: デプロイ時の確認漏れを防ぎ、リリース時間を短縮する

---

## 📋 新機能デプロイ前チェックリスト

### 1. 環境変数の確認

**ローカル開発で使用した環境変数がVercelにも設定されているか確認**

```bash
# ローカルで使用している環境変数を確認
grep -E "^[A-Z_]+=" .env.local | cut -d= -f1
```

| チェック | 項目 |
|:---:|---|
| [ ] | 新しい環境変数をVercelダッシュボードに追加したか |
| [ ] | 環境変数の値が本番用の値になっているか（ローカルURLではないか） |
| [ ] | `VITE_`プレフィックスの変数はフロントエンドで公開されることを理解しているか |

**よくある環境変数**:
- `SANITY_WRITE_TOKEN` - Sanity書き込み用トークン
- `SLACK_FEEDBACK_WEBHOOK_URL` - Slack通知用Webhook
- `VITE_SANITY_PROJECT_ID` - SanityプロジェクトID
- `VITE_SUPABASE_URL` - SupabaseのURL

---

### 2. APIエンドポイントの確認

**ローカルAPI（vite.config.ts）と本番API（api/*.ts）の両方を更新したか**

| チェック | 項目 |
|:---:|---|
| [ ] | `vite.config.ts`のローカルAPIハンドラを更新した |
| [ ] | `api/`フォルダの本番APIハンドラを更新した |
| [ ] | 両方のAPIで同じロジック・バリデーションを使用している |
| [ ] | TypeScriptのインポートパスに`.js`拡張子を付けた（ESM対応） |

---

### 3. OGP設定の確認（SNSシェア機能がある場合）

**SPAではOGPが正しく表示されないため、静的HTML生成が必要**

| チェック | 項目 |
|:---:|---|
| [ ] | `scripts/generate-ogp.js`に新しいページを追加した |
| [ ] | `vercel.json`にクローラー用のリライトルールを追加した |
| [ ] | OG画像を`public/assets/`に配置した |
| [ ] | [OGP確認ツール](https://ogp.me/)でプレビューを確認した |

**リライトルールのテンプレート**:
```json
{
  "source": "/your-page",
  "has": [
    {
      "type": "header",
      "key": "user-agent",
      "value": ".*(Twitterbot|facebookexternalhit|LinkedInBot|Slackbot|Discordbot|TelegramBot|WhatsApp|Line).*"
    }
  ],
  "destination": "/ogp/your-page.html"
}
```

---

### 4. Slack通知の確認（Slack連携がある場合）

| チェック | 項目 |
|:---:|---|
| [ ] | 正しいWebhook URLが設定されている |
| [ ] | 通知が正しいチャンネルに送信される |
| [ ] | 通知メッセージの内容が要件と一致している |

---

### 5. デプロイ後の動作確認

| チェック | 項目 |
|:---:|---|
| [ ] | 本番URLでページが正常に表示される |
| [ ] | フォーム送信が成功する |
| [ ] | データがSanity/Supabaseに保存される |
| [ ] | Slack通知が正しいチャンネルに届く |
| [ ] | OGPがSNSで正しく表示される |

---

## 🚨 よくあるトラブルと解決策

### API 500エラー（FUNCTION_INVOCATION_FAILED）

**原因**: 環境変数が設定されていない
**解決**: Vercelダッシュボードで環境変数を追加し、再デプロイ

### Slack通知が別チャンネルに届く

**原因**: 複数のWebhook URLが設定されており、間違ったものを参照している
**解決**: `SLACK_FEEDBACK_WEBHOOK_URL`など専用の環境変数名を使用

### OGPが表示されない

**原因**: SPAではクローラーがJavaScriptを実行しないため、React Helmetが機能しない
**解決**: 静的HTMLを生成し、vercel.jsonでクローラーにリダイレクト

### TypeScriptインポートエラー

**原因**: ESMではインポートパスに拡張子が必要
**解決**: `import { x } from './module.js'`のように`.js`を追加

---

## 📝 デプロイコマンド

```bash
# 1. 変更をコミット・プッシュ
git add .
git commit -m "feat: 機能名"
git push origin feature/branch-name

# 2. PRを作成（GitHub CLIを使用）
gh pr create --title "タイトル" --body "説明"

# 3. マージ後、本番デプロイを確認
vercel logs --follow
```

---

## 🔗 関連ドキュメント

- [Vercel環境変数設定](https://vercel.com/docs/environment-variables)
- [OGP仕様](https://ogp.me/)
- [Slack Block Kit Builder](https://app.slack.com/block-kit-builder)
