-- =============================================================================
-- コメント論理削除が RLS で失敗するバグの修正（#140 レビューで発見）
--
-- 原因: deleteComment は UPDATE で deleted_at をセットする（論理削除）が、
--       PostgREST は UPDATE 時に内部的に RETURNING を使うため、更新後の行に
--       SELECT ポリシーが適用される。既存の SELECT ポリシーは
--       「deleted_at IS NULL」の行しか許可しないため、削除した瞬間に行が
--       不可視になり 42501 (new row violates row-level security policy) となる。
--
-- 修正: 本人（user_id = auth.uid()）は自分のコメントを削除済み含めて SELECT
--       可能にする。一覧表示はアプリ側の .is("deleted_at", null) フィルタと
--       question_comment_counts ビューの WHERE deleted_at IS NULL で除外済みの
--       ため、表示・集計への影響はない。
-- =============================================================================

DROP POLICY IF EXISTS "members can read comments" ON public.question_comments;

CREATE POLICY "members can read comments"
  ON public.question_comments
  FOR SELECT
  TO authenticated
  USING (
    (deleted_at IS NULL AND public.is_active_member(auth.uid()))
    OR user_id = auth.uid()
  );
