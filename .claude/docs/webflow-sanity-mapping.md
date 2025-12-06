# Webflow-Sanity データ構造マッピング

---

## Sanity Lesson スキーマ（現在の構造）

| フィールド名 | 型 | 必須 | 説明 |
|------------|-----|-----|------|
| `title` | string | ✅ | レッスンタイトル |
| `slug` | slug | ✅ | URL用スラッグ |
| `description` | text | ❌ | レッスンの説明文 |
| `iconImage` | image | ❌ | アイコン画像（200×200px推奨） |
| `coverImage` | image | ❌ | カバー画像（1200×630px推奨） |
| `category` | string | ❌ | カテゴリ（情報設計/UI/UX） |
| `isPremium` | boolean | ❌ | 有料レッスンフラグ |
| `webflowSource` | string | ❌ | Webflow Series ID（例: 684a8fd0ff2a7184d2108210） |
| `purposes` | array | ❌ | レッスンの目的（箇条書き） |
| `overview` | block content | ❌ | レッスンの概要（リッチテキスト） |
| `contentHeading` | string | ❌ | コンテンツ見出し |
| `quests` | array of references | 条件付き | クエストの参照（webflowSourceがない場合は必須） |

---

## Webflow Series スキーマ（あなたが記入してください）

### 基本情報
- **Collection名**: Series
- **Collection ID**:

### フィールド一覧

| Webflowフィールド名 | 型 | 説明 | 対応するSanityフィールド |
|-------------------|-----|------|----------------------|
| (ここに記入) | | | |
| (ここに記入) | | | |
| (ここに記入) | | | |
| (ここに記入) | | | |

### 例（参考）
```
| name | Plain Text | レッスン名 | title |
| slug | Slug | URL用 | slug |
| description | Plain Text | 説明文 | description |
| cover-image | Image | カバー画像 | coverImage |
```

---

## Webflow Videos スキーマ（あなたが記入してください）

### 基本情報
- **Collection名**: Videos
- **Collection ID**:

### フィールド一覧

| Webflowフィールド名 | 型 | 説明 | 対応するArticleフィールド |
|-------------------|-----|------|------------------------|
| (ここに記入) | | | |
| (ここに記入) | | | |
| (ここに記入) | | | |
| (ここに記入) | | | |

---

## マッピングルール

### Webflowから自動取得するフィールド

| Sanityフィールド | Webflowフィールド | 備考 |
|----------------|-----------------|------|
| `title` | (記入してください) | レッスン名 |
| `slug` | (記入してください) | URL用スラッグ |
| `description` | (記入してください) | 説明文（あれば） |
| `coverImage` | (記入してください) | カバー画像（あれば） |
| `category` | (記入してください) | カテゴリ（あれば） |

### Sanityで手動管理するフィールド

- `iconImage`
- `isPremium`
- `purposes`
- `overview`
- `contentHeading`
