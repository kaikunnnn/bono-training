# Skills マークダウン箇条書き要件詳細

## 必須要件

### マークダウン箇条書きサポート
- **YAML記述方法**:
  ```yaml
  description: |
    - 箇条書き項目1
    - 箇条書き項目2
    - 箇条書き項目3
  ```

- **HTML出力要件**:
  - `- ${skill.description}`から`${skill.description}`への変更
  - マークダウン箇条書きがそのまま`SimpleMarkdownRenderer`で処理される
  - 既存のスタイリング（`list-disc list-inside space-y-2 mb-4 ml-4`）が適用される

### 後方互換性要件
- **既存の単一行description**:
  ```yaml
  description: 単一行の説明文
  ```
  引き続き正常に表示される

- **reference_linkとの併用**:
  ```yaml
  description: |
    - 箇条書き項目1
    - 箇条書き項目2
  reference_link: https://example.com
  ```
  参考リンクも正常に表示される

## 技術仕様

### 変更対象関数
- **ファイル**: `src/utils/simplifiedSkillGuideParser.ts`
- **関数**: `convertSkillsToHtml`
- **変更行**: 75行目の`- ${skill.description}`

### マークダウン処理フロー
1. YAML frontmatterから`skills.description`を取得
2. `convertSkillsToHtml`でHTMLテンプレートに埋め込み
3. `SimpleMarkdownRenderer`でマークダウンを解析・レンダリング
4. 箇条書きスタイルが適用されて表示

## テストケース

### 基本機能テスト
1. **単一行description**: 従来通りの表示
2. **マークダウン箇条書き**: bullet pointとインデントで表示
3. **reference_linkとの併用**: 両方が正常表示
4. **空のdescription**: エラーが発生しない

### 表示確認テスト
1. **視覚的確認**: bullet pointが表示されている
2. **スタイリング確認**: 適切なインデントとスペーシング
3. **レスポンシブ確認**: モバイル・デスクトップ両方で正常表示

## 実装後の確認項目
- [ ] 既存コンテンツの表示が正常
- [ ] マークダウン箇条書きがbullet pointで表示
- [ ] reference_linkが正常に表示
- [ ] モバイル・デスクトップでの表示確認
- [ ] 複数のTrainingページでの動作確認