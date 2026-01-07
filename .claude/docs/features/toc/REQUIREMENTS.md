# 記事目次（Table of Contents）機能 要件定義

**作成日**: 2025-12-28
**ステータス**: 要件定義中

---

## 1. 概要

記事詳細ページに目次（Table of Contents）を追加し、ユーザーが記事の構造を把握しやすくする機能。

**特徴**: Sanityで任意の位置に配置可能なカスタムブロックとして実装

---

## 2. 現状分析

### 2.1 既存実装

- **記事コンテンツ**: Sanity PortableText で管理
- **見出しレンダリング**: `RichTextSection.tsx` で H2/H3/H4 をレンダリング
- **見出しID生成**: `generateHeadingId()` 関数で `id` 属性を付与済み
  - 形式: `heading-{index}-{slugified-text}`
- **スクロール対応**: `scroll-mt-20` クラスで固定ヘッダー分のオフセット対応済み

### 2.2 ページ構造

```
┌─────────────────────────────────────────────────────┐
│ サイドナビ (320px) │ メインコンテンツ              │
│ - レッスン/クエスト│ - HeadingSection (720px)      │
│   ナビゲーション   │ - VideoSection (最大1320px)   │
│                    │ - TodoSection                  │
│                    │ - RichTextSection (720px)      │
│                    │ - ContentNavigation            │
└─────────────────────────────────────────────────────┘
```

---

## 3. 要件

### 3.1 必須要件（Must Have）

| ID | 要件 | 詳細 |
|----|------|------|
| R-001 | 見出し抽出 | PortableText から H2/H3/H4 見出しを抽出 |
| R-002 | 階層表示 | H2 > H3 > H4 の階層構造を視覚的に表現 |
| R-003 | クリックでスクロール | 目次項目クリックで該当見出しにスムーズスクロール |
| R-004 | 現在位置ハイライト | スクロール位置に応じて現在表示中の見出しをハイライト |
| R-005 | レスポンシブ対応 | PC/モバイルで適切に表示 |

### 3.2 推奨要件（Should Have）

| ID | 要件 | 詳細 |
|----|------|------|
| R-006 | 見出しがない場合は非表示 | 見出しが0件の場合、目次セクション自体を非表示 |
| R-007 | 最小見出し数 | 見出しが1件以下の場合は非表示（閾値は調整可能） |
| R-008 | アクセシビリティ | nav要素 + aria-label で適切なマークアップ |

### 3.3 オプション要件（Nice to Have）

| ID | 要件 | 詳細 |
|----|------|------|
| R-009 | 折りたたみ | モバイルで目次を折りたたみ可能に |
| R-010 | 固定表示 | PCで右サイドバーに固定表示（既存サイドナビとは別） |
| R-011 | 進捗インジケータ | 読了した見出しにチェックマーク等を表示 |

---

## 4. 実装方式: Sanityカスタムブロック

### 4.1 採用理由

**決定**: Sanityのリッチテキストにカスタムブロックとして追加

```
Sanity編集画面の挿入メニュー:
+ 画像
+ リンクカード
+ テーブル
+ カスタムコンテナ
+ 目次 ← NEW（📋 アイコン）
```

**メリット**:
1. 記事ごとに任意の位置に配置可能
2. 既存パターン（`customContainer`, `tableBlock`, `linkCard`）と同じUX
3. 目次を表示しない記事も自由に選択可能
4. スキーマ変更のみでSanity側の実装はシンプル

### 4.2 挙動

1. **Sanity側**: 編集者が `+ 目次` で任意の位置に挿入
2. **フロントエンド側**: `tableOfContents` ブロックを検出したら、その位置に目次をレンダリング
3. **目次内容**: 同じ記事内のH2/H3見出しを自動抽出して表示

### 4.3 既存パターンとの比較

| 項目 | customContainer | linkCard | **tableOfContents** |
|------|-----------------|----------|---------------------|
| タイプ | object | object | object |
| フィールド | type, title, content | url, title, desc, image | **なし（自動生成）** |
| プレビュー | タイプ名表示 | URL表示 | 「📋 目次」固定 |

### 4.4 フォールバック

- 見出しが0件の場合: 「この記事には目次がありません」と表示（または非表示）
- 見出しが1件のみ: そのまま表示（設定で非表示も可能）

---

## 5. UI仕様（案）

### 5.1 デザイン

