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

// カテゴリごとのFluentEmoji 3D URLマッピング
const categoryEmojiUrl: Record<string, string> = {
  "portfolio": "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Briefcase/3D/briefcase_3d.png",
  "user-value-design": "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bullseye/3D/bullseye_3d.png",
  "ui-style": "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Artist%20palette/3D/artist_palette_3d.png",
  "career": "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Rocket/3D/rocket_3d.png",
  "default": "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Memo/3D/memo_3d.png",
};

// カテゴリごとのフォールバック絵文字（FluentEmoji読み込み失敗時）
const categoryEmoji: Record<string, string> = {
  "portfolio": "💼",
  "user-value-design": "🎯",
  "ui-style": "🎨",
  "career": "🚀",
  "default": "📝",
};

// カテゴリごとのグラデーションマッピング
const categoryGradient: Record<string, string> = {
  portfolio: "from-blue-100/50 via-indigo-50/50 to-white",
  "user-value-design": "from-orange-100/50 via-amber-50/50 to-white",
  "ui-style": "from-pink-100/50 via-rose-50/50 to-white",
  career: "from-emerald-100/50 via-teal-50/50 to-white",
  default: "from-gray-100/50 via-slate-50/50 to-white",
};

// フィードバックカード（改善版）
const FeedbackCard = ({ feedback }: { feedback: Feedback }) => {
  const publishedDate = feedback.publishedAt
    ? new Date(feedback.publishedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const categorySlug = feedback.category?.slug?.current || "default";
  const emojiUrl = categoryEmojiUrl[categorySlug] || categoryEmojiUrl["default"];
  const emojiAlt = categoryEmoji[categorySlug] || categoryEmoji["default"];
  const gradientClass = categoryGradient[categorySlug] || categoryGradient["default"];

  return (
    <motion.div variants={fadeInUp} className="h-full">
      <Link
        to={`/feedbacks/${feedback.slug.current}`}
        className="group block h-full bg-white rounded-[24px] border border-border/50 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300"
      >
        {/* ビジュアルエリア (Top Half) */}
        <div className={cn("h-[180px] w-full bg-gradient-to-br flex items-center justify-center relative overflow-hidden", gradientClass)}>
          {/* 装飾的な円 (Blur) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/40 rounded-full blur-2xl" />
          
          {/* アイコン - FluentEmoji 3D */}
          <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
            <img
              src={emojiUrl}
              alt={emojiAlt}
              className="w-16 h-16 object-contain drop-shadow-sm"
              loading="lazy"
            />
          </div>

          {/* カテゴリバッジ (右上) */}
          {feedback.category && (
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center justify-center px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full border border-white/50 shadow-sm">
                <span className="font-noto-sans-jp text-[11px] font-bold text-foreground/80">
                  {feedback.category.title}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* コンテンツエリア (Bottom Half) */}
        <div className="p-6 flex flex-col gap-3">
          <h3 className="font-rounded-mplus text-[17px] font-bold text-foreground leading-[1.6] line-clamp-2 group-hover:text-primary transition-colors">
            {feedback.title}
          </h3>

          {/* 対象アウトプット - タイトル下に独立ブロックで表示 */}
          {feedback.targetOutput && (
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">📎</span>
              <span className="font-noto-sans-jp text-[12px] font-medium text-foreground/80 line-clamp-1">
                {feedback.targetOutput}
              </span>
            </div>
          )}

          {/* 概要 */}
          {feedback.excerpt && (
            <p className="font-noto-sans-jp text-[13px] text-muted-foreground leading-[1.8] line-clamp-2">
              {feedback.excerpt}
            </p>
          )}

          <div className="mt-auto pt-4 flex items-center text-xs text-muted-foreground/70">
            {publishedDate && <span>{publishedDate}</span>}
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

// カテゴリタブコンポーネント
const CategoryTab = ({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border",
      active
        ? "bg-foreground text-background border-foreground shadow-md scale-105"
        : "bg-white text-muted-foreground border-border hover:border-gray-300 hover:text-foreground hover:bg-gray-50/50"
    )}
  >
    {children}
  </button>
);

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
      <div className="min-h-screen w-full">
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
            className="flex flex-wrap gap-3 mb-16 justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CategoryTab
              active={selectedCategory === null}
              onClick={() => setSelectedCategory(null)}
            >
              すべて
            </CategoryTab>
            {categories.map((cat) => (
              <CategoryTab
                key={cat._id}
                active={selectedCategory === cat.slug.current}
                onClick={() => setSelectedCategory(cat.slug.current)}
              >
                <img
                  src={categoryEmojiUrl[cat.slug.current] || categoryEmojiUrl["default"]}
                  alt={categoryEmoji[cat.slug.current] || "📝"}
                  className="w-5 h-5 object-contain inline-block mr-2"
                />
                {cat.title}
              </CategoryTab>
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
