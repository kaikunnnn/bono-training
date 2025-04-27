# データスキーマ & マイグレーション SQL

## テーブル定義

### ① training サマリー（チャレンジ or スキル）

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

### ② task お題メタデータ（本文は MDX ファイルで管理、ここは index 用）

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

### ③ user_progress 進捗チェック

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

## 使い方

1. Supabase ダッシュボード → SQL Editor → 新しいクエリに上記を貼り付け → 実行。
2. GUI で「Tables」に反映されれば完了。

## 注意点

Stripe Webhook → plan_members=true を書き込むロジックを Edge Function で追加すれば権限制御できます。
