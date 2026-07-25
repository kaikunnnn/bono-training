-- =============================================================================
-- コメントのレート制限（スパム対策）
-- 作成日: 2026-07-09
-- 関連: rebono/issues/掲示板_リリース前ハードニング.md (#131) C.
-- 仕様: 1ユーザーにつき 1分間に 10件まで INSERT 可。超過は例外で拒否。
-- 実装場所の決定: Edge Function ではなく DB トリガー。
--   理由: デプロイ物が増えず、PostgREST 直叩きでも回避できない層（RLSと同じ層）で
--   確実に効く。カウントは SECURITY DEFINER で RLS を跨ぎ、論理削除済みも含める
--   （投稿→即削除でカウンタをリセットさせない）。
-- =============================================================================

CREATE OR REPLACE FUNCTION public.enforce_question_comment_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (
    SELECT count(*)
    FROM public.question_comments
    WHERE user_id = NEW.user_id
      AND created_at > now() - interval '1 minute'
  ) >= 10 THEN
    -- アプリ側（src/lib/services/questions.ts addComment）はこの識別子で判定して
    -- 日本語メッセージに変換する。変更時はセットで直すこと
    RAISE EXCEPTION 'comment_rate_limit_exceeded'
      USING DETAIL = 'max 10 comments per user per minute';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_question_comments_rate_limit ON public.question_comments;
CREATE TRIGGER trg_question_comments_rate_limit
  BEFORE INSERT ON public.question_comments
  FOR EACH ROW EXECUTE FUNCTION public.enforce_question_comment_rate_limit();

COMMENT ON FUNCTION public.enforce_question_comment_rate_limit IS
  'question_comments のレート制限: 1ユーザー/1分/10件（#131-C）';
