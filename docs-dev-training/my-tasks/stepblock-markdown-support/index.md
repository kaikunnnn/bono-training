# StepBlock マークダウン対応

## 概要
`StepBlock.tsx` コンポーネントの `description` フィールドでマークダウン記法（箇条書き、リンク、画像）を使用できるようにする。

## 現在の問題点
- `description` が単純な文字列として表示される（`whitespace-pre-line`）
- 箇条書き、リンク、画像が使用できない
- 他のマークダウンレンダリングコンポーネントとスタイリングが統一されていない

## 期待する成果
- StepBlockの`description`で箇条書き、リンク、画像が使用可能
- YAMLコンテンツでマークダウン構文使用可能
- 既存のテキストベースdescriptionも引き続き動作
- 他のマークダウンコンポーネントとの統一感

## 対象ファイル
- `src/components/training/StepBlock.tsx`

## 優先度
**中**: UI改善とコンテンツ表現力向上

## 工数見積もり
- 必須実装（マークダウンレンダリング対応）: 30分
- 推奨実装（スタイリング統一）: +15分

## 関連ファイル
- `src/components/training/SimpleMarkdownRenderer.tsx` (参考実装)
- `src/components/training/MdxPreview.tsx` (参考実装)

## 実装状況
- [ ] StepBlockコンポーネントの修正
- [ ] マークダウンレンダリング機能の追加
- [ ] 既存コンテンツとの後方互換性確保
- [ ] テスト・動作確認