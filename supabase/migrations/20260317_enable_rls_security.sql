-- =============================================================================
-- セキュリティ強化: RLS有効化とポリシー設定
-- 作成日: 2026-03-17
-- 目的: 他ユーザーのデータアクセスを防止
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. article_progress テーブル
-- -----------------------------------------------------------------------------
ALTER TABLE "public"."article_progress" ENABLE ROW LEVEL SECURITY;

-- SELECT: 自分の進捗のみ閲覧可能
CREATE POLICY "Users can view own article progress"
  ON "public"."article_progress"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: 自分のuser_idでのみ挿入可能
CREATE POLICY "Users can insert own article progress"
  ON "public"."article_progress"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: 自分の進捗のみ更新可能
CREATE POLICY "Users can update own article progress"
  ON "public"."article_progress"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: 自分の進捗のみ削除可能
CREATE POLICY "Users can delete own article progress"
  ON "public"."article_progress"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 2. lesson_progress テーブル
-- -----------------------------------------------------------------------------
ALTER TABLE "public"."lesson_progress" ENABLE ROW LEVEL SECURITY;

-- SELECT: 自分の進捗のみ閲覧可能
CREATE POLICY "Users can view own lesson progress"
  ON "public"."lesson_progress"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: 自分のuser_idでのみ挿入可能
CREATE POLICY "Users can insert own lesson progress"
  ON "public"."lesson_progress"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: 自分の進捗のみ更新可能
CREATE POLICY "Users can update own lesson progress"
  ON "public"."lesson_progress"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: 自分の進捗のみ削除可能
CREATE POLICY "Users can delete own lesson progress"
  ON "public"."lesson_progress"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. user_progress テーブル
-- -----------------------------------------------------------------------------
ALTER TABLE "public"."user_progress" ENABLE ROW LEVEL SECURITY;

-- SELECT: 自分の進捗のみ閲覧可能
CREATE POLICY "Users can view own user progress"
  ON "public"."user_progress"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: 自分のuser_idでのみ挿入可能
CREATE POLICY "Users can insert own user progress"
  ON "public"."user_progress"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: 自分の進捗のみ更新可能
CREATE POLICY "Users can update own user progress"
  ON "public"."user_progress"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: 自分の進捗のみ削除可能
CREATE POLICY "Users can delete own user progress"
  ON "public"."user_progress"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4. article_bookmarks テーブル
-- -----------------------------------------------------------------------------
ALTER TABLE "public"."article_bookmarks" ENABLE ROW LEVEL SECURITY;

-- SELECT: 自分のブックマークのみ閲覧可能
CREATE POLICY "Users can view own bookmarks"
  ON "public"."article_bookmarks"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: 自分のuser_idでのみ挿入可能
CREATE POLICY "Users can insert own bookmarks"
  ON "public"."article_bookmarks"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- DELETE: 自分のブックマークのみ削除可能
CREATE POLICY "Users can delete own bookmarks"
  ON "public"."article_bookmarks"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 5. subscriptions テーブル
-- -----------------------------------------------------------------------------
ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;

-- SELECT: 自分のサブスクリプションのみ閲覧可能
CREATE POLICY "Users can view own subscriptions"
  ON "public"."subscriptions"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- サービスロールは全操作可能（Webhook処理用）
CREATE POLICY "Service role can manage subscriptions"
  ON "public"."subscriptions"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 6. user_subscriptions テーブル（既にRLS有効だがポリシー追加）
-- -----------------------------------------------------------------------------
-- 注意: user_subscriptionsは既にRLSが有効でSELECTポリシーがある
-- INSERT/UPDATE/DELETEはサービスロール経由のみ許可

-- サービスロールは全操作可能（Webhook処理用）
CREATE POLICY "Service role can manage user_subscriptions"
  ON "public"."user_subscriptions"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- 完了
-- =============================================================================
