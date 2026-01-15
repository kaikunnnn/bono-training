# 記事詳細ページ スタイル調整

## 概要

`/articles/:slug` ページのスタイルをFigmaデザインに合わせてコンポーネントごとに調整する。

---

## 対象ファイル

### ページ
- `src/pages/ArticleDetail.tsx`

### コンポーネント（15個）

| カテゴリ | コンポーネント | ファイルパス |
|----------|---------------|-------------|
| **メイン** | VideoSection | `src/components/article/VideoSection.tsx` |
| | HeadingSection | `src/components/article/HeadingSection.tsx` |
| | TodoSection | `src/components/article/TodoSection.tsx` |
| | RichTextSection | `src/components/article/RichTextSection.tsx` |
| | ContentNavigation | `src/components/article/ContentNavigation.tsx` |
| | TableOfContents | `src/components/article/TableOfContents.tsx` |
| **サイドバー** | ArticleSideNav | `src/components/article/sidebar/ArticleSideNav.tsx` |
| | BackNavigation | `src/components/article/sidebar/BackNavigation.tsx` |
| | ContentItem | `src/components/article/sidebar/ContentItem.tsx` |
| | LessonSection | `src/components/article/sidebar/LessonSection.tsx` |
| | LogoBlock | `src/components/article/sidebar/LogoBlock.tsx` |
| | QuestBlock | `src/components/article/sidebar/QuestBlock.tsx` |
| | QuestTitle | `src/components/article/sidebar/QuestTitle.tsx` |
| **モバイル** | MobileMenuButton | `src/components/article/MobileMenuButton.tsx` |
| | MobileSideNav | `src/components/article/MobileSideNav.tsx` |

---

## 進捗管理

### ステータス

| # | コンポーネント | 状態 | 備考 |
|---|---------------|------|------|
| 1 | VideoSection | 未着手 | |
| 2 | HeadingSection | 未着手 | |
| 3 | TodoSection | 未着手 | |
| 4 | RichTextSection | 未着手 | |
| 5 | ContentNavigation | 未着手 | |
| 6 | TableOfContents | 未着手 | |
| 7 | ArticleSideNav | 未着手 | |
| 8 | BackNavigation | 未着手 | |
| 9 | ContentItem | 未着手 | |
| 10 | LessonSection | 未着手 | |
| 11 | LogoBlock | 未着手 | |
| 12 | QuestBlock | 未着手 | |
| 13 | QuestTitle | 未着手 | |
| 14 | MobileMenuButton | 未着手 | |
| 15 | MobileSideNav | 未着手 | |
| 16 | ArticleDetail（レイアウト） | 未着手 | |

---

## ドキュメント構造

```
.claude/docs/features/article-detail/
├── README.md                    # このファイル（全体概要・進捗）
├── FIGMA-SPEC.md               # Figma仕様（後で追加）
└── components/                  # コンポーネントごとの仕様
    ├── video-section.md
    ├── heading-section.md
    ├── todo-section.md
    ├── rich-text-section.md
    ├── content-navigation.md
    ├── sidebar/
    │   ├── article-side-nav.md
    │   ├── back-navigation.md
    │   ├── content-item.md
    │   ├── lesson-section.md
    │   ├── logo-block.md
    │   ├── quest-block.md
    │   └── quest-title.md
    └── mobile/
        ├── mobile-menu-button.md
        └── mobile-side-nav.md
```

---

## 作業フロー

1. **Figma URLを受け取る** → `FIGMA-SPEC.md` に仕様を記録
2. **コンポーネントごとに作業**:
   - Figmaから該当コンポーネントの仕様を抽出
   - `components/xxx.md` に仕様を記録
   - 実装を変更
   - このREADMEのステータスを更新
3. **全コンポーネント完了後** → レイアウト全体の調整

---

## 次のアクション

- [ ] FigmaデザインURLを共有してもらう
- [ ] Figma仕様を `FIGMA-SPEC.md` に記録
- [ ] 各コンポーネントの仕様ドキュメント作成
