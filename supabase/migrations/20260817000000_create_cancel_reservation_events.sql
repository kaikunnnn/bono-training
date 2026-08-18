-- 解約予約(cancel_at_period_end)の遷移を記録する追記専用ログ。
-- 目的: 「解約を予約した瞬間」を残し、週次の予約数を正確に集計できるようにする。
--       user_subscriptions は現在値のみを持ち、予約時刻や予約→取消の履歴が残らないため、
--       週次トレンドを survivorship バイアスなく取るには専用ログが必要（issue 191 の後続）。
-- 書き込み元: supabase/functions/stripe-webhook の customer.subscription.updated ハンドラ。

create table if not exists public.cancel_reservation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  stripe_subscription_id text,
  stripe_customer_id text,
  plan_type text,
  duration integer,
  -- 'reserved'  = 自動更新オフ (cancel_at_period_end false→true)
  -- 'unreserved'= 予約取消     (cancel_at_period_end true→false)
  event_type text not null,
  current_period_end timestamptz,          -- この予約で失効する予定日
  environment text not null default 'live',-- test/live 分離（他テーブルと同様）
  reserved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

comment on table public.cancel_reservation_events is
  '解約予約(cancel_at_period_end)の遷移ログ。stripe-webhookが追記。週次の予約数集計用。issue 191';

create index if not exists idx_cancel_reservation_events_reserved_at
  on public.cancel_reservation_events (reserved_at);
create index if not exists idx_cancel_reservation_events_env_type
  on public.cancel_reservation_events (environment, event_type);

-- 管理者(service_role)専用。webhook は service_role で書き込むため RLS はバイパスされる。
-- 一般ユーザーからの参照は不要なので、あえて公開ポリシーは作らない（既定で全拒否）。
alter table public.cancel_reservation_events enable row level security;
