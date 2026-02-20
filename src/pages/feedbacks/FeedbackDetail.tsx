import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Lock,
  Play,
  FileText,
  User,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  getFeedback,
  getRelatedFeedbacks,
  getRecentFeedbacks,
} from "@/lib/sanity";
import type { Feedback } from "@/types/sanity";
import { PortableText } from "@portabletext/react";
import Layout from "@/components/layout/Layout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import SEO from "@/components/common/SEO";
import VideoSection from "@/components/article/VideoSection";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";

// アニメーション設定
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// カテゴリ別のグラデーション設定
const categoryGradients: Record<string, { primary: string; secondary: string }> = {
  "portfolio": {
    primary: "from-blue-100/60 via-indigo-50/40 to-transparent",
    secondary: "from-indigo-100/50 via-transparent to-transparent",
  },
  "user-value-design": {
    primary: "from-orange-100/60 via-amber-50/40 to-transparent",
    secondary: "from-amber-100/50 via-transparent to-transparent",
  },
  "ui-style": {
    primary: "from-pink-100/60 via-rose-50/40 to-transparent",
    secondary: "from-rose-100/50 via-transparent to-transparent",
  },
  "career": {
    primary: "from-emerald-100/60 via-teal-50/40 to-transparent",
    secondary: "from-teal-100/50 via-transparent to-transparent",
  },
  "default": {
    primary: "from-gray-100/60 via-slate-50/40 to-transparent",
    secondary: "from-slate-100/50 via-transparent to-transparent",
  },
};

