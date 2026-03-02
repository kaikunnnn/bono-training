# Webflowレッスン完全インポート タスク

**作成日**: 2025-02-25
**ステータス**: ✅ 完了

---

## 目標

Webflowの全レッスン（44 Series）をSanityにインポートし、Lessonsページでカテゴリ別に表示する。

---

## 調査結果サマリー

### Webflowデータ（2026-01-26時点）

| 項目 | 件数 |
|------|------|
| Series（レッスン） | 44 |
| Quest（クエスト） | 139 |
| Article（記事） | 545 |

### 既存実装

| 機能 | 状態 | 場所 |
|------|------|------|
| Webflow APIクライアント | ✅ 実装済 | `supabase/functions/webflow-series/` |
| インポートスクリプト | ✅ 実装済 | `scripts/webflow-import/` |
| Sanityスキーマ | ✅ 実装済 | `sanity-studio/schemaTypes/` |
| Lessonsページ | ✅ 実装済 | `src/pages/Lessons.tsx` |
| カテゴリフィルタリング | ❌ 未実装 | - |

### 問題点

1. **Quest ID重複** - タイムスタンプベースで再インポート時に重複
2. **カテゴリ未設定** - Webflowのcategoriesフィールドが変換されない
3. **フィルタUI未実装** - 一覧表示のみ

---

## 実装計画

### Phase 1: インポートスクリプト改善 ✅ 完了

1. Quest IDを固定形式に変更: `webflow-series-{seriesId}-quest-{questNumber}`
2. Webflowのcategoriesをマッピング

### Phase 2: 全レッスンインポート実行 ✅ 完了（2025-02-25）

```bash
npx ts-node scripts/webflow-import/import.ts --all
```

**インポート結果**:
- 41レッスン新規作成（3件はスキップ: 既存）
- 多数のクエストと記事を自動生成
- カテゴリ情報も正常にマッピング

### Phase 3: カテゴリフィルタリングUI実装 ✅ 完了（2025-02-25）

1. ✅ `src/pages/Lessons.tsx`にカテゴリフィルターを実装
2. ✅ 「すべて」+ 各カテゴリボタンでフィルタリング可能
3. ✅ 各カテゴリの件数を表示

### Phase 4: カテゴリマッピング修正 ✅ 完了（2025-02-26）

**問題**: インポート時にカテゴリが紐付けされていなかった（47/49件が未設定）

**対応**:
1. ✅ 新規カテゴリ作成: 「キャリア」「BONO」
2. ✅ Webflow→Sanityカテゴリマッピング実装
3. ✅ 全レッスンにカテゴリを設定（45件更新）

**カテゴリ分布（修正後）**:
| カテゴリ | 件数 |
|----------|------|
| UI | 15 |
| 情報設計 | 15 |
| UX | 7 |
| キャリア | 5 |
| BONO | 4 |
| 未設定 | 3（Sanity独自レッスン） |

**作成したスクリプト**: `scripts/webflow-import/update-categories.ts`

---

## 環境設定

```bash
# 必要な環境変数（.env.local）
WEBFLOW_API_TOKEN=xxx
SANITY_AUTH_TOKEN=xxx
```

---

## 関連ファイル

- `scripts/webflow-import/preview.ts` - プレビュー生成
- `scripts/webflow-import/import.ts` - インポート実行
- `scripts/webflow-import/update-categories.ts` - カテゴリ更新スクリプト
- `src/pages/Lessons.tsx` - レッスン一覧ページ
- `src/hooks/useLessons.ts` - レッスン取得Hook
