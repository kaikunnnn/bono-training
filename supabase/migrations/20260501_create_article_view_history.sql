-- =============================================================================
-- 閲覧履歴テーブル作成
-- 作成日: 2026-05-01
-- 目的: ユーザーの記事閲覧履歴を管理（マイページの閲覧履歴タブ用）
-- =============================================================================

-- テーブル作成
CREATE TABLE IF NOT EXISTS "public"."article_view_history" (
    "user_id" "uuid" NOT NULL,
    "article_id" "text" NOT NULL,
    "viewed_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."article_view_history" OWNER TO "postgres";

COMMENT ON TABLE "public"."article_view_history" IS 'ユーザーの記事閲覧履歴を管理';
COMMENT ON COLUMN "public"."article_view_history"."article_id" IS 'Sanity CMSのarticle._id';

-- 主キー（ユーザー×記事で一意）
ALTER TABLE ONLY "public"."article_view_history"
    ADD CONSTRAINT "article_view_history_pkey" PRIMARY KEY ("user_id", "article_id");

-- インデックス（閲覧日時降順で取得用）
CREATE INDEX "idx_article_view_history_user_viewed"
    ON "public"."article_view_history" USING "btree" ("user_id", "viewed_at" DESC);

-- 外部キー
ALTER TABLE ONLY "public"."article_view_history"
    ADD CONSTRAINT "article_view_history_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

-- 権限付与
GRANT ALL ON TABLE "public"."article_view_history" TO "anon";
GRANT ALL ON TABLE "public"."article_view_history" TO "authenticated";
GRANT ALL ON TABLE "public"."article_view_history" TO "service_role";

-- RLS有効化
ALTER TABLE "public"."article_view_history" ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "Users can view own view history"
    ON "public"."article_view_history"
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own view history"
    ON "public"."article_view_history"
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own view history"
    ON "public"."article_view_history"
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own view history"
    ON "public"."article_view_history"
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
