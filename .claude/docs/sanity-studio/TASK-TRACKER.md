# Sanity Studio タスクトラッカー

**最終更新**: 2025-12-11
**ステータス**: アクティブ

---

## 🎯 現在の作業

### Task 1: ナビゲーション表示バグ 🔴 CRITICAL

**優先度**: 🔴 最高
**ステータス**: ⏳ 調査中
**担当**: Claude Code

**問題**:
記事詳細ページ(`/articles/{slug}`)で、左サイドナビにレッスン・クエスト・記事が表示されない

**原因調査結果**:

| 確認項目 | 状態 | 詳細 |
|---------|------|------|
| Sanityクエリ構造 | ✅ 正常 | `getArticleWithContext()`は正しく定義 |
| スキーマ参照関係 | ⚠️ 要確認 | Quest→Lesson, Quest→Articleの実データ |
| フロント描画ロジック | ✅ 正常 | ArticleSideNavは適切に実装 |

**最も可能性が高い原因**:
1. **Sanityの実データ**: 記事がQuestに参照されていない、またはQuestがLessonに参照されていない
2. **警告ログ**: `questInfo` または `lessonInfo` が null

**次のアクション**:
1. [ ] Sanity Studioで実際のデータ構造を確認
2. [ ] ブラウザコンソールで警告を確認
3. [ ] クエリ結果をデバッグ出力

**関連ファイル**:
- `src/lib/sanity.ts:24-106` - getArticleWithContext
- `src/components/article/sidebar/ArticleSideNav.tsx` - サイドナビ

---

### Task 2: Markdown Import機能 🟡 MEDIUM

**優先度**: 🟡 中
**ステータス**: ⏳ 調査中
**担当**: Claude Code

**問題**:
1. 既存の`MarkdownImportInput`コンポーネントが動作しない
2. 記事本文をMarkdownで管理したい

**調査結果**:

| 項目 | 現状 |
|-----|------|
| MarkdownImportInput | レッスンの`overview`フィールドのみに適用 |
| 記事スキーマ | Portable Textのみ、Markdown Import未対応 |
| 変換ロジック | marked.js + DOMParser使用 |

**対応プラン**:

**Phase A: 既存機能の修正**
- [ ] MarkdownImportInputのデバッグ
- [ ] 変換エラーの特定・修正

**Phase B: 記事への適用**
- [ ] article.tsの`content`フィールドにMarkdownImport追加
- [ ] 同じ変換ロジックを再利用

**Phase C: (オプション) Markdown直接保存**
- [ ] `contentMarkdown`フィールド追加検討
- [ ] フロントでのMarkdown→HTML変換

**関連ファイル**:
- `sanity-studio/components/MarkdownImportInput.tsx`
- `sanity-studio/schemaTypes/article.ts`
- `sanity-studio/schemaTypes/lesson.ts`

---

## 📋 作業ログ

### 2025-12-11

**10:00** - 調査開始
- Sanity Studioのコード構造を確認
- スキーマファイル読み込み完了
- データフロー調査完了

**10:30** - ドキュメント作成
- `.claude/docs/sanity-studio/` フォルダ作成
- README.md, TASK-TRACKER.md 作成

---

## ⚠️ 注意事項

1. **Sanity Studioは別リポジトリ**: `sanity-studio/`は独立したgitリポジトリ
2. **本番データに影響**: Sanity Studioの変更は即座に本番に反映される
3. **MCPは本番**: Claude CodeのMCPツールは本番Supabaseに接続

---

## 📝 チェックリスト

### デバッグ前の確認
- [ ] Sanity Studioを起動できるか
- [ ] 本番のSanityデータにアクセスできるか
- [ ] フロントエンドの記事詳細ページが開けるか

### 修正後の確認
- [ ] TypeScriptエラーなし
- [ ] ローカルで動作確認
- [ ] Sanity Studio デプロイ（必要な場合）

---

## 🔗 関連ドキュメント

- `./README.md` - プロジェクト概要
- `./navigation-bug.md` - ナビゲーションバグ詳細
- `./markdown-import.md` - Markdown Import詳細
- `../.claude/PROJECT-RULES.md` - プロジェクトルール
