

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."handle_new_user_subscription"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.user_subscriptions (
    user_id,
    is_active,
    plan_type,
    stripe_subscription_id
  ) VALUES (
    NEW.id,
    false,
    'standard',
    NULL
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user_subscription"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."article_bookmarks" (
    "user_id" "uuid" NOT NULL,
    "article_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."article_bookmarks" OWNER TO "postgres";


COMMENT ON TABLE "public"."article_bookmarks" IS 'ユーザーの記事ブックマークを管理';



COMMENT ON COLUMN "public"."article_bookmarks"."article_id" IS 'Sanity CMSのarticle._id';



CREATE TABLE IF NOT EXISTS "public"."article_progress" (
    "user_id" "uuid" NOT NULL,
    "article_id" "text" NOT NULL,
    "lesson_id" "text" NOT NULL,
    "status" "text" DEFAULT 'not_started'::"text" NOT NULL,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "article_progress_status_check" CHECK (("status" = ANY (ARRAY['not_started'::"text", 'in_progress'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."article_progress" OWNER TO "postgres";


COMMENT ON TABLE "public"."article_progress" IS 'ユーザーの記事進捗を管理';



COMMENT ON COLUMN "public"."article_progress"."article_id" IS 'Sanity CMSのarticle._id';



COMMENT ON COLUMN "public"."article_progress"."lesson_id" IS '所属するレッスンのID';



COMMENT ON COLUMN "public"."article_progress"."status" IS 'not_started: 未視聴, in_progress: 視聴中, completed: 完了';



CREATE TABLE IF NOT EXISTS "public"."lesson_progress" (
    "user_id" "uuid" NOT NULL,
    "lesson_id" "text" NOT NULL,
    "status" "text" DEFAULT 'not_started'::"text" NOT NULL,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "lesson_progress_status_check" CHECK (("status" = ANY (ARRAY['not_started'::"text", 'in_progress'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."lesson_progress" OWNER TO "postgres";


COMMENT ON TABLE "public"."lesson_progress" IS 'ユーザーのレッスン進捗を管理';



COMMENT ON COLUMN "public"."lesson_progress"."lesson_id" IS 'Sanity CMSのlesson._id';



COMMENT ON COLUMN "public"."lesson_progress"."status" IS 'not_started: 未開始, in_progress: 進行中, completed: 完了';



CREATE TABLE IF NOT EXISTS "public"."price_cache" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "price_id" "text" NOT NULL,
    "product_id" "text" NOT NULL,
    "plan_type" "text" NOT NULL,
    "duration" integer NOT NULL,
    "unit_amount" integer NOT NULL,
    "currency" "text" DEFAULT 'jpy'::"text" NOT NULL,
    "recurring_interval" "text",
    "recurring_interval_count" integer,
    "environment" "text" NOT NULL,
    "cached_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."price_cache" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stripe_customers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "stripe_customer_id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "environment" "text" DEFAULT 'live'::"text",
    CONSTRAINT "stripe_customers_environment_check" CHECK (("environment" = ANY (ARRAY['test'::"text", 'live'::"text"])))
);


ALTER TABLE "public"."stripe_customers" OWNER TO "postgres";


COMMENT ON COLUMN "public"."stripe_customers"."environment" IS 'Stripe環境: 
  test（テスト環境）またはlive（本番環境）';



CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "stripe_subscription_id" character varying(255) NOT NULL,
    "stripe_invoice_id" character varying(255),
    "start_timestamp" timestamp with time zone NOT NULL,
    "end_timestamp" timestamp with time zone NOT NULL,
    "plan_members" boolean DEFAULT false,
    "environment" "text" NOT NULL,
    CONSTRAINT "subscriptions_environment_check" CHECK (("environment" = ANY (ARRAY['test'::"text", 'live'::"text"])))
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."task" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "training_id" "uuid",
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "order_index" integer NOT NULL,
    "is_premium" boolean DEFAULT false,
    "preview_sec" integer DEFAULT 30,
    "video_full" "text",
    "video_preview" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."task" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."training" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "type" "text",
    "difficulty" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "training_difficulty_check" CHECK (("difficulty" = ANY (ARRAY['easy'::"text", 'normal'::"text", 'hard'::"text"]))),
    CONSTRAINT "training_type_check" CHECK (("type" = ANY (ARRAY['challenge'::"text", 'skill'::"text"])))
);


ALTER TABLE "public"."training" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_progress" (
    "user_id" "uuid" NOT NULL,
    "task_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'todo'::"text",
    "completed_at" timestamp with time zone,
    CONSTRAINT "user_progress_status_check" CHECK (("status" = ANY (ARRAY['done'::"text", 'todo'::"text", 'in-progress'::"text"])))
);


ALTER TABLE "public"."user_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "plan_type" "text" NOT NULL,
    "is_active" boolean DEFAULT false NOT NULL,
    "stripe_subscription_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "stripe_customer_id" "text",
    "plan_members" boolean DEFAULT false,
    "duration" integer DEFAULT 1,
    "cancel_at_period_end" boolean DEFAULT false,
    "cancel_at" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "environment" "text" DEFAULT 'live'::"text",
    CONSTRAINT "user_subscriptions_environment_check" CHECK (("environment" = ANY (ARRAY['test'::"text", 'live'::"text"])))
);


ALTER TABLE "public"."user_subscriptions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."user_subscriptions"."stripe_customer_id" IS 'StripeのカスタマーID。カスタマーポータルへのアクセスに使用。';



COMMENT ON COLUMN "public"."user_subscriptions"."plan_members" IS 'メンバーアクセス権限があるかどうか';



COMMENT ON COLUMN "public"."user_subscriptions"."duration" IS 'プランの契約期間（月単位）。1 = 1ヶ月、3 = 3ヶ月';



COMMENT ON COLUMN "public"."user_subscriptions"."current_period_end" IS 'サブスクリプションの次回更新日（Stripeのcurrent_period_endから取得）';



COMMENT ON COLUMN "public"."user_subscriptions"."environment" IS 'Stripe環境: 
  test（テスト環境）またはlive（本番環境）';



ALTER TABLE ONLY "public"."article_bookmarks"
    ADD CONSTRAINT "article_bookmarks_pkey" PRIMARY KEY ("user_id", "article_id");



ALTER TABLE ONLY "public"."article_progress"
    ADD CONSTRAINT "article_progress_pkey" PRIMARY KEY ("user_id", "article_id");



ALTER TABLE ONLY "public"."lesson_progress"
    ADD CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("user_id", "lesson_id");



ALTER TABLE ONLY "public"."price_cache"
    ADD CONSTRAINT "price_cache_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stripe_customers"
    ADD CONSTRAINT "stripe_customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stripe_customers"
    ADD CONSTRAINT "stripe_customers_user_id_environment_key" UNIQUE ("user_id", "environment");



COMMENT ON CONSTRAINT "stripe_customers_user_id_environment_key" ON "public"."stripe_customers" IS '1ユーザーは各環境（test/live）ごとに1つのStripe顧客IDを持つ';



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_stripe_invoice_id_key" UNIQUE ("stripe_invoice_id");



ALTER TABLE ONLY "public"."task"
    ADD CONSTRAINT "task_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."task"
    ADD CONSTRAINT "task_training_id_slug_key" UNIQUE ("training_id", "slug");



ALTER TABLE ONLY "public"."training"
    ADD CONSTRAINT "training_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."training"
    ADD CONSTRAINT "training_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."price_cache"
    ADD CONSTRAINT "unique_price_per_env" UNIQUE ("price_id", "environment");



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_pkey" PRIMARY KEY ("user_id", "task_id");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_stripe_subscription_id_environment_key" UNIQUE ("stripe_subscription_id", "environment");



COMMENT ON CONSTRAINT "user_subscriptions_stripe_subscription_id_environment_key" ON "public"."user_subscriptions" IS 'Stripeサブスクリプションは環境ごとに一意';



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_user_id_environment_key" UNIQUE ("user_id", "environment");



CREATE INDEX "idx_article_bookmarks_user" ON "public"."article_bookmarks" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_article_progress_lesson" ON "public"."article_progress" USING "btree" ("user_id", "lesson_id");



CREATE INDEX "idx_article_progress_status" ON "public"."article_progress" USING "btree" ("user_id", "status");



CREATE INDEX "idx_article_progress_updated" ON "public"."article_progress" USING "btree" ("user_id", "updated_at" DESC);



CREATE INDEX "idx_article_progress_user" ON "public"."article_progress" USING "btree" ("user_id");



CREATE INDEX "idx_lesson_progress_status" ON "public"."lesson_progress" USING "btree" ("user_id", "status");



CREATE INDEX "idx_lesson_progress_updated" ON "public"."lesson_progress" USING "btree" ("user_id", "updated_at" DESC);



CREATE INDEX "idx_lesson_progress_user" ON "public"."lesson_progress" USING "btree" ("user_id");



CREATE INDEX "idx_price_cache_cached_at" ON "public"."price_cache" USING "btree" ("cached_at");



CREATE INDEX "idx_price_cache_plan" ON "public"."price_cache" USING "btree" ("plan_type", "duration", "environment");



CREATE INDEX "idx_stripe_customers_environment" ON "public"."stripe_customers" USING "btree" ("environment");



CREATE INDEX "idx_user_subscriptions_environment" ON "public"."user_subscriptions" USING "btree" ("environment");



CREATE INDEX "idx_user_subscriptions_plan_duration" ON "public"."user_subscriptions" USING "btree" ("plan_type", "duration");



CREATE INDEX "idx_user_subscriptions_stripe_customer_id" ON "public"."user_subscriptions" USING "btree" ("stripe_customer_id");



CREATE OR REPLACE TRIGGER "update_article_progress_updated_at" BEFORE UPDATE ON "public"."article_progress" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_lesson_progress_updated_at" BEFORE UPDATE ON "public"."lesson_progress" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_stripe_customers_updated_at" BEFORE UPDATE ON "public"."stripe_customers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_subscriptions_updated_at" BEFORE UPDATE ON "public"."user_subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."article_bookmarks"
    ADD CONSTRAINT "article_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."article_progress"
    ADD CONSTRAINT "article_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lesson_progress"
    ADD CONSTRAINT "lesson_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stripe_customers"
    ADD CONSTRAINT "stripe_customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."task"
    ADD CONSTRAINT "task_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "public"."training"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Allow insert for authenticated users" ON "public"."stripe_customers" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow select for own records" ON "public"."stripe_customers" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow update for own records" ON "public"."stripe_customers" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Anyone can read price_cache" ON "public"."price_cache" FOR SELECT USING (true);



CREATE POLICY "Service role can manage price_cache" ON "public"."price_cache" USING (("auth"."role"() = 'service_role'::"text"));



ALTER TABLE "public"."price_cache" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stripe_customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_subscriptions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "ユーザーは自分のサブスクリプション情報を閲" ON "public"."user_subscriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user_subscription"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user_subscription"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user_subscription"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."article_bookmarks" TO "anon";
GRANT ALL ON TABLE "public"."article_bookmarks" TO "authenticated";
GRANT ALL ON TABLE "public"."article_bookmarks" TO "service_role";



GRANT ALL ON TABLE "public"."article_progress" TO "anon";
GRANT ALL ON TABLE "public"."article_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."article_progress" TO "service_role";



GRANT ALL ON TABLE "public"."lesson_progress" TO "anon";
GRANT ALL ON TABLE "public"."lesson_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."lesson_progress" TO "service_role";



GRANT ALL ON TABLE "public"."price_cache" TO "anon";
GRANT ALL ON TABLE "public"."price_cache" TO "authenticated";
GRANT ALL ON TABLE "public"."price_cache" TO "service_role";



GRANT ALL ON TABLE "public"."stripe_customers" TO "anon";
GRANT ALL ON TABLE "public"."stripe_customers" TO "authenticated";
GRANT ALL ON TABLE "public"."stripe_customers" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."task" TO "anon";
GRANT ALL ON TABLE "public"."task" TO "authenticated";
GRANT ALL ON TABLE "public"."task" TO "service_role";



GRANT ALL ON TABLE "public"."training" TO "anon";
GRANT ALL ON TABLE "public"."training" TO "authenticated";
GRANT ALL ON TABLE "public"."training" TO "service_role";



GRANT ALL ON TABLE "public"."user_progress" TO "anon";
GRANT ALL ON TABLE "public"."user_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."user_progress" TO "service_role";



GRANT ALL ON TABLE "public"."user_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






