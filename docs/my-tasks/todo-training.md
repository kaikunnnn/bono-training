# Markdown でトレーニングコンテンツを管理し、無料/有料出し分けを行い、1 人で運用できるを最小限で対応できるようにする開発計画です。

以下の内容を参照して開発を進めてください。
すでに終わった内容に対しては何度もチェックする手間をなくすために、ドキュメントを編集しながら進めてください

⸻

# MDX ファイルによるトレーニングコース管理：最小構成の開発計画

⸻

## Phase 1：ストレージと基本的な取得機能の実装

### 🎯 目的

- Supabase Storage に Markdown ファイルをアップロードし、それをフロントで読み込んで表示できる仕組みを整える。

### ✅ タスク

1. content バケットの作成
   - Supabase Storage に content バケットを作成（public = false）。
   - フォルダ構成は /content/[training-slug]/content.mdx の単層構造で OK。
2. RLS ポリシー設定
   - SELECT: anon（未ログインユーザー）も許可。
   - INSERT/UPDATE: authenticated ユーザーのみ許可（自分だけが編集できるように）。
3. MDX ファイルのアップロード
   - 最低 1 つのサンプルファイル（無料用・有料用）を /content/react-hooks/content.mdx などにアップ。
4. エッジ関数 get-mdx-content の作成
   - JWT を検証し、対象ファイルの is_premium フロントマターを読み取る。
   - 有料なのに未認証 or 無課金なら 403 を返す。
   - 成功時は { frontMatter, content } を返す。

⸻

## Phase 2：フロントエンドの最小表示機能の実装

### 🎯 目的

- MDX を読み込んで表示する UI を作り、無料／有料の出し分けを最低限行う。

### ✅ タスク

1. フロントマター型の定義

interface MdxFrontMatter {
title: string;
is_premium?: boolean;
slug?: string;
}

2. loadMdxContent(slug: string) 関数の作成
   - 上記エッジ関数を叩き、結果の content を MDX に変換して返す。
3. TaskDetailPage に表示
   - loadMdxContent を使い、MDX 本文を表示。
   - is_premium: true かつ課金ユーザーでない場合は「購読してください」画面を表示。
4. MdxPreview コンポーネントの作成
   - markdown-to-jsx or @mdx-js/react を使い、MDX 本文を描画。

⸻

## Phase 3：運用フローの整備（手動）

### 🎯 目的

- Markdown ファイルを手動で差し替えるだけでコンテンツが更新されるようにする。

### ✅ タスク

1. コンテンツの管理ルールを定める（簡易ドキュメント）
   - ファイル命名ルール：[slug]/content.mdx
   - フロントマターに is_premium を必ずつける。
   - title なども frontmatter に入れる。
2. 新規追加／修正時の手順を確立
   - Supabase Studio or CLI から手動アップロード。
   - アップロード後、自動反映される仕組み（CDN を使わなければ即反映）。

⸻

## 📌 最小要件まとめ

| 機能                            | 実装状況                                |
| ------------------------------- | --------------------------------------- |
| Markdown からのトレーニング構築 | ✅ content.mdx + frontmatter            |
| 有料/無料出し分け               | ✅ is_premium + JWT 検証                |
| 表示                            | ✅ フロントで loadMdxContent()          |
| 編集                            | ✅ 手動で Storage にアップすれば OK     |
| セキュリティ                    | ✅ JWT で paid チェック。RLS で更新制限 |
