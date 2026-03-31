# Layoutヘッダーグラデーションが表示されない問題

**作成日**: 2026-03-31
**ステータス**: ✅ 修正完了

---

## 概要

Layout.tsxのヘッダーグラデーション（紫/ピンク→クリーム→透明、148px高）が、一部のページで表示されていない。

### 期待される動作

全てのページで、ページ上部にグラデーションが表示される（サイドバーと同様）。

### 現状

- サイドバー上部: グラデーション見える ✅
- メインコンテンツ上部: 一部ページで見えない ❌

---

## 原因

### Layout.tsxの構造

```
┌─────────────────────────────────────────────────────────┐
│ Layout outer: bg-base (#F9F9F7)                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ グラデーション: fixed z-0, h-[148px], 全幅           │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────┐ ┌───────────────────────────────────────┐   │
│ │Sidebar  │ │ Main content: z-[1]                   │   │
│ │ z-10    │ │                                        │   │
│ │グラデ   │ │ ページコンテンツ                       │   │
│ │見える   │ │ ↓ここに bg-base があると隠れる        │   │
│ └─────────┘ └───────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### なぜ見えないのか

1. **Layout.tsxのグラデーション**: `fixed inset-x-0 top-0 h-[148px] z-0`
2. **メインコンテンツ**: `relative z-[1]`（グラデーションより上）
3. **各ページ**: `bg-[#f9f9f7]` または `bg-base` を設定
4. → **ページの不透明な背景がグラデーションを覆い隠す**

### なぜ/lessonsでは見えるのか

/lessonsページは背景色を設定していないため、Layout.tsxの`bg-base`のみが適用され、グラデーションが透けて見える。

---

## 影響を受けるページ一覧

### 本番ページ（要修正）

| ページ | ファイル | 背景設定 |
|--------|----------|----------|
| /roadmaps | `src/pages/roadmaps/index.tsx:108,128,157` | `bg-[#f9f9f7]` |
| /lessons/:id | `src/pages/LessonDetail.tsx:261` | `bg-base` |
| /search | `src/pages/Search.tsx:65` | `bg-[#F9F9F7]` |
| /knowledge | `src/pages/knowledge/KnowledgeList.tsx:211` | `bg-base` |
| /knowledge/:id | `src/pages/knowledge/KnowledgeDetail.tsx:245` | `bg-base` |
| /feedback-apply | `src/pages/feedback-apply/index.tsx:181` | `bg-base` |
| /feedback-apply/submit | `src/pages/feedback-apply/submit.tsx:445,459,482,503` | `bg-base` |
| /feedbacks | `src/pages/feedbacks/FeedbackList.tsx:288` | `bg-base` |
| /feedbacks/:id | `src/pages/feedbacks/FeedbackDetail.tsx:320` | `bg-base` |
| /events/:id | `src/pages/events/EventDetail.tsx:77,85` | `bg-base` |
| /articles/:id | `src/pages/ArticleDetail.tsx:414,422,439` | `bg-base` |
| /questions | `src/pages/questions/QuestionList.tsx:160` | `bg-base` |
| /questions/:id | `src/pages/questions/QuestionDetail.tsx:248` | `bg-base` |

### 問題なしページ

| ページ | ファイル | 背景設定 |
|--------|----------|----------|
| /lessons | `src/pages/Lessons.tsx` | なし ✅ |

---

## 修正方針

### 採用案: 各ページの背景色を削除

**理由**:
- Layout.tsxの外側コンテナに既に`bg-base`がある（line 45）
- 各ページで二重に背景色を指定する必要がない
- シンプルで影響範囲が明確

**修正内容**:
```diff
- <div className="min-h-screen bg-[#f9f9f7]">
+ <div className="min-h-screen">
```

```diff
- <div className="min-h-screen bg-base">
+ <div className="min-h-screen">
```

### 却下案: グラデーションのz-indexを上げる

**問題点**:
- グラデーションがコンテンツの上に被さる
- pointer-events-noneでも視覚的に邪魔になる可能性

### 却下案: 各ページの背景を透明にする

**問題点**:
- `bg-transparent`は明示的に透明にするだけで、結果は同じ
- 背景色を削除するだけで十分

---

## 修正対象ファイル一覧

1. `src/pages/roadmaps/index.tsx` - 3箇所
2. `src/pages/LessonDetail.tsx` - 1箇所
3. `src/pages/Search.tsx` - 1箇所
4. `src/pages/knowledge/KnowledgeList.tsx` - 1箇所
5. `src/pages/knowledge/KnowledgeDetail.tsx` - 1箇所
6. `src/pages/feedback-apply/index.tsx` - 1箇所
7. `src/pages/feedback-apply/submit.tsx` - 4箇所
8. `src/pages/feedbacks/FeedbackList.tsx` - 1箇所
9. `src/pages/feedbacks/FeedbackDetail.tsx` - 1箇所
10. `src/pages/events/EventDetail.tsx` - 2箇所
11. `src/pages/ArticleDetail.tsx` - 3箇所
12. `src/pages/questions/QuestionList.tsx` - 1箇所
13. `src/pages/questions/QuestionDetail.tsx` - 1箇所

**合計**: 13ファイル、21箇所

---

## 修正履歴

**2026-03-31**: 全13ファイル、21箇所の修正完了

修正済みファイル:
- ✅ `src/pages/roadmaps/index.tsx` - 3箇所
- ✅ `src/pages/LessonDetail.tsx` - 1箇所
- ✅ `src/pages/Search.tsx` - 1箇所
- ✅ `src/pages/knowledge/KnowledgeList.tsx` - 1箇所
- ✅ `src/pages/knowledge/KnowledgeDetail.tsx` - 1箇所
- ✅ `src/pages/feedback-apply/index.tsx` - 1箇所
- ✅ `src/pages/feedback-apply/submit.tsx` - 4箇所
- ✅ `src/pages/feedbacks/FeedbackList.tsx` - 1箇所
- ✅ `src/pages/feedbacks/FeedbackDetail.tsx` - 1箇所
- ✅ `src/pages/events/EventDetail.tsx` - 2箇所
- ✅ `src/pages/ArticleDetail.tsx` - 3箇所
- ✅ `src/pages/questions/QuestionList.tsx` - 1箇所
- ✅ `src/pages/questions/QuestionDetail.tsx` - 1箇所

---

## 確認事項

修正後、以下を確認:

1. [ ] 全ページでヘッダーグラデーションが表示される
2. [ ] ページコンテンツの背景色が維持される（Layout.tsxのbg-baseで）
3. [ ] スクロール時の表示に問題がない

---

## 関連ファイル

- `src/components/layout/Layout.tsx` - グラデーション定義元
- `.claude/docs/features/roadmap/GRADIENT-ISSUES.md` - RoadmapCard型定義の問題（別件）
