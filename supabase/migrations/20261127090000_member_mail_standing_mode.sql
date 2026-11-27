-- =============================================================================
-- 会員メール: 常設の文面ごとのスイッチ（standing_mode）を足す（#327-E/F）
-- 作成日: 2026-11-27
-- 関連: rebono/issues/327-E_リマインダー_入会5〜6日目.md / 327-F_30分相談の案内_入会7〜11日目.md
--       土台: 20261123000000_create_member_mail.sql / 20261125090715_member_mail_standing_campaigns.sql
--
-- なぜ: 327-D・E・F は同じ種類（signup）なので、種類のスイッチだけだと
--       327-D を全員に送っているあいだに 327-E・F だけを「人数だけ → オーナーだけ → 全員」と上げられない。
--
-- 変えること（足すだけ）:
--   member_mail_campaigns.standing_mode（off / count / owner / all）
--     常設の文面（standing_key あり）だけが見る。1回分の文面（weekly など）では見ない。
--     効くのは「全体（member_mail_settings.mode）・種類（member_mail_kind_settings）・この列」のいちばん弱いもの。
--     対象を選ぶときと、送る直前の両方で見る。種類のスイッチは、まとめて止める非常停止としてそのまま使える。
--   既定値:
--     - このマイグレーションを当てた時点でもうある行は 'all'
--       （今の動きを変えない。327-D がすでに種類のスイッチで動いていても止めない）
--     - そのあとに入れる行（327-E・F の登録 SQL など）は 'count'（人数だけから始める）
--   列を変えても content_version は上がらない（版を上げるトリガーは件名・プレヘッダー・本文・種類だけを見る）。
--
-- 権限・RLS: 既存の表に列を足すだけなので変わらない（service_role だけが読み書き）。
-- アプリ側は列が無い（このマイグレーションの前）とき、文面では絞らない（今までどおり）。
-- =============================================================================

ALTER TABLE public.member_mail_campaigns
  ADD COLUMN IF NOT EXISTS standing_mode text NOT NULL DEFAULT 'all'
    CHECK (standing_mode IN ('off', 'count', 'owner', 'all'));

-- 既存の行は 'all' のまま、これから入れる行は 'count' から始める
ALTER TABLE public.member_mail_campaigns
  ALTER COLUMN standing_mode SET DEFAULT 'count';

COMMENT ON COLUMN public.member_mail_campaigns.standing_mode IS
  '常設の文面ごとのスイッチ（off/count/owner/all）。効くのは全体・種類・この列のいちばん弱いもの。1回分の文面では見ない。新しい行は count から';
