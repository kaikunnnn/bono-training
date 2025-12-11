# Sanity Studio 開発計画

**作成日**: 2025-12-11
**ステータス**: 計画中

---

## 概要

Sanity Studioに関する2つの開発タスク：
1. **バグ修正**: 記事詳細ページの左ナビゲーションに表示されない問題
2. **機能追加**: Markdown Importの改善と記事スキーマへの適用

---

## ドキュメント一覧

| ファイル | 内容 | ステータス |
|---------|------|-----------|
| `TASK-TRACKER.md` | タスク管理・進捗追跡 | ✅ 作成済 |
| `navigation-bug.md` | ナビゲーションバグ調査 | ✅ 作成済 |
| `markdown-import.md` | Markdown Import機能計画 | ✅ 作成済 |

---

## タスクサマリー

### Task 1: ナビゲーション表示バグ 🔴

**症状**: 記事詳細ページで左サイドナビにレッスン・クエスト・記事が表示されない

**原因候補**:
1. Sanityの参照構造が不完全（Quest→Lesson, Quest→Article）
2. クエリの取得失敗（questInfo/lessonInfo が null）
3. 進捗データ取得エラー

**優先度**: 高（ユーザー体験に直結）

### Task 2: Markdown Import機能 🟡

**症状**:
- 現在のMarkdownImportInputが動かない
- 記事本文にMarkdownで書いた内容を表示したい

**対応**:
1. 既存MarkdownImportInputのデバッグ
2. 記事スキーマ(article.ts)にMarkdownImport機能追加
3. Markdown直接保存＋表示の検討

**優先度**: 中

---

## 作業フロー

```
Phase 1: 調査・分析（現在）
├── ナビゲーションバグの原因特定
└── Markdown Import問題の調査

Phase 2: バグ修正
├── Sanityスキーマ/データの確認・修正
└── MarkdownImportInputの修正

Phase 3: 機能追加
├── 記事スキーマにMarkdown Import追加
└── Markdown表示機能の実装

Phase 4: テスト・デプロイ
├── ローカルテスト
└── Sanity Studio デプロイ
```

---

## 関連ファイル

### Sanity Studio
```
sanity-studio/
├── sanity.config.ts          # Sanity設定
├── schemaTypes/
│   ├── index.ts              # スキーマエクスポート
│   ├── lesson.ts             # レッスンスキーマ
│   ├── quest.ts              # クエストスキーマ
│   ├── article.ts            # 記事スキーマ
│   └── category.ts           # カテゴリスキーマ
├── components/
│   └── MarkdownImportInput.tsx  # Markdown変換コンポーネント
└── scripts/
    └── import-from-webflow.ts   # Webflowインポート
```

### フロントエンド
```
src/
├── pages/
│   └── ArticleDetail.tsx     # 記事詳細ページ
├── components/article/sidebar/
│   ├── ArticleSideNav.tsx    # サイドナビ親
│   ├── LessonSection.tsx     # レッスン情報
│   ├── QuestBlock.tsx        # クエストブロック
│   └── ContentItem.tsx       # 記事アイテム
└── lib/
    └── sanity.ts             # Sanityクエリ
```

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-11 | 初版作成・調査開始 |
