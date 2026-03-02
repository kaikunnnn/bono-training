import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getApprovedArticleSubmissions, type ArticleSubmission } from "@/lib/sanity";
import {
  PenTool,
  ExternalLink,
  Sparkles,
  ArrowRight,
  RefreshCw,
  User,
} from "lucide-react";

// カテゴリラベルのマッピング
const CATEGORY_LABELS: Record<string, string> = {
  notice: "気づき",
  "before-after": "B/A",
  why: "Why",
};

// 記事カード
const ArticleCard = ({ article }: { article: ArticleSubmission }) => {
  return (
    <Card className="group overflow-hidden transition-all hover:border-indigo-200 hover:shadow-md">
      <CardContent className="p-0">
        {/* サムネイル */}
        {article.articleImage ? (
          <div className="aspect-video overflow-hidden bg-slate-100">
            <img
              src={article.articleImage}
              alt={article.articleTitle || "記事サムネイル"}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
            <PenTool className="h-12 w-12 text-indigo-300" />
          </div>
        )}

        <div className="p-4">
          {/* カテゴリバッジ */}
          <div className="mb-2 flex flex-wrap gap-1">
            {article.categories?.map((cat) => (
              <Badge
                key={cat}
                variant="secondary"
                className="bg-indigo-50 text-indigo-600"
              >
                {CATEGORY_LABELS[cat] || cat}
              </Badge>
            ))}
          </div>

          {/* タイトル */}
          <h3 className="mb-2 line-clamp-2 font-semibold text-slate-900 group-hover:text-indigo-600">
            {article.articleTitle || "（タイトル未取得）"}
          </h3>

          {/* 伝えたいこと */}
          {article.mainPoint && (
            <p className="mb-3 line-clamp-3 text-sm text-slate-600">
              {article.mainPoint}
            </p>
          )}

          {/* 著者・日付 */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {article.authorName}
            </div>
            <div>
              {new Date(article.submittedAt).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>

          {/* 記事リンク */}
          <a
            href={article.articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            記事を読む
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

// 空状態
const EmptyState = () => (
  <div className="col-span-full py-16 text-center">
    <div className="mb-4 flex justify-center">
      <div className="rounded-full bg-slate-100 p-4">
        <PenTool className="h-8 w-8 text-slate-400" />
      </div>
    </div>
    <h3 className="mb-2 text-lg font-semibold text-slate-900">
      まだ記事がありません
    </h3>
    <p className="mb-6 text-slate-600">
      最初の一人になりましょう！
    </p>
    <Button asChild>
      <Link to="/share/submit">
        記事を提出する
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  </div>
);

const ShareIndex = () => {
  const [articles, setArticles] = useState<ArticleSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await getApprovedArticleSubmissions();
        setArticles(data);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <Layout>
      <div className="container py-8">
        {/* ヘッダー */}
        <section className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 p-3">
              <Sparkles className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="mb-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            みんなの思考の軌跡
          </h1>
          <p className="mb-6 text-slate-600">
            BONOで学んだことを実践し、思考をアウトプットした記事の一覧です
          </p>
          <Button asChild size="lg">
            <Link to="/share/submit">
              あなたの記事を提出する
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>

        {/* コンテンツ */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="flex items-center gap-2 text-slate-500">
              <RefreshCw className="h-5 w-5 animate-spin" />
              読み込み中...
            </div>
          </div>
        ) : articles.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ShareIndex;
