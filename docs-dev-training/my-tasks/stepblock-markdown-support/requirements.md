# StepBlock マークダウン対応要件

## 機能要件

### 1. マークダウン記法サポート
- **箇条書き**: `- item1`, `* item2`, `1. numbered`
- **リンク**: `[text](url)`, `<url>`
- **画像**: `![alt](src)`
- **強調**: `**bold**`, `*italic*`
- **コード**: `\`inline\``, \`\`\`block\`\`\`

### 2. 後方互換性
- 既存の単一行テキストdescriptionが引き続き動作
- 改行文字（`\n`）の適切な処理
- HTMLエスケープの正常な動作

### 3. スタイリング要件
- 他のマークダウンコンポーネントとの一貫性
- StepBlockの既存デザインとの調和
- レスポンシブ対応

## 技術仕様

### 使用コンポーネント
- `SimpleMarkdownRenderer` を採用
- `react-markdown` + `rehype-raw` 使用
- Tailwind CSS のprose classes活用

### Props インターフェース
```typescript
interface StepBlockProps {
  title: string;
  description: string; // マークダウン対応
  referenceLink?: {
    text: string;
    url: string;
  };
}
```

### CSS Classes
```css
prose prose-sm max-w-none
- prose: タイポグラフィー
- prose-sm: 小さめサイズ
- max-w-none: 幅制限なし
```

## テストケース

### 1. 既存機能テスト
```yaml
description: "単一行のテキスト説明"
```
期待結果: 正常に表示される

### 2. 箇条書きテスト
```yaml
description: |
  - 項目1
  - 項目2
  - 項目3
```
期待結果: 箇条書きが適切にレンダリングされる

### 3. リンクテスト
```yaml
description: |
  詳細は[公式サイト](https://example.com)をご覧ください。
```
期待結果: クリック可能なリンクとして表示される

### 4. 画像テスト
```yaml
description: |
  ![サンプル画像](/path/to/image.jpg)
```
期待結果: 画像が適切に表示される

### 5. 複合テスト
```yaml
description: |
  ## 手順
  
  1. **準備**
     - ツールを用意
     - 環境確認
  
  2. **実行**
     - [ガイド](https://example.com)を参照
     - 実装を開始
  
  ![参考画像](/image.jpg)
```
期待結果: すべての要素が適切にレンダリングされる

## 品質基準

### パフォーマンス
- レンダリング時間 < 100ms
- メモリ使用量の最適化

### アクセシビリティ
- alt属性の適切な処理
- キーボードナビゲーション対応
- スクリーンリーダー対応

### ブラウザサポート
- モダンブラウザ対応
- IE11未サポート（既存方針に準拠）