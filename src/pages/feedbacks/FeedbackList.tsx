import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import {
  getAllFeedbacks,
  getFeedbackCategories,
  getFeedbacksByCategory,
} from "@/lib/sanity";
import type { Feedback, FeedbackCategory } from "@/types/sanity";
import Layout from "@/components/layout/Layout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import SEO from "@/components/common/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import { cn } from "@/lib/utils";

// アニメーション設定
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// カテゴリごとのアイコン/絵文字マッピング
const categoryEmoji: Record<string, string> = {
  "portfolio": "💼",
  "user-value-design": "🎯",
  "ui-style": "🎨",
  "career": "🚀",
};

// フィードバックカード（LessonCard風）
const FeedbackCard = ({ feedback }: { feedback: Feedback }) => {
  const publishedDate = feedback.publishedAt
    ? new Date(feedback.publishedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const categorySlug = feedback.category?.slug?.current || "";
  const emoji = categoryEmoji[categorySlug] || "📝";

  return (
    <motion.div variants={fadeInUp}>
      <Link
        to={`/feedbacks/${feedback.slug.current}`}
        className={cn(
          "bg-white flex flex-col p-5 rounded-[24px] shadow-[0px_1px_8px_0px_rgba(0,0,0,0.08)]",
          "cursor-pointer transition-all duration-200",
          "hover:shadow-[0px_1px_12px_0px_rgba(0,0,0,0.12)] hover:translate-y-[-2px]",
          "w-full h-full",
          "min-h-[240px]"
        )}
      >
        <div className="flex h-full flex-col gap-4">
          {/* カテゴリバッジ */}
          {feedback.category && (
            <div className="flex items-center">
              <span className="inline-flex items-center justify-center px-2.5 py-1.5 bg-primary/10 rounded-full">
                <span className="font-noto-sans-jp text-[12px] font-medium text-primary leading-none">
                  {feedback.category.title}
                </span>
              </span>
            </div>
          )}

          {/* アイコンエリア */}
          <div className="flex justify-center items-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-3xl shadow-inner">
              {emoji}
            </div>
          </div>

          {/* タイトル・説明エリア */}
          <div className="flex flex-col gap-2 flex-1">
            <h3 className="font-rounded-mplus text-[15px] font-bold text-foreground leading-[1.5] line-clamp-2">
              {feedback.title}
            </h3>

            {/* 概要 */}
            {feedback.excerpt && (
              <p className="font-noto-sans-jp text-[13px] text-muted-foreground leading-[1.6] line-clamp-2">
                {feedback.excerpt}
              </p>
            )}

            {/* 対象アウトプット */}
            {feedback.targetOutput && (
              <p className="font-noto-sans-jp text-xs text-muted-foreground/70 leading-[1.5] line-clamp-1">
                📎 {feedback.targetOutput}
              </p>
            )}
          </div>

          {/* 日付 */}
          {publishedDate && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-muted-foreground">{publishedDate}</p>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

// フィードバック依頼ボタン（アクセス制御付き）
const FeedbackRequestButton = () => {
  const { user } = useAuth();
  const { planType, loading } = useSubscriptionContext();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Button variant="default" size="medium" disabled>
        <LoadingSpinner size="sm" />
      </Button>
    );
  }

  // ログインしていない場合
  if (!user) {
    return (
      <Button variant="default" size="medium" onClick={() => navigate("/login")}>
        ログインしてフィードバックを依頼
      </Button>
    );
  }

  // Growthプラン（feedback含む）でない場合
  if (planType !== "growth" && planType !== "feedback") {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">
          フィードバック機能はGrowthプラン限定です
        </p>
        <Button variant="default" size="medium" onClick={() => navigate("/subscription")}>
          プランを変更する
        </Button>
      </div>
    );
  }

  // Growthプランの場合
  return (
    <a
      href="https://bo-no.slack.com/archives/C02GNBK4EGR"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Button variant="default" size="medium">
        フィードバックを依頼する
      </Button>
    </a>
  );
};

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [categories, setCategories] = useState<FeedbackCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [feedbacksData, categoriesData] = await Promise.all([
          getAllFeedbacks(),
          getFeedbackCategories(),
        ]);
        setFeedbacks(feedbacksData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // カテゴリ変更時にフィルタリング
  useEffect(() => {
    const fetchFiltered = async () => {
      if (selectedCategory) {
        setLoading(true);
        try {
          const filtered = await getFeedbacksByCategory(selectedCategory);
          setFeedbacks(filtered);
        } catch (err) {
          console.error("Error fetching filtered feedbacks:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(true);
        try {
          const all = await getAllFeedbacks();
          setFeedbacks(all);
        } catch (err) {
          console.error("Error fetching all feedbacks:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFiltered();
  }, [selectedCategory]);

  if (loading && feedbacks.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title="みんなのフィードバック"
        description="BONOメンバーのデザインに対するフィードバック事例をまとめています。ポートフォリオ、UIスタイル、ユーザー価値設計など様々なカテゴリのフィードバックが閲覧できます。"
        ogUrl="/feedbacks"
        ogType="website"
      />
      <div className="min-h-screen w-full bg-base">
        {/* メインコンテンツ */}
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
          {/* ページヘッダー */}
          <PageHeader
            label="Feedback"
            title="みんなのフィードバック"
            description="BONOメンバーのデザインに対するフィードバック事例をまとめています"
          >
            <FeedbackRequestButton />
          </PageHeader>

          {/* カテゴリフィルター */}
          <motion.div
            className="flex flex-wrap gap-2 mb-8 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setSelectedCategory(null)}
            >
              すべて
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat._id}
                variant={
                  selectedCategory === cat.slug.current ? "default" : "outline"
                }
                size="sm"
                className="rounded-full"
                onClick={() => setSelectedCategory(cat.slug.current)}
              >
                {cat.title}
              </Button>
            ))}
          </motion.div>

          {/* フィードバックグリッド */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-muted-foreground">フィードバックがまだありません</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {feedbacks.map((feedback) => (
                <FeedbackCard key={feedback._id} feedback={feedback} />
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </Layout>
  );
};

export default FeedbackList;
