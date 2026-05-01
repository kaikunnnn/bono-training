import { Metadata } from "next";
import Link from "next/link";
import { getAllArticles, type ArticleListItem } from "@/lib/sanity";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Play, FileText, Lock, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "記事一覧",
  description:
    "UIUXデザインに関する記事一覧。動画レッスン、チュートリアル、実践ガイドなど、デザインスキルを高めるコンテンツを提供しています。",
  openGraph: {
    title: "記事一覧 | BONO",
    description:
      "UIUXデザインに関する記事一覧。動画レッスン、チュートリアル、実践ガイドなど、デザインスキルを高めるコンテンツを提供しています。",
  },
  twitter: {
    title: "記事一覧 | BONO",
    description:
      "UIUXデザインに関する記事一覧。動画レッスン、チュートリアル、実践ガイドなど、デザインスキルを高めるコンテンツを提供しています。",
  },
  alternates: { canonical: "/articles" },
};

export default async function ArticlesPage() {
  const articles = await getAllArticles();

  // レッスン別にグループ化
  const articlesByLesson = articles.reduce(
    (acc, article) => {
      const lessonKey = article.lessonSlug || "other";
      const lessonTitle = article.lessonTitle || "その他の記事";
      if (!acc[lessonKey]) {
        acc[lessonKey] = {
          title: lessonTitle,
          slug: article.lessonSlug,
          articles: [],
        };
      }
      acc[lessonKey].articles.push(article);
      return acc;
    },
    {} as Record<
      string,
      { title: string; slug?: string; articles: ArticleListItem[] }
    >
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ヘッダーセクション */}
      <section className="bg-background border-b">
        <div className="container px-4 py-12 sm:px-8">
          <h1 className="text-3xl font-bold mb-4">記事一覧</h1>
          <p className="text-muted-foreground max-w-2xl">
            UIUXデザインに関する記事。動画レッスン、チュートリアル、実践ガイドなど、
            デザインスキルを高めるコンテンツを用意しています。
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{articles.length} 件の記事</span>
          </div>
        </div>
      </section>

      {/* 記事一覧 */}
      <section className="container px-4 py-12 sm:px-8">
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">記事が見つかりませんでした</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(articlesByLesson).map(([key, group]) => (
              <div key={key}>
                {/* レッスンタイトル */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">{group.title}</h2>
                  {group.slug && (
                    <Link
                      href={`/lessons/${group.slug}`}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      レッスンを見る
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>

                {/* 記事グリッド */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.articles.slice(0, 6).map((article) => (
                    <ArticleCard key={article._id} article={article} />
                  ))}
                </div>

                {/* もっと見るリンク */}
                {group.articles.length > 6 && group.slug && (
                  <div className="mt-4 text-center">
                    <Link
                      href={`/lessons/${group.slug}`}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      +{group.articles.length - 6} 件の記事を見る
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ArticleCard({ article }: { article: ArticleListItem }) {
  const isVideo =
    article.articleType === "explain" || article.articleType === "demo";
  const duration = article.videoDuration
    ? typeof article.videoDuration === "string"
      ? parseInt(article.videoDuration, 10)
      : article.videoDuration
    : null;

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins}分`;
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return minutes > 0 ? `${hours}時間${minutes}分` : `${hours}時間`;
  };

  return (
    <Link href={`/articles/${article.slug.current}`}>
      <Card className="group hover:shadow-md transition-all duration-200 h-full">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* アイコン */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                isVideo
                  ? "bg-red-100 text-red-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {isVideo ? (
                <Play className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>

            {/* コンテンツ */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-1">
                {article.title}
              </h3>

              {/* メタ情報 */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(duration)}
                  </span>
                )}
                {article.isPremium && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0"
                  >
                    <Lock className="w-2.5 h-2.5 mr-0.5" />
                    Premium
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
