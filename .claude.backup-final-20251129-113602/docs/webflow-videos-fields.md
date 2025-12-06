# Webflow Videos Collection フィールド一覧

## Basic info

| フィールド名 | 型 | 必須 | Sanity対応 | 備考 |
|------------|-----|-----|-----------|------|
| Name | Plain text | ✅ | `title` | 動画タイトル |
| Slug | Plain text | ✅ | `slug` | URL用スラッグ |

## Custom fields

| フィールド名 | 型 | 必須 | Sanity対応 | 備考 |
|------------|-----|-----|-----------|------|
| VideoTitle | Plain text | ❌ | ❌ 不要 | 動画タイトル（Nameと重複？） |
| Video Thumbnail | Image | ❌ | ❌ 不要 | 動画サムネイル |
| Is this a section title? | Switch | ❌ | ❌ 使用中 | セクションタイトル判定（Quest分割用） |
| コンテンツ概要 - Summary | Plain text | ❌ | ❌ 不要 | コンテンツ概要 |
| CategoryMd-Design-Flow | Reference | ❌ | ❌ 不要 | カテゴリ参照 |
| CategoryTy-tag | Reference | ❌ | ❌ 不要 | タグ参照 |
| Series | Reference | ❌ | ❌ 使用中 | シリーズ参照（親レッスン） |
| Link Video | Video link | ❌ | `videoUrl` | 有料動画URL |
| FreeVideoURL | Video link | ❌ | `videoUrl` | 無料動画URL |
| Video Length | Plain text | ✅ | `videoDuration` | 動画の長さ |
| Next Video | Reference | ❌ | ❌ 不要 | 次の動画参照 |
| Series Video Order | Number | ❌ | ❌ 使用中 | 表示順序（ソート用） |
| 更新に表示しない | Switch | ❌ | ❌ 不要 | 表示フラグ |
| FreeContent | Switch | ❌ | `isPremium` | 無料コンテンツか（論理反転） |
| FreeVideo | Reference | ❌ | ❌ 不要 | 無料動画参照 |
| CommunityVideo | Switch | ❌ | ❌ 不要 | コミュニティ動画か |
| Description | Rich text | ❌ | `content` | 動画の説明 |
| Description Free | Rich text | ❌ | ❌ 不要 | 無料版の説明 |
| Series Number | Plain text | ❌ | ❌ 不要 | シリーズ番号 |
| Video Item ID | Plain text | ❌ | ❌ 不要 | 動画アイテムID |
| step-number | Plain text | ❌ | ❌ 不要 | ステップ番号 |
| シリーズ紹介動画 | Switch | ❌ | ❌ 不要 | シリーズ紹介動画か |
| Number of Total Favorite | Number | ❌ | ❌ 不要 | お気に入り数 |

---

## Sanityマッピング（Article型）

### 自動取得すべきフィールド

| Webflowフィールド | Sanityフィールド | 優先度 | 備考 |
|-----------------|----------------|-------|------|
| Name | `title` | 🔴 必須 | 既に実装済み |
| Slug | `slug` | 🔴 必須 | 既に実装済み |
| FreeVideoURL | `videoUrl` | 🔴 必須 | 無料コンテンツ用（既に実装済み） |
| Link Video | `videoUrl` | 🔴 必須 | 有料コンテンツ用（既に実装済み） |
| Video Length | `videoDuration` | 🔴 必須 | 既に実装済み |
| FreeContent | `isPremium` | 🔴 必須 | 論理反転（既に実装済み） |
| Description | `content` | 🔴 必須 | 既に実装済み |
| Series Video Order | （ソート用） | 🔴 必須 | Quest内のソートに使用（既に実装済み） |
| Is this a section title? | （Quest判定） | 🔴 必須 | Quest分割に使用（既に実装済み） |

### 内部使用フィールド（表示しない）

- **Series**: 親レッスンの参照（API経由で自動取得）
- **Series Video Order**: ソート順序の決定に使用
- **Is this a section title?**: Quest/Article判定に使用

---

## 現在の実装状況

### ✅ 既に実装済み

すべての重要フィールドが実装済みです！

1. ✅ Name → `title`
2. ✅ Slug → `slug`
3. ✅ FreeVideoURL → `videoUrl` (無料コンテンツ)
4. ✅ Link Video → `videoUrl` (有料コンテンツ)
5. ✅ Video Length → `videoDuration`
6. ✅ FreeContent → `isPremium` (論理反転)
7. ✅ Description → `content`
8. ✅ Series Video Order → ソート用
9. ✅ Is this a section title? → Quest判定用

### 実装場所

- `supabase/functions/webflow-series/types.ts` - WebflowVideo型
- `supabase/functions/webflow-series/transformer.ts` - 変換ロジック
- `supabase/functions/webflow-series/webflow-client.ts` - API取得

---

## 注意事項

### 1. 動画URL取得ロジック（既に実装済み）

```typescript
if (!isPremium) {
  // 無料コンテンツ: FreeVideoURL を優先
  videoUrl = video.fieldData?.['freevideourl'] ?? video['freevideourl'] ?? ...
} else {
  // 有料コンテンツ: Link Video を使用
  videoUrl = video.fieldData?.['link-video-3'] ?? video.fieldData?.['link-video'] ?? ...
}
```

### 2. Quest分割ロジック（既に実装済み）

```typescript
const isSectionTitle = video.fieldData?.['is-this-a-section-title-3'] ?? ...

if (isSectionTitle) {
  // 新しいQuestを作成
  currentQuest = { title: name, articles: [] };
} else {
  // 現在のQuestにArticleを追加
  currentQuest.articles.push(transformVideoToArticle(video));
}
```

---

## Videos Collectionで追加実装は不要

Webflow Videosコレクションについては、**既に必要なフィールドがすべて実装されています**。

追加で取得したいフィールドがあれば教えてください。
