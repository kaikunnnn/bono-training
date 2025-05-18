お待たせしました。
以下に「あなたの既存の実装計画を踏襲しつつ、今回の要望（文章と動画の無料/有料出し分け）を反映した修正版の実装計画」をご用意しました。

⸻

✅ MDX ファイルによるトレーニングコンテンツ管理システム（修正版）

⸻

Phase 1: ストレージとエッジ関数の実装（変更なし）

目的： Supabase Storage と連携し、MDX ファイルの読み込み基盤を構築する

✅ 実装内容
• content バケット作成（public=false）
• ファイル構成：content/training-slug/content.mdx
• Edge Function get-mdx-content の実装
• JWT を読み取り、ユーザーが有料会員かどうかを判定
• 認可 OK なら content.mdx を読み取り、Frontmatter と本文を返す

⸻

Phase 2: フロントエンドのローダー・表示機能の実装（✅ 修正あり）

目的： コンテンツを効率的に読み込み、無料/有料を切り替えて表示できる UI を作成

✅ 修正点（追加）

✍️ 文章出し分け（MDX 内で途中から有料）
• content.mdx に <!--PREMIUM--> 区切りを導入

## useState とは？

useState は React の状態管理...

<!--PREMIUM-->

この先では useEffect の使い方を紹介します...

    •	MdxPreview コンポーネントを修正：
    •	content.split(preview_marker) で分割
    •	有料会員でなければ前半のみを表示 + 「続きを見るには課金」バナー表示

🎥 動画出し分け
• Frontmatter に以下の 2 つを追加：

video_preview: "987654321" # 無料ユーザー用
video_full: "123456789" # 有料ユーザー用

    •	VideoPlayer コンポーネントで userIsPaid によって表示を切り替える：

const videoId = userIsPaid ? frontMatter.video_full : frontMatter.video_preview;

⸻

Phase 3: コンテンツ管理とセキュリティ（✅ 軽微な補足）

目的： コンテンツの一貫性と安全性を保つ

✅ 補足点
• preview_marker のキーワードを Frontmatter 側でカスタマイズ可能にしておく（オプション）：

preview_marker: "<!--PAID-->"

    •	フロント側で frontMatter.preview_marker || "<!--PREMIUM-->" のように柔軟に対応
    •	is_premium: true を Frontmatter に明示し、エッジ関数やUI側の表示切り替えロジックと一致させる

⸻

Phase 4: 運用・更新フロー（✅ 変更なし）

目的： Markdown ファイルをアップロードするだけでコンテンツが管理・反映されるフローを整える

✅ 内容
• VS Code 等で content.mdx を編集
• Supabase の Storage へアップロード（GUI または CLI）
• JWT によるアクセス制御により、適切なユーザーにのみ表示

⸻

📌 まとめ：今回の修正ポイント

対象 修正点
Phase 2 文章の途中出し分け (<!--PREMIUM--> 区切り) に対応
Phase 2 Frontmatter による動画の無料/有料切り替えに対応
Phase 3 preview_marker を Frontmatter で柔軟に設定できるようにした

⸻

必要なら、次のステップとして「実際の content.mdx のサンプルファイル」「表示側のコード断片」「Edge Function の JWT チェック実装」なども具体化できますので、遠慮なくどうぞ！
