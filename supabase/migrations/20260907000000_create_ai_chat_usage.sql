-- =============================================================================
-- AIチャット（/api/ai-chat）のレート制限用 使用量ログ
-- 作成日: 2026-09-07
-- 関連: セキュリティ監査 Critical C-1（ai-chat に認証+レート制限を追加）
-- 目的:
--   /api/ai-chat は Groq(LLM) と Sanity を叩くため、無制限呼び出しは金銭的DoSになる。
--   questions/submit は Sanity の実データ（question 数）をcountしてレート制限するが、
--   ai-chat は何も永続化しないためcount対象が無い。そこで1リクエスト=1行を記録する
--   軽量ログテーブルを設け、直近1時間の行数で「ユーザーごと 30回/時」を判定する。
-- 書き込み/読み取り:
--   route.ts が SERVICE_ROLE で insert/count する（RLSを跨ぐ）。
--   RLSはポリシー無しで有効化 → 認証クライアントからの直接 insert（カウント詐称）や
--   他ユーザーの使用量read を遮断する（20260317_enable_rls_security と同じ方針）。
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.ai_chat_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 直近1時間の「user_id ごとの件数」countを高速化する複合インデックス
CREATE INDEX IF NOT EXISTS idx_ai_chat_usage_user_created
  ON public.ai_chat_usage (user_id, created_at);

-- ポリシーを付けずにRLSを有効化（service_roleのみ通す）
ALTER TABLE public.ai_chat_usage ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.ai_chat_usage IS
  'ai-chat のレート制限用 使用量ログ: 1リクエスト1行。直近1時間の行数でユーザーごと30回/時を判定（C-1）';
