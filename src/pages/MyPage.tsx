import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { BookmarkList } from "@/components/ui/bookmark-list";
import { LessonProgressCard } from "@/components/ui/lesson-progress-card";
import { getBookmarkedArticles, toggleBookmark, type BookmarkedArticle } from "@/services/bookmarks";
import { getAllLessonsWithArticles, type LessonWithArticles } from "@/services/lessons";
import { getMultipleLessonProgress, type LessonProgress } from "@/services/progress";
import { User } from "lucide-react";

export default function MyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<BookmarkedArticle[]>([]);
  const [lessons, setLessons] = useState<LessonWithArticles[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ログインチェック
    if (!user) {
      navigate("/auth");
      return;
    }

    // データを取得
    const fetchData = async () => {
      setLoading(true);

      // ブックマークを取得
      const articles = await getBookmarkedArticles();
      setBookmarks(articles);

      // レッスン一覧を取得
      const allLessons = await getAllLessonsWithArticles();
      setLessons(allLessons);

      // 各レッスンの進捗を取得
      const lessonData = allLessons.map(lesson => ({
        lessonId: lesson._id,
        articleIds: lesson.articleIds,
      }));
      const progress = await getMultipleLessonProgress(lessonData);
      setProgressMap(progress);

      setLoading(false);
    };

    fetchData();
  }, [user, navigate]);

  // ブックマーク解除ハンドラー
  const handleRemoveBookmark = async (articleId: string) => {
    // ブックマーク状態をトグル（追加/解除）
    await toggleBookmark(articleId, false);

    // リストは再取得しない（ページリロード時に反映される）
    // これにより、間違って解除した場合に即座に復元できる
  };

  // 進行中のレッスン（0% < 進捗 < 100%）
  const inProgressLessons = lessons.filter(lesson => {
    const progress = progressMap[lesson._id];
    return progress && progress.percentage > 0 && progress.percentage < 100;
  });

  // 完了したレッスン（進捗 = 100%）
  const completedLessons = lessons.filter(lesson => {
    const progress = progressMap[lesson._id];
    return progress && progress.percentage === 100;
  });

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">マイページ</h1>
            <Link
              to="/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <User className="w-5 h-5" />
              <span>プロフィール</span>
            </Link>
          </div>
          <p className="text-gray-600">
            学習の進捗とブックマークを確認できます
          </p>
        </div>

        {/* 進行中のレッスン */}
        {inProgressLessons.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              進行中のレッスン（{inProgressLessons.length}件）
            </h2>
            <div className="space-y-4">
              {inProgressLessons.map(lesson => {
                const progress = progressMap[lesson._id];
                return (
                  <LessonProgressCard
                    key={lesson._id}
                    lesson={lesson}
                    progress={progress}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ブックマーク一覧 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            ブックマーク（{bookmarks.length}件）
          </h2>

          <BookmarkList
            articles={bookmarks}
            emptyMessage="ブックマークした記事がありません"
            emptyLink={{ href: "/lessons", label: "レッスンを見る" }}
            onRemoveBookmark={handleRemoveBookmark}
          />
        </div>

        {/* 完了したレッスン */}
        {completedLessons.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              完了したレッスン（{completedLessons.length}件）
            </h2>
            <div className="space-y-4">
              {completedLessons.map(lesson => {
                const progress = progressMap[lesson._id];
                return (
                  <LessonProgressCard
                    key={lesson._id}
                    lesson={lesson}
                    progress={progress}
                    isCompleted
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
