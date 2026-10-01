-- =============================================================================
-- user_subscriptions.source_group（料金ページにどこから来て契約したか）
-- 作成日: 2026-10-01
-- 関連: rebono/issues #213 スライス A2 / 213-B_出す数字の定義 P1（案B・最後に押したボタン1つ・9グループ）
-- 目的:
--   料金ページ（/subscription?from=<group>）の出どころを Stripe Checkout の metadata 経由で
--   持ち回り、新規契約の行に保存する。ダッシュボードで「どのボタンから来た人が実際に払ったか」を出す。
-- 値:
--   9グループ（src/lib/activity-utils.ts PRICING_CTA_SOURCE_GROUPS /
--   supabase/functions/_shared/pricing-source.ts と同じ）または NULL（直接・不明・A2以前の契約）。
-- 書き込み:
--   stripe-webhook（checkout.session.completed / customer.subscription.created / .updated）が
--   metadata.source_group から書く。新しい契約（保存済みと違う subscription id。解約後の再入会を含む）
--   は今回の値で上書き（無効・無しなら NULL）。同じ契約の更新・プラン変更では既存値を保持する。
-- 既存データ: 触らない（すべて NULL のまま）。
-- =============================================================================

ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS source_group text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_subscriptions_source_group_check'
      AND conrelid = 'public.user_subscriptions'::regclass
  ) THEN
    ALTER TABLE public.user_subscriptions
      ADD CONSTRAINT user_subscriptions_source_group_check
      CHECK (
        source_group IS NULL OR source_group IN (
          'lesson_lock',
          'content_lock',
          'roadmap',
          'feedback',
          'questions',
          'top',
          'nav',
          'event',
          'other'
        )
      );
  END IF;
END $$;

COMMENT ON COLUMN public.user_subscriptions.source_group IS
  '料金ページの出どころ（最後に押したCTAのグループ・9種）。NULL=直接/不明/A2以前。#213 A2';
