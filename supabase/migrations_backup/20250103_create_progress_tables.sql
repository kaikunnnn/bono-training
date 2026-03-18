-- ============================================
-- 進捗管理・ブックマーク機能のテーブル作成
-- 作成日: 2025-01-03
-- 目的: ユーザーの学習進捗とブックマークを管理
-- ============================================

-- ---------------------------------------------
-- 1. updated_at 自動更新用の関数（共通）
-- ---------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------
-- 2. lesson_progress テーブル
-- レッスン単位での進捗を管理
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)
);

-- コメント追加
COMMENT ON TABLE lesson_progress IS 'ユーザーのレッスン進捗を管理';
COMMENT ON COLUMN lesson_progress.lesson_id IS 'Sanity CMSのlesson._id';
COMMENT ON COLUMN lesson_progress.status IS 'not_started: 未開始, in_progress: 進行中, completed: 完了';

-- lesson_progress のインデックス
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_status ON lesson_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_updated ON lesson_progress(user_id, updated_at DESC);

-- lesson_progress の updated_at 自動更新トリガー
CREATE TRIGGER update_lesson_progress_updated_at
    BEFORE UPDATE ON lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------
-- 3. article_progress テーブル
-- 記事単位での進捗を管理
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS article_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, article_id)
);

-- コメント追加
COMMENT ON TABLE article_progress IS 'ユーザーの記事進捗を管理';
COMMENT ON COLUMN article_progress.article_id IS 'Sanity CMSのarticle._id';
COMMENT ON COLUMN article_progress.lesson_id IS '所属するレッスンのID';
COMMENT ON COLUMN article_progress.status IS 'not_started: 未視聴, in_progress: 視聴中, completed: 完了';

-- article_progress のインデックス
CREATE INDEX IF NOT EXISTS idx_article_progress_user ON article_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_article_progress_lesson ON article_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_article_progress_status ON article_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_article_progress_updated ON article_progress(user_id, updated_at DESC);

-- article_progress の updated_at 自動更新トリガー
CREATE TRIGGER update_article_progress_updated_at
    BEFORE UPDATE ON article_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------
-- 4. article_bookmarks テーブル
-- 記事のブックマークを管理
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS article_bookmarks (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, article_id)
);

-- コメント追加
COMMENT ON TABLE article_bookmarks IS 'ユーザーの記事ブックマークを管理';
COMMENT ON COLUMN article_bookmarks.article_id IS 'Sanity CMSのarticle._id';

-- article_bookmarks のインデックス
CREATE INDEX IF NOT EXISTS idx_article_bookmarks_user ON article_bookmarks(user_id, created_at DESC);

-- ---------------------------------------------
-- 完了メッセージ
-- ---------------------------------------------
DO $$
BEGIN
    RAISE NOTICE '✅ 進捗管理テーブルの作成が完了しました';
    RAISE NOTICE '📊 作成されたテーブル: lesson_progress, article_progress, article_bookmarks';
    RAISE NOTICE '🔄 自動更新トリガーが設定されました';
END $$;
