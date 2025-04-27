# ⬇️ データスキーマ & MD ファイル管理

## データ管理方針

トレーニングとお題の内容は MD ファイルで管理し、メタデータのみを Supabase で管理します。

### ① training メタデータ（Supabase）

```sql
create table public.training (
  id            uuid        primary key default gen_random_uuid(),
  slug          text        unique not null,
  title         text        not null,
  description   text,
  type          text        check (type in ('challenge','skill')),
  difficulty    text        check (difficulty in ('easy','normal','hard')),
  tags          text[]      default '{}',
  created_at    timestamptz default now()
);
```

### ② task メタデータ（Supabase）

```sql
create table public.task (
  id            uuid        primary key default gen_random_uuid(),
  training_id   uuid        references public.training (id) on delete cascade,
  slug          text        not null,
  title         text        not null,
  order_index   int         not null,
  is_premium    boolean     default false,
  preview_sec   int         default 30,
  video_full    text,
  video_preview text,
  created_at    timestamptz default now(),
  unique (training_id, slug)
);
```

### ③ user_progress 進捗チェック（Supabase）

```sql
create table public.user_progress (
  user_id     uuid    references auth.users (id) on delete cascade,
  task_id     uuid    references public.task  (id) on delete cascade,
  status      text    check (status in ('done','todo','in-progress')) default 'todo',
  completed_at timestamptz,
  primary key (user_id, task_id)
);
```

### ④ subscriptions テーブルに members 列を追加（既存テーブルに ALTER）

```sql
alter table public.subscriptions
  add column plan_members boolean default false;
```

## MD ファイル管理構造

トレーニングとお題の内容は以下のようなディレクトリ構造で MD ファイルとして管理します：

```
/content/training/
  /ui-todo/                    # training.slugに対応
    meta.md                    # トレーニングの説明など
    /build-home-ui/            # task.slugに対応
      content.md               # 実際のコンテンツ
    /add-todo-flow/
      content.md
    /state-management/
      content.md
```

### meta.md の例

```markdown
---
title: "UI Todo"
description: "Todo アプリで UI デザインを筋トレ"
type: "challenge"
difficulty: "normal"
tags: ["ui", "figma"]
---

# UI Todo

このトレーニングでは、シンプルな Todo アプリの UI デザインを通じて、基本的な UI デザインの考え方を学びます。
```

### content.md の例

```markdown
---
title: "ホーム画面をつくる"
slug: "build-home-ui"
order_index: 1
is_premium: false
preview_sec: 30
video_full: "https://example.com/videos/build-home-ui-full.mp4"
video_preview: "https://example.com/videos/build-home-ui-preview.mp4"
---

# ホーム画面をつくる

このタスクでは、Todo アプリのホーム画面をデザインします。

## 目標

- タスク一覧の表示
- 新規タスク追加ボタンの配置
- フィルター機能の実装

## 手順

1. まずはワイヤーフレームを作成します
2. カラースキームを決定します
3. コンポーネントを配置します
```

## 使い方

1. Supabase ダッシュボード → SQL Editor → 新しいクエリに上記を貼り付け → 実行。
2. GUI で「Tables」に反映されれば完了。
3. `/content/training/` ディレクトリを作成し、上記の構造で MD ファイルを配置。

## 注意点

- MD ファイルのフロントマターと Supabase のデータは同期させる必要があります
- アプリケーションは両方を連携させて表示します
- コンテンツ更新時は MD ファイルを編集し、メタデータのみ Supabase で更新します

読み込んだ MDC ファイルの一覧: 00general.mdc, 01best-practice-common.mdc, 02structure.mdc, 03product.mdc
