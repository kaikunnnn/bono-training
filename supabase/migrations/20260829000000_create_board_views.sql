-- =============================================================================
-- 掲示板の既読管理テーブル：board_views（掲示板の新着ドット）
-- 作成日: 2026-08-29
-- 関連: rebono/issues/掲示板の新着ドット.md
-- 目的:
--   ログイン済みユーザーが「みんなの掲示板」一覧（/questions）を最後に開いた時刻を記録し、
--   最新質問の publishedAt と比較して未読（新着）ドットの表示可否を判定する。
--   article_view_history と同じ「本人のみ SELECT/INSERT/UPDATE」パターン。
--   1ユーザー1行（PK = user_id）。行が無ければ「未読扱い」とアプリ側で解釈する。
-- =============================================================================

-- テーブル作成（1ユーザー1行）
CREATE TABLE IF NOT EXISTS "public"."board_views" (
    "user_id" "uuid" NOT NULL,
    "last_seen_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."board_views" OWNER TO "postgres";

COMMENT ON TABLE "public"."board_views" IS '掲示板一覧を最後に開いた時刻（新着ドット判定用）。1ユーザー1行。';
COMMENT ON COLUMN "public"."board_views"."last_seen_at" IS '/questions 一覧を最後に開いた時刻。最新質問 publishedAt より古ければ新着ありと判定。';

-- 主キー（ユーザーごとに一意）
ALTER TABLE ONLY "public"."board_views"
    ADD CONSTRAINT "board_views_pkey" PRIMARY KEY ("user_id");

-- 外部キー（退会で既読情報も消す）
ALTER TABLE ONLY "public"."board_views"
    ADD CONSTRAINT "board_views_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

-- 権限付与（article_view_history と同じ）
GRANT ALL ON TABLE "public"."board_views" TO "anon";
GRANT ALL ON TABLE "public"."board_views" TO "authenticated";
GRANT ALL ON TABLE "public"."board_views" TO "service_role";

-- RLS有効化
ALTER TABLE "public"."board_views" ENABLE ROW LEVEL SECURITY;

-- RLSポリシー（本人のみ SELECT / INSERT / UPDATE。DELETE は不要のため作らない）
CREATE POLICY "Users can view own board view"
    ON "public"."board_views"
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own board view"
    ON "public"."board_views"
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own board view"
    ON "public"."board_views"
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
