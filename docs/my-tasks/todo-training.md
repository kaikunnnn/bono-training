
お待たせしました。
以下に「あなたの既存の実装計画を踏襲しつつ、今回の要望（文章と動画の無料/有料出し分け）を反映した修正版の実装計画」をご用意しました。

⸻

✅ MDX ファイルによるトレーニングコンテンツ管理システム（修正版）

⸻

Phase 1: ストレージとエッジ関数の実装（✅ 完了）

目的： Supabase Storage と連携し、MDX ファイルの読み込み基盤を構築する

✅ 実装済み
• content バケット作成（public=false）
• ファイル構成：content/training-slug/content.mdx
• Edge Function get-mdx-content の実装
• JWT を読み取り、ユーザーが有料会員かどうかを判定
• 認可 OK なら content.mdx を読み取り、Frontmatter と本文を返す

⸻

Phase 2: フロントエンドのローダー・表示機能の実装（✅ 完了）

目的： コンテンツを効率的に読み込み、無料/有料を切り替えて表示できる UI を作成

✅ 実装済み

✅ 文章出し分け（MDX 内で途中から有料）
• content.mdx に <!--PREMIUM--> 区切りを導入

## useState とは？

useState は React の状態管理...

<!--PREMIUM-->

この先では useEffect の使い方を紹介します...

✅ MdxPreview コンポーネントを修正：
• content.split(preview_marker) で分割
• 有料会員でなければ前半のみを表示 + 「続きを見るには課金」バナー表示

✅ 動画出し分け
• Frontmatter に以下の 2 つを追加：

video_preview: "987654321" # 無料ユーザー用
video_full: "123456789" # 有料ユーザー用

✅ VideoPlayer コンポーネントで userIsPaid によって表示を切り替える：

const videoId = userIsPaid ? frontMatter.video_full : frontMatter.video_preview;

⸻

Phase 3: コンテンツ管理とセキュリティ（✅ 完了）

目的： コンテンツの一貫性と安全性を保つ

✅ 実装済み
• preview_marker のキーワードを Frontmatter 側でカスタマイズ可能にしておく（オプション）：

preview_marker: "<!--PREMIUM-->"

• フロント側で frontMatter.preview_marker || "<!--PREMIUM-->" のように柔軟に対応
• is_premium: true を Frontmatter に明示し、エッジ関数やUI側の表示切り替えロジックと一致させる

⸻

Phase 4: 進捗管理機能の実装（✅ 完了）

目的： ユーザーがトレーニングの進捗を追跡できる仕組みを導入

✅ 実装済み
• ユーザーごとの進捗データを保存する仕組み
• タスク完了時のステータス更新機能
• 進捗度合いを視覚的に表示するプログレスバー
• 全タスク完了時のお祝いメッセージ

⸻

Phase 5: 運用・更新フロー（予定）

目的： Markdown ファイルをアップロードするだけでコンテンツが管理・反映されるフローを整える

◯ 実装予定
• VS Code 等で content.mdx を編集
• Supabase の Storage へアップロード（GUI または CLI）
• JWT によるアクセス制御により、適切なユーザーにのみ表示

⸻

📌 現在の実装状況

対象 | 状態 | 詳細
--- | --- | ---
ストレージ基盤 | ✅ 完了 | content バケット作成、RLSポリシー設定完了
MdxPreview コンポーネント | ✅ 完了 | プレミアムコンテンツ表示制限機能実装済み
TaskVideo コンポーネント | ✅ 完了 | 有料/無料ユーザー向けの動画出し分け機能を実装済み
進捗管理機能 | ✅ 完了 | タスク完了チェック、進捗バー表示機能を実装済み
TaskContent コンポーネント | ✅ 完了 | プレミアムマーカー対応、有料/無料コンテンツの出し分け機能を実装済み
Edge Function | ✅ 完了 | get-mdx-content のプレミアムコンテンツ対応を実装済み

⸻

### サンプル MDX ファイル

```md
---
title: "ホーム画面をつくる"
slug: "build-home-ui"
order_index: 1
is_premium: true
video_full: "845235300"
video_preview: "845235294"
preview_sec: 30
preview_marker: "<!--PREMIUM-->"
---

# ホーム画面の設計

このタスクでは、UIデザインの基本原則に従ってホーム画面を作成します。

## 基本レイアウト

まずはグリッドシステムを理解しましょう...

<!--PREMIUM-->

## 高度なテクニック

ここからは有料会員限定のコンテンツです。Auto-layoutを活用した効率的な...
```

⸻

### 次のステップ

1. ✅ プレミアムコンテンツの区切り処理を完了
2. ✅ Edge Function `get-mdx-content` の JWT 認証・認可処理を実装
3. ✅ サンプル MDX ファイルのアップロード
4. ✅ ユーザー権限に基づいた表示テスト
5. ✅ 進捗管理機能の実装

現在の課題:
- SNS シェア機能の実装
- 達成バッジやリマインダー機能などのゲーミフィケーション要素の追加
- サイドナビゲーションの改善（完了済みのタスクを視覚的に分かりやすく）
