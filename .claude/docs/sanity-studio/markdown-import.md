# Markdown Import 機能計画

**作成日**: 2025-12-11
**ステータス**: 計画中

---

## 現状の分析

### 既存の MarkdownImportInput コンポーネント

**場所**: `sanity-studio/components/MarkdownImportInput.tsx`

**機能**:
- Markdownテキストを入力
- `marked.js` でHTMLに変換
- `DOMParser` でHTML→Portable Textに変換
- 既存のコンテンツに追加

**適用箇所**:
- `lesson.ts` の `overview` フィールドのみ

**対応している記法**:
- `## 見出し2` (h2)
- `### 見出し3` (h3)
- `**太字**` (strong)
- `*斜体*` (em)
- `- 箇条書き` (bullet list)
- `1. 番号付き` (number list)
- 段落 (p)

**未対応**:
- リンク `[text](url)`
- コードブロック
- 画像
- テーブル

---

## 問題点

### 1. 動作しない原因（要調査）

**可能性のある原因**:
1. ブラウザの DOMParser 互換性
2. marked.js のバージョン問題
3. Portable Text のスキーマ不一致
4. Sanity の `onChange(set(...))` の使い方

**デバッグ手順**:
```typescript
// handleConvert 内にログ追加
console.log('1. Input markdown:', markdown);
const html = await marked.parse(markdown);
console.log('2. Converted HTML:', html);
// ...
console.log('3. Portable Text blocks:', blocks);
```

### 2. 記事スキーマへの適用

**現状** (`article.ts`):
```typescript
defineField({
  name: "content",
  title: "記事本文",
  type: "array",
  of: [
    { type: "block", ... },
    { type: "image", ... },
  ],
  // MarkdownImportInput 未適用
})
```

---

## 実装プラン

### Phase A: 既存機能の修正

**目標**: `lesson.overview` での Markdown Import を動作させる

**作業**:
1. Sanity Studio を起動して動作確認
2. コンソールエラーを確認
3. 変換ロジックをデバッグ
4. 必要に応じて修正

**確認項目**:
- [ ] marked.js が正しくインストールされているか
- [ ] DOMParser が正しく動作するか
- [ ] Portable Text の構造が正しいか

### Phase B: 記事スキーマへの適用

**目標**: `article.content` でも Markdown Import を使えるようにする

**修正ファイル**: `sanity-studio/schemaTypes/article.ts`

```typescript
import { MarkdownImportInput } from "../components/MarkdownImportInput";

// content フィールドに追加
defineField({
  name: "content",
  title: "記事本文",
  type: "array",
  of: [...],
  components: {
    input: MarkdownImportInput,  // ← 追加
  },
})
```

### Phase C: (オプション) Markdown直接保存

**目標**: Markdownを直接保存し、フロントで表示

**メリット**:
- 編集が簡単
- バージョン管理しやすい
- 外部ツールとの連携が容易

**デメリット**:
- Sanity のリッチエディタが使えない
- Portable Text の柔軟性が失われる

**実装案**:

1. **スキーマ追加**:
```typescript
defineField({
  name: "contentMarkdown",
  title: "記事本文（Markdown）",
  type: "text",
  rows: 30,
  description: "Markdownで記事を記述",
})
```

2. **フロント変換**:
```typescript
// ArticleDetail.tsx
import { marked } from 'marked';

const htmlContent = marked.parse(article.contentMarkdown);
```

3. **表示**:
```tsx
<div
  className="prose"
  dangerouslySetInnerHTML={{ __html: htmlContent }}
/>
```

---

## 推奨アプローチ

### 短期（今回の対応）

1. **Phase A**: 既存 MarkdownImportInput を修正
2. **Phase B**: 記事スキーマに同じ機能を追加

**理由**:
- Portable Text ベースなので Sanity の機能をフル活用
- 画像挿入など他の機能と互換性あり
- 変更が最小限

### 長期（将来の検討）

- Markdown 直接保存は運用してみて必要性を判断
- 現状の Portable Text + Markdown Import が使いやすければそのまま

---

## テストケース

### Phase A 完了後

- [ ] Sanity Studio で Lesson を開く
- [ ] `overview` フィールドの「Import from Markdown」ボタンをクリック
- [ ] テスト用 Markdown を入力:
  ```markdown
  ## テスト見出し

  これはテスト段落です。**太字**と*斜体*のテスト。

  - リスト1
  - リスト2

  1. 番号1
  2. 番号2
  ```
- [ ] 「Convert to Portable Text」をクリック
- [ ] エラーなく変換される
- [ ] 保存して公開

### Phase B 完了後

- [ ] Sanity Studio で Article を開く
- [ ] `content` フィールドに「Import from Markdown」ボタンがある
- [ ] 同様に変換テスト
- [ ] 記事詳細ページで正しく表示される

---

## 関連ファイル

| ファイル | 役割 |
|---------|------|
| `sanity-studio/components/MarkdownImportInput.tsx` | 変換コンポーネント |
| `sanity-studio/schemaTypes/lesson.ts` | レッスンスキーマ（適用済み） |
| `sanity-studio/schemaTypes/article.ts` | 記事スキーマ（要追加） |
| `sanity-studio/package.json` | marked.js 依存 |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-11 | 初版作成 |
