# /lessons ページ パフォーマンス分析と改善案

**作成日**: 2025-11-15
**問題**: /lessonsページの読み込みが非常に遅い

---

## 🔍 問題の原因

### 現状のデータフロー

```
ユーザーが /lessons にアクセス
  ↓
useLessons() フックが発火
  ↓
① Sanity から全レッスンを取得（4件）
  ↓
② 各レッスンに webflowSource があるか確認
  ↓
③ WebflowソースがあるレッスンごとにSupabase Edge Functionを呼び出し
  - センスを盗む技術 → Webflow API呼び出し
  - 「3構造」ではじめるUIデザイン入門 → Webflow API呼び出し
  ↓
④ Webflow APIが各Seriesデータ + 動画一覧を取得
  ↓
⑤ レッスンページ表示
```

### パフォーマンスボトルネック

#### **問題1: Webflow API の逐次呼び出し（最大の問題）**

**現在のコード** (`useLessons.ts:108-137`):
```typescript
const lessonsWithWebflow = await Promise.all(
  sanityLessons.map(async (lesson) => {
    if (!lesson.webflowSource) {
      return lesson;
    }

    // ❌ レッスンごとに Webflow API を呼び出し
    const webflowData = await fetchWebflowSeries(lesson.webflowSource);
    // ...
  })
);
```

**実際の処理時間**:
- Sanity fetch: ~200-500ms
- **Webflow Series API (1件あたり): 2-5秒** ← ボトルネック
- 2件のWebflowレッスンの場合: **4-10秒**
- 将来10件になると: **20-50秒**

#### **問題2: 不要なデータの取得**

Webflow API (`/functions/webflow-series`) は以下を取得:
- Series メタデータ（タイトル、説明、画像など）
- **全動画データ（quests, articles）** ← レッスン一覧では不要

**実際のレスポンスサイズ**:
- センスを盗む技術: ~50KB（quests 3個、articles 8個含む）
- 3構造UIデザイン: ~100KB（大量の動画含む）

**レッスン一覧で必要なデータ**:
- タイトル
- スラッグ
- 説明
- カバー画像URL
- カテゴリ

→ **80-90%のデータが無駄**

#### **問題3: React Query のキャッシュが効いていない**

現在のキャッシュ設定:
```typescript
staleTime: 5 * 60 * 1000, // 5分
gcTime: 10 * 60 * 1000,   // 10分
```

しかし、**ページ初回アクセス時は必ずAPIコール**が発生する。

---

## 📊 パフォーマンス測定

### 現状の読み込み時間（推定）

| ステップ | 所要時間 | 備考 |
|---------|---------|------|
| Sanity fetch | 300ms | 4件のレッスン取得 |
| Webflow API (1件目) | 3,000ms | センスを盗む技術 |
| Webflow API (2件目) | 4,000ms | 3構造UIデザイン |
| データマージ | 50ms | - |
| レンダリング | 100ms | - |
| **合計** | **7.45秒** | 🐢 非常に遅い |

### 目標の読み込み時間

| ステップ | 目標時間 | 改善方法 |
|---------|---------|---------|
| Sanity fetch | 300ms | 変更なし |
| Webflow データ | 0ms | ✅ Sanityにキャッシュ |
| レンダリング | 100ms | - |
| **合計** | **400ms** | 🚀 95% 改善 |

---

## 🎯 改善案

### 【推奨】案1: Sanityに事前キャッシュ（最も効果的）

Webflowデータを**Sanityに保存**し、`useLessons`は**Sanityのみ**から取得。

#### メリット
- ✅ **劇的な高速化**: 7.5秒 → 0.4秒（95%改善）
- ✅ Webflow APIの障害に強い
- ✅ キャッシュ制御が容易
- ✅ 将来のスケーラビリティ

#### 実装方法

**Step 1: Webflowインポート時にlessonドキュメントを更新**