// PortableText用のコンポーネント
const portableTextComponents = {
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-[22px] md:text-[26px] font-bold text-foreground mt-10 mb-6 first:mt-0 font-rounded-mplus flex items-center gap-2">
        <span className="w-1.5 h-6 bg-primary rounded-full" />
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-[18px] md:text-[20px] font-bold text-foreground mt-8 mb-4 font-rounded-mplus">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-[16px] md:text-[18px] font-semibold text-foreground mt-6 mb-3 font-rounded-mplus">
        {children}
      </h4>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary/20 bg-muted/30 py-4 px-6 my-6 text-[15px] leading-relaxed text-muted-foreground rounded-r-lg">
        {children}
      </blockquote>
    ),
    normal: ({ children }: any) => (
      <p
        className="text-[15px] md:text-[16px] leading-[1.8] text-muted-foreground mb-6"
        style={{ letterSpacing: "0.03em" }}
      >
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc mb-6 space-y-2 pl-6 text-muted-foreground">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal mb-6 space-y-2 pl-6 text-muted-foreground">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li className="text-[15px] md:text-[16px] leading-[1.8] pl-1">
        {children}
      </li>
    ),
    number: ({ children }: any) => (
      <li className="text-[15px] md:text-[16px] leading-[1.8] pl-1">
        {children}
      </li>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-bold text-foreground bg-yellow-100/50 px-1 rounded">
        {children}
      </strong>
    ),
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground font-medium">
        {children}
      </code>
    ),
    link: ({ children, value }: any) => (
      <a
        href={value?.href || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline hover:text-primary/80 decoration-primary/30 underline-offset-4 transition-colors"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }: any) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-8">
          <img
            src={value.asset.url}
            alt={value.alt || ""}
            className="w-full h-auto rounded-xl border border-border shadow-sm"
            loading="lazy"
          />
          {value.caption && (
            <figcaption className="mt-2 text-sm text-muted-foreground text-center italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

// フィードバックカード（関連フィードバック・最近のフィードバック用）
const FeedbackCard = ({ feedback }: { feedback: Feedback }) => (
  <Link
    to={`/feedbacks/${feedback.slug.current}`}
    className="block p-4 bg-background rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all group"
  >
    <div className="flex flex-col gap-2">
      <Badge
        variant="secondary"
        className="w-fit font-normal text-xs bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors"
      >
        {feedback.category?.title || "カテゴリなし"}
      </Badge>
      <h3 className="text-[15px] font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
        {feedback.title}
      </h3>
    </div>
  </Link>
);

// プレミアムコンテンツロック表示（Luma風）
const PremiumContentLock = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-12 p-8 bg-muted/30 rounded-2xl border border-border text-center backdrop-blur-sm">
      <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
        <Lock className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2 font-rounded-mplus">
        もっと詳しく学びたいですか？
      </h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
        Growthプランに参加すると、すべての動画レビューとFigmaデータにアクセスできます。
      </p>
      <Button
        onClick={() => navigate("/subscription")}
        size="lg"
        className="rounded-full px-8 font-bold shadow-lg shadow-primary/20"
      >
        プランを確認する
      </Button>
    </div>
  );
};

const FeedbackDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { canAccessContent } = useSubscriptionContext();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [relatedFeedbacks, setRelatedFeedbacks] = useState<Feedback[]>([]);
  const [recentFeedbacks, setRecentFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // フィードバックはプレミアムコンテンツとして扱う
  const isPremium = true;
  const hasAccess = canAccessContent(isPremium);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) {
        setError("フィードバックのスラッグが指定されていません");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getFeedback(slug);

        if (!data) {
          setError("フィードバックが見つかりませんでした");
          setLoading(false);
          return;
        }

        setFeedback(data);

        // 関連フィードバックと最近のフィードバックを取得
        if (data.category?.slug?.current) {
          const related = await getRelatedFeedbacks(
            data.category.slug.current,
            slug,
            3,
          );
          setRelatedFeedbacks(related);
        }

        const recent = await getRecentFeedbacks(3, slug);
        setRecentFeedbacks(recent);
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError("フィードバックの取得中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error || !feedback) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <p className="text-destructive mb-4 font-medium">
              {error || "フィードバックが見つかりませんでした"}
            </p>
            <Button variant="default" onClick={() => navigate("/feedbacks")}>
              フィードバック一覧に戻る
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const publishedDate = feedback.publishedAt
    ? new Date(feedback.publishedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <Layout>
      <SEO
        title={feedback.title}
        description={`${feedback.category?.title || "フィードバック"}：${
          feedback.title
        }`}
        ogUrl={`/feedbacks/${slug}`}
        ogType="article"
      />
      <div className="relative min-h-screen w-full bg-base font-sans overflow-hidden">
        {/* Ambient Gradient Background - カテゴリ色連動 */}
        {(() => {
          const categorySlug = feedback.category?.slug?.current || "default";
          const gradients = categoryGradients[categorySlug] || categoryGradients["default"];
          return (
            <>
              <div className={`absolute top-0 inset-x-0 h-[400px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] ${gradients.primary} pointer-events-none`} />
              <div className={`absolute top-0 left-0 w-full h-[400px] bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] ${gradients.secondary} pointer-events-none`} />
            </>
          );
        })()}

        {/* メインコンテンツ */}
        <main className="max-w-3xl mx-auto px-6 md:px-10 py-12 relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Navigation */}
            <motion.div variants={fadeInUp} className="mb-12">
              <button
                onClick={() => navigate("/feedbacks")}
                className="bg-white border border-[#EBEBEB] flex gap-2 items-center px-3 py-[7px] rounded-xl shadow-[0px_1px_1px_0px_rgba(0,0,0,0.08),0px_0px_0px_0px_rgba(0,0,0,0),0px_0px_3px_0px_rgba(0,0,0,0.04)] hover:bg-gray-50 transition"
              >
                <ArrowLeft className="size-5 text-black" strokeWidth={2} />
                <span className="font-noto-sans-jp font-semibold text-sm text-black">
                  フィードバック一覧へ
                </span>
              </button>
            </motion.div>

            {/* Header Section */}
            <motion.div variants={fadeInUp} className="mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border shadow-sm mb-6">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {feedback.category?.title || "フィードバック"}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-[42px] font-bold text-foreground leading-[1.3] tracking-tight font-rounded-mplus mb-6">
                {feedback.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-[#FF6B4A] flex items-center justify-center">
                    <img
                      src="/images/authors/kaikun.jpg"
                      alt="カイクン"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<span class="text-white text-[10px] font-bold">K</span>';
                      }}
                    />
                  </div>
                  <span className="font-medium text-foreground">
                    カイクン
                  </span>
                </div>
                {publishedDate && (
                  <>
                    <span className="text-border">•</span>
                    <span>{publishedDate}</span>
                  </>
                )}
                {feedback.category && (
                  <>
                    <span className="text-border">•</span>
                    <Badge
                      variant="secondary"
                      className="font-normal bg-muted hover:bg-muted/80 border-transparent text-muted-foreground"
                    >
                      {feedback.category.title}
                    </Badge>
                  </>
                )}
              </div>
            </motion.div>

            {/* Request Context (Card) - 対象アウトプット + 依頼内容 */}
            {(feedback.requestContent?.length > 0 || feedback.targetOutput) && (
              <motion.div variants={fadeInUp} className="mb-12">
                <div className="bg-background/60 backdrop-blur-sm rounded-2xl border border-border/60 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-1.5 bg-muted rounded-lg">
                      <User className="size-4 text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      メンバーからのFB依頼内容
                    </h3>
                  </div>

                  {/* 対象アウトプット */}
                  {feedback.targetOutput && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
                      <FileText className="size-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <span className="text-xs text-muted-foreground">対象アウトプット</span>
                        <p className="text-sm font-medium text-foreground">{feedback.targetOutput}</p>
                      </div>
                    </div>
                  )}

                  {/* 依頼内容 */}
                  {feedback.requestContent && feedback.requestContent.length > 0 && (
                    <div className="text-[15px] leading-relaxed text-muted-foreground">
                      <PortableText
                        value={feedback.requestContent}
                        components={portableTextComponents}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            <Separator className="mb-12 opacity-50" />

            {/* Main Content Body */}
            <motion.div variants={fadeInUp} className="space-y-10">
              {/* Access Check: Premium Content */}
              {hasAccess ? (
                <>
                  {/* フィードバック内容ブロック（レビューポイント + メインテキスト） */}
                  {(feedback.reviewPoints?.length > 0 || feedback.feedbackContent?.length > 0) && (
                    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                      {/* レビューのポイント */}
                      {feedback.reviewPoints && feedback.reviewPoints.length > 0 && (
                        <div className="bg-primary/5 p-6 border-b border-primary/10">
                          <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="size-5 text-primary" />
                            <h3 className="text-lg font-bold text-primary font-rounded-mplus">
                              レビューのポイント
                            </h3>
                          </div>
                          <div className="text-foreground">
                            <PortableText
                              value={feedback.reviewPoints}
                              components={portableTextComponents}
                            />
                          </div>
                        </div>
                      )}

                      {/* メインコンテンツ */}
                      {feedback.feedbackContent && feedback.feedbackContent.length > 0 && (
                        <div className="p-6">
                          <PortableText
                            value={feedback.feedbackContent}
                            components={portableTextComponents}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Video Section */}
                  {feedback.vimeoUrl && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <Play className="size-4 text-primary fill-primary" />
                          Video Review
                        </h4>
                      </div>
                      <VideoSection
                        videoUrl={feedback.vimeoUrl}
                        isPremium={isPremium}
                      />
                    </div>
                  )}

                  {/* Figma Link */}
                  {feedback.figmaUrl && (
                    <a
                      href={feedback.figmaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <div className="bg-muted/30 rounded-xl border border-border p-4 flex items-center justify-between group-hover:border-primary/50 group-hover:bg-muted/50 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-background rounded-xl border border-border flex items-center justify-center shadow-sm text-[#F24E1E] group-hover:scale-105 transition-transform">
                            <FileText className="size-6" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                              Open in Figma
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              実際の添削ファイルを確認する
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground group-hover:text-foreground"
                        >
                          <ArrowLeft className="size-4 rotate-180" />
                        </Button>
                      </div>
                    </a>
                  )}
                </>
              ) : (
                /* Non-Premium View */
                <>
                  {/* Partial Content Preview (Optional) */}
                  {feedback.reviewPoints && feedback.reviewPoints.length > 0 && (
                    <div className="relative">
                      <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 opacity-50 blur-[2px] select-none">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="size-5 text-primary" />
                          <h3 className="text-lg font-bold text-primary font-rounded-mplus">
                            レビューのポイント
                          </h3>
                        </div>
                        <div className="text-foreground h-24 overflow-hidden">
                          <PortableText
                            value={feedback.reviewPoints}
                            components={portableTextComponents}
                          />
                        </div>
                      </div>
                      {/* Lock Overlay for Points */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="size-8 text-muted-foreground/50" />
                      </div>
                    </div>
                  )}

                  <PremiumContentLock />
                </>
              )}
            </motion.div>

            {/* Related Feedbacks (Footer) */}
            {(relatedFeedbacks.length > 0 || recentFeedbacks.length > 0) && (
              <motion.div
                variants={fadeInUp}
                className="mt-20 pt-10 border-t border-border"
              >
                <h2 className="text-xl font-bold text-foreground mb-6 font-rounded-mplus">
                  他のフィードバックを見る
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(relatedFeedbacks.length > 0
                    ? relatedFeedbacks
                    : recentFeedbacks
                  ).map((f) => (
                    <FeedbackCard key={f._id} feedback={f} />
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </Layout>
  );
};

export default FeedbackDetail;
