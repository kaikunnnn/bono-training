import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Play, FileText } from "lucide-react";
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

// PortableText用のコンポーネント
const portableTextComponents = {
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-[20px] md:text-[24px] font-semibold leading-[32px] text-foreground mt-8 mb-4 first:mt-0 font-rounded-mplus">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-[18px] md:text-[20px] font-semibold leading-[28px] text-foreground mt-6 mb-3 font-rounded-mplus">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-[16px] md:text-[18px] font-semibold leading-[26px] text-foreground mt-5 mb-2 font-rounded-mplus">
        {children}
      </h4>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-border bg-muted py-4 px-6 my-4 text-[16px] md:text-[18px] leading-[200%] text-foreground">
        {children}
      </blockquote>
    ),
    normal: ({ children }: any) => (
      <p
        className="text-[16px] md:text-[18px] leading-[200%] text-foreground mb-4"
        style={{ letterSpacing: "0.03em" }}
      >
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul
        className="list-disc mb-4 space-y-2"
        style={{ paddingLeft: "21.5px" }}
      >
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol
        className="list-decimal mb-4 space-y-2"
        style={{ paddingLeft: "21.5px" }}
      >
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li className="text-[16px] md:text-[18px] leading-[200%] text-foreground">
        {children}
      </li>
    ),
    number: ({ children }: any) => (
      <li className="text-[16px] md:text-[18px] leading-[200%] text-foreground">
        {children}
      </li>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <strong
        className="font-bold"
        style={{ background: "linear-gradient(transparent 60%, #FED7AA 60%)" }}
      >
        {children}
      </strong>
    ),
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
    link: ({ children, value }: any) => (
      <a
        href={value?.href || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline hover:text-primary/80"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }: any) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-6">
          <img
            src={value.asset.url}
            alt={value.alt || ""}
            className="w-full h-auto rounded-lg"
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
    className="block p-4 bg-white rounded-lg border border-border hover:border-primary hover:shadow-md transition-all"
  >
    <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full mb-2">
      {feedback.category?.title || "カテゴリなし"}
    </span>
    <h3 className="text-[15px] font-medium text-foreground line-clamp-2">
      {feedback.title}
    </h3>
  </Link>
);

// プレミアムコンテンツロック表示（フル）
const PremiumContentLock = () => {
  const navigate = useNavigate();

  return (
    <div className="relative p-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-4">
          <Lock className="w-8 h-8 text-primary" strokeWidth={2} />
        </div>
        <h3 className="font-noto-sans-jp font-bold text-lg text-gray-800 mb-2">
          プレミアムコンテンツ
        </h3>
        <p className="font-noto-sans-jp text-sm text-gray-600 mb-4">
          フィードバックの詳細を閲覧するにはメンバーシップの登録が必要です
        </p>
        <Button onClick={() => navigate("/subscription")}>
          プランを確認する
        </Button>
      </div>
    </div>
  );
};

// フィードバックプレビュー（冒頭だけ見せてフェードアウト）
const FeedbackPreview = ({ blocks }: { blocks: any[] }) => {
  const navigate = useNavigate();
  // 最初の3ブロックだけ表示
  const previewBlocks = blocks.slice(0, 3);

  return (
    <div className="relative">
      {/* プレビュー部分 */}
      <div className="relative">
        <PortableText value={previewBlocks} components={portableTextComponents} />

        {/* グラデーションオーバーレイ */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
      </div>

      {/* ロック表示 */}
      <div className="relative -mt-8 pt-8 pb-6 bg-white">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
            <Lock className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            続きを読むにはメンバーシップの登録が必要です
          </p>
          <Button size="sm" onClick={() => navigate("/subscription")}>
            プランを確認する
          </Button>
        </div>
      </div>
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
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error || !feedback) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">
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
        description={`${feedback.category?.title || "フィードバック"}：${feedback.title}`}
        ogUrl={`/feedbacks/${slug}`}
        ogType="article"
      />
      <div className="min-h-screen w-full bg-base">
        {/* メインコンテンツ */}
        <main className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
          {/* 戻るボタン */}
          <div className="mb-12">
            <button
              onClick={() => navigate("/feedbacks")}
              className="bg-white border border-[#EBEBEB] flex gap-2 items-center px-3 py-[7px] rounded-xl shadow-[0px_1px_1px_0px_rgba(0,0,0,0.08),0px_0px_0px_0px_rgba(0,0,0,0),0px_0px_3px_0px_rgba(0,0,0,0.04)] hover:bg-gray-50 transition"
            >
              <ArrowLeft className="size-5 text-black" strokeWidth={2} />
              <span className="font-noto-sans-jp font-semibold text-sm text-black">
                フィードバック一覧へ
              </span>
            </button>
          </div>

          <motion.div
            className="flex flex-col gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* ===== 公開エリア ===== */}

            {/* ヘッダー部分：タイトル */}
            <motion.div variants={fadeInUp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 border-b border-[#d0d5dd] pb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-black font-rounded-mplus leading-tight">
                  {feedback.title}
                </h1>
                {/* カテゴリ・対象アウトプット・日付 */}
                <div className="flex items-center gap-3 text-sm flex-wrap">
                  {feedback.category && (
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                      {feedback.category.title}
                    </span>
                  )}
                  {feedback.targetOutput && (
                    <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full">
                      {feedback.targetOutput}
                    </span>
                  )}
                  {publishedDate && (
                    <span className="text-muted-foreground">{publishedDate}</span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* 依頼内容セクション（公開） */}
            {feedback.requestContent && feedback.requestContent.length > 0 && (
              <motion.div variants={fadeInUp}>
                {/* 依頼者のイメージ */}
                <div className="flex items-start gap-4">
                  {/* アバター（匿名ユーザー） */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-medium">?</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* ヘッダー */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">メンバーからの依頼</span>
                    </div>

                    {/* 対象アウトプット */}
                    {feedback.targetOutput && (
                      <p className="text-xs text-muted-foreground mb-3">
                        📎 {feedback.targetOutput}
                      </p>
                    )}

                    {/* 吹き出し風の依頼内容 */}
                    <div className="relative bg-gray-50 rounded-2xl rounded-tl-sm p-4 border border-gray-200">
                      <div className="text-[15px] leading-relaxed text-foreground">
                        <PortableText
                          value={feedback.requestContent}
                          components={portableTextComponents}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ===== プレミアムエリア ===== */}

            {/* フィードバック内容セクション */}
            <motion.div variants={fadeInUp}>
              <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Play className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground font-rounded-mplus">
                    フィードバック内容
                  </h2>
                  {!hasAccess && (
                    <span className="ml-auto px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      メンバー限定
                    </span>
                  )}
                </div>

                {hasAccess ? (
                  /* プレミアムユーザー：全て表示 */
                  <div className="flex flex-col gap-6">
                    {/* 動画 */}
                    {feedback.vimeoUrl && (
                      <div className="mb-4">
                        <VideoSection
                          videoUrl={feedback.vimeoUrl}
                          isPremium={isPremium}
                        />
                      </div>
                    )}

                    {/* Figma URL */}
                    {feedback.figmaUrl && (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-sm text-muted-foreground mb-2">Figmaファイル</p>
                        <a
                          href={feedback.figmaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 underline text-sm break-all"
                        >
                          {feedback.figmaUrl}
                        </a>
                      </div>
                    )}

                    {/* 観点・ポイント */}
                    {feedback.reviewPoints && feedback.reviewPoints.length > 0 && (
                      <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-sm font-medium text-blue-800 mb-2">観点・ポイント</p>
                        <div className="text-[15px]">
                          <PortableText
                            value={feedback.reviewPoints}
                            components={portableTextComponents}
                          />
                        </div>
                      </div>
                    )}

                    {/* フィードバック本文 */}
                    {feedback.feedbackContent && feedback.feedbackContent.length > 0 && (
                      <div className="pt-4 border-t border-gray-100">
                        <PortableText
                          value={feedback.feedbackContent}
                          components={portableTextComponents}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  /* 非プレミアムユーザー：冒頭だけ見せる */
                  feedback.feedbackContent && feedback.feedbackContent.length > 0 ? (
                    <FeedbackPreview blocks={feedback.feedbackContent} />
                  ) : (
                    <PremiumContentLock />
                  )
                )}
              </div>
            </motion.div>

            {/* 関連フィードバック */}
            {relatedFeedbacks.length > 0 && (
              <motion.div
                variants={fadeInUp}
                className="mt-8 pt-8 border-t border-border"
              >
                <h2 className="text-lg font-bold text-foreground mb-4 font-rounded-mplus">
                  関連するフィードバック
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedFeedbacks.map((f) => (
                    <FeedbackCard key={f._id} feedback={f} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* 最近のフィードバック */}
            {recentFeedbacks.length > 0 && (
              <motion.div
                variants={fadeInUp}
                className="mt-4 pt-8 border-t border-border"
              >
                <h2 className="text-lg font-bold text-foreground mb-4 font-rounded-mplus">
                  最近のフィードバック
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentFeedbacks.map((f) => (
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
