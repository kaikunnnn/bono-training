-- =============================================================================
-- is_active_member に environment フィルタを追加
-- 作成日: 2026-07-03（2026-07-09 改訂: GUC 方式 → 設定テーブル方式）
-- 関連: rebono/issues/掲示板_リリース前ハードニング.md (#131) E.
-- 背景: アプリ層（src/lib/subscription.ts / /api/questions/submit）は
--       user_subscriptions.environment ('test'/'live') でフィルタしているが、
--       RLS の is_active_member は is_active のみを見ていた。
--       test 環境のサブスク行しか持たないユーザーが本番のコメント/スタンプを
--       読み書きできてしまうため、RLS 側でも environment を判定する。
-- 仕組み: public.app_config テーブルの 'environment' 行で環境を判定。
--       - 本番: 行なし → デフォルト 'live'（追加作業不要）
--       - ローカル: supabase/seed.sql が 'test' を INSERT（seed はローカルのみ実行）
--       ※ GUC（ALTER DATABASE ... SET app.environment）方式はローカルの postgres
--         ロールに権限がなく db reset で消えるため採用しない。
-- =============================================================================

-- アプリ全体の環境設定（現状 'environment' のみ）。
-- anon/authenticated には公開しない（SECURITY DEFINER 関数からのみ参照）
CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value text NOT NULL
);

REVOKE ALL ON public.app_config FROM anon, authenticated;

COMMENT ON TABLE public.app_config IS
  'アプリ全体の環境設定。environment: RLS が参照する Stripe 環境（未設定=live）。ローカルは seed.sql が test を投入';

CREATE OR REPLACE FUNCTION public.is_active_member(target_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_subscriptions
    WHERE user_id = target_user
      AND is_active = true
      AND environment = COALESCE(
        (SELECT value FROM public.app_config WHERE key = 'environment'),
        'live'
      )
  );
$$;
