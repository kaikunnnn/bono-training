---
name: design
description: Figmaデザインを分析し、デザインシステムに沿ってコンポーネントを実装
argument-hint: [Figma URL または 実装指示]
allowed-tools: Read, Glob, Grep, Edit, Write, Bash, mcp__figma-remote-mcp__get_design_context, mcp__figma-remote-mcp__get_screenshot, mcp__figma-remote-mcp__get_metadata, mcp__figma-remote-mcp__get_variable_defs
---

# Design Implementation Workflow

## 概要

Figmaデザインを分析し、デザインシステムに沿ってコンポーネントを実装するワークフロー。

## 呼び出し方

- `/design [Figma URL]` - 新しいデザインを分析
- `/design analyze [Figma URL]` - 分析のみ（実装しない）
- `/design implement [コンポーネント名]` - ドキュメントに従って実装
- `/design token [Figma URL]` - トークン抽出のみ

---

## ワークフロー

### Phase 1: 分析（analyze）

1. **デザインシステム確認**
   - `.claude/design-system/README.md` を読む
   - 既存トークン・コンポーネントを把握

2. **Figma分析**
   - `get_design_context` でデザイン情報取得
   - `get_screenshot` でビジュアル確認
   - `get_variable_defs` でFigma Variables取得

3. **分析レポート作成**
   以下の形式でユーザーに報告：

```markdown
## 分析レポート

### 基本情報
- **Figma node-id**: `xxx-xxx`
- **コンポーネント名（提案）**: XxxCard

### 構造
```
[構造図]
```

### 検出したスタイル
- 背景色: #XXX → `bg-xxx`（既存）/ 新規追加必要
- フォント: 16px semibold → `text-base font-semibold`
- 余白: 16px → `p-4`

### 既存デザインシステムとの対応
- [一致するトークン]
- [新規追加が必要なトークン]

### 質問事項
- [ユーザーに確認したいこと]
```

4. **ユーザー確認待ち**
   - 命名の確認
   - 新規トークンの確認
   - 実装方針の確認

### Phase 2: ドキュメント化

ユーザー確認後：

1. **トークン追加**（必要な場合）
   - `.claude/design-system/tokens/` を更新

2. **コンポーネント仕様作成**
   - `.claude/design-system/components/[component].md` を作成
   - テンプレート: `.claude/design-system/components/_template.md`

3. **Figmaマッピング更新**
   - `.claude/design-system/figma/node-mapping.md` に追加

### Phase 3: 実装（implement）

1. **仕様参照**
   - `.claude/design-system/components/[component].md` を読む

2. **コンポーネント実装**
   - 仕様に従って `src/components/` に実装
   - トークンを使用（ハードコード禁止）

3. **プレビューページ作成**（任意）
   - `/dev/[component]` ページを作成

4. **完了報告**

```markdown
## 実装完了

### 作成ファイル
- `src/components/xxx/Xxx.tsx`
- `src/pages/dev/XxxPreview.tsx`（プレビュー）

### 使用トークン
- 色: `bg-card`, `text-foreground`
- フォント: `text-lg font-semibold`

### 確認方法
http://localhost:5173/dev/xxx
```

---

## 重要ルール

### 必ず守ること

1. **分析結果は必ずユーザーに報告**
   - 勝手に命名しない
   - 勝手にトークン追加しない

2. **デザインシステム参照**
   - 既存トークンを最大限活用
   - 新規追加はユーザー承認後

3. **ドキュメント先行**
   - 実装前にコンポーネント仕様を作成
   - Figmaマッピングを更新

4. **一貫性の維持**
   - 同じFigmaコンポーネントは同じ実装
   - `node-mapping.md` で管理

### やらないこと

- ハードコードで色・サイズを指定
- デザインシステムを無視した実装
- ドキュメント更新を忘れる

---

## 対応するFigmaファイル

| ファイル | File Key | 用途 |
|----------|----------|------|
| product---new-BONO-ui-2026 | `oNJwxeYUNaRWggDGAUi94D` | メインUI |

---

## 関連ドキュメント

- `.claude/design-system/README.md` - デザインシステム概要
- `.claude/design-system/tokens/` - トークン定義
- `.claude/design-system/components/` - コンポーネント仕様
- `.claude/design-system/figma/node-mapping.md` - Figma対応表