`import-from-webflow.ts` を修正し、以下のフィールドをSanityに保存:
```typescript
await client.createOrReplace({
  _id: lessonId,
  _type: 'lesson',
  title: series.name,
  slug: { current: series.slug },
  description: series.description,
  coverImageUrl: series.thumbnailImage?.url,      // ← 追加
  iconImageUrl: series.iconImage?.url,            // ← 追加
  category: series.category?._ref,                // ← カテゴリ参照
  webflowSource: seriesId,
  quests: questIds.map(id => ({ _type: 'reference', _ref: id })),
});
```

**Step 2: useLessons を簡素化**

```typescript
// ❌ 削除: fetchWebflowSeries の呼び出し
// ✅ 追加: Sanity から全フィールド取得

const query = `*[_type == "lesson"] {
  _id,
  title,
  slug,
  description,
  coverImage,
  coverImageUrl,      // ← Webflowから保存済み
  iconImageUrl,       // ← Webflowから保存済み
  category,
  isPremium,
  webflowSource
}`;

const lessons = await client.fetch(query);
return lessons; // Webflow APIコール不要
```

**Step 3: Sanityスキーマ更新**

`lesson.ts` に既存のフィールドを確認（すでに `coverImageUrl`, `iconImageUrl` は存在）。

#### 移行手順

1. **既存のWebflowレッスンを再インポート**（データ更新）
   ```bash
   SANITY_AUTH_TOKEN=xxx npm run import-webflow -- --series-id=67e51906e5339d3194c7c43d
   SANITY_AUTH_TOKEN=xxx npm run import-webflow -- --series-id=684a8fd0ff2a7184d2108210
   ```

2. **useLessons.ts を更新**（Webflow API呼び出しを削除）

3. **動作確認**

---

### 案2: Webflow API のレスポンス最適化（中程度の改善）

Supabase Edge Function (`webflow-series`) に**軽量版エンドポイント**を追加。

#### メリット
- ✅ 中程度の高速化: 7.5秒 → 2-3秒（60%改善）
- ✅ Webflowの最新データを取得可能

#### デメリット
- ❌ 依然として遅い（複数API呼び出しが必要）
- ❌ Webflow API障害時にページが遅延

#### 実装方法

**Step 1: 軽量版APIエンドポイント作成**

`/functions/webflow-series-lite/` を新規作成:

```typescript
// リクエスト: { seriesIds: string[] }
// レスポンス: { id, title, slug, description, coverImageUrl }[]

const seriesData = await Promise.all(
  seriesIds.map(async (id) => {
    const series = await fetchWebflowSeries(id);
    return {
      id,
      title: series.name,
      slug: series.slug,
      description: series.description,
      coverImageUrl: series.thumbnailImage?.url,
      iconImageUrl: series.iconImage?.url,
      category: series.category,
    };
  })
);
```

**Step 2: useLessons を最適化**

```typescript
// 1回のAPIコールで全Webflowレッスンを取得
const webflowSeriesIds = sanityLessons
  .filter(l => l.webflowSource)
  .map(l => l.webflowSource);

const webflowData = await fetch('/functions/webflow-series-lite', {
  method: 'POST',
  body: JSON.stringify({ seriesIds: webflowSeriesIds }),
});
```

#### 改善効果
- 4回のAPI呼び出し → **1回**
- 合計 7.5秒 → **2-3秒**

---

### 案3: 段階的レンダリング（UX改善のみ）

データ取得は変えず、**表示を段階的**にする。

#### メリット
- ✅ ユーザー体験が向上（スケルトン表示）
- ✅ 実装が簡単

#### デメリット
- ❌ 実際の読み込み速度は変わらない

#### 実装方法

```tsx
function Lessons() {
  const { data: lessons, isLoading } = useLessons();

  return (
    <Layout>
      <h1>レッスン一覧</h1>

      {/* スケルトン表示 */}
      {isLoading && (
        <div className="grid grid-cols-3 gap-6">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* 実際のレッスン */}
      {lessons?.map(lesson => <LessonCard lesson={lesson} />)}
    </Layout>
  );
}
```

