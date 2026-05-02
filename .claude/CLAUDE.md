# BONO Training — Next.js App Router

UIデザイン学習プラットフォーム。Supabase + Stripe + Sanity CMS で構築。

## 技術スタック

- Next.js 16 (App Router / Turbopack) + React 19
- TypeScript 5
- Supabase (認証・DB・Edge Functions)
- Stripe (課金・サブスクリプション)
- Sanity CMS (レッスン・記事コンテンツ)
- Tailwind CSS + shadcn/ui
- Vercel (ホスティング)

## 作業開始フロー

1. ブランチ名から Linear イシューを特定（`feature/bon-{番号}-{説明}` → BON-{番号}）
2. イシューのコメントで要件・フィードバックを確認
3. 作業実施、問題発見時はLinearにサブイシューまたはコメントで記録
4. 完了後、Linearステータスを更新

## ディレクトリ構成

```
src/
├── app/          # App Router ページ（Server Component）
├── components/   # UIコンポーネント（feature別 + ui/）
├── lib/          # ユーティリティ・サービス・Supabase
│   ├── supabase/ # server.ts / client.ts
│   └── services/ # Server Actions（progress, bookmarks等）
├── hooks/        # カスタムフック
├── types/        # 型定義
└── styles/       # グローバルCSS
```

## 開発コマンド

```bash
npm run dev       # localhost:3000
npm run build     # 本番ビルド（Server/Client境界エラーはここで検出）
npx tsc --noEmit  # 型チェック
npm run lint      # ESLint
npm test          # Vitest
```

## デザインシステム

UIの追加・編集・移植を行う前に、**必ず `.claude/design-system/SKILL.md` を読むこと**。色・タイポ・角丸・影・コンポーネントの正規ルールはそこに定義されている。

要点:
- 全てのcolor/type/radius/shadow値は `.claude/design-system/colors_and_type.css` で定義されたCSS変数を参照する
- JSXに生hex/rgbを書かない。トークンが存在する場合は `bg-[#102720]` ではなく `bg-btn-primary` を使う
- `next/link`, `next/image`, `next/font` を使う
- `ui_kits/marketing-top/` と `ui_kits/training/` を参照してから新UIを書く

## ルール（詳細は .claude/rules/ 参照）

- `01-nextjs-architecture.md` — Server/Client境界・レイアウト（最重要）
- `02-server-client-modules.md` — supabase/server vs client、モジュール分離パターン
- `03-ui-conventions.md` — アイコン・UIコンポーネント・CSS
- `04-billing-patterns.md` — 課金の3段階フォールバック
- `05-file-conventions.md` — ファイル配置・命名
- `06-development-workflow.md` — 環境・ビルド・デプロイ
- `07-performance.md` — フォント・画像・バンドルサイズ最適化

## 移植ルール（最重要）

mainブランチ（`/Users/kaitakumi/Documents/bono-training`）のコードを移植する際の必須ルール。
**独自に書き直すことは禁止。コピーして最小限のNext.js適応のみ行う。**

### 移植前チェック
1. mainの対応ファイルを必ず先に読む（`Read` で確認）
2. コンポーネント構造・CSS クラス・inline style をそのままコピー
3. Next.js 固有の変更のみ適用（`"use client"`, `Link`, `Image`, Server Component化 等）

### 移植時の禁止事項
- **CSSクラスの独自定義禁止**: mainに存在しないクラス名（`text-text-primary`, `bg-surface` 等）を作らない。mainのクラスをそのまま使う
- **ロジックの簡略化禁止**: mainの入れ子構造やフィルタリングロジックを平坦化しない
- **スタイルの再実装禁止**: mainで使っている `font-rounded-mplus`, `SectionHeading`, `DottedDivider` 等のコンポーネント/スタイルを手書きで置き換えない

### 移植後チェック（コミット前に必ず実施）
1. **URL照合**: 全ての `href`, `Link`, `redirect` が `src/app/` のディレクトリ構成と一致しているか確認
2. **アセット照合**: 参照している画像・フォントが `/public/` に存在するか確認
3. **色・フォント突合**: 見出し・本文の色・フォントがmainのコンポーネントと一致しているか確認
4. **mainとの目視比較**: ブラウザでmain（本番）と並べて表示を比較

## 禁止事項

- Linear イシューなしで作業開始しない
- テスト（build + tsc）なしでデプロイしない
- 本番DBで実験的なクエリを実行しない
- Client Component から `@/lib/supabase/server` を import しない
- MCP は本番DB参照のため、開発中のデータ操作に使用しない
