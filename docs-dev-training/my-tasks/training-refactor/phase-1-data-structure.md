# Phase 1: データ構造の簡素化

## 概要
HTMLタグ依存を除去し、YAMLフロントマターを拡張して「進め方ガイド」表示問題を解決する。

## 対象ファイル

### 1. コンテンツファイル修正
- `content/training/info-odai-book-rental/index.md`
  - HTMLタグ (`<div class="skill-group">`, `<div class="step">`) を削除
  - スキルとガイド情報をYAMLフロントマターに移行

### 2. パーサー簡素化
- `src/utils/processSkillSection.ts` (458行 → 30行に削減)
  - 複雑な正規表現を削除
  - HTMLタグ依存を除去
  - エラーハンドリング強化

### 3. 型定義拡張
- `src/types/training.ts`
  - 新しい構造化データ型を追加
  - `SkillData`, `GuideData` インターフェース追加

## 実装ステップ

### Step 1: コンテンツ構造変更
HTMLタグをYAMLに移行:

```yaml
skills:
  - title: "使いやすいUI"を要件とユーザーから設計する力
    description: 自分が良いと思うではなく、使う人目線のUI作成スキル
    reference_link: https://example.com
guide:
  title: 進め方ガイド
  description: デザイン基礎を身につけながらデザインするための\nやり方の流れを説明します
  lesson:
    title: ゼロからはじめる情報設計
    emoji: 📚
    description: 進め方の基礎はBONOで詳細に学習・実践できます
    link: /training
  steps:
    - title: 摸写したいアプリを選ぶ
      description: なんでも良いですが、なるべく単一機能を提供している...
```

### Step 2: 簡素なパーサー実装
458行のパーサーを30行の構造に変更:

```typescript
export const getSkillsFromFrontmatter = (frontmatter: TrainingFrontmatter): SkillData[] => {
  return frontmatter.skills || [];
};

export const getGuideFromFrontmatter = (frontmatter: TrainingFrontmatter): GuideData | null => {
  return frontmatter.guide || null;
};
```

### Step 3: TrainingDetail.tsx 修正
複雑な解析呼び出しを構造化データアクセスに変更:

```typescript
// 現在 (複雑)
const guideSection = extractGuideSection(content);
const parsedGuideContent = parseGuideContent(guideSection);

// 変更後 (シンプル)
const guideData = frontmatter.guide;
```

## 期待効果
- 「進め方ガイド」表示問題の完全解決
- エラー率80%削減
- AIの理解度向上
- メンテナンス性向上