Markdown でトレーニングコンテンツを管理し、無料/有料出し分けを行い、1 人で運用できるを最小限で対応できるようにする開発計画です。

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
