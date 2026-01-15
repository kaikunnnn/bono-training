import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { client } from "@/lib/sanity";
import Layout from "@/components/layout/Layout";
import { LessonHeaderLayout } from "@/components/lesson/header";
import LessonTabs from "@/components/lesson/LessonTabs";
import QuestList from "@/components/lesson/QuestList";
import OverviewTab from "@/components/lesson/OverviewTab";
import { getLessonProgress } from "@/services/progress";

interface Article {
  _id: string;
  title: string;
  slug: { current: string };
  articleType?: "explain" | "intro" | "practice" | "challenge";
  thumbnail?: any;
  thumbnailUrl?: string;
  videoDuration?: number;
  isPremium?: boolean;
}

interface Quest {
  _id: string;
  title: string;
  description?: string;
  goal?: string;
  estTimeMins?: number;
  articles: Article[];
}

interface Lesson {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  iconImage?: any;
  iconImageUrl?: string;
  category?: string;
  isPremium?: boolean;
  contentHeading?: string;
  purposes?: string[];
  overview?: any;
  quests: Quest[];
}

export default function LessonDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questProgressMap, setQuestProgressMap] = useState<Record<string, { completed: number; total: number; completedArticleIds: string[] }>>({});
  const [activeTab, setActiveTab] = useState<"content" | "overview">("content");
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const query = `*[_type == "lesson" && slug.current == $slug][0] {
          _id,
          title,
          slug,
          description,
          iconImage {
            _type,
            asset {
              _ref,
              _type
            }
          },
          iconImageUrl,
          "category": category->title,
          isPremium,
          contentHeading,
          purposes,
          overview,
          "quests": quests[]-> {
            _id,
            title,
            description,
            goal,
            estTimeMins,
            "articles": articles[]-> {
              _id,
              title,
              slug,
              articleType,
              thumbnail {
                _type,
                asset {
                  _ref,
                  _type
                }
              },
              thumbnailUrl,
              videoDuration,
              isPremium
            }
          }
        }`;

        const data = await client.fetch(query, { slug });

        if (!data) {
          setError("レッスンが見つかりませんでした");
        } else {
          // 配列のindexから番号を付与
          const processedData = {
            ...data,
            quests: data.quests?.map((quest: Quest, questIndex: number) => ({
              ...quest,
              questNumber: questIndex + 1,
              articles: quest.articles?.map((article: Article, articleIndex: number) => ({
                ...article,
                articleNumber: articleIndex + 1,
              })) || [],
            })) || [],
          };
          setLesson(processedData);
        }
      } catch (err) {
        console.error("Error fetching lesson:", err);
        setError("レッスンの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchLesson();
    }
  }, [slug]);

  // 各クエストの進捗データを取得
  useEffect(() => {
    const fetchQuestProgress = async () => {
      if (!lesson || !lesson._id) return;

      const progressMap: Record<string, { completed: number; total: number; completedArticleIds: string[] }> = {};

      // 各クエストの進捗を取得
      for (const quest of lesson.quests) {
        const articleIds = quest.articles.map(a => a._id);
        const progress = await getLessonProgress(lesson._id, articleIds);

        progressMap[quest._id] = {
          completed: progress.completedArticles,
          total: progress.totalArticles,
          completedArticleIds: progress.completedArticleIds,
        };
      }

      setQuestProgressMap(progressMap);
    };

    fetchQuestProgress();
  }, [lesson]);

  const handleStart = () => {
    if (lesson?.quests?.[0]?.articles?.[0]) {
      const firstArticle = lesson.quests[0].articles[0];
      navigate(`/articles/${firstArticle.slug.current}`);
    }
  };

  // 「概要・目的ですべてみる」クリック時にタブを切り替え
  const handleViewAllDetails = () => {
    setActiveTab("overview");
    // タブ部分までスクロール
    tabsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 全体の進捗率を計算（完了記事数 / 全記事数 × 100）
  const calculateOverallProgress = (): number => {
    if (!lesson || !questProgressMap) return 0;

    let totalArticles = 0;
    let completedArticles = 0;

    for (const quest of lesson.quests) {
      const progress = questProgressMap[quest._id];
      if (progress) {
        totalArticles += progress.total;
        completedArticles += progress.completed;
      } else {
        totalArticles += quest.articles.length;
      }
    }

    if (totalArticles === 0) return 0;
    return Math.round((completedArticles / totalArticles) * 100);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !lesson) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "エラーが発生しました"}</p>
            <button
              onClick={() => navigate("/lessons")}
              className="text-blue-600 underline"
            >
              レッスン一覧に戻る
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const overallProgress = calculateOverallProgress();

  // 概要・目的データがあるかチェック
  const hasOverviewData = !!(
    (lesson.purposes && lesson.purposes.length > 0) ||
    (lesson.overview && lesson.overview.length > 0)
  );

  return (
    <Layout>
      <div className="min-h-screen bg-base">
        {/* 新デザインヘッダー + タブコンテンツ（右側ブロックに統合） */}
        <LessonHeaderLayout
          lesson={lesson}
          progress={overallProgress}
          onStart={handleStart}
          onViewAllDetails={hasOverviewData ? handleViewAllDetails : undefined}
        >
          {/* タブコンテンツ（右側ブロック内に配置） */}
          <div ref={tabsRef}>
            <LessonTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              showOverviewTab={hasOverviewData}
              contentTab={
                <QuestList
                  contentHeading={lesson.contentHeading}
                  quests={lesson.quests || []}
                  questProgressMap={questProgressMap}
                />
              }
              overviewTab={hasOverviewData ? <OverviewTab purposes={lesson.purposes} overview={lesson.overview} /> : undefined}
            />
          </div>
        </LessonHeaderLayout>
      </div>
    </Layout>
  );
}
