# BONO Design System

**最終更新**: 2026-03-19
**ステータス**: 構築中

---

## 概要

このドキュメントはClaude CodeがUI実装時に参照するデザインシステムです。
Figmaのデザインと実装コードの一貫性を保つために使用します。

---

## ディレクトリ構成

```
.claude/design-system/
├── README.md              # このファイル（概要・ワークフロー）
├── tokens/
│   ├── colors.md          # 色定義・命名規則
│   ├── typography.md      # フォント・サイズ・行間
│   └── spacing.md         # 余白・間隔・グリッド
├── components/
│   ├── _template.md       # コンポーネント記述テンプレート
│   └── [component].md     # 各コンポーネント仕様
└── figma/
    └── node-mapping.md    # FigmaノードIDと実装の対応表
```

---

## ワークフロー

### 新しいデザインを実装する時

1. **Figma URL共有** → ユーザーがFigma URLを共有
2. **分析レポート** → Claude Codeが`get_design_context`で取得し分析結果を報告
3. **意図の確認** → ユーザーが役割・命名・トークンを指示
4. **ドキュメント記録** → `design-system/`に記録（ユーザーが確認）
5. **実装** → 記録に従ってコンポーネント実装
6. **繰り返し** → 次のコンポーネントへ

### 既存コンポーネントを使う時

1. `design-system/components/`から該当コンポーネントを参照
2. `figma/node-mapping.md`でFigma対応を確認
3. 既存パターンに従って実装

---

## トークン参照

実装時は以下の優先順位でトークンを使用:

1. **design-system/tokens/** に定義されたトークン
2. **tailwind.config.ts** のカスタム定義
3. Tailwindのデフォルト値（最終手段）

---

## 命名規則

### コンポーネント

```
[機能][バリエーション]
例: RoadmapCard, RoadmapCardCompact, ButtonPrimary
```

### トークン（色）

```
[用途]-[役割]-[状態]
例: text-primary, bg-card-hover, border-muted
```

### トークン（余白）

```
[コンテキスト]-[サイズ]
例: card-padding-md, section-gap-lg
```

---

## 現在の実装状況

| カテゴリ | ファイル | ステータス |
|----------|----------|------------|
| 色 | tokens/colors.md | 📋 未整理 |
| タイポグラフィ | tokens/typography.md | 📋 未整理 |
| 余白 | tokens/spacing.md | 📋 未整理 |
| ボタン | components/buttons.md | 📋 未作成 |
| カード | components/cards.md | 📋 未作成 |
| Figma対応表 | figma/node-mapping.md | 📋 未作成 |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-03-19 | 初版作成 |