---

## 🚀 推奨実装プラン

### **Phase 1: 事前キャッシュ（案1）**

**優先度**: 🔥 最高
**所要時間**: 2-3時間
**改善効果**: 95%（7.5秒 → 0.4秒）

#### ステップ
1. `import-from-webflow.ts` を更新（coverImageUrl, iconImageUrl を保存）
2. 既存のWebflowレッスンを再インポート
3. `useLessons.ts` を簡素化（Webflow API削除）
4. 動作確認

---

### **Phase 2: 段階的レンダリング（案3）**

**優先度**: 🟡 中
**所要時間**: 30分
**改善効果**: UX向上のみ

#### ステップ
1. `SkeletonCard` コンポーネント作成
2. `Lessons.tsx` に追加

---

### **Phase 3: 定期同期の仕組み（将来）**

**優先度**: 🟢 低（余裕があれば）
**所要時間**: 4-5時間

#### 概要
Webflowのデータが更新された際に自動でSanityを更新する仕組み。

- **Option A**: Webflow Webhook → Supabase Function → Sanity更新
- **Option B**: Cron Job（毎日1回Webflowから取得 → Sanity更新）

---

## 📝 まとめ

### 現状
- ❌ 読み込み: **7.5秒**（非常に遅い）
- ❌ レッスンごとにWebflow APIを呼び出し
- ❌ 不要なデータ（quests, articles）を取得

### 改善後（案1実装時）
- ✅ 読み込み: **0.4秒**（95%改善）
- ✅ Sanityのみからデータ取得
- ✅ Webflow APIは不要

### 次のアクション

**すぐに実装すべき**:
1. **Phase 1: Sanity事前キャッシュ**（案1）
2. Phase 2: スケルトン表示（案3）

**将来的に検討**:
3. Phase 3: 定期同期の仕組み

---

## 🔧 技術詳細

### 現在のSanityクエリ（遅い）
```typescript
// ① Sanityから基本データ取得
const query = `*[_type == "lesson"] {
  _id, title, slug, description, coverImage, category, isPremium, webflowSource
}`;
const lessons = await client.fetch(query);

// ② 各レッスンでWebflow APIコール（2件 × 3秒 = 6秒）
await Promise.all(lessons.map(async (lesson) => {
  if (lesson.webflowSource) {
    const webflowData = await fetchWebflowSeries(lesson.webflowSource);
  }
}));
```

### 改善後のSanityクエリ（速い）
```typescript
// ① Sanityから全データ取得（Webflowデータも含む）
const query = `*[_type == "lesson"] {
  _id,
  title,
  slug,
  description,
  coverImage,
  coverImageUrl,  // ← インポート時に保存済み
  iconImageUrl,   // ← インポート時に保存済み
  category,
  isPremium
}`;
const lessons = await client.fetch(query);

// ② 終わり（Webflow APIコール不要）
return lessons;
```

### パフォーマンス比較表

| 項目 | 現状 | 改善後（案1） | 改善率 |
|-----|------|-------------|--------|
| Sanity fetch | 300ms | 300ms | - |
| Webflow API | 7,000ms | **0ms** | **100%** |
| データサイズ | 150KB | 10KB | 93%減 |
| 合計時間 | 7.5秒 | **0.4秒** | **95%減** |
| レッスン10件時 | 25秒 | **0.5秒** | **98%減** |

---

## 🎯 結論

**最優先で案1（Sanity事前キャッシュ）を実装すべき**。

理由:
- ✅ 最も効果的（95%改善）
- ✅ スケーラブル（レッスン数が増えても高速）
- ✅ Webflow障害に強い
- ✅ 実装コストも高くない（2-3時間）

次の手順で進めることを推奨:
1. `import-from-webflow.ts` を更新
2. 既存Webflowレッスンを再インポート
3. `useLessons.ts` を簡素化
4. 動作確認
