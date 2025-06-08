# Git ベースでの Training コンテンツ管理計画

## 目的

Markdown ファイルを Git リポジトリで管理し、無料・有料ユーザー向けにトレーニングコンテンツを表示・制御する構成に移行する。

⸻

1. ゴール・要件定義

1.1 基本要件
• Markdown ファイルでトレーニングコンテンツを作成・管理
• 無料・有料ユーザーによる出し分け（Supabase Auth ＋ Stripe 連携による会員権限管理）
• Git でのファイル管理とバージョン管理
• 新しいコンテンツを Git 経由で簡単に追加可能

1.2 出し分けの仕様
• Frontmatter で is_premium: true/false を定義
• 本文中の<!-- PREMIUM_ONLY -->で境界を分割
• video_preview, video_full による動画出し分けも対応

- 出しわけのアカウント権限は bo-no.design でやっている仕組みと同じものを使う

⸻

2. ファイル構成と命名規則

content/training/
├── todo-app/
│ ├── index.md
│ └── tasks/
│ ├── 01-introduction.md
│ ├── 02-advanced.md
│ └── 03-premium.md
├── figma-basics/
│ ├── index.md
│ └── tasks/
│ └── 01-getting-started.md

命名ルール
• Training 名: 英小文字・ハイフン（例: todo-app）
• タスク名: 01-introduction.md など番号＋英語名
• index.md: 各トレーニングのメタ情報と説明文

URL 対応
• トレーニング一覧: /training
• トレーニング詳細: /training/todo-app
• タスク詳細: /training/todo-app/introduction

⸻

3. Markdown 記述テンプレート

index.md

---

title: "Todo アプリ UI 制作"
description: "実践的な Todo アプリの UI デザインを学ぶ"
type: "challenge"
difficulty: "normal"
tags: ["ui", "todo", "実践"]
estimated_total_time: "2 時間"
task_count: 2

---

task.md（無料）

---

title: "はじめに"
slug: "introduction"
order: 1
is_premium: false
difficulty: "easy"
estimated_time: "60 分"
tags: ["ui", "基本"]
video_preview: ""
video_full: ""

---

...内容...

task.md（有料）

---

title: "プロの実践テクニック"
slug: "pro-techniques"
order: 3
is_premium: true
difficulty: "hard"
estimated_time: "90 分"
tags: ["上級", "プロ技術"]
video_preview: "https://.../preview.mp4"
video_full: "https://.../full.mp4"

---

...無料パート...

<!-- PREMIUM_ONLY -->

...有料パート...

⸻

4. 表示制御の仕様

4.1 アプリ側ロジック
• getMarkdownWithFrontmatter() で Markdown を取得
• isPremium 判定（Supabase DB + Stripe）
• <!-- PREMIUM_ONLY --> で split して出し分け

4.2 表示ロジック

const [freePart, premiumPart] = content.split('<!-- PREMIUM_ONLY -->')
const displayContent = isPremium ? freePart + premiumPart : freePart

⸻

5. データ設計と型定義

type TrainingMeta = {
title: string;
description: string;
slug: string;
difficulty: 'easy' | 'normal' | 'hard';
tags: string[];
estimated_total_time: string;
task_count: number;
};

type TaskMeta = {
title: string;
slug: string;
is_premium: boolean;
video_preview?: string;
video_full?: string;
};

type TaskContent = {
meta: TaskMeta;
body: string;
bodyPremium?: string;
};

⸻

6. チェックリスト

構造チェック
• Training 一覧に新しい Training が表示される
• Training 詳細にタスク一覧が正しく表示される
• タスク詳細ページが表示される

出し分けチェック
• 無料タスクは全文表示される
• 有料タスクは無料ユーザーに途中までのみ表示される
• 有料ユーザーには全コンテンツ表示される

⸻

備考
• Supabase Auth は「ログイン・課金状態の確認」にのみ使用
• Stripe は Webhook で Supabase ユーザーに is_premium フラグ付与
