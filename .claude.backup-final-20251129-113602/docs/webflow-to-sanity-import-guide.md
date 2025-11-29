# Webflow → Sanity インポートガイド

## 概要

このガイドでは、WebflowからSeriesとVideosデータを取得してSanityに自動インポートする手順を説明します。

---

## 前提条件

### 必要な情報

1. **Sanity認証情報**
   - Project ID: `cqszh4up`
   - Dataset: `production`
   - Auth Token: CLI経由で自動取得

2. **Webflow認証情報**
   - API Token: `674b54cf2429858c005eb647787f444c749bb324a1ca1615b6cf4967b4033e76`
   - Series Collection ID: `6029d01e01a7fb81007f8e4e`
   - Videos Collection ID: `6029d027f6cb8852cbce8c75`

3. **インポート対象**
   - Series ID: `684a8fd0ff2a7184d2108210` (「3構造」ではじめるUIデザイン入門)

---

## インポート手順

### 1. 環境変数の設定

`.env.local`ファイルを`sanity-studio/`ディレクトリに作成します（既に存在します）:

```bash
# Sanity Configuration
SANITY_STUDIO_PROJECT_ID=cqszh4up
SANITY_STUDIO_DATASET=production
SANITY_AUTH_TOKEN=<your-token-here>

# Webflow Configuration
WEBFLOW_TOKEN=674b54cf2429858c005eb647787f444c749bb324a1ca1615b6cf4967b4033e76
```

### 2. Sanity認証トークンの取得

```bash
sanity debug --secrets
```

出力から`Auth token`の値をコピーして`.env.local`に設定します。

### 3. インポートスクリプトの実行

```bash
cd sanity-studio

# 環境変数をエクスポート
export SANITY_STUDIO_PROJECT_ID=cqszh4up
export SANITY_STUDIO_DATASET=production
export SANITY_AUTH_TOKEN=<your-token-from-debug>
export WEBFLOW_TOKEN=674b54cf2429858c005eb647787f444c749bb324a1ca1615b6cf4967b4033e76

# インポート実行
npm run import-webflow -- --series-id=684a8fd0ff2a7184d2108210
```

### 4. インポート結果の確認

```bash
# Lessonの確認
npx sanity documents query "*[_type == 'lesson' && _id == 'webflow-series-684a8fd0ff2a7184d2108210']{ _id, title, slug, webflowSource, 'questCount': count(quests) }" --dataset production

# Questsの確認
npx sanity documents query "*[_type == 'quest']{ _id, questNumber, title, 'articleCount': count(articles) } | order(questNumber asc)" --dataset production

# Articlesの確認
npx sanity documents query "*[_type == 'article' && _id match 'webflow-video-*'][0..5]{ _id, title, videoUrl, isPremium, videoDuration }" --dataset production
```

---

## データマッピング

### Webflow Series → Sanity Lesson

| Webflowフィールド | Sanityフィールド | 備考 |
|-----------------|----------------|------|
| `id` | `webflowSource` | WebflowのSeries ID |
| `name` | `title` | レッスンタイトル |
| `slug` | `slug` | URL用スラッグ |
| - | `quests` | Questsの参照配列 |

### Webflow Videos → Sanity Article

| Webflowフィールド | Sanityフィールド | 備考 |
|-----------------|----------------|------|
| `name` | `title` | 記事タイトル |
| `slug` | `slug` | URL用スラッグ |
| `freevideourl` / `link-video-3` | `videoUrl` | 無料/有料で使い分け |
| `video-length` | `videoDuration` | 動画の長さ |
| `freecontent` | `isPremium` | 論理反転（FreeContent=false → isPremium=true） |
| `description-3` | `content` | 記事本文 |

### Webflow Videos → Sanity Quest

| Webflowフィールド | Sanityフィールド | 備考 |
|-----------------|----------------|------|
| `is-this-a-section-title-3` | - | Quest判定用 |
| `series-video-order-3` | - | ソート用 |
| `name` (if section title) | `title` | Questタイトル |
| - | `questNumber` | 自動採番 |
| - | `articles` | Articleの参照配列 |
| - | `goal` | デフォルト値設定 |
| - | `estTimeMins` | 記事数 × 10分 |

