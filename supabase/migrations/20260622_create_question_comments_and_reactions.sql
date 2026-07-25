-- =============================================================================
-- みんなの掲示板：コメント & スタンプ
-- 作成日: 2026-06-22
-- 関連: rebono/issues/みんなの掲示板の実装.md (#125)
-- 設計: 質問本体は Sanity、コメント/スタンプは Supabase。
--       メンバー限定閲覧（user_subscriptions.is_active）+ 本人のみ書き込み。
-- =============================================================================

-- -----------------------------------------------------------------------------
-- メンバー判定ヘルパー（user_subscriptions.is_active）
-- SECURITY DEFINER で RLS チェック内のJOIN負荷を最小化
-- NOTE: environment (test/live) フィルタは RLS では未実施。アプリケーション層で
--       NODE_ENV に応じて適切な Supabase プロジェクトに接続することで分離する
--       （既存パターン src/lib/subscription.ts に倣う）。本DBに混在を許容しない前提。
-- -----------------------------------------------------------------------------
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
  );
$$;

-- -----------------------------------------------------------------------------
-- 1. question_comments：コメント本体
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.question_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id text NOT NULL,                          -- Sanity 質問 _id（弱結合・JOINしない）
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- 投稿者プロフィールを denormalize（auth.users への JOIN を回避、表示速度安定）
  -- ユーザーが後で名前変更しても既存コメントは投稿時点の表示が残る
  author_name text NOT NULL,
  author_avatar_url text,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 5000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz                              -- 論理削除（モデレーション復旧用）
);

CREATE INDEX IF NOT EXISTS idx_question_comments_question_created
  ON public.question_comments (question_id, created_at)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_question_comments_user
  ON public.question_comments (user_id);

COMMENT ON TABLE public.question_comments IS 'みんなの掲示板：質問へのコメント。Sanity質問とは弱結合（question_id は Sanity _id）';

-- -----------------------------------------------------------------------------
-- 2. question_reactions：スタンプ（投稿本体 / コメント どちらにも付く）
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.question_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL CHECK (target_type IN ('question', 'comment')),
  target_id text NOT NULL,                            -- question_id (Sanity) or comment.id (uuid::text)
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction text NOT NULL CHECK (reaction IN ('cheer', 'thanks', 'insight')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (target_type, target_id, user_id, reaction)  -- 同ユーザー同種類はトグル
);

CREATE INDEX IF NOT EXISTS idx_question_reactions_target
  ON public.question_reactions (target_type, target_id);

-- 自分のリアクション一覧クエリ用（getMyReactions）
CREATE INDEX IF NOT EXISTS idx_question_reactions_user_target
  ON public.question_reactions (user_id, target_type);

COMMENT ON TABLE public.question_reactions IS 'みんなの掲示板：スタンプ（cheer/thanks/insight）。投稿本体とコメント両方に付く';

-- -----------------------------------------------------------------------------
-- 3. 集計View（一覧の表示を1クエリで済ませる）
-- 重要: WITH (security_invoker = true) を必ず付ける。これが無いと View 定義者の
--       権限で実行されベーステーブルの RLS がバイパスされる（PostgreSQL 15+）
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.question_comment_counts
WITH (security_invoker = true) AS
SELECT question_id, count(*)::int AS count
FROM public.question_comments
WHERE deleted_at IS NULL
GROUP BY question_id;

CREATE OR REPLACE VIEW public.question_reaction_counts
WITH (security_invoker = true) AS
SELECT target_type, target_id, reaction, count(*)::int AS count
FROM public.question_reactions
GROUP BY target_type, target_id, reaction;

COMMENT ON VIEW public.question_comment_counts IS '質問ごとのコメント数（論理削除を除外）';
COMMENT ON VIEW public.question_reaction_counts IS 'ターゲット×種類のスタンプ集計';

-- -----------------------------------------------------------------------------
-- 4. updated_at の自動更新
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_question_comment_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_question_comments_updated_at ON public.question_comments;
CREATE TRIGGER trg_question_comments_updated_at
  BEFORE UPDATE ON public.question_comments
  FOR EACH ROW EXECUTE FUNCTION public.touch_question_comment_updated_at();

-- -----------------------------------------------------------------------------
-- 5. RLS: question_comments
--    SELECT: アクティブなメンバーのみ
--    INSERT: 本人のみ（メンバー判定はサーバー側で別途）
--    UPDATE/DELETE: 本人のみ（管理者操作は service_role で実施）
-- -----------------------------------------------------------------------------
ALTER TABLE public.question_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members can read comments"
  ON public.question_comments
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND public.is_active_member(auth.uid())
  );

CREATE POLICY "owner can insert comment"
  ON public.question_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_active_member(auth.uid())
  );

CREATE POLICY "owner can update own comment"
  ON public.question_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "owner can delete own comment"
  ON public.question_comments
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 6. RLS: question_reactions
-- -----------------------------------------------------------------------------
ALTER TABLE public.question_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members can read reactions"
  ON public.question_reactions
  FOR SELECT
  TO authenticated
  USING (public.is_active_member(auth.uid()));

CREATE POLICY "owner can insert reaction"
  ON public.question_reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_active_member(auth.uid())
  );

CREATE POLICY "owner can delete own reaction"
  ON public.question_reactions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 7. View への権限（View自体はRLSが伝播するため authenticated に grant）
-- -----------------------------------------------------------------------------
GRANT SELECT ON public.question_comment_counts TO authenticated;
GRANT SELECT ON public.question_reaction_counts TO authenticated;
