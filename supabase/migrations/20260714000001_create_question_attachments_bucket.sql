-- =============================================================================
-- 投稿添付画像用ストレージバケット（画像基盤 Phase 2）
-- 作成日: 2026-07-14
-- 関連: rebono/issues/画像基盤：アバターと投稿添付.md (#145) Phase 2
-- 仕様:
--   - パス構造: {user_id}/{uuid}.webp（1投稿1枚。upsert はせず毎回ユニークな名前）
--   - Supabase Free プラン（storage 1GB）前提。アップロードはクライアントで
--     長辺 1200px WebP / quality 0.75 に縮小してから行う（実質 100〜200KB）
--   - file_size_limit=5MB / allowed_mime_types でバケット側にも二重防御を設定
-- RLS 方針（Phase 1 の avatars バケットと同型）:
--   - 公開 SELECT（誰でも閲覧可。掲示板の詳細ページで素の <img> で表示）
--   - INSERT/DELETE は authenticated かつ「本人フォルダ」のみ
--     （(storage.foldername(name))[1] = auth.uid()::text）
--   - UPDATE は不要（毎回ユニークな名前で新規作成のため upsert しない）
-- =============================================================================

-- バケット作成（既存なら何もしない）
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'question-attachments',
  'question-attachments',
  true,
  5242880, -- 5MB。クライアント縮小後は数百KBだが、バケット側の上限ガードとして設定
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

-- 公開読み取り（バケットが public なので実質誰でも読めるが、RLS でも明示）
create policy "question_attachments_public_read"
  on storage.objects for select
  using (bucket_id = 'question-attachments');

-- 本人フォルダへの新規アップロード
create policy "question_attachments_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'question-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 本人フォルダの削除
create policy "question_attachments_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'question-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
