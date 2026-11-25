-- =============================================================================
-- 会員メール: 常設の文面（毎日、条件に合った人だけに送る）を足す（#327-D）
-- 作成日: 2026-11-25
-- 関連: rebono/issues/327-D_はじめの案内_入会2〜3日目.md / 327_新規の最初の2週間に送る通知の実装.md
--       土台: 20261123000000_create_member_mail.sql
--
-- 変えること（足すだけ。既存の行・既存の動き（weekly）は変えない）:
--   1. member_mail_campaigns.standing_key
--        NULL … 今までどおりの1回分の文面（weekly など。scheduled_at = 送り始めてよい時刻）
--        値あり … 常設の文面（例: onboarding_day2 = 入会2日後の朝の「はじめの案内」）。
--                 scheduled_at = 仕組みを有効にした時刻。これより後に入会した人だけが対象（過去の入会者にさかのぼらない）。
--                 scheduled_at が NULL なら何もしない。enqueued_at は使わない（毎日、その日の対象だけを足す）。
--        1つの standing_key に文面は1行だけ（一意インデックス）。文面を直すときは同じ行を書き換える
--        （書き換えると版が上がって承認が外れる。既存のトリガーのまま）。
--        1人に1回だけは、既存の一意インデックス uq_member_mail_deliveries_all（campaign_id, user_id）で守る。
--   2. member_mail_settings.test_email_prefixes
--        常設の文面で外すテスト用アカウントのメールアドレスの頭（例: '{abc,def}'）。既定は空。
--        値はリポジトリに書かない（公開リポジトリのため）。本番では SQL で入れる。
--        空のままだと、常設の文面は「全員に送る」で書き出しを始めない（アプリ側で止める）。
--   14日で最大3通の上限は、既存のインデックス idx_member_mail_deliveries_user_sending（user_id, sending_at）で数える（足さない）。
--
-- 権限・RLS: 既存の表に列を足すだけなので変わらない（service_role だけが読み書き）。
-- =============================================================================

-- 1. 常設の文面の種類
ALTER TABLE public.member_mail_campaigns
  ADD COLUMN IF NOT EXISTS standing_key text
    CHECK (standing_key IS NULL OR standing_key ~ '^[a-z][a-z0-9_]{0,39}$');

COMMENT ON COLUMN public.member_mail_campaigns.standing_key IS
  '常設の文面の種類（例: onboarding_day2）。NULL は1回分の文面。値ありのとき scheduled_at は「仕組みを有効にした時刻」で、それより後に入会した人だけが対象';

CREATE UNIQUE INDEX IF NOT EXISTS uq_member_mail_campaigns_standing_key
  ON public.member_mail_campaigns (standing_key)
  WHERE standing_key IS NOT NULL;

-- 2. テスト用アカウントの除外
ALTER TABLE public.member_mail_settings
  ADD COLUMN IF NOT EXISTS test_email_prefixes text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.member_mail_settings.test_email_prefixes IS
  '常設の文面で送らないテスト用アカウントのメールアドレスの頭（大文字・小文字を区別しない前方一致）。空のままだと常設の文面は全員に送らない';

