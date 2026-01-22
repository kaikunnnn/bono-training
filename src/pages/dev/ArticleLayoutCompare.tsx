import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import { client, getArticleWithContext } from "@/lib/sanity";
import type { ArticleWithContext } from "@/types/sanity";
import VideoSection from "@/components/article/VideoSection";
import HeadingSection from "@/components/article/HeadingSection";
import TodoSection from "@/components/article/TodoSection";
import RichTextSection from "@/components/article/RichTextSection";
import ContentNavigation from "@/components/article/ContentNavigation";
import ArticleSideNavNew from "@/components/article/sidebar/ArticleSideNavNew";
import LogoBlock from "@/components/article/sidebar/LogoBlock";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { isBookmarked, toggleBookmark } from "@/services/bookmarks";
import { getArticleProgress, toggleArticleCompletion } from "@/services/progress";
import type { QuestArticleItemLayoutVariant } from "@/components/article/sidebar/ArticleListItem";

type LayoutVariant = "left-sidebar" | "right-sidebar";

// レッスン名が揺れても拾えるように広めにマッチ（例: "UIサイクル入門…"）
const DEFAULT_LESSON_TITLE_PATTERN = "*UIサイクル*";
// ユーザー指定の固定デフォルト記事（/articles/howto_uidesigncycle）
const DEFAULT_ARTICLE_SLUG = "howto_uidesigncycle";

