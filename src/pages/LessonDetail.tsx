import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { client } from "@/lib/sanity";
import Layout from "@/components/layout/Layout";
import LessonHero from "@/components/lesson/LessonHero";
import LessonTabs from "@/components/lesson/LessonTabs";
import QuestList from "@/components/lesson/QuestList";
import OverviewTab from "@/components/lesson/OverviewTab";
import { getLessonProgress } from "@/services/progress";

interface Article {
  _id: string;
  title: string;
  slug: { current: string };
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

  const canStart = lesson.quests?.[0]?.articles?.[0] !== undefined;

  return (
    <Layout>
      <div className="min-h-screen bg-base">
        <LessonHero
          title={lesson.title}
          description={lesson.description}
          iconImage={lesson.iconImage}
          iconImageUrl={lesson.iconImageUrl}
          category={lesson.category}
          isPremium={lesson.isPremium}
          onStartClick={handleStart}
          canStart={canStart}
        />

        <LessonTabs
          contentTab={
            <QuestList
              contentHeading={lesson.contentHeading}
              quests={lesson.quests || []}
              questProgressMap={questProgressMap}
            />
          }
          overviewTab={<OverviewTab purposes={lesson.purposes} overview={lesson.overview} />}
        />
      </div>
    </Layout>
  );
}
