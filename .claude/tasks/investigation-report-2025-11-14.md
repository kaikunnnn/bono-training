# 現状調査レポート: 残っている問題

**調査日**: 2025-11-14
**ステータス**: 調査完了、修正プラン作成待ち

---

## 📋 調査対象の問題

1. Lessonの説明がWebflowからインポートされていない
2. 記事のサムネイルが取得できていない
3. YouTube動画URLが表示されない

---

## 🔍 問題1: Lessonの説明フィールド

### 現状

#### Sanityスキーマ (`sanity-studio/schemaTypes/lesson.ts`)
- **フィールド名**: `description`
- **現在の型**: `array`（Portable Text形式）
- **場所**: 26-52行目

#### インポートスクリプト (`sanity-studio/scripts/import-from-webflow.ts`)
- **取得しようとしているWebflowフィールド**: `ExplainWhyThisSeries-Description`
- **場所**: 499-505行目
- **処理**: HTMLをPortable Textに変換

```typescript
const descriptionRaw = series.fieldData?.['ExplainWhyThisSeries-Description'] ||
                       series.fieldData?.['explainwhythisseries-description'] ||
                       series.fieldData?.['ExplainWhyThisSeriesDescription'] ||
                       series['ExplainWhyThisSeries-Description'];

const description = descriptionRaw ? htmlToPortableText(descriptionRaw) : undefined;
```

### 調査結果：Webflow APIレスポンス

**重要**: Webflow APIに`ExplainWhyThisSeries-Description`フィールドは**存在しない** ❌

#### 実際に存在するフィールド（Series）
```
- description: (string) <h3 id="">...</h3>  ← HTMLデータあり ✅
- aboutthisseries: (string) <h3 id="">...</h3>  ← HTMLデータあり（overviewに使用中）
- descriptions-2: (string) UI設計がラクになる3つの役割を知ろう
- seriesgoal: (string) UI設計がラクになる3つの役割を知ろう
```

### 根本原因

**Webflowのフィールド名が間違っている**
- 取得しようとしているフィールド: `ExplainWhyThisSeries-Description` ❌
- 実際に存在するフィールド: `description` ✅

### ユーザーの要求

- **空のフィールド**: `description`（説明）
- **期待する型**: 通常のテキスト（リッチテキストではない）
- **Webflowデータソース**: ユーザーは「ExplainWhyThisSeries-Description」と言っているが、実際は`description`フィールドを指している可能性が高い

---

## 🔍 問題2: 記事のサムネイル

### 現状

#### Sanityスキーマ (`sanity-studio/schemaTypes/article.ts`)
- **フィールド名**: `thumbnailUrl`
- **型**: `url`
- **場所**: 82-87行目

#### インポートスクリプト (`sanity-studio/scripts/import-from-webflow.ts`)
- **取得しようとしているWebflowフィールド**: `video-thumbnail` または `videothumbnail`
- **場所**: 190-192行目

```typescript
const thumbnailUrl = video.fieldData?.['video-thumbnail']?.url ||
                     video.fieldData?.['videothumbnail']?.url ||
                     video['video-thumbnail']?.url;
```

### ユーザーの報告

- **Webflowフィールド名**: `videothumbnail`
- **問題**: ずっと取得できていない

### 推測される問題

1. **フィールド名の大文字小文字**: Webflow APIのフィールド名は正確に一致する必要がある
2. **ネストの深さ**: `.url`でアクセスしているが、構造が違う可能性
3. **フィールド名自体が違う**: `videothumbnail`ではない可能性

### 確認が必要な情報

Webflow APIのVideosレスポンスで、実際のサムネイルフィールド名を確認する必要がある。
（APIエラーが出たため、代替方法：インポート時にログを追加して確認）

---

## 🔍 問題3: YouTube動画URL

### 現状

#### VideoSectionコンポーネント (`src/components/article/VideoSection.tsx`)
- **現在の対応**: Vimeoのみ
- **場所**: 17-28行目

```typescript
const getVimeoId = (url: string | null | undefined | { url?: string }): string | null => {
  if (!url) return null;

  const urlString = typeof url === 'string' ? url : url?.url;

  if (!urlString || typeof urlString !== 'string') return null;

  // https://vimeo.com/76979871 → 76979871
  const match = urlString.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
};
```

### 問題

- **YouTubeリンクの場合**: 動画ブロックごと何も表示されない
- **原因**: VimeoのIDが抽出できないため、`vimeoId`がnullになり、コンポーネントが`return null`で非表示になる（30-33行目）

### ユーザーの要求

- **YouTube**: YouTube埋め込みを表示
- **Vimeo**: Vimeo埋め込みを表示（現在は対応済み）

---

## 📊 優先順位

### 高: 問題1（Lessonの説明）
- **難易度**: 低
- **影響範囲**: 小（Lessonのdescriptionフィールドのみ）
- **修正内容**:
  1. Webflowフィールド名を`description`に変更
  2. Sanityスキーマを`array`→`text`に変更（ユーザー要求）
  3. HTMLをプレーンテキストに変換（stripHtml使用）

### 高: 問題2（記事のサムネイル）
- **難易度**: 中（フィールド名の確認が必要）
- **影響範囲**: 中（Sanity Studio、/lessonページ）
- **修正内容**:
  1. 実際のWebflowフィールド名を確認
  2. インポートスクリプトのフィールド名を修正
  3. データ再インポート

### 高: 問題3（YouTube動画URL）
- **難易度**: 中
- **影響範囲**: 中（記事詳細ページの動画表示）
- **修正内容**:
  1. YouTubeとVimeoのURL判定ロジックを追加
  2. それぞれの埋め込みHTMLを出し分け

---

## 🎯 次のステップ

1. ✅ 現状調査完了
2. ⏳ 修正アクションプランを作成
3. ⏳ 問題1から順番に修正（1つずつ）
4. ⏳ 各修正後にデータ再インポート・確認

---

## 📝 メモ

- Webflow APIのフィールド名は正確に一致する必要がある
- 大文字小文字も区別される
- ユーザーが言っている「ExplainWhyThisSeries-Description」は実際には`description`の可能性が高い
- 問題2のフィールド名確認のため、インポート時にログを追加して実行する必要がある