export default function ArticleLayoutCompare() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const [variant, setVariant] = useState<LayoutVariant>("left-sidebar");
  const [inputSlug, setInputSlug] = useState(slug ?? "");

  const [article, setArticle] = useState<ArticleWithContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvingDefaultSlug, setResolvingDefaultSlug] = useState(false);

  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [progressUpdateTrigger, setProgressUpdateTrigger] = useState(0);
  const [questItemVariant, setQuestItemVariant] = useState<QuestArticleItemLayoutVariant>("B");

  const activeSlug = slug ?? inputSlug;

  // slug が未指定なら「動画あり記事」を1件自動で選んで固定表示（入力不要）
  useEffect(() => {
    const run = async () => {
      if (typeof slug === "string" && slug.length > 0) return;
      if (inputSlug.trim().length > 0) return;

      try {
        setResolvingDefaultSlug(true);
        // 0) まずは固定slugを優先（指定があるので入力不要）
        try {
          const existsQuery = `*[_type == "article" && slug.current == $slug][0]{ "slug": slug.current }`;
          const exists = await client.fetch<{ slug?: string } | null>(existsQuery, { slug: DEFAULT_ARTICLE_SLUG });
          if (exists?.slug) {
            setInputSlug(DEFAULT_ARTICLE_SLUG);
            navigate(`/dev/article-layout-compare/${encodeURIComponent(DEFAULT_ARTICLE_SLUG)}`, { replace: true });
            return;
          }
        } catch {
          // 取得失敗時はフォールバックへ
        }

        // 1) まず「UIサイクル」レッスン配下（Quest.lesson 経由）の動画付き記事を優先
        // Article は quest を参照している前提なので、lesson の quest を列挙せずに「lessonに紐づくquest」を起点に探す
        const lessonArticleQuery = `*[
          _type == "article"
          && defined(slug.current)
          && defined(videoUrl) && videoUrl != ""
          && references(*[_type == "quest" && lesson->title match $title]._id)
        ] | order(publishedAt desc, _createdAt desc)[0]{
          "slug": slug.current
        }`;
        const lessonArticle = await client.fetch<{ slug?: string } | null>(lessonArticleQuery, {
          title: DEFAULT_LESSON_TITLE_PATTERN,
        });
        const fromLesson = lessonArticle?.slug?.trim();

        // 2) フォールバック: 動画あり記事なら何でも
        const anyQuery = `*[_type == "article" && defined(slug.current) && defined(videoUrl) && videoUrl != ""] | order(publishedAt desc, _createdAt desc)[0]{
          "slug": slug.current
        }`;
        const anyResult = fromLesson ? null : await client.fetch<{ slug?: string } | null>(anyQuery);
        const found = (fromLesson ?? anyResult?.slug)?.trim();
        if (!found) {
          setError("動画付きの記事が見つかりませんでした（slugを手入力してください）");
          return;
        }

        setInputSlug(found);
        navigate(`/dev/article-layout-compare/${encodeURIComponent(found)}`, { replace: true });
      } catch (e) {
        console.error("ArticleLayoutCompare: resolve default slug error", e);
        setError("デフォルト記事の取得に失敗しました（slugを手入力してください）");
      } finally {
        setResolvingDefaultSlug(false);
      }
    };

    void run();
  }, [inputSlug, navigate, slug]);

  useEffect(() => {
    const run = async () => {
      if (!activeSlug) {
        setArticle(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getArticleWithContext(activeSlug);
        if (!data) {
          setArticle(null);
          setError("記事が見つかりませんでした");
          return;
        }
        setArticle(data);
      } catch (e) {
        console.error("ArticleLayoutCompare: fetch error", e);
        setError("記事の取得中にエラーが発生しました");
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [activeSlug]);

  // bookmark / completion 初期化
  useEffect(() => {
    const run = async () => {
      if (!article?._id) return;
      const [bm, status] = await Promise.all([isBookmarked(article._id), getArticleProgress(article._id)]);
      setBookmarked(bm);
      setIsCompleted(status === "completed");
    };
    void run();
  }, [article?._id]);

  const navigation = useMemo(() => {
    if (!article || !article.lessonInfo?.quests) return { previous: undefined, next: undefined };

    const allArticles: { slug: string; title: string }[] = [];
    for (const quest of article.lessonInfo.quests) {
      for (const art of quest.articles) {
        allArticles.push({ slug: art.slug.current, title: art.title });
      }
    }

    const currentIndex = allArticles.findIndex((a) => a.slug === article.slug.current);
    if (currentIndex === -1) return { previous: undefined, next: undefined };

    const previous =
      currentIndex > 0 ? { slug: allArticles[currentIndex - 1].slug, title: allArticles[currentIndex - 1].title } : undefined;
    const next =
      currentIndex < allArticles.length - 1 ? { slug: allArticles[currentIndex + 1].slug, title: allArticles[currentIndex + 1].title } : undefined;

    return { previous, next };
  }, [article]);

  const handleBookmarkToggle = useCallback(async () => {
    if (!article) return;
    setBookmarkLoading(true);
    const result = await toggleBookmark(article._id, false);
    if (result.success) {
      setBookmarked(result.isBookmarked);
    }
    setBookmarkLoading(false);
  }, [article]);

  const handleCompleteToggle = useCallback(async () => {
    if (!article || !article.lessonInfo?._id) return;
    setCompletionLoading(true);
    const result = await toggleArticleCompletion(article._id, article.lessonInfo._id);
    if (result.success) {
      setIsCompleted(result.isCompleted);
      setProgressUpdateTrigger((v) => v + 1);
    }
    setCompletionLoading(false);
  }, [article]);

  const leftHeader = (
    <div className="w-full bg-white border-b border-black/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-[#151834]" />
            <h1 className="text-lg font-bold">記事詳細レイアウト比較（Desktop）</h1>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            右サイド案ではロゴをメイン左上に移動してバランスを取ります。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/mypage" className="text-sm text-blue-600 hover:underline">
            ← MyPage
          </Link>
          <Link to="/dev" className="text-sm text-blue-600 hover:underline">
            Dev Home
          </Link>
        </div>
      </div>
    </div>
  );

  const isRightSideLayout = variant === "right-sidebar";

  return (
    <div className="min-h-screen bg-base">
      {leftHeader}

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm text-gray-600">表示:</div>
            <button
              type="button"
              onClick={() => setVariant("left-sidebar")}
              className={`px-3 py-2 rounded-md border text-sm bg-white ${
                variant === "left-sidebar" ? "border-gray-900 text-gray-900" : "border-gray-200 text-gray-600"
              }`}
            >
              現行（左サイド）
            </button>
            <button
              type="button"
              onClick={() => setVariant("right-sidebar")}
              className={`px-3 py-2 rounded-md border text-sm bg-white ${
                variant === "right-sidebar" ? "border-gray-900 text-gray-900" : "border-gray-200 text-gray-600"
              }`}
            >
              案（右サイド＋ロゴは左上）
            </button>

            <div className="ml-6 flex items-center gap-2">
              <span className="text-sm text-gray-600">クエスト行:</span>
              <button
                type="button"
                onClick={() => setQuestItemVariant("A")}
                className={`px-2.5 py-2 rounded-md border text-sm bg-white ${
                  questItemVariant === "A" ? "border-gray-900 text-gray-900" : "border-gray-200 text-gray-600"
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setQuestItemVariant("B")}
                className={`px-2.5 py-2 rounded-md border text-sm bg-white ${
                  questItemVariant === "B" ? "border-gray-900 text-gray-900" : "border-gray-200 text-gray-600"
                }`}
              >
                B
              </button>
              <button
                type="button"
                onClick={() => setQuestItemVariant("C")}
                className={`px-2.5 py-2 rounded-md border text-sm bg-white ${
                  questItemVariant === "C" ? "border-gray-900 text-gray-900" : "border-gray-200 text-gray-600"
                }`}
              >
                C
              </button>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-gray-600">slug:</span>
              <input
                value={inputSlug}
                onChange={(e) => setInputSlug(e.target.value)}
                placeholder="articles の slug（例: xxx）"
                className="px-3 py-2 rounded-md border bg-white text-sm w-[240px]"
                disabled={typeof slug === "string" && slug.length > 0}
              />
              {typeof slug !== "string" || slug.length === 0 ? (
                <Link
                  to={inputSlug ? `/dev/article-layout-compare/${encodeURIComponent(inputSlug)}` : "/dev/article-layout-compare"}
                  className="px-3 py-2 rounded-md bg-[#151834] text-white text-sm"
                >
                  開く
                </Link>
              ) : null}
            </div>
          </div>

          {loading && (
            <div className="min-h-[240px] flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {!loading && resolvingDefaultSlug && (
            <div className="min-h-[240px] flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {!loading && error && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-red-600">{error}</div>
          )}

          {!loading && !error && !article && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-600">
              比較したい記事の slug を入力してください（MyPageの導線から来た場合は自動で入ります）。
            </div>
          )}
        </div>
      </div>

      {article && (
        <div className="flex max-w-[1920px] mx-auto">
          {variant === "left-sidebar" && (
            <aside className="hidden md:block w-[320px] flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
              <ArticleSideNavNew
                article={article}
                currentArticleId={article._id}
                progressUpdateTrigger={progressUpdateTrigger}
                showLogo
                questArticleItemLayoutVariant={questItemVariant}
              />
            </aside>
          )}

          <main className="flex-1 flex flex-col items-center gap-4">
            {/* 右サイド案: ロゴだけメイン左上に移動 */}
            {isRightSideLayout && (
              <div className="hidden md:block w-full pt-6">
                <div className="max-w-[1320px] mx-auto px-6">
                  <div className="w-fit">
                    <LogoBlock variant="compact" />
                  </div>
                </div>
              </div>
            )}

            <div className="w-full px-0 min-[1680px]:px-2 min-[1680px]:pt-8 pt-16 md:pt-8">
              <VideoSection
                videoUrl={article.videoUrl}
                thumbnail={article.thumbnail}
                thumbnailUrl={article.thumbnailUrl}
                isPremium={article.isPremium}
                autoPlay
              />
            </div>

            <div className="w-full px-0 py-0 min-[1680px]:px-2">
              <div className="flex flex-col gap-3">
                <HeadingSection
                  tagType={article.articleType}
                  title={article.title}
                  description={article.excerpt}
                  onComplete={handleCompleteToggle}
                  onFavorite={handleBookmarkToggle}
                  onNext={navigation.next ? () => (window.location.href = `/articles/${navigation.next.slug}`) : undefined}
                  isBookmarked={bookmarked}
                  bookmarkLoading={bookmarkLoading}
                  isCompleted={isCompleted}
                  completionLoading={completionLoading}
                />

                <TodoSection items={article.learningObjectives} />
                <RichTextSection content={article.content} isPremium={article.isPremium} />
                <ContentNavigation previous={navigation.previous} next={navigation.next} />

                {(bookmarkLoading || completionLoading) && (
                  <div className="text-xs text-gray-500">更新中...</div>
                )}
              </div>
            </div>
          </main>

          {isRightSideLayout && (
            <aside className="hidden md:block w-[320px] flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
              <ArticleSideNavNew
                article={article}
                currentArticleId={article._id}
                progressUpdateTrigger={progressUpdateTrigger}
                showLogo={false}
                questArticleItemLayoutVariant={questItemVariant}
              />
            </aside>
          )}
        </div>
      )}
    </div>
  );
}

