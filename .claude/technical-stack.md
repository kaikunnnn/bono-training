# 技術スタック

このドキュメントは、bono-training プロジェクトで使用している技術スタックの全体像をまとめたものです。

---

## 📋 プロジェクト概要

- **プロジェクト名**: bono-training
- **説明**: UI/UX デザイン学習プラットフォーム
- **言語**: TypeScript（フロントエンド・バックエンド共通）

---

## 🎨 フロントエンド

### コアフレームワーク・ライブラリ

- **React** `18.3.1`

  - メイン UI ライブラリ
  - 関数コンポーネント + Hooks ベースの実装

- **TypeScript** `5.5.3`

  - 型安全性を確保
  - strict モードは緩和（noImplicitAny: false, strictNullChecks: false）
  - `@/*` エイリアスによるパスマッピング

- **React Router DOM** `6.26.2`
  - クライアントサイドルーティング
  - PrivateRoute による認証保護実装

### ビルドツール・開発環境

- **Vite** `5.4.1`

  - 高速な開発サーバーとビルド
  - `@vitejs/plugin-react-swc` で React 高速コンパイル
  - ポート: 8080
  - React 重複バンドル問題の解決（dedupe 設定）

- **ESLint** `9.9.0`
  - コード品質チェック
  - React Hooks / React Refresh プラグイン使用

### スタイリング

- **Tailwind CSS** `3.4.11`

  - ユーティリティファースト CSS
  - カスタムテーマ（training 専用カラー、グラデーション、アニメーション）
  - `@tailwindcss/typography` プラグイン
  - `tailwindcss-animate` によるアニメーション拡張

- **PostCSS** `8.4.47`

  - CSS 変換・最適化

- **カスタムフォント**:
  - Futura, Inter, Noto Sans JP, M PLUS Rounded 1c, DotGothic16

### UI コンポーネントライブラリ

- **shadcn/ui** (Radix UI ベース)

  - 40 以上のコンポーネント実装（`src/components/ui/`）
  - Radix UI プリミティブ使用
  - カスタマイズ可能なアクセシブルコンポーネント

- **主要 UI ライブラリ**:
  - `lucide-react` `0.462.0` - アイコン
  - `sonner` `1.5.0` - トースト通知
  - `cmdk` `1.0.0` - コマンドパレット
  - `embla-carousel-react` `8.3.0` - カルーセル
  - `recharts` `2.12.7` - チャート/グラフ
  - `vaul` `0.9.3` - ドロワー
  - `next-themes` `0.3.0` - テーマ切替（ダークモード）

### 状態管理・データフェッチ

- **React Context API**

  - `AuthContext` - 認証状態管理
  - `SubscriptionContext` - サブスクリプション状態管理

- **TanStack Query** (React Query) `5.56.2`

  - サーバー状態管理
  - キャッシング、再取得、バックグラウンド同期

- **カスタムフック**:
  - `useContent` - コンテンツデータ取得
  - `useSubscription` - サブスクリプション管理
  - `useTrainingCache` - トレーニングデータキャッシュ

### フォーム管理

- **React Hook Form** `7.53.0`

  - フォーム状態管理
  - バリデーション

- **Zod** `3.23.8`
  - TypeScript ファーストなスキーマバリデーション
  - `@hookform/resolvers` との統合

### マークダウン・コンテンツレンダリング

- **react-markdown** `10.1.0`

  - Markdown コンテンツのレンダリング
  - GFM（GitHub Flavored Markdown）サポート

- **関連プラグイン**:
  - `remark-gfm` `4.0.1` - GFM 構文サポート
  - `rehype-highlight` `7.0.2` - コードシンタックスハイライト
  - `rehype-raw` `7.0.0` - 生 HTML 対応
  - `js-yaml` `4.1.0` - frontmatter パース

### ユーティリティ

- **class-variance-authority** `0.7.1` - コンポーネントバリアント管理
- **clsx** `2.1.1` - クラス名結合
- **tailwind-merge** `2.5.2` - Tailwind クラスのマージ
- **date-fns** `3.6.0` - 日付操作

