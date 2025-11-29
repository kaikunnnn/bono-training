# Sanity Article（記事）に必要な項目リスト

## レッスン詳細ページで表示する項目（記事/動画コンテンツ）

→〜の先に書くのは Webflow Videos のデータです

1. **title** - 記事タイトル（動画タイトル） → `Name`
2. **slug** - URL用スラッグ → `Slug`
3. **videoUrl** - 動画URL → `FreeVideoURL`（無料）または `Link Video`（有料）
4. **videoDuration** - 動画の長さ → `Video Length`
5. **isPremium** - 有料フラグ → `FreeContent`（論理反転：false→true、true→false）
6. **content** - 記事の内容/説明 → `Description`

---

## 内部処理で使用する項目（表示しない）

7. **Series Video Order** - 表示順序 → ソート用に使用（記事の並び順）
8. **Is this a section title?** - セクションタイトルか → Quest分割に使用

---

## 実装状況

### ✅ 既に実装済み

すべてのフィールドが実装済みです！

| Sanity Article | Webflow Videos | 状態 |
|---------------|---------------|------|
| `title` | `Name` | ✅ 実装済み |
| `slug` | `Slug` | ✅ 実装済み |
| `videoUrl` | `FreeVideoURL` / `Link Video` | ✅ 実装済み（無料/有料で自動切替） |
| `videoDuration` | `Video Length` | ✅ 実装済み |
| `isPremium` | `FreeContent` | ✅ 実装済み（論理反転） |
| `content` | `Description` | ✅ 実装済み |

---

## 動画URL取得ロジック（既に実装済み）

```typescript
if (isPremium === false) {
  // 無料コンテンツ: FreeVideoURL を使用
  videoUrl = video.fieldData?.['freevideourl'] ?? ...
} else {
  // 有料コンテンツ: Link Video を使用
  videoUrl = video.fieldData?.['link-video-3'] ?? ...
}
```

---

## Quest分割ロジック（既に実装済み）

Webflow Videosの **Is this a section title?** フィールドを使って、動画をQuestにグループ化：

- `Is this a section title? = true` → 新しいQuestを作成
- `Is this a section title? = false` → 現在のQuestに記事を追加

---

## Articleに追加実装は不要

Webflow Videosから生成されるArticleについては、**既に必要なフィールドがすべて実装されています**。

追加で取得したいフィールドがあれば教えてください。
