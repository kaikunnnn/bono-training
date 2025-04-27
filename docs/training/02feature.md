# 2. 主要機能 ──

### 概要一覧

| ID      | 機能ブロック                | ユーザーストーリー & 価値                                                                 | 主な UI / API                                              | データ & 権限                     |
| ------- | --------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------- | ------ |
| **A01** | **アカウント共通化**        | As a 既存受講者, I want to use the same BONO account on Training pages.                   | `<AuthProvider>`（Supabase）                               | `public.users` (共通)             |
| **S01** | **「members」購読権限**     | As a Pro 会員, I can view **paid training tasks**.<br>As a Free 会員, I can preview them. | `SubscriptionGuard role="members"`                         | `subscriptions.plan.members=true` |
| **T01** | **Training カタログ**       | ブラウズ & フィルタで「チャレンジ」「スキル」2 タイプのトレーニングを選べる。             | `/training` (`<TrainingTabs>`, `<TagFilter>`)              | front-matter: `type: challenge    | skill` |
| **T02** | **Training 詳細**           | 一覧で複数のお題 (Task) を確認し、順番に取り組む。                                        | `/training/[trainingSlug]` (`<TaskList>`, `<ProgressBar>`) | `training.yaml` (tasks[])         |
| **T03** | **Task（お題）ページ**      | タイトル・カテゴリ・説明・ポイント・ナレッジを読んで実装開始。                            | `/training/[trainingSlug]/[taskSlug]`                      | `tasks/*.mdx`                     |
| **G01** | **有料 Task ゲート**        | Free 会員でも Task ページを開けるが、本文は `<GateBanner>` で途中ロック。                 | `<GateBanner>` (`isMember` 判定)                           | `isPremium: true`                 |
| **P01** | **進捗マーク**              | Task 完了をチェックして Training 全体の進捗率を可視化。                                   | `<Checkbox>` -> `POST /api/training/progress`              | `user_progress`                   |
| **B01** | **SNS シェア**              | 完了後に成果物を Twitter 共有してモチベ維持。                                             | `<ShareTwitterBtn>`                                        | GA Event: `share_task`            |
| **C01** | **Markdown コンテンツ管理** | 記事型 Task を MDX で記述。AI／Cursor と親和性 ◎                                          | `content/training/<training>/<task>.mdx`                   | Front-matter schema               |

### Task（お題）ページ ── フロントマター例

```yaml
title: "ホーム画面をつくる"
slug: "build-home-ui"
category: "UI/レイアウト"
type: "challenge" # or "skill"
isPremium: true # 有料 Task
trainingPoints:
  - "Auto-layout を使う"
  - "16px グリッドで整列"
knowledgeLinks:
  - label: "Figma Auto-layout 公式"
    url: "https://help.figma.com/..."
```

### 権限制御ロジック例 参考程度です

```
const isMember = user?.subscription?.plan?.members === true;

if (!isMember && task.isPremium) {
  showPreview();       // タイトル・カテゴリ・Task リストのみ
  render(<GateBanner />);
} else {
  render(<TaskBody />); // 全文 + ナレッジリンク
}
```

---

# サンプルコンテンツ

### /training/ui-todo/build-home-ui.mdx

---

title: "ホーム画面をつくる"
slug: "build-home-ui"
training: "ui-todo"
order_index: 1
type: "challenge" # challenge | skill
is_premium: true
difficulty: "normal"
tags: ["ui", "layout", "figma"]
preview_sec: 30
video_full: "https://videos.bono.design/ui-todo-home.mp4"
video_preview: "https://videos.bono.design/preview-home.mp4"

---

import { YouTube } from "@/components/VideoPlayer";

#### ホーム画面をデザインしよう

**ゴール**: Todo リストの初期画面を 1024px 幅で作成し、4 つのカード UI を配置します。

##### 手順

1. Auto Layout フレームを作成し、16px グリッドを適用
2. カードを `border-radius: 12px` で作成
3. Text Style を `Heading/24` に設定

<YouTube id="abcd1234" start={0} end={preview_sec} />

---

##### トレーニングポイント

- **Auto Layout** の入れ子構造に慣れる
- グリッドシステムで余白を揃える

### ##ナレッジリンク

- [Figma Auto Layout 公式ガイド](https://help.figma.com/hc/ja/articles/360040451373)
- [8pt グリッドとは？](https://www.gridlover.net/8pt-grid)