```
┌─────────────────────────────────────┐
│ 目次                                │
├─────────────────────────────────────┤
│ ● この記事の概要                    │ ← H2
│    ○ 前提知識                      │ ← H3
│    ○ 準備するもの                  │ ← H3
│ ● メインコンテンツ                  │ ← H2
│    ○ ステップ1                     │ ← H3
│       ・ ポイント1                  │ ← H4
│       ・ ポイント2                  │ ← H4
│    ○ ステップ2                     │ ← H3
│ ● まとめ                           │ ← H2
└─────────────────────────────────────┘
```

### 5.2 スタイル

| 要素 | スタイル |
|------|----------|
| コンテナ | 背景: #F9FAFB, 角丸: 8px, padding: 16px 20px |
| タイトル | 14px, SemiBold, #101828, M PLUS Rounded 1c |
| H2項目 | 14px, Medium, #364153, インデント: 0 |
| H3項目 | 14px, Regular, #6B7280, インデント: 16px |
| H4項目 | 13px, Regular, #9CA3AF, インデント: 32px |
| ホバー | 背景: #F3F4F6, テキスト: #101828 |
| アクティブ | 左ボーダー: 2px #3B82F6, テキスト: #3B82F6 |

---

## 6. 技術仕様

### 6.1 Sanityスキーマ追加

**ファイル**: `sanity-studio/schemaTypes/objects/tableOfContents.ts`

```typescript
import { defineType } from "sanity";

export default defineType({
  name: "tableOfContents",
  title: "目次",
  type: "object",
  icon: () => "📋",  // 挿入メニューのアイコン
  fields: [],        // フィールドなし（自動生成のため）
  preview: {
    prepare() {
      return {
        title: "📋 目次",
        subtitle: "記事内の見出しから自動生成",
      };
    },
  },
});
```

**スキーマ登録**: `schemaTypes/index.ts` に追加

**article.ts の content に追加**:
```typescript
{
  type: "tableOfContents",
}
```

### 6.2 見出し抽出ロジック

```typescript
interface TocItem {
  id: string;           // 見出しのID (anchor)
  text: string;         // 見出しテキスト
  level: 2 | 3 | 4;     // 見出しレベル
}

function extractHeadings(content: PortableTextBlock[]): TocItem[] {
  // PortableText から style が 'h2', 'h3', 'h4' のブロックを抽出
  // children からテキストを結合
  // generateHeadingId と同じロジックでIDを生成
}
```

### 6.3 現在位置検出

```typescript
// Intersection Observer を使用
// 各見出し要素を監視
// 画面上部に最も近い見出しをアクティブとする
```

### 6.4 コンポーネント構成

```
src/components/article/
├── TableOfContents.tsx      # 目次コンポーネント本体
├── hooks/
│   └── useActiveHeading.ts  # 現在位置検出フック
└── utils/
    └── extractHeadings.ts   # 見出し抽出ユーティリティ
```

### 6.5 RichTextSection.tsx への追加

```typescript
types: {
  // 既存: image, customContainer, tableBlock, linkCard

  // 新規追加
  tableOfContents: ({ value }) => {
    // content (PortableTextBlock[]) から見出しを抽出
    const headings = extractHeadings(content);
    return <TableOfContents headings={headings} />;
  },
}
```

---

## 7. 決定事項

### 7.1 確定済み

| 項目 | 決定 | 備考 |
|------|------|------|
| 実装方式 | Sanityカスタムブロック | 任意の位置に配置可能 |
| 配置位置 | 編集者が自由に決定 | Sanityで挿入した場所に表示 |

### 7.2 要確認

| 項目 | オプション | 推奨 |
|------|------------|------|
| 見出しレベル | H2のみ / H2+H3 / H2+H3+H4 | H2+H3 |
| 見出し0件時 | 非表示 / メッセージ表示 | 非表示 |
| 現在位置ハイライト | あり / なし | あり |
| 折りたたみ（モバイル） | あり / なし | なし（Phase 1） |

---

## 8. 実装フェーズ

### Phase 1: 基本実装（MVP）
1. Sanityスキーマ追加 (`tableOfContents`)
2. フロントエンド目次コンポーネント作成
3. RichTextSection に統合

### Phase 2: UX改善（オプション）
1. 現在位置ハイライト（Intersection Observer）
2. スムーズスクロール
3. モバイル折りたたみ

---

## 9. 次のステップ

1. ✅ 実装方式決定（Sanityカスタムブロック）
2. ⬜ 残りの確認事項を決定
3. ⬜ Phase 1 実装開始

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-28 | Sanityカスタムブロック方式を採用、技術仕様追加 |
| 2025-12-28 | 初版作成 |
