# BONO Blog - Ghost CMS on Railway デプロイガイド

## 概要

このドキュメントでは、Ghost CMSをRailwayにデプロイして、BONO BlogのフロントエンドとAPI連携する手順を説明します。

## 前提条件

- GitHub アカウント
- クレジットカード（無料枠でも必要）
- Railway アカウント（これから作成）

## デプロイ手順

### ステップ1: Railway アカウント作成（2分）

1. **Railway にアクセス**
   - URL: https://railway.app/

2. **サインアップ**
   - 「Start a New Project」をクリック
   - 「Login with GitHub」を選択
   - GitHub認証を許可

3. **クレジットカード登録**
   - Dashboard → Account → Billing
   - クレジットカード情報を入力
   - 無料枠（$5/月）が適用される

### ステップ2: Ghost テンプレートをデプロイ（3分）

1. **新規プロジェクト作成**
   - Dashboard で「New Project」をクリック
   - 「Deploy a Template」を選択

2. **Ghost テンプレート検索**
   - 検索ボックスに「**Ghost**」と入力
   - 「Ghost CMS」テンプレートを選択
   - ※ 正式名称: "Ghost CMS on Railway"

3. **デプロイ開始**
   - 「Deploy」ボタンをクリック
   - 自動的にデプロイが開始される
   - 完了まで約3-5分

4. **ドメイン確認**
   - デプロイ完了後、「Settings」タブを開く
   - 「Networking」セクションで「Generate Domain」をクリック
   - 生成されたドメインをコピー
   - 例: `https://your-ghost.up.railway.app`

### ステップ3: Ghost 管理画面のセットアップ（2分）

1. **管理画面にアクセス**
   - ブラウザで `https://your-ghost.up.railway.app/ghost` を開く
   - 初回アクセス時はセットアップ画面が表示される

2. **管理者アカウント作成**
   - サイトタイトル: `BONO Blog`
   - 名前: あなたの名前
   - メールアドレス: あなたのメール
   - パスワード: 強力なパスワード
   - 「Create account」をクリック

3. **初期設定をスキップ**
   - 「I'll do this later」をクリックして初期ウィザードをスキップしてOK

### ステップ4: Content API Key を取得（2分）

1. **Integrations 設定を開く**
   - Ghost管理画面の左サイドバー
   - ⚙️ Settings → Integrations

2. **カスタム統合を作成**
   - 「+ Add custom integration」をクリック
   - Integration名: `BONO Frontend`
   - 「Create」をクリック

3. **API Key をコピー**
   - **Content API Key** をコピー（長い文字列）
   - 例: `34e80e2a649a2a79ff933405af1234567890abcdef`
   - ※ 後で使うので、メモ帳などに保存

### ステップ5: ローカルデータをRailwayにインポート（オプション・5分）

現在ローカルで作成した記事をRailwayのGhostに移行します。

1. **ローカルGhostでデータエクスポート**
   - http://localhost:2368/ghost にアクセス
   - Settings → Labs
   - 「Export your content」の「Export」をクリック
   - JSONファイルがダウンロードされる

2. **RailwayのGhostにインポート**
   - Railway Ghost管理画面 Settings → Labs
   - 「Import content」セクション
   - ダウンロードしたJSONファイルを選択
   - 「Import」をクリック

3. **確認**
   - Posts セクションで記事が表示されることを確認

### ステップ6: BONO Frontend に環境変数を設定（3分）

#### 6-1. ローカル環境（開発用）

1. **`.env` ファイルを更新**

```bash
# 既存の設定はそのまま
VITE_SUPABASE_ANON_KEY=...
VITE_SUPABASE_URL=...

# サイトURL
VITE_SITE_URL=http://localhost:8080

# Blog / Ghost CMS設定（Railwayに変更）
VITE_BLOG_DATA_SOURCE=ghost
VITE_GHOST_URL=https://your-ghost.up.railway.app
VITE_GHOST_KEY=あなたのContent-API-Key
```

2. **開発サーバーを再起動**

```bash
# 現在のサーバーを停止（Ctrl + C）
npm run dev
```

3. **動作確認**
   - http://localhost:8080/blog にアクセス
   - Railway Ghost の記事が表示されることを確認

#### 6-2. 本番環境（Vercel）

1. **Vercel Dashboard にアクセス**
   - https://vercel.com/dashboard
   - `bono-training` プロジェクトを選択

