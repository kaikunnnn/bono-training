-- =============================================================================
-- イベント参加申込（event_registrations）
-- 作成日: 2026-10-06
-- 関連: rebono/issues/218_イベントのサイト上参加申込.md（作るもの A）
-- 設計: イベント本体は Sanity、申込は Supabase。question_comments と同じ形
--       （Sanity _id で弱結合・名前/アイコンを書き込み時に denormalize・論理削除）。
--       1人1イベント1行（UNIQUE (event_id, user_id)）。取り消しは deleted_at をセット、
--       再申込は同じ行の deleted_at を NULL に戻す（新しい行は作らない）。
-- RLS（Supabase Docs の定石: 操作ごとに分割 / TO authenticated / (select auth.uid())）:
--   SELECT: 有料会員は取り消し済みを除く全員分を読める。本人は自分の行を取り消し済みも
--           含めて読める（PostgREST の UPDATE+RETURNING で論理削除時に 42501 になるのを
--           防ぐ。20260713000000_fix_comment_soft_delete_rls.sql と同じ理由）。
--   INSERT: 本人の行だけ、かつ有料会員。
--   UPDATE: 本人の行だけ、かつ更新後も有料会員（非会員が取り消し済みの行を復活させたり
--           コメントを書き換えたりできないようにする）。
--   DELETE: ポリシーなし（取り消しは UPDATE による論理削除。管理操作は service_role）。
--   anon: ポリシーなし＋権限も剥奪。非会員向けのアイコン・人数はサーバー側で
--         service_role を使って必要な列だけ取り出す。
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. event_registrations：申込本体
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,                             -- Sanity イベント _id（弱結合・JOINしない）
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- 申込者プロフィールを denormalize（プロフィール変更時はアプリ側で更新する）
  author_name text NOT NULL,
  author_avatar_url text,
  comment text NOT NULL DEFAULT '参加します！' CHECK (char_length(comment) BETWEEN 1 AND 300),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,                             -- 取り消し＝論理削除
  UNIQUE (event_id, user_id)
);

-- イベントごとの参加者一覧（申込順）
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_created
  ON public.event_registrations (event_id, created_at)
  WHERE deleted_at IS NULL;

-- RLS の user_id 判定・自分の申込一覧用
CREATE INDEX IF NOT EXISTS idx_event_registrations_user
  ON public.event_registrations (user_id);

COMMENT ON TABLE public.event_registrations IS 'イベント参加申込。Sanityイベントとは弱結合（event_id は Sanity _id）。1人1イベント1行、取り消しは deleted_at による論理削除';

-- -----------------------------------------------------------------------------
-- 2. 書き込み時の列ガード（created_at/updated_at の強制・不変列の保護）
-- -----------------------------------------------------------------------------
-- 有料会員は自分のセッションで Supabase REST API を直接呼べるため、アプリの upsert を
-- 通らない書き込みもありうる。RLS は「どの行を触れるか」しか見ないので、列の値は
-- トリガーで守る:
--   INSERT: created_at / updated_at はクライアントの値を捨てて now() にする
--           （申込順＝表示順を過去日付で先頭に割り込ませない）。
--   UPDATE: id / event_id / user_id / created_at の変更はエラーにする
--           （申込を別イベントへ付け替える・申込順をずらすのを防ぐ）。updated_at は now()。
-- アプリの upsert（ON CONFLICT (event_id, user_id) DO UPDATE）は created_at を送らず、
-- event_id / user_id は同じ値で上書きするだけなので、このガードに引っかからない。
CREATE OR REPLACE FUNCTION public.guard_event_registration_write()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_at = pg_catalog.now();
    NEW.updated_at = pg_catalog.now();
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.event_id IS DISTINCT FROM OLD.event_id
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'event_registrations: id, event_id, user_id, created_at cannot be changed'
      USING ERRCODE = 'P0001';
  END IF;

  NEW.updated_at = pg_catalog.now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_event_registrations_guard_write ON public.event_registrations;
CREATE TRIGGER trg_event_registrations_guard_write
  BEFORE INSERT OR UPDATE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.guard_event_registration_write();

-- -----------------------------------------------------------------------------
-- 3. RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- 未ログインには一切公開しない（ポリシーが無いので元々読めないが、権限からも外す）
REVOKE ALL ON public.event_registrations FROM anon;

DROP POLICY IF EXISTS "members can read registrations" ON public.event_registrations;
CREATE POLICY "members can read registrations"
  ON public.event_registrations
  FOR SELECT
  TO authenticated
  USING (
    (deleted_at IS NULL AND public.is_active_member((select auth.uid())))
    OR user_id = (select auth.uid())
  );

DROP POLICY IF EXISTS "member can register self" ON public.event_registrations;
CREATE POLICY "member can register self"
  ON public.event_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (select auth.uid())
    AND public.is_active_member((select auth.uid()))
  );

DROP POLICY IF EXISTS "member can update own registration" ON public.event_registrations;
CREATE POLICY "member can update own registration"
  ON public.event_registrations
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (
    user_id = (select auth.uid())
    AND public.is_active_member((select auth.uid()))
  );
