# MdxPreview マークダウンスタイリング要件詳細

## 必須要件

### 箇条書き（ul, li）
- **視覚的要件**:
  - bullet point（●）が表示される
  - 適切なインデント（ml-4）
  - 項目間のスペーシング（space-y-2）
  - 下部マージン（mb-4）

- **スタイルクラス**:
  ```
  ul: "list-disc list-inside space-y-2 mb-4 ml-4"
  li: "text-gray-700 leading-relaxed"
  ```

### リンク（a）
- **視覚的要件**:
  - 青色テキスト（text-blue-600）
  - ホバー時の色変更（hover:text-blue-800）
  - アンダーライン表示
  - スムーズなトランジション効果

- **機能要件**:
  - 外部リンク（http/https）は新しいタブで開く
  - `rel="noopener noreferrer"` セキュリティ対応
  - 内部リンクは同一タブで開く

- **スタイルクラス**:
  ```
  "text-blue-600 hover:text-blue-800 underline transition-colors"
  ```

## 推奨要件（オプション）

### 見出し（h2, h3, h4）
- h2: "text-2xl font-bold text-gray-900 mt-8 mb-4"
- h3: "text-xl font-semibold text-gray-800 mt-6 mb-3"
- h4: "text-lg font-medium text-gray-800 mt-4 mb-2"

### 段落（p）
- "text-gray-700 leading-relaxed mb-4"

### インラインコード（code）
- "bg-gray-100 px-2 py-1 rounded text-sm font-mono"

### ブロック引用（blockquote）
- "border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4"

## 互換性要件

### 既存機能との整合性
- プレミアムコンテンツバナー表示機能を維持
- `getDisplayContent` 関数の動作を変更しない
- `className` プロップでの追加スタイリングを許可

### SimpleMarkdownRenderer.tsx との統一性
- 同様のスタイリングアプローチを採用
- 色とスペーシングの一貫性を保持
- コンポーネント定義パターンの統一

## テストケース

### 基本機能テスト
1. 単純な箇条書きの表示
2. ネストした箇条書きの表示
3. 内部リンクのクリック動作
4. 外部リンクの新しいタブでの開き動作

### プレミアム機能テスト
1. 無料ユーザーでのプレミアムバナー表示
2. 有料ユーザーでの完全コンテンツ表示
3. コンテンツ分割機能の正常動作

## 実装後の確認項目
- [ ] 箇条書きにbullet pointが表示されている
- [ ] リンクが青色で下線付きで表示されている
- [ ] 外部リンクが新しいタブで開く
- [ ] ホバー効果が正常に動作している
- [ ] プレミアムバナーが適切に表示されている
- [ ] 既存のクラス名での追加スタイリングが可能