2. **環境変数を追加**
   - Settings → Environment Variables
   - 以下の変数を追加:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_GHOST_URL` | `https://your-ghost.up.railway.app` | Production, Preview, Development |
| `VITE_GHOST_KEY` | `あなたのContent-API-Key` | Production, Preview, Development |
| `VITE_SITE_URL` | `https://your-site.vercel.app` | Production |
| `VITE_BLOG_DATA_SOURCE` | `ghost` | Production, Preview, Development |

3. **Redeploy**
   - Deployments タブを開く
   - 最新のデプロイの「⋯」メニューから「Redeploy」を選択

4. **本番環境で確認**
   - デプロイ完了後、本番URLにアクセス
   - `/blog` ページでRailway Ghost の記事が表示されることを確認

## 完了後の確認事項

### ✅ チェックリスト

- [ ] Railway Ghostが起動している
- [ ] Ghost管理画面にアクセスできる
- [ ] Content API Keyを取得した
- [ ] ローカル環境でRailway Ghostの記事が表示される
- [ ] Vercelに環境変数を設定した
- [ ] 本番環境でRailway Ghostの記事が表示される

### 🎉 成功！

すべてのチェック項目が完了したら、デプロイ成功です！

## トラブルシューティング

### Q1: Railway Ghostにアクセスできない

**原因**: ドメインが正しく生成されていない

**対処法**:
1. Railway Dashboard → プロジェクト → Settings
2. Networking → Generate Domain
3. 生成されたドメインを確認

### Q2: フロントエンドで記事が表示されない

**原因**: API KeyまたはURLが間違っている

**対処法**:
1. Ghost管理画面でAPI Keyを再確認
2. `.env` ファイルの `VITE_GHOST_URL` と `VITE_GHOST_KEY` を確認
3. 開発サーバーを再起動

### Q3: CORS エラーが出る

**原因**: Ghost側のCORS設定

**対処法**:

Railway Dashboard → 環境変数を追加:
```
url=https://your-ghost.up.railway.app
```

### Q4: Railway の無料枠を超えた

**確認方法**:
- Railway Dashboard → Billing
- 使用量を確認

**対処法**:
1. 使用量が多い場合は Ghost Cloud へ移行を検討
2. またはmockPostsに戻す

### Q5: 画像がアップロードできない

**原因**: ストレージ設定

**対処法**:
- Railway のボリュームは永続化されていない場合がある
- Cloudinary や S3 などの外部ストレージを設定推奨

## 料金管理

### 無料枠の監視

1. **Railway Dashboard → Billing**
   - 現在の使用量を確認
   - 月$5を超えそうな場合は通知される

2. **使用量を抑える方法**
   - 画像を最適化（圧縮）
   - 大きなメディアファイルは外部サービス（Cloudinary等）を使用
   - アクセス数が少ない時間はスリープ設定

### 超えた場合

- 追加料金が自動課金される
- または支払い設定でサービスを停止することも可能

## データバックアップ

### 定期的なバックアップ（推奨）

**週1回または月1回**:

1. Ghost管理画面 → Settings → Labs
2. 「Export your content」
3. ダウンロードしたJSONを保存
4. `/content/images` フォルダも別途バックアップ推奨

## 次のステップ

### 記事の作成・管理

1. **Railway Ghost管理画面で記事作成**
   - https://your-ghost.up.railway.app/ghost
   - Posts → New post

2. **絵文字アイコンの設定**
   - タイトルに絵文字を含める
   - 例: `🎨 UIは美しさではない`

3. **Excerptの設定**
   - 右サイドバー → Settings → Excerpt
   - 記事の要約を入力（100-160文字推奨）

4. **リンクカードの挿入**
   - 記事本文で `/bookmark`
   - URLを入力

### カスタムドメイン設定（オプション）

独自ドメインを使いたい場合:

1. **Railway側設定**
   - Settings → Networking → Custom Domain
   - ドメインを追加

2. **DNS設定**
   - CNAMEレコードを追加
   - Railwayの指示に従う

## 参考リンク

- [Railway 公式ドキュメント](https://docs.railway.app/)
- [Ghost 公式ドキュメント](https://ghost.org/docs/)
- [Ghost Content API](https://ghost.org/docs/content-api/)
- [Railway Ghost Template](https://railway.app/template/ghost)

## まとめ

このガイドに従って作業すれば、約15分でGhost CMSをRailwayにデプロイし、BONO Blogと連携できます。

質問や問題が発生した場合は、トラブルシューティングセクションを参照してください。
