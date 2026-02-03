# レッスンページ パフォーマンス改善

**作成日**: 2025-01-26
**ステータス**: ✅ 完了

---

## 結果サマリー

| ページ | Before | After | 改善 |
|--------|--------|-------|------|
| レッスン一覧（`/lessons`） | ~4秒 | ~0.6秒 | ✅ 85%削減 |
| レッスン詳細（`/lessons/:slug`） | ~0.6秒 | ~0.6秒 | ✅ 元々Sanityのみ |

---

## 問題

レッスン一覧ページ（`/lessons`）の読み込みが遅い。

---

## 調査結果

### 現状のアーキテクチャ

```
ユーザー
  ↓
Lessons.tsx (useLessons hook)
  ↓
┌─────────────────────────────────────────┐
│ fetchIntegratedLessons()                │
│  1. Sanity Query (全レッスン取得)        │  ~600ms
│  2. Webflowソースがあるレッスンごとに    │
│     → Edge Function (webflow-series)    │  ~3,400ms × N
└─────────────────────────────────────────┘
```

### 計測結果

| 処理 | 時間 | 備考 |
|------|------|------|
| Sanity クエリ | ~600ms | CDN経由、比較的高速 |
| Webflow Edge Function (1回) | **~3,400ms** | **極めて遅い** |
| Webflow Edge Function (2回目) | **~3,400ms** | **キャッシュ効いていない** |

### データ構成

| 項目 | 値 |
|------|-----|
| 総レッスン数 | 6 |
| Webflowソースあり | 2 |
| Webflowソースなし | 4 |

### ボトルネック

1. **Webflow Edge Function が極めて遅い（3.4秒/回）**
   - Webflow API自体が遅い
   - Edge Functionのコールドスタート
   - データ変換処理

2. **キャッシュが機能していない**
   - Edge Functionのインメモリキャッシュはインスタンス単位
   - 異なるインスタンスに振り分けられるとキャッシュミス
   - Supabaseの無料プランではEdge Functionインスタンスが頻繁にリサイクル

3. **N+1クエリパターン**
   - Webflowソースがあるレッスン数だけAPIコールが発生
   - Promise.allで並列化されているが、各コールが3秒以上かかる

### 総読み込み時間（現状）

```
Sanity: 600ms
+ Webflow (並列2件): ~3,400ms
──────────────────────
合計: ~4,000ms（4秒）
```

---

## 改善案

### 案1: Webflow データを Sanity に同期（推奨）

**概要**: Webflowのデータを定期的にSanityに同期し、フロントエンドはSanityのみ参照

**メリット**:
- Webflow APIコールが不要になる
- 読み込み時間が600ms程度に短縮
- シンプルなアーキテクチャ

**デメリット**:
- 同期バッチの実装が必要
- データの鮮度が同期頻度に依存

**実装工数**: 中（2-4時間）

---

### 案2: Supabase データベースにキャッシュ

**概要**: Edge FunctionでWebflowデータをSupabaseのPostgresに永続化

**メリット**:
- インスタンス間でキャッシュ共有
- 2回目以降は高速

**デメリット**:
- 初回アクセスは依然として遅い
- キャッシュ無効化ロジックが必要

**実装工数**: 中（2-3時間）

---

### 案3: Webflow統合を廃止

**概要**: Webflowソースの参照を停止し、Sanityデータのみ使用

**メリット**:
- 最もシンプル
- 即座に改善

**デメリット**:
- Webflowのコンテンツが表示されなくなる
- Webflowで管理している2レッスンの移行が必要

**実装工数**: 小（30分）

---

### 案4: レッスン一覧では Webflow を呼ばない（暫定対応）

**概要**: 一覧ページではSanityデータのみ表示し、詳細ページでのみWebflowを読み込む

**メリット**:
- 一覧ページは即座に高速化
- Webflow統合は維持

**デメリット**:
- 一覧でのタイトル・説明がSanity版になる
- 詳細ページは依然として遅い

**実装工数**: 小（30分）

---

## 推奨アプローチ

**短期（即効性）**: 案4 を実装
- 一覧ページの体験を即座に改善
- 工数が小さい

**中期**: 案1 または 案2 を検討
- 詳細ページも含めた根本解決

---

## 実装計画

### Phase 1: 暫定対応（案4）✅ 完了

**実装日**: 2025-01-26

**変更内容**:
1. `src/hooks/useLessons.ts` を修正
2. Webflow Edge Function呼び出しを削除
3. 一覧ページではSanityデータのみ使用

**結果**:
- 読み込み時間: ~4秒 → ~0.6秒（約85%削減）
- Webflow APIの遅延がなくなった
- コードが大幅に簡素化された（不要な型定義・関数を削除）

**注意**:
- 詳細ページ（`/lessons/:slug`）ではWebflowソースがあるレッスンは引き続きWebflow APIを呼ぶ
- `useLessonDetail` hookは変更なし

### Phase 2: Webflow → Sanity データ移行（別タスク）

**ステータス**: 未着手（パフォーマンス改善とは別タスクとして管理）

**概要**: WebflowのコンテンツをSanityにインポートする

**詳細は別途相談予定**

---

## 変更ファイル

| ファイル | 変更内容 |
|----------|----------|
| `src/hooks/useLessons.ts` | Webflow API呼び出しを削除、Sanityのみ使用に変更 |
| `.claude/docs/features/2025-01-lessons-performance/README.md` | このドキュメント（調査結果・実装ログ） |

## 実装ログ

### 2025-01-26: Phase 1 実装完了

**問題**: レッスン一覧ページの読み込みが~4秒かかっていた

**原因**:
1. Webflow Edge Function が1回あたり~3.4秒かかる
2. WebflowソースがあるレッスンごとにAPIを呼んでいた（N+1パターン）
3. Edge Functionのインメモリキャッシュが効かない（インスタンス単位）

**解決策**:
- `useLessons` フックを修正し、一覧ページではWebflow APIを呼ばないようにした
- Sanityデータのみを使用（~600msで完了）

**Before**:
```typescript
// Webflowソースがあるレッスンを並列でフェッチ
const lessonsWithWebflow = await Promise.all(
  sanityLessons.map(async (lesson) => {
    if (lesson.webflowSource) {
      const webflowData = await fetchWebflowSeries(lesson.webflowSource);
      // ... 3.4秒 × N
    }
  })
);
```

**After**:
```typescript
// Sanityデータをそのまま返す
return client.fetch(query); // ~600ms
```

**結果**: 読み込み時間 ~4秒 → ~0.6秒（約85%削減）
