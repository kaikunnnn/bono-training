# タスク004: コンポーネント・カラーリファレンスページ

## 概要

デザインシステムとコンポーネントライブラリを一覧できる開発者向けリファレンスページの構築

## 目的

- サイトで定義されているコンポーネントを視覚的に確認
- カラーパレット・タイポグラフィ・アニメーションなどのデザイントークンを一元管理
- 開発環境でのみアクセス可能なスタイルガイドとして機能
- コンポーネントの使用例とコードスニペットを提供

## ドキュメント構成

- **task.md** - タスクサマリーとメタデータ
- **requirements.md** - 詳細な機能要件
- **specification.md** - 技術仕様書
- **implementation-plan.md** - 実装計画とチェックリスト

## 現状分析

### 発見されたコンポーネント

**shadcn/ui コンポーネント (47個)**
- accordion, alert, alert-dialog, aspect-ratio, avatar
- badge, button, calendar, card, carousel
- chart, checkbox, collapsible, command, context-menu
- dialog, drawer, dropdown-menu, form, hover-card
- input, input-otp, label, menubar, navigation-menu
- pagination, popover, progress, radio-group, resizable
- scroll-area, select, separator, sheet, sidebar
- skeleton, slider, sonner, switch, table
- tabs, textarea, toast, toaster, toggle
- toggle-group, tooltip

**カスタムコンポーネント**
- auth/ (1): PrivateRoute
- common/ (4): ErrorBoundary, DottedSeparator, PageTopHeading, HeadingBlock2
- content/ (3): ContentCard, VimeoPlayer, ContentList, ContentFilter
- layout/ (3 + Sidebar): Header, Footer, Layout, Sidebar (7個のサブコンポーネント)
- lessons/ (1): LessonCard
- subscription/ (9): ContentGuard, FallbackContent, FeatureList, PlanCard, SubscriptionHeader, SubscriptionGuard, SubscriptionButton, ProtectedPremiumRoute, PlanComparison
- training/ (30+): TrainingHeader, TrainingFooter, TrainingCard, IconBlock, CategoryTag, LearningGoals, MarkdownRenderer, など
- guide/ (9): GuideCard, GuideGrid, GuideHero, CategoryBadge, CategorySection, GuideHeader, GuideContent, GuideLayout, RelatedGuides

### カラーシステム

**テーマカラー (CSS変数)**
- background, foreground
- primary, primary-foreground
- secondary, secondary-foreground
- muted, muted-foreground
- accent, accent-foreground
- destructive, destructive-foreground
- card, card-foreground
- popover, popover-foreground
- border, input, ring
- sidebar (8個のサブカラー)

**カスタムカラー**
- training: DEFAULT, background, dark, text (primary/secondary), gradient (start/middle/end)

### タイポグラフィ

**フォントファミリー**
- Futura
- Inter
- Noto Sans / Noto Sans JP
- M PLUS Rounded 1c (Rounded Mplus)
- DotGothic16

### アニメーション

- accordion-down, accordion-up
- fade-in
- gradient-fade-in
- gradient-slide
- gradient-scale-slide

## 実装アプローチ

1. `/dev/components` ルートでアクセス可能なページを作成
2. 環境チェックで開発モードのみ表示
3. タブまたはセクションで分類:
   - Colors (カラーパレット)
   - Typography (タイポグラフィ)
   - Animations (アニメーション)
   - UI Components (shadcn/ui)
   - Custom Components (カスタムコンポーネント)
4. 各コンポーネントには:
   - ライブプレビュー
   - 説明
   - コードスニペット (オプション)

## 参考リンク

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
