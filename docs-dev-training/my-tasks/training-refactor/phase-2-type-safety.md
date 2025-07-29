# Phase 2: 型安全なデータ構造とバリデーション

## 概要
Zodスキーマによるランタイムバリデーションを追加し、loadTrainingContentの機能を拡張する。

## 実装ステップ

### Step 1: Zodスキーマ定義
- `src/types/training.ts`にZodスキーマを追加
- `SkillData`, `GuideData`, `TrainingFrontmatter`のバリデーション
- ランタイム型安全性を確保

### Step 2: loadTrainingContent機能拡張  
- `src/utils/loadTrainingContent.ts`の改善
- YAMLとMarkdown両方の完全サポート
- エラーハンドリング強化
- 型安全なデータローディング

### Step 3: バリデーション統合
- フロントマターパース時のZodバリデーション
- 詳細なエラーメッセージ
- 開発時のデータ整合性チェック

## 期待効果
- ランタイム型安全性確保
- より詳細なエラーメッセージ
- データ整合性の向上
- 開発時のフィードバック改善