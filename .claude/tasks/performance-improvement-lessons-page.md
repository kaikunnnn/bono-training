# パフォーマンス改善: /lessons ページの読み込み速度

**作成日**: 2025-11-14
**優先度**: 中
**ステータス**: 未着手

---

## 📋 問題

`/lessons` ページの読み込みが遅い

- **現状**: 5つのレッスンコンテンツしかないのに、ロードが非常に遅い
- **影響**: ユーザー体験の低下

---

## 🔍 調査項目

### 1. Sanity クエリの最適化
- [ ] GROQクエリの実行時間を計測
- [ ] 不要なフィールドの取得を削除
- [ ] プロジェクションを最適化

### 2. 画像の最適化
- [ ] 画像サイズの確認（適切なサイズにリサイズされているか）
- [ ] Sanity CDNのImage URLパラメータ確認
- [ ] Lazy loadingの実装確認

### 3. データフェッチの最適化
- [ ] クライアントサイドレンダリング vs サーバーサイドレンダリング
- [ ] キャッシュ戦略の見直し
- [ ] プリフェッチの検討

### 4. React コンポーネントのパフォーマンス
- [ ] 不要な再レンダリングの確認
- [ ] メモ化の検討（React.memo, useMemo, useCallback）

---

## 🎯 改善目標

- **初回ロード時間**: 現在の〇秒 → 目標: 2秒以内
- **Time to Interactive**: 目標: 3秒以内

---

## 📝 実装予定

### Phase 1: 計測・分析
1. Chrome DevToolsでパフォーマンス計測
2. Network タブでリソース読み込み時間確認
3. Lighthouse スコア取得

### Phase 2: クイックウィン
1. 画像の最適化（サイズ、フォーマット）
2. クエリの最適化（不要なフィールド削除）

### Phase 3: 根本的な改善
1. キャッシュ戦略の実装
2. Lazy loading の実装
3. コード分割の検討

---

## 🚀 次のアクション

Webflowデータ取得が完了し、機能が正常に動作することを確認した後に着手する。

---

## 📌 関連ファイル

- `/Users/kaitakumi/Documents/bono-training/src/pages/Lessons.tsx`
- `/Users/kaitakumi/Documents/bono-training/src/lib/sanity.ts`
- `/Users/kaitakumi/Documents/bono-training/src/hooks/useLessons.ts`（存在する場合）
