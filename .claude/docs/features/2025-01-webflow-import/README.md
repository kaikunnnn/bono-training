# Webflow → Sanity データインポート

**作成日**: 2025-01-26
**ステータス**: ✅ Step 1 完了 → Step 2 待機中

---

## 概要

WebflowのSeries CMSデータ（44件）をSanityにインポートする。

### 背景

| 環境 | CMS | 状態 |
|------|-----|------|
| 本番サイト（bo-no.design） | Webflow | 継続使用 |
| 新サイト（bono-training） | Sanity | ← ここにインポート |

### 目標

- 44件のWebflow SeriesをSanityのlesson/quest/articleドキュメントとして作成
- データの整合性を保証
- 失敗時のリカバリー可能

---

## データマッピング

### Webflow → Sanity 対応表

| Webflow | Sanity | 備考 |
|---------|--------|------|
| Series | lesson | 1:1 |
| Series.name | lesson.title | |
| Series.slug | lesson.slug | |
| Series.descriptions-2 | lesson.description | |
| Series.thumbnail | lesson.iconImageUrl | URL文字列 |
| Series.ogpimezi | lesson.thumbnailUrl | URL文字列 |
| Series.categories | lesson.category | 要変換 |
| Series.aboutthisseries | lesson.overview | HTML→PortableText |
| Video (section=true) | quest | セクションタイトル |
| Video (section=false) | article | 記事/動画 |
| Video.name | article.title | |
| Video.slug | article.slug | |
| Video.link-video | article.videoUrl | |
| Video.video-length | article.videoDuration | |
| Video.freecontent | article.isPremium | 論理反転（free=true → premium=false） |

---

## 実行計画

### Step 1: プレビュー ⏳ 実行中

**目的**: 実際にインポートせず、データ変換結果を確認

**前提条件**:
- [ ] WEBFLOW_API_TOKEN を `.env.local` に追加

```bash
# .env.local に追加
WEBFLOW_API_TOKEN=wf_xxxxxxxx
```

トークン取得先: https://webflow.com/dashboard → Account Settings → Apps & Integrations → API Access

**成果物**:
- `scripts/webflow-import/preview.ts` - プレビュースクリプト ✅ 作成済み
- `scripts/webflow-import/output/preview-YYYY-MM-DD.json` - 変換結果

**実行コマンド**:
```bash
npx ts-node scripts/webflow-import/preview.ts
```

**確認項目**:
- [x] 44件全て取得できるか → ✅ 44件取得成功
- [x] データ変換が正しいか → ✅ 正常に変換
- [x] 欠損データがないか → ✅ エラー0件

**実行結果** (2025-01-26):
```
レッスン: 44件
クエスト: 139件
記事:     545件
エラー:   0件

出力ファイル: scripts/webflow-import/output/preview-2026-01-26.json (828KB)
```

**注意点**:
- 2件のレッスンは動画0件（空）:
  - 「目的達成のUI設計」
  - 「Webデザインの組み立て方」

---

### Step 2: テストインポート ✅ 実行完了

**目的**: 実際にSanityにデータを作成し、動作確認

**実行コマンド**:
```bash
npx ts-node scripts/webflow-import/import.ts --test
```

**インポート結果**:
```
レッスン: UIタイポグラフィ入門
  - 4クエスト作成
  - 7記事作成
  - Dataset: development
```

**確認項目**:
- [ ] Sanity Studioでドキュメントが見えるか
- [ ] レッスン詳細ページで正しく表示されるか
- [ ] クエスト・記事の階層が正しいか

---

### Step 3: 本番インポート（全件）

**目的**: 全44件をインポート

**安全策**:
- 重複チェック（同じslugがあればスキップ）
- エラー時は該当アイテムをスキップして続行
- 結果ログを出力

**実行結果**:
```
（実行後に記入）
```

---

## 技術仕様

### 使用するAPI

1. **Webflow API** (既存Edge Function経由)
   - `webflow-series` Edge Function
   - Series一覧取得 + 各Seriesの詳細取得

2. **Sanity API**
   - `@sanity/client` を使用
   - `createOrReplace` でドキュメント作成

### スクリプト構成

```
scripts/webflow-import/
├── preview.ts          # Step 1: プレビュー
├── import.ts           # Step 2-3: インポート実行
├── utils/
│   ├── webflow.ts      # Webflowデータ取得
│   ├── transform.ts    # データ変換
│   └── sanity.ts       # Sanity書き込み
└── output/
    └── preview-*.json  # プレビュー結果
```

---

## リスクと対策

| リスク | 対策 |
|--------|------|
| データ欠損 | プレビューで事前確認 |
| 変換エラー | エラーハンドリング + ログ出力 |
| 重複作成 | slugベースの重複チェック |
| 途中失敗 | 部分実行可能な設計 |

---

## 実行ログ

### 2025-01-26

| 時刻 | アクション | 結果 |
|------|------------|------|
| 15:20 | ドキュメント作成 | ✅ 完了 |
| 15:25 | プレビュースクリプト作成 | ✅ 完了 |
| 15:30 | WEBFLOW_API_TOKEN設定 | ✅ 完了（Site API token） |
| 15:35 | プレビュー実行（1回目） | ❌ 403エラー（cms:read権限不足） |
| 15:37 | Site API tokenに変更 | ✅ 完了 |
| 15:40 | プレビュー実行（2回目） | ✅ 完了（44レッスン取得） |

**Step 1 結果**:
- レッスン: 44件
- クエスト: 139件
- 記事: 545件
- エラー: 0件
- 出力: `scripts/webflow-import/output/preview-2026-01-26.json`

---

## 次のアクション

1. ~~プレビュースクリプトを作成~~ ✅
2. ~~実行してデータ確認~~ ✅
3. **Step 2: テストインポート（1-2件）** ← 次
4. Step 3: 本番インポート（全44件）
