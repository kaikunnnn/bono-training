import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { BookmarkList } from "@/components/ui/bookmark-list";
import { getBookmarkedArticles, toggleBookmark, type BookmarkedArticle } from "@/services/bookmarks";
import { User } from "lucide-react";

export default function MyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<BookmarkedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ログインチェック
    if (!user) {
      navigate("/auth");
      return;
    }

    // ブックマーク一覧を取得
    const fetchBookmarks = async () => {
      setLoading(true);
      const articles = await getBookmarkedArticles();
      setBookmarks(articles);
      setLoading(false);
    };

    fetchBookmarks();
  }, [user, navigate]);

  // ブックマーク解除ハンドラー
  const handleRemoveBookmark = async (articleId: string) => {
    // ブックマーク状態をトグル（追加/解除）
    await toggleBookmark(articleId, false);

    // リストは再取得しない（ページリロード時に反映される）
    // これにより、間違って解除した場合に即座に復元できる
  };

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
            ブックマークした記事を確認できます
          </p>
        </div>

        {/* ブックマーク一覧 */}
        <div>
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
      </div>
    </Layout>
  );
}
