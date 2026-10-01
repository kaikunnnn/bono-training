-- =============================================================================
-- 会員の活動ログ（member_activity_events）
-- 作成日: 2026-10-01
-- 関連: rebono/issues #213（数字ページ）スライス A1 / 213-B_出す数字の定義
-- 目的:
--   ダッシュボードで「会員がどれだけ使っているか」（来訪・記事閲覧/完了・レッスン閲覧・
--   掲示板閲覧・コミュニティ参加ボタン・完了画面の次アクション・料金ページへのCTA）を
--   集計するための1行1イベントのログ。event_type は下の8種のみ（CHECK制約）。
-- 書き込み:
--   Client Component → Server Action（src/lib/services/activity.ts）→ 本人として insert。
--   サーバー描画や Link の先読みでは記録しない。
-- 重複防止:
--   site_visit は 1人1日（日本時間）1回。(user_id, jst_date) の部分一意インデックスで担保し、
--   アプリ側は一意制約違反（23505）を成功扱いにする（insert-ignore）。
-- RLS:
--   authenticated は「自分の user_id の行の insert」だけ許可。select/update/delete の
--   ポリシーは作らない（利用者は自分の行も読めない）。ダッシュボードは既存の読み取り専用
--   DBロールで直接読む（API経由では読まない）。
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.member_activity_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'site_visit',
    'article_view',
    'article_complete',
    'lesson_view',
    'questions_view',
    'community_join_click',
    'success_next_click',
    'pricing_cta_click'
  )),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  jst_date date NOT NULL DEFAULT ((now() AT TIME ZONE 'Asia/Tokyo')::date),
  article_id text NULL,
  lesson_id text NULL,
  path text NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- site_visit は 1人1日（JST）1回
CREATE UNIQUE INDEX IF NOT EXISTS uq_member_activity_events_site_visit_daily
  ON public.member_activity_events (user_id, jst_date)
  WHERE event_type = 'site_visit';

-- 集計用（種類×期間 / 人×期間）
CREATE INDEX IF NOT EXISTS idx_member_activity_events_type_occurred
  ON public.member_activity_events (event_type, occurred_at);

CREATE INDEX IF NOT EXISTS idx_member_activity_events_user_occurred
  ON public.member_activity_events (user_id, occurred_at);

-- RLS: 本人の行の insert のみ
ALTER TABLE public.member_activity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "member_activity_events_insert_own" ON public.member_activity_events;
CREATE POLICY "member_activity_events_insert_own"
  ON public.member_activity_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 最小権限: Supabase は public の新規表に anon/authenticated へ全権限を付けるため、
-- RLS に頼るだけでなく権限自体を絞る（TRUNCATE は RLS の対象外のため特に外す）。
-- 未ログイン(anon)は一切触れない。ログイン会員は INSERT のみ（本人行は RLS で強制）。
REVOKE ALL ON public.member_activity_events FROM anon;
REVOKE ALL ON public.member_activity_events FROM authenticated;
GRANT INSERT ON public.member_activity_events TO authenticated;

COMMENT ON TABLE public.member_activity_events IS
  '会員の活動ログ（#213 A1）: 1イベント1行。本人insertのみ・利用者selectなし。ダッシュボードは読み取り専用ロールで集計';

-- 数字ページ（health_check）の読み取り専用ロールに集計用の SELECT を許可する。
-- 既存の article_progress 等と同じ hc_readonly_select パターン。ロールが無い環境（ローカル）では何もしない。
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'health_check_readonly') THEN
    GRANT SELECT ON public.member_activity_events TO health_check_readonly;
    DROP POLICY IF EXISTS "hc_readonly_select" ON public.member_activity_events;
    CREATE POLICY "hc_readonly_select"
      ON public.member_activity_events FOR SELECT TO health_check_readonly
      USING (true);
  END IF;
END $$;
