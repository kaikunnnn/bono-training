-- =============================================================================
-- みんなの掲示板：コメントへの画像添付（1コメント1枚）
-- 作成日: 2026-07-16
-- 関連: rebono/issues/掲示板：コメントへの画像添付.md (#150)
-- 設計: 画像は question-attachments バケットにアップロード済みの公開URLを保持する。
--       真実はこのカラムのみ（Sanity 等には複製しない）。
--       - 画像のみのコメントは不可（content の NOT NULL / CHECK は変更しない）。
--       - 編集時の画像変更は今回スコープ外（テキストのみ編集）。
--       - RLS / View（question_comment_counts）/ レート制限トリガーは変更不要。
-- NOTE: サーバー側（src/lib/services/questions.ts addComment）でも URL の
--       ホスト・バケット・所有者プレフィックスを検証する（外部URL注入の防止）。
-- =============================================================================

ALTER TABLE public.question_comments
  ADD COLUMN IF NOT EXISTS image_url text;

-- 公開URL長のガード（既存の content CHECK と同じスタイル）
ALTER TABLE public.question_comments
  DROP CONSTRAINT IF EXISTS question_comments_image_url_length;

ALTER TABLE public.question_comments
  ADD CONSTRAINT question_comments_image_url_length
  CHECK (image_url IS NULL OR char_length(image_url) <= 2048);

COMMENT ON COLUMN public.question_comments.image_url IS
  '添付画像の公開URL（question-attachments バケット、1コメント1枚、NULL可）。真実はこのカラムのみ';
