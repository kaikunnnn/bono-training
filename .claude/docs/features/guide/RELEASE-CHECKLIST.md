# 学習ガイド リリースチェックリスト

**作成日**: 2026-04-13
**ブランチ**: `feature/guide-page`

---

## 現状

学習ガイドページは `/guide` (一覧) + `/guide/:slug` (詳細) で**ほぼ実装済み**。
Markdownベースでコンテンツ21本が `content/guide/` に存在。

---

## リリースまでの修正・確認項目

### ナビゲーション
- [x] サイドナビに「学習ガイド」を追加（トレーニングの下）

### ページ確認
- [ ] `/guide` 一覧ページの表示確認
- [ ] `/guide/:slug` 詳細ページの表示確認
- [ ] カテゴリフィルターの動作確認
- [ ] レスポンシブ（モバイル）表示確認

### コンテンツ
- [ ] 21本の記事の内容・リンク切れ確認
- [ ] サムネイル画像の表示確認
- [ ] プレミアム記事の制御確認（isPremium）

### デザイン・UI
- [ ] （ここにユーザーの修正指示を追記）

### 技術
- [ ] ビルドエラーなし
- [ ] lintエラーなし
- [ ] パフォーマンス確認（画像の最適化等）

---

## 修正ログ

| 日付 | 修正内容 | 状態 |
|------|---------|------|
| 2026-04-13 | サイドナビに「学習ガイド」追加 | 完了 |

---

## 関連ファイル

### ページ
- `src/pages/Guide/index.tsx` — 一覧ページ
- `src/pages/Guide/GuideDetail.tsx` — 詳細ページ

### コンポーネント
- `src/components/guide/` — 11コンポーネント

### データ取得
- `src/lib/guideLoader.ts` — Markdown読み込み
- `src/hooks/useGuides.ts` — React Query hooks

### コンテンツ
- `content/guide/` — 21本のMarkdown記事

### 仕様書
- `.claude/tasks/003-guide-pages/final-specification.md` — 最終仕様書
- `.claude/tasks/003-guide-pages/requirements.md` — 要件定義
