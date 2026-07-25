-- ローカル開発環境専用の初期データ（supabase db reset / start 時のみ実行される）
-- 本番には適用されない。

-- RLS の is_active_member が参照する環境フラグ。
-- 本番は行なし（デフォルト 'live'）、ローカルは 'test' のサブスクを有効とみなす。
INSERT INTO public.app_config (key, value)
VALUES ('environment', 'test')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
