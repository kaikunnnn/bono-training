-- =============================================================================
-- イベント参加者の表示用関数（event_registrations の読み出し）
-- 作成日: 2026-10-06
-- 関連: rebono/issues/218_イベントのサイト上参加申込.md（作るもの D）
--
-- なぜ関数にするか:
--   表示するのは「いま有料会員の参加者」だけ（解約した人は自動で表示から外れ、再課金で戻る）。
--   会員判定は public.is_active_member と同じ定義（user_subscriptions.is_active かつ
--   app_config の environment 一致）を使いたいが、event_registrations と user_subscriptions には
--   FK が無く PostgREST では JOIN できない。RLS も「他人が会員かどうか」で行を絞れない。
--   SQL 関数なら WHERE public.is_active_member(user_id) で同じ定義をそのまま使える。
--
-- 権限:
--   どちらも SECURITY DEFINER（RLS を通らずに全員分を読む）なので、EXECUTE は service_role だけ。
--   関数は既定で PUBLIC が実行できるため、REVOKE しないと非会員が PostgREST から直接
--   名前・コメントを取れてしまう。呼び出しはサーバー側（src/lib/events/registration.ts）のみ。
--   - get_event_participant_summary: 誰にでも見せるアイコン（最大4件）と人数だけを返す。
--     名前・コメントは返さない
--   - get_event_participants: 名前・アイコン・コメントを返す。サーバーが閲覧者の
--     hasMemberAccess を確かめたあとにだけ呼ぶ
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. 誰にでも見せる要約（アイコンURL 最大4件＋人数）
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_event_participant_summary(p_event_id text)
RETURNS TABLE (total_count integer, avatar_urls text[])
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH active AS (
    SELECT r.author_avatar_url, r.created_at
    FROM public.event_registrations r
    WHERE r.event_id = p_event_id
      AND r.deleted_at IS NULL
      AND public.is_active_member(r.user_id)
  )
  SELECT
    (SELECT count(*)::integer FROM active),
    -- アイコン未設定（NULL）も1人として並べる（表示側で共通の代替アイコンを出す）
    ARRAY(
      SELECT a.author_avatar_url
      FROM active a
      ORDER BY a.created_at DESC
      LIMIT 4
    );
$$;

COMMENT ON FUNCTION public.get_event_participant_summary(text) IS
  'イベント参加者（いま有料会員の人だけ）の人数と、新しい順のアイコンURL最大4件。名前・コメントは返さない。service_role 専用';

-- -----------------------------------------------------------------------------
-- 2. 会員向けの一覧（名前・アイコン・コメント）
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_event_participants(p_event_id text)
RETURNS TABLE (
  id uuid,
  author_name text,
  author_avatar_url text,
  comment text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT r.id, r.author_name, r.author_avatar_url, r.comment, r.created_at
  FROM public.event_registrations r
  WHERE r.event_id = p_event_id
    AND r.deleted_at IS NULL
    AND public.is_active_member(r.user_id)
  ORDER BY r.created_at DESC;
$$;

COMMENT ON FUNCTION public.get_event_participants(text) IS
  'イベント参加者（いま有料会員の人だけ）の名前・アイコン・コメント（新しい順）。閲覧者が会員かはサーバー側で確認してから呼ぶ。service_role 専用';

-- -----------------------------------------------------------------------------
-- 3. 実行権限（service_role のみ）
-- -----------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.get_event_participant_summary(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_event_participants(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_event_participant_summary(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_event_participants(text) TO service_role;
