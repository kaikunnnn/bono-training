-- 旧テスト用テーブルの掃除（本番リリース時のセキュリティ指摘対応）
--
-- public.task / public.training は初期の実験で作られた遺物:
-- - 本番・ローカルとも 0 行
-- - Next.js / main(Vite) / Edge Functions のどこからも参照なし
--   （get-training-* Edge Functions が使うのは storage の 'training-content' バケットで別物）
-- - RLS 無効のまま放置され Supabase の critical advisory が出ていた
--
-- user_progress は稼働中のためテーブルは残す。ただし task_id の FK は
-- 空の task テーブルを参照しており、updateTaskProgress の upsert が
-- FK 違反で常に失敗する構造だったため、FK 制約のみ外す（潜在バグ修正）。

alter table if exists public.user_progress
  drop constraint if exists user_progress_task_id_fkey;

drop table if exists public.task;
drop table if exists public.training;
