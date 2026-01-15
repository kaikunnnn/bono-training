# クエストブロック コンポーネント仕様一覧

**作成日**: 2025-01-15
**ステータス**: ✅ 仕様作成完了

---

## コンポーネント一覧

| # | コンポーネント | ファイル | 説明 |
|---|---------------|----------|------|
| 0 | [SectionQuest](./SectionQuest.md) | `quest/SectionQuest.tsx` | **クエスト1ブロック全体（完了状態管理）** |
| 1 | [QuestHeader](./QuestHeader.md) | `quest/QuestHeader.tsx` | クエスト番号行（チェック + ラベル） |
| 2 | [IconCheck](./IconCheck.md) | `ui/IconCheck.tsx` | チェックアイコン（共通コンポーネント） |
| 3 | [QuestCard](./QuestCard.md) | `quest/QuestCard.tsx` | クエストカード全体 |
| 4 | [QuestCardHeader](./QuestCardHeader.md) | `quest/QuestCardHeader.tsx` | カードヘッダー（タイトル + ゴール） |
| 5 | [ArticleItem](./ArticleItem.md) | `quest/ArticleItem.tsx` | 記事アイテム（4状態対応） |

---

## クエスト完了状態

**重要**: [SectionQuest.md](./SectionQuest.md) を参照

### 判定ロジック

```tsx
const isQuestCompleted = completedCount === totalCount && totalCount > 0;
```

### 完了時に変化する要素

| 要素 | 未完了 | 完了 |
|------|--------|------|
| チェックアイコン | グレー | グラデーション + 白チェック |
| 縦点線 | `#E1E1E1` (グレー) | `#10B981` (緑) |

---

## 階層構造

```
SectionQuest（クエスト1つ分）
│
├── QuestHeader ─────────────────── クエスト番号行
│   ├── IconCheck                   チェックアイコン (empty/on)
│   └── QuestLabel                  「クエスト 01」テキスト
│
└── QuestBody ───────────────────── 縦点線 + カード
    ├── VerticalDivider             縦の点線
    └── QuestCard ───────────────── カード全体
        ├── QuestCardHeader         タイトル + ゴール
        └── ArticleItem[] ──────── 記事アイテム × n
            ├── NumberOrCheck       番号 or チェック
            ├── Thumbnail           サムネイル + タイプアイコン + 時間
            ├── ContentArea         タグ + タイトル
            └── ArrowIcon           右矢印
```

---

## ファイル配置（予定）

```
src/components/
├── lesson/
│   └── quest/
│       ├── SectionQuest.tsx      # クエストブロック全体
│       ├── QuestHeader.tsx       # クエスト番号行
│       ├── QuestCard.tsx         # カード全体
│       ├── QuestCardHeader.tsx   # カードヘッダー
│       └── ArticleItem.tsx       # 記事アイテム
│
└── ui/
    └── IconCheck.tsx             # チェックアイコン（共通）
```

---

## 状態パターン

### IconCheck (2状態)
- `empty`: 未完了（グレー）
- `on`: 完了（グラデーション）

### ArticleItem (4状態)
- `video + default`: 動画・未完了
- `video + checked`: 動画・完了
- `text + default`: テキスト・未完了
- `text + checked`: テキスト・完了

---

## 共通の色定義

| 用途 | 色 | Hex |
|------|-----|-----|
| テキスト（濃紺） | 見出し | #151834 |
| テキスト（黒） | タイトル | #1E1B1B |
| テキスト（グレー） | 説明文 | #6F7178 |
| テキスト（番号） | 記事番号 | #414141 |
| 背景（タグ） | タグ | #F4F4F4 |
| 背景（サムネ） | フォールバック | #E0DFDF |
| ボーダー（区切り） | 区切り線 | rgba(0,0,0,0.08) |
| ボーダー（カード） | カード | rgba(0,0,0,0.06) |
| グラデーション上 | チェック | rgba(255,75,111,0.68) |
| グラデーション下 | チェック | rgba(38,119,143,0.68) |

---

## フォント定義

| 用途 | フォント | Tailwind |
|------|---------|----------|
| タイトル・見出し | Noto Sans JP Bold | `font-noto-sans-jp font-bold` |
| 説明文・タグ | Noto Sans JP Medium | `font-noto-sans-jp font-medium` |
| クエスト番号 | Unbounded SemiBold | `font-unbounded font-semibold` |
| 記事番号 | Unbounded Bold | `font-unbounded font-bold` |
| 動画時間 | Helvetica Regular | `font-helvetica` |

---

## 次のステップ

1. [ ] 各コンポーネントの実装
2. [ ] SectionQuest の実装（全体統合）
3. [ ] 既存 QuestCard.tsx / ContentItem.tsx からの移行
4. [ ] LessonDetail ページへの統合
