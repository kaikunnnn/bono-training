-- =============================================================================
-- user_subscriptions: 何に興味を持って課金したか（ボタンを押したページ・最初に来たページ）
-- 作成日: 2026-10-07
-- 関連: rebono/issues #233（D3）。#213 A2 の source_group を広げる
-- 目的:
--   source_group（9グループ）だけでは「どのレッスン・どの動画か」が分からないため、
--   ページ単位のパスと、サイトに初めて来たときの入口（パス・?yt=・utm_*・参照元ドメイン・日時）を
--   Stripe Checkout の metadata 経由で持ち回り、新規契約の行に保存する。
-- 個人情報:
--   パス（クエリ無し）・印・ドメインだけ。値はアプリと Edge Function
--   （supabase/functions/_shared/purchase-attribution.ts）で整形済み。長さは CHECK でも縛る。
-- 書き込み:
--   stripe-webhook（checkout.session.completed / customer.subscription.created / .updated）。
--   ルールは source_group と同じ（新しい契約は今回の値で上書き・無ければ NULL、
--   同じ契約の再通知・更新・プラン変更では既存値を保持）。
-- 既存データ: 触らない（すべて NULL のまま）。
-- 適用順: このマイグレーション → stripe-webhook / create-checkout のデプロイ。
--   （webhook は列が無いと既存値の読み取りに失敗して attribution を書かないので、逆順でも契約保存は壊れない）
-- =============================================================================

ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS source_path text,
  ADD COLUMN IF NOT EXISTS first_touch_path text,
  ADD COLUMN IF NOT EXISTS first_touch_yt text,
  ADD COLUMN IF NOT EXISTS first_touch_utm_source text,
  ADD COLUMN IF NOT EXISTS first_touch_utm_medium text,
  ADD COLUMN IF NOT EXISTS first_touch_utm_campaign text,
  ADD COLUMN IF NOT EXISTS first_touch_utm_content text,
  ADD COLUMN IF NOT EXISTS first_touch_utm_term text,
  ADD COLUMN IF NOT EXISTS first_touch_referrer_host text,
  ADD COLUMN IF NOT EXISTS first_touch_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_subscriptions_purchase_attribution_length_check'
      AND conrelid = 'public.user_subscriptions'::regclass
  ) THEN
    ALTER TABLE public.user_subscriptions
      ADD CONSTRAINT user_subscriptions_purchase_attribution_length_check
      CHECK (
        (source_path IS NULL OR (char_length(source_path) <= 200 AND left(source_path, 1) = '/'))
        AND (first_touch_path IS NULL OR (char_length(first_touch_path) <= 200 AND left(first_touch_path, 1) = '/'))
        AND (first_touch_yt IS NULL OR char_length(first_touch_yt) <= 64)
        AND (first_touch_utm_source IS NULL OR char_length(first_touch_utm_source) <= 100)
        AND (first_touch_utm_medium IS NULL OR char_length(first_touch_utm_medium) <= 100)
        AND (first_touch_utm_campaign IS NULL OR char_length(first_touch_utm_campaign) <= 100)
        AND (first_touch_utm_content IS NULL OR char_length(first_touch_utm_content) <= 100)
        AND (first_touch_utm_term IS NULL OR char_length(first_touch_utm_term) <= 100)
        AND (first_touch_referrer_host IS NULL OR char_length(first_touch_referrer_host) <= 100)
      );
  END IF;
END $$;

COMMENT ON COLUMN public.user_subscriptions.source_path IS
  '料金ページへのボタンを押したページのパス（クエリ無し・最後に押したもの）。NULL=不明/#233以前。#233';
COMMENT ON COLUMN public.user_subscriptions.first_touch_path IS
  '最初に来たページのパス（クエリ無し・90日以内の初回来訪）。NULL=不明/#233以前。#233';
COMMENT ON COLUMN public.user_subscriptions.first_touch_yt IS
  '最初に来たときの YouTube の印（?yt=）。#233';
COMMENT ON COLUMN public.user_subscriptions.first_touch_utm_source IS '最初に来たときの utm_source。#233';
COMMENT ON COLUMN public.user_subscriptions.first_touch_utm_medium IS '最初に来たときの utm_medium。#233';
COMMENT ON COLUMN public.user_subscriptions.first_touch_utm_campaign IS '最初に来たときの utm_campaign。#233';
COMMENT ON COLUMN public.user_subscriptions.first_touch_utm_content IS '最初に来たときの utm_content。#233';
COMMENT ON COLUMN public.user_subscriptions.first_touch_utm_term IS '最初に来たときの utm_term。#233';
COMMENT ON COLUMN public.user_subscriptions.first_touch_referrer_host IS
  '最初に来たときの参照元ドメイン（ホスト名のみ・自サイトは NULL）。#233';
COMMENT ON COLUMN public.user_subscriptions.first_touch_at IS
  '最初に来た日時（ブラウザで記録）。#233';
