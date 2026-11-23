-- =============================================================================
-- public.app_config に RLS を有効化する
-- 作成日: 2026-11-06
-- 関連: rebono/issues/291_app_configのRLSを有効にする.md
-- 背景: 20260703 で anon/authenticated の権限は REVOKE 済みで、API からは読み書き
--       できない状態だった。ただし RLS は無効のままで、権限の1枚だけで守っていた。
--       権限を誤って戻しても開かないように、RLS を2枚目として重ねる。
--
-- 判定関数への影響: なし
--   is_active_member は SECURITY DEFINER で所有者は postgres（BYPASSRLS 持ち）なので、
--   RLS を有効にしてもこの表を読める。未設定=live の挙動も変わらない。
--   FORCE ROW LEVEL SECURITY は付けない（付ける理由がなく、所有者の読み取りに影響しうる）。
--
-- ポリシーを「拒否のみ」にする理由:
--   anon/authenticated がこの表を読む必要はない。Supabase の linter 0008 の案内に沿い、
--   閉じていることが意図だと分かるように拒否ポリシーを明示する。
--   https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
--
-- health_check_readonly（本番のみ）: SELECT 権限は残るがポリシーを足さないので 0 行に見える。
--   この表を読む処理はなく、本番は行なしなので結果は今と同じ。
-- =============================================================================

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- public スキーマの既定権限では新規テーブルに anon/authenticated の全権限が付くため、
-- 表を作り直した場合にも閉じた状態を保てるよう改めて取り消す。
REVOKE ALL ON public.app_config FROM anon, authenticated;

DROP POLICY IF EXISTS "app_config_deny_api_roles" ON public.app_config;
CREATE POLICY "app_config_deny_api_roles"
  ON public.app_config
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