---

## 🔧 バックエンド

### プラットフォーム

- **Supabase**
  - プロジェクト ID: `fryogvfhymnpiqwssmuu`
  - PostgreSQL データベース（v15）
  - 認証、ストレージ、Edge Functions

### Edge Functions (Deno ランタイム)

バックエンドロジックは Supabase Edge Functions で実装（Deno ベース）

**実装済みエンドポイント**:

- `check-subscription` - サブスクリプション状態確認
- `create-checkout` - Stripe Checkout セッション作成
- `get-content` - コンテンツ取得（アクセス制御付き）
- `get-training-content` - トレーニングコンテンツ取得
- `get-training-detail` - トレーニング詳細取得
- `get-training-list` - トレーニング一覧取得
- `stripe-webhook` - Stripe Webhook ハンドラー

**共通機能**:

- CORS 設定（`_shared/cors.ts`）
- エラーハンドリング
- アクセス制御ロジック

### データベース

- **PostgreSQL** (Supabase 提供)
  - スキーマ: `public`, `storage`, `graphql_public`
  - RLS（Row Level Security）
  - マイグレーション管理（`supabase/migrations/`）

### 認証

- **Supabase Auth**
  - メールアドレス + パスワード認証
  - JWT トークン（有効期限: 3600 秒）
  - メール確認機能
  - パスワードリセット

### ストレージ

- **Supabase Storage**
  - ファイルサイズ上限: 50MB
  - トレーニングコンテンツバケット
  - 画像・動画アセット管理

---

## 💳 決済・課金

### Stripe 統合

- サブスクリプション管理
- Checkout セッション作成
- Webhook 処理
- カスタマーポータル

**プラン構成**:

- `free` - 無料プラン
- `community` (¥1,480/月) - メンバーコンテンツアクセス
- `standard` (¥4,000/月) - 学習コンテンツアクセス
- `growth` (¥9,800/月) - 全コンテンツ + フィードバック機能

**実装ファイル**:

- `src/services/stripe.ts` - Stripe API クライアント
- `src/utils/stripe.ts` - Stripe ユーティリティ
- `supabase/functions/stripe-webhook/` - Webhook ハンドラー

---

## 🎬 メディア

### 動画プレイヤー

- **Vimeo**
  - カスタム Vimeo プレイヤーコンポーネント（`src/components/content/VimeoPlayer.tsx`）
  - プレビュー動画 vs フル動画の出し分け
  - 無料/有料ユーザーの視聴制御

---

## 🧪 テスト

### テストフレームワーク

- **Jest** `29.7.0`

  - ユニットテスト・統合テスト
  - `ts-jest` `29.3.4` - TypeScript サポート

- **Testing Library**
  - `@testing-library/react` `16.3.0`
  - `@testing-library/jest-dom` `6.6.3`
  - `@testing-library/user-event` `14.6.1`

### テストファイル

- `src/__tests__/edge-functions/` - Edge Functions テスト
- `src/__tests__/integration/` - 統合テスト
- テスト設定: `jest.config.js`, `tsconfig.jest.json`

---

## 📦 デプロイ・インフラ

### ホスティング

- **Vercel**
  - フロントエンドデプロイ
  - 設定: `vercel.json`
  - 環境変数管理

### CI/CD・自動化スクリプト

**スクリプト一覧** (`scripts/`):

- `sync-training-content.js` - コンテンツ同期
- `upload-initial-content.js` - 初期コンテンツアップロード
- `validate-training-content.sh` - コンテンツバリデーション
- `validate-frontmatter.sh` - Frontmatter バリデーション
- `validate-data-consistency.sh` - データ整合性チェック
- `check-image-resources.sh` - 画像リソースチェック
- `monitor-system-health.sh` - システムヘルスモニタリング
- `test-edge-functions.sh` - Edge Functions テスト
- `run-all-validations.sh` - 全バリデーション実行

---

## 📄 コンテンツ管理

### コンテンツ構造

