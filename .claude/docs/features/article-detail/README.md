# 記事詳細ページ スタイル調整

## 概要

`/articles/:slug` ページのスタイルをFigmaデザインに合わせてコンポーネントごとに調整する。

---

## 対象ファイル

### ページ
- `src/pages/ArticleDetail.tsx`

### コンポーネント（13個）

| カテゴリ | コンポーネント | ファイルパス |
|----------|---------------|-------------|
| **メイン** | VideoSection | `src/components/article/VideoSection.tsx` |
| | HeadingSection | `src/components/article/HeadingSection.tsx` |
| | TodoSection | `src/components/article/TodoSection.tsx` |
| | RichTextSection | `src/components/article/RichTextSection.tsx` |
| | ContentNavigation | `src/components/article/ContentNavigation.tsx` |
| | TableOfContents | `src/components/article/TableOfContents.tsx` |
| **サイドバー** | ArticleSideNavNew | `src/components/article/sidebar/ArticleSideNavNew.tsx` |
| | LessonDetailCard | `src/components/article/sidebar/LessonDetailCard.tsx` |
| | QuestItem | `src/components/article/sidebar/QuestItem.tsx` |
| | ArticleListItem | `src/components/article/sidebar/ArticleListItem.tsx` |
| | ArticleTag | `src/components/article/sidebar/ArticleTag.tsx` |
| | CheckIcon | `src/components/article/sidebar/CheckIcon.tsx` |
| | LogoBlock | `src/components/article/sidebar/LogoBlock.tsx` |
| **モバイル** | MobileMenuButton | `src/components/article/MobileMenuButton.tsx` |
| | MobileSideNav | `src/components/article/MobileSideNav.tsx` |

---

## 進捗管理

### ステータス

| # | コンポーネント | 状態 | 備考 |
|---|---------------|------|------|
| 1 | VideoSection | ✅ 完了 | 上部に移動、スタイル調整 |
| 2 | HeadingSection | ✅ 完了 | Figma仕様準拠、コンポーネント再利用 |
| 3 | TodoSection | 未着手 | |
| 4 | RichTextSection | ✅ 完了 | 外側スタイル統一 |
| 5 | ContentNavigation | ✅ 完了 | 外側スタイル統一 |
| 6 | TableOfContents | 未着手 | |
| 7 | ArticleSideNavNew | ✅ 完了 | 新規作成（旧ArticleSideNav削除済み） |
| 8 | LessonDetailCard | ✅ 完了 | 新規作成（旧LessonSection削除済み） |
| 9 | QuestItem | ✅ 完了 | 新規作成（旧QuestBlock削除済み） |
| 10 | ArticleListItem | ✅ 完了 | 新規作成（旧ContentItem削除済み） |
| 11 | ArticleTag | ✅ 完了 | 新規作成 |
| 12 | CheckIcon | ✅ 完了 | 新規作成 |
| 13 | LogoBlock | 維持 | 新旧共通で使用 |
| 14 | MobileMenuButton | 未着手 | |
| 15 | MobileSideNav | ✅ 完了 | ArticleSideNavNewに統一 |
| 16 | ArticleDetail（レイアウト） | ✅ 完了 | 幅調整、セクション配置 |

### 削除済みコンポーネント（リファクタリング）

| ファイル | 削除日 | 理由 |
|---------|-------|------|
| ArticleSideNav.tsx | 2025-01-15 | ArticleSideNavNewに統合 |
| BackNavigation.tsx | 2025-01-15 | 未使用 |
| ContentItem.tsx | 2025-01-15 | ArticleListItemに置換 |
| LessonSection.tsx | 2025-01-15 | LessonDetailCardに置換 |
| QuestBlock.tsx | 2025-01-15 | QuestItemに置換 |
| QuestTitle.tsx | 2025-01-15 | QuestItemに統合 |

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
- [ ] 未完了コンポーネントの調整（詳細: `components/INCOMPLETE-COMPONENTS.md`）

---

## 関連ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| `components/INCOMPLETE-COMPONENTS.md` | 未完了コンポーネントの現状まとめ |
| `components/sidebar/SIDEBAR-SPEC.md` | サイドバーコンポーネント仕様 |
| `FIGMA-SPEC.md` | Figmaデザイン仕様 |
