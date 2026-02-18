import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

// フィードバックカード
const FeedbackCard = ({ feedback }: { feedback: Feedback }) => {
  const publishedDate = feedback.publishedAt
    ? new Date(feedback.publishedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <motion.div variants={fadeInUp}>
      <Link
        to={`/feedbacks/${feedback.slug.current}`}
        className="block p-5 bg-white rounded-xl border border-[#E5E7EB] hover:border-primary hover:shadow-lg transition-all group"
      >
        <div className="flex items-start gap-4">
          {/* アイコン */}
          <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-lg flex-shrink-0">
            📝
          </div>

          {/* コンテンツ */}
          <div className="flex-1 min-w-0">
            {/* タイトル + カテゴリ・対象アウトプット・日付 */}
            <div className="flex flex-col gap-2">
              <h3 className="text-[16px] font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-0">
                {feedback.title}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {feedback.category && (
                  <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full font-medium">
                    {feedback.category.title}
                  </span>
                )}
                {feedback.targetOutput && (
                  <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                    {feedback.targetOutput}
                  </span>
                )}
                {publishedDate && (
                  <span className="text-xs text-muted-foreground">
                    {publishedDate}
                  </span>
                )}
              </div>
            </div>

            {/* 抜粋 */}
            {feedback.feedbackExcerpt && (
              <p className="text-[14px] text-muted-foreground line-clamp-2 mt-2">
                {feedback.feedbackExcerpt}
              </p>
            )}
          </div>
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
        <main className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
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

          {/* フィードバックリスト */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">フィードバックがまだありません</p>
            </div>
          ) : (
            <motion.div
              className="flex flex-col gap-4"
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
