# BONO Training - Next.js

UIUXデザイン学習プラットフォーム「BONO」のNext.js App Router版。

## 技術スタック

- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS v4, shadcn/ui
- **CMS**: Sanity
- **Auth**: Supabase Auth
- **Payment**: Stripe (via Supabase Edge Functions)
- **Language**: TypeScript

## セットアップ

### 環境変数

`.env.local` に以下を設定:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

### 開発サーバー

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアクセス。

## ディレクトリ構成

```
src/
├── app/                    # App Router ページ
│   ├── (auth)/            # 認証関連
│   ├── articles/          # 記事詳細
│   ├── lessons/           # レッスン一覧・詳細
│   ├── mypage/            # マイページ
│   ├── subscription/      # サブスクリプション
│   └── ...
├── components/
│   ├── article/           # 記事関連コンポーネント
│   ├── auth/              # 認証コンポーネント
│   ├── common/            # 共通コンポーネント
│   ├── layout/            # レイアウト (Header/Footer)
│   ├── lesson/            # レッスン関連
│   ├── lessons/           # レッスン一覧
│   ├── subscription/      # サブスク関連
│   └── ui/                # shadcn/ui
├── hooks/                  # カスタムフック
├── lib/
│   ├── services/          # APIサービス
│   ├── supabase/          # Supabaseクライアント
│   └── ...
└── types/                  # TypeScript型定義
```

## 主要機能

### コア機能 (Phase 1-2)
- [x] レッスン一覧・詳細ページ (SSR)
- [x] 記事詳細ページ (動画再生、サイドナビ)
- [x] カテゴリナビゲーション
- [x] マイページ (進捗、ブックマーク、履歴)
- [x] プロフィール・アカウント設定
- [x] 認証 (ログイン/サインアップ/パスワードリセット)

### 決済機能 (Phase 3)
- [x] サブスクリプションページ
- [x] Stripe Checkout統合
- [x] カスタマーポータル

### 今後の実装 (Phase 4)
- [ ] トレーニング機能
- [ ] フィードバック機能
- [ ] ブログ機能
- [ ] ガイド機能

## コマンド

```bash
npm run dev       # 開発サーバー
npm run build     # プロダクションビルド
npm run start     # プロダクションサーバー
npm run lint      # ESLint
```

## 移行状況

詳細は [MIGRATION_STATUS.md](./MIGRATION_STATUS.md) を参照。

## ライセンス

Private
