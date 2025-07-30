# Skills セクション マークダウン箇条書き対応

## 概要
`skills.description`フィールドでマークダウン箇条書きが正しく表示されない問題を修正する。

## 現在の問題点
- YAMLの`description`でマルチライン箇条書きを書いても単一行として処理される
- `convertSkillsToHtml`関数が`- ${skill.description}`形式で強制的に単一行にしている
- `SimpleMarkdownRenderer`はマークダウンをサポートしているが活かされていない

## 期待する成果
```yaml
skills:
  - title: "使いやすいUIを要件とユーザーから設計する力"
    description: |
      - 自分が良いと思うではなく、使う人目線のUI作成スキル
      - とにかく頑張ろう！
      - 参考デザインをちゃんとみよう！
```
上記のようなYAML記述でマークダウン箇条書きが正常に表示される。

## 対象ファイル
- `src/utils/simplifiedSkillGuideParser.ts` (`convertSkillsToHtml`関数)

## 優先度
**中**: ユーザビリティ向上、コンテンツ作成の柔軟性向上

## 工数見積もり
- 必須実装: 30分
- テスト・動作確認: 15分

## 実装状況
- [ ] `convertSkillsToHtml`関数の修正
- [ ] 後方互換性の確認
- [ ] サンプルコンテンツでの動作確認
- [ ] テスト実施