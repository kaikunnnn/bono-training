-- =============================================================================
-- アバター画像用ストレージバケット（画像基盤 Phase 1）
-- 作成日: 2026-07-14
-- 関連: rebono/issues/画像基盤：アバターと投稿添付.md (#145) Phase 1
-- 仕様:
--   - パス構造: {user_id}/avatar.webp（upsert で常に1枚。URL末尾に ?v={timestamp}
--     を付けてキャッシュバスト）
--   - Supabase Free プラン（storage 1GB）前提。アップロードはクライアントで
--     512px WebP に縮小してから行う（実質 30〜50KB）
--   - file_size_limit=2MB / allowed_mime_types でバケット側にも二重防御を設定
-- RLS 方針:
--   - 公開 SELECT（誰でも閲覧可。掲示板・ヘッダー等で avatar_url を素の <img> で表示）
--   - INSERT/UPDATE/DELETE は authenticated かつ「本人フォルダ」のみ
--     （(storage.foldername(name))[1] = auth.uid()::text）
-- =============================================================================

-- バケット作成（既存なら何もしない）
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB。クライアント縮小後は数十KBだが、バケット側の上限ガードとして設定
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

-- 公開読み取り（バケットが public なので実質誰でも読めるが、RLS でも明示）
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- 本人フォルダへの新規アップロード
create policy "avatars_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 本人フォルダの上書き（upsert 時に発火）
create policy "avatars_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 本人フォルダの削除
create policy "avatars_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
