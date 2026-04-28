# ファイル配置・命名規約

## App Router ルーティング

```
src/app/
├── [route]/page.tsx          # ページ（Server Component）
├── [route]/[slug]/page.tsx   # 動的ルート
├── [route]/error.tsx         # エラーバウンダリ
├── [route]/loading.tsx       # ローディング UI
├── [route]/opengraph-image.tsx # OGP画像
├── (auth)/                   # 認証グループ（レイアウトなし）
├── api/[route]/route.ts      # API Route
└── layout.tsx                # ルートレイアウト
```

## コンポーネント配置

```
src/components/
├── article/      # 記事詳細（VideoSection, RichTextSection, sidebar/）
├── lesson/       # レッスン（header/, quest/）
├── roadmap/      # ロードマップ（card/, detail/）
├── subscription/ # 課金（PlanCard, PlanSelector）
├── premium/      # ゲートUI（PremiumVideoLock, ContentPreviewOverlay）
├── training/     # トレーニング
├── layout/       # レイアウト（Layout, Header, Sidebar）
├── common/       # 共通（BackButton 等）
├── ui/           # shadcn/ui 汎用コンポーネント
└── auth/         # 認証
```

## lib 配置

- `lib/supabase/` — server.ts（Server専用）, client.ts（ブラウザ用）
- `lib/services/` — Server Actions + データ取得ロジック
- `lib/sanity.ts` — Sanity CMS クライアント
- `lib/subscription.ts` — サブスク（Server専用）
- `lib/subscription-utils.ts` — サブスクユーティリティ（共用）
- `lib/analytics.ts` — GA4 トラッキング

## 命名

- コンポーネント: PascalCase (`TrainingCard.tsx`)
- ユーティリティ: kebab-case (`subscription-utils.ts`)
- Server Action: `actions.ts`
- 型定義: `types/` に集約
