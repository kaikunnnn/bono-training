# 修正アクションプラン

**作成日**: 2025-11-14
**ステータス**: プラン作成完了、実装待ち

---

## ⚠️ 重要な原則

- **1つずつ実装する**
- **各ステップ完了後に確認する**
- **不安な点は質問してから進める**
- **一気に全部やらない**

---

## 📋 修正する問題（優先順）

1. ✅ 問題1: Lessonの説明がインポートされていない
2. ✅ 問題2: 記事のサムネイルが取得できていない
3. ✅ 問題3: YouTube動画URLが表示されない

---

## 🔧 問題1: Lessonの説明フィールド修正

### 現状の問題
- Webflowフィールド名が間違っている
- 取得しようとしている: `ExplainWhyThisSeries-Description` ❌
- 実際に存在する: `description` ✅

### 修正内容

#### Step 1.1: Sanityスキーマを修正
**ファイル**: `sanity-studio/schemaTypes/lesson.ts`

**変更箇所**: 26-52行目

**変更前**:
```typescript
defineField({
  name: "description",
  title: "説明",
  type: "array",  // ← Portable Text形式
  of: [{ type: "block", ... }],
  description: "レッスンの説明（ExplainWhyThisSeries-Description）",
}),
```

**変更後**:
```typescript
defineField({
  name: "description",
  title: "説明",
  type: "text",  // ← 通常のテキスト
  rows: 5,
  description: "レッスンの説明（Webflow: description）",
}),
```

#### Step 1.2: インポートスクリプトを修正
**ファイル**: `sanity-studio/scripts/import-from-webflow.ts`

**変更箇所**: 498-505行目

**変更前**:
```typescript
// Get description from Webflow: ExplainWhyThisSeries-Description (Rich Text)
const descriptionRaw = series.fieldData?.['ExplainWhyThisSeries-Description'] ||
                       series.fieldData?.['explainwhythisseries-description'] ||
                       series.fieldData?.['ExplainWhyThisSeriesDescription'] ||
                       series['ExplainWhyThisSeries-Description'];

// Convert description to Portable Text to preserve formatting
const description = descriptionRaw ? htmlToPortableText(descriptionRaw) : undefined;
```

**変更後**:
```typescript
// Get description from Webflow: description field (plain text)
const descriptionRaw = series.fieldData?.['description'] ||
                       series['description'];

// Convert HTML to plain text (strip tags)
const description = descriptionRaw ? stripHtml(descriptionRaw) : undefined;
```

#### Step 1.3: データ再インポート
```bash
# 既存データ削除
SANITY_AUTH_TOKEN=*** npm run delete-webflow

# 再インポート
SANITY_STUDIO_PROJECT_ID=cqszh4up \
SANITY_STUDIO_DATASET=production \
SANITY_AUTH_TOKEN=*** \
WEBFLOW_TOKEN=*** \
npm run import-webflow -- --series-id=684a8fd0ff2a7184d2108210
```

#### Step 1.4: 確認
- [ ] Sanity Studioで「説明」フィールドにテキストが入っているか
- [ ] HTMLタグが除去されているか

---

## 🔧 問題2: 記事のサムネイル修正

### 現状の問題
- サムネイルが取得できていない
- フィールド名: `videothumbnail` と報告されているが、実際に確認が必要

### 修正内容

#### Step 2.1: デバッグログを追加してフィールド名を確認
**ファイル**: `sanity-studio/scripts/import-from-webflow.ts`

**追加箇所**: 189行目の前

```typescript
// DEBUG: Log all video fieldData keys for first video
if (orderIndex === 0) {
  console.log('\n=== DEBUG: First Video fieldData keys ===');
  if (video.fieldData) {
    Object.keys(video.fieldData).forEach(key => {
      if (key.toLowerCase().includes('thumb') || key.toLowerCase().includes('image')) {
        console.log(`  ${key}:`, video.fieldData[key]);
      }
    });
  }
  console.log('=== END DEBUG ===\n');
}
```