- **Markdown ベース**
  - `content/training/` 配下に構造化
  - Frontmatter によるメタデータ管理
  - 各トレーニングに `index.md` と `tasks/` サブディレクトリ

### コンテンツパース

- カスタムパーサー実装（`src/lib/simple-frontmatter.ts`）
- セクション分割機能（`src/lib/content-splitter.ts`）
- スキルガイドパーサー（`src/utils/simplifiedSkillGuideParser.ts`）

### トレーニング構造

```
Course (コース)
└── LessonSeries (レッスンシリーズ)
    └── Content (最小学習単位)
```

---

## 🔐 アクセス制御・権限管理

### 権限タイプ

- **learning_access** - 学習コンテンツ閲覧権限（standard, growth）
- **member_access** - メンバーコンテンツ閲覧権限（community, standard, growth）

### ガード実装

- `ProtectedPremiumRoute` - ページレベル保護
- `ContentGuard` - コンテンツレベル保護
- `SubscriptionGuard` - サブスクリプション状態による出し分け
- `TrainingGuard` - トレーニングコンテンツ保護

---

## 🛠️ 開発ツール

- **lovable-tagger** `1.7` - コンポーネントタグ付け（開発モード）
- **TypeScript ESLint** `8.0.1` - TypeScript リンティング
- **Autoprefixer** `10.4.20` - CSS ベンダープレフィックス自動付与

---

## 📂 主要ディレクトリ構造

```
bono-training/
├── src/
│   ├── components/          # UIコンポーネント
│   │   ├── auth/           # 認証関連
│   │   ├── training/       # トレーニング関連
│   │   ├── subscription/   # サブスクリプション関連
│   │   ├── content/        # コンテンツ表示
│   │   └── ui/             # shadcn/ui コンポーネント
│   ├── contexts/           # React Context
│   ├── hooks/              # カスタムフック
│   ├── pages/              # ページコンポーネント
│   ├── services/           # API サービス層
│   ├── types/              # TypeScript 型定義
│   ├── utils/              # ユーティリティ関数
│   └── integrations/       # 外部サービス統合
│       └── supabase/
├── supabase/
│   ├── functions/          # Edge Functions
│   └── migrations/         # DBマイグレーション
├── content/
│   └── training/           # トレーニングコンテンツ（Markdown）
├── public/                 # 静的アセット
└── scripts/                # 自動化スクリプト
```

---

## 🌐 環境変数

プロジェクトルートに `.env` ファイルを配置（GitIgnore 対象）

**必要な環境変数**:

- `VITE_SUPABASE_URL` - Supabase プロジェクト URL
- `VITE_SUPABASE_ANON_KEY` - Supabase 匿名キー
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe 公開キー
- （他、Stripe シークレットキー等は Edge Functions 側で管理）

---

## 📝 コーディング規約

### TypeScript

- 明示的な型アノテーションを使用
- `any` 型は避け、`unknown` を使用（ただし現在は緩和設定）
- 複雑な型は `interface`/`type` で定義
- 配列型は `T[]` 形式を優先
- オプショナルチェーン `?.` と Nullish 合体演算子 `??` を活用

### モジュール構成

- 絶対パスは `@/*` エイリアス使用
- 型のみの場合は `import type` 使用
- 名前付きエクスポート優先

### エラー処理

- 具体的なエラー型を使用
- 非同期処理は `try/catch` または `Promise.catch()` で処理
- エラーバウンダリ実装（`src/components/common/ErrorBoundary.tsx`）

---

## 🚀 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 開発環境ビルド
npm run build:dev

# リント
npm run lint

# プレビュー
npm run preview
```

---

## 📊 パフォーマンス最適化

- React 重複バンドル問題の解決（Vite dedupe 設定）
- TanStack Query によるデータキャッシング
- カスタムフック `useTrainingCache` によるトレーニングデータキャッシュ
- Lazy loading / Code splitting（React Router）
- 画像最適化（WebP 形式使用）

---

## 🔄 更新履歴メモ

このドキュメントは技術スタックの変更に応じて更新してください。

- 2025 年 10 月 24 日: 初版作成