---

## インポート結果（例）

### 成功したインポート

```
🚀 Starting Webflow → Sanity import for series: 684a8fd0ff2a7184d2108210

📥 Fetching Webflow data...
  → Series: 「3構造」ではじめるUIデザイン入門
  → Videos: 13 found

📝 Creating Articles and Quests in Sanity...

📚 Quest 1: 【3構造】00 タイトル01 レッスン概要
  → Creating article: 【3構造】01 レッスンで得られるもの・進め方
  ✅ Creating quest: 【3構造】00 タイトル01 レッスン概要 (1 articles)

📚 Quest 2: 【3構造】10 タイトル01 UIデザインの基本：3構造
  → Creating article: 【3構造】11 UIデザインはこの3つで決まる！『3構造』を徹底解説
  → Creating article: 【3構造】12 事例で理解！UIデザイン3構造：Instagram編
  ...
  ✅ Creating quest: 【3構造】10 タイトル01 UIデザインの基本：3構造 (5 articles)

🎓 Creating lesson: 「3構造」ではじめるUIデザイン入門
  ✅ Lesson created with 4 quests

✅ Import completed successfully!
```

### インポートされたデータ

- **Lesson**: 1件
  - ID: `webflow-series-684a8fd0ff2a7184d2108210`
  - Title: 「3構造」ではじめるUIデザイン入門
  - Quests: 4個

- **Quests**: 4件
  - Quest 1: レッスン概要（1記事）
  - Quest 2: UIデザインの基本（5記事）
  - Quest 3: 実践しよう（2記事）
  - Quest 4: つぎに進もう（1記事）

- **Articles**: 9件（合計）
  - すべて無料コンテンツ（isPremium: false）
  - 動画URL、動画の長さ、説明文が含まれる

---

## トラブルシューティング

### エラー: "Failed to fetch series: Not Found"

**原因**: Series Collection IDまたはSeries Item IDが間違っています。

**解決方法**:
1. Series Collection IDが`6029d01e01a7fb81007f8e4e`であることを確認
2. Series Item IDが正しいことを確認
3. Webflow APIトークンが有効であることを確認

### エラー: "SANITY_AUTH_TOKEN is not set"

**原因**: Sanity認証トークンが設定されていません。

**解決方法**:
```bash
sanity debug --secrets
```
で取得したトークンを環境変数に設定します。

### エラー: "Failed to fetch videos"

**原因**: Videos Collection IDが間違っているか、APIトークンが無効です。

**解決方法**:
1. Videos Collection IDが`6029d027f6cb8852cbce8c75`であることを確認
2. Webflow APIトークンを再確認

---

## 次のステップ

### 1. Sanity Studioでデータを確認

```bash
cd sanity-studio
npm run dev
```

ブラウザで http://localhost:3333 を開いて、以下を確認:
- レッスン一覧
- クエスト一覧
- 記事一覧

### 2. フロントエンドで表示テスト

```bash
cd ..
npm run dev
```

ブラウザで http://localhost:8081 を開いて、インポートしたレッスンを確認:
- `/lessons` - レッスン一覧
- `/lessons/three-structures-ui-design` - 「3構造」レッスン詳細

### 3. 追加のSeriesをインポート

他のSeriesをインポートする場合は、Series IDを変更して同じコマンドを実行:

```bash
npm run import-webflow -- --series-id=<another-series-id>
```

---

## 参考資料

- **Webflow API Docs**: https://docs.webflow.com/docs/api
- **Sanity Client Docs**: https://www.sanity.io/docs/js-client
- **スクリプト場所**: `sanity-studio/scripts/import-from-webflow.ts`
- **型定義**: `supabase/functions/webflow-series/types.ts`
- **変換ロジック**: `supabase/functions/webflow-series/transformer-fixed-v2.ts`

---

## 完了！

Webflowからのデータインポートが完了しました。Sanity Studioでデータを確認し、フロントエンドでの表示をテストしてください。