#### Step 2.2: デバッグログ付きでインポート実行
```bash
SANITY_STUDIO_PROJECT_ID=cqszh4up \
SANITY_STUDIO_DATASET=production \
SANITY_AUTH_TOKEN=*** \
WEBFLOW_TOKEN=*** \
npm run import-webflow -- --series-id=684a8fd0ff2a7184d2108210
```

ログから正しいフィールド名を確認する。

#### Step 2.3: 正しいフィールド名で修正
**ファイル**: `sanity-studio/scripts/import-from-webflow.ts`

**変更箇所**: 190-192行目

確認したフィールド名に応じて修正（例）:
```typescript
const thumbnailUrl = video.fieldData?.['正しいフィールド名']?.url ||
                     video.fieldData?.['代替フィールド名']?.url;
```

#### Step 2.4: デバッグログを削除して再インポート

#### Step 2.5: 確認
- [ ] Sanity Studioで記事のサムネイルURLが入っているか
- [ ] `/lesson`ページでクエスト内記事にサムネイルが表示されているか

---

## 🔧 問題3: YouTube動画URL対応

### 現状の問題
- Vimeoのみ対応、YouTubeは未対応
- YouTubeリンクの場合、動画ブロックごと非表示になる

### 修正内容

#### Step 3.1: VideoSectionコンポーネントを修正
**ファイル**: `src/components/article/VideoSection.tsx`

**追加**: YouTube/Vimeo判定関数

```typescript
// URLからプラットフォームとIDを判定
const getVideoInfo = (url: string | null | undefined | { url?: string }) => {
  if (!url) return null;

  const urlString = typeof url === 'string' ? url : url?.url;
  if (!urlString || typeof urlString !== 'string') return null;

  // YouTube判定: youtu.be/xxx or youtube.com/watch?v=xxx
  const youtubeMatch = urlString.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) {
    return { platform: 'youtube', id: youtubeMatch[1] };
  }

  // Vimeo判定: vimeo.com/xxx
  const vimeoMatch = urlString.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { platform: 'vimeo', id: vimeoMatch[1] };
  }

  return null;
};
```

**変更**: レンダリング部分

```typescript
const videoInfo = getVideoInfo(videoUrl);

if (!videoInfo) {
  return null; // URLが無効またはサポートされていない
}

return (
  <div className="w-full">
    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
      {videoInfo.platform === 'youtube' ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoInfo.id}`}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video player"
        />
      ) : (
        <iframe
          src={`https://player.vimeo.com/video/${videoInfo.id}?title=0&byline=0&portrait=0`}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Vimeo video player"
        />
      )}
    </div>
  </div>
);
```

#### Step 3.2: 確認
- [ ] YouTubeリンクの記事で動画が表示されるか
- [ ] Vimeoリンクの記事で動画が表示されるか（既存機能が壊れていないか）

---

## 📊 実装順序

### Phase 1: 問題1を修正
1. Step 1.1: Sanityスキーマ修正
2. Step 1.2: インポートスクリプト修正
3. Step 1.3: データ再インポート
4. Step 1.4: 確認
5. ✅ 完了確認後、次へ

### Phase 2: 問題2を修正
1. Step 2.1: デバッグログ追加
2. Step 2.2: デバッグ実行
3. Step 2.3: 正しいフィールド名で修正
4. Step 2.4: 再インポート
5. Step 2.5: 確認
6. ✅ 完了確認後、次へ

### Phase 3: 問題3を修正
1. Step 3.1: VideoSectionコンポーネント修正
2. Step 3.2: 確認
3. ✅ 完了

---

## 🎯 次のアクション

**問題1から開始します。**

実装を開始してよろしいですか？

---

## 📝 メモ

- 各Phaseは完全に独立している
- 前のPhaseが完了してから次に進む
- データ再インポートは問題1と2で各1回ずつ必要
- 問題3はフロントエンドのみの修正なので再インポート不要
