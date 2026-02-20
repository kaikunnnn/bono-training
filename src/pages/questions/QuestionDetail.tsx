import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import {
  getQuestion,
  getRelatedQuestions,
  getRecentQuestions,
} from "@/lib/sanity";
import type { Question } from "@/types/sanity";
import { PortableText } from "@portabletext/react";
import Layout from "@/components/layout/Layout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import SEO from "@/components/common/SEO";

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

// PortableText用のコンポーネント（RichTextSectionから簡略化）
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

// 質問カード（関連質問・最近の質問用）
const QuestionCard = ({ question }: { question: Question }) => (
  <Link
    to={`/questions/${question.slug.current}`}
    className="block p-4 bg-white rounded-lg border border-border hover:border-primary hover:shadow-md transition-all"
  >
    <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full mb-2">
      {question.category?.title || "カテゴリなし"}
    </span>
    <h3 className="text-[15px] font-medium text-foreground line-clamp-2">
      {question.title}
    </h3>
  </Link>
);

const QuestionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [relatedQuestions, setRelatedQuestions] = useState<Question[]>([]);
  const [recentQuestions, setRecentQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) {
        setError("質問のスラッグが指定されていません");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getQuestion(slug);

        if (!data) {
          setError("質問が見つかりませんでした");
          setLoading(false);
          return;
        }

        setQuestion(data);

        // 関連質問と最近の質問を取得
        if (data.category?.slug?.current) {
          const related = await getRelatedQuestions(
            data.category.slug.current,
            slug,
            3,
          );
          setRelatedQuestions(related);
        }

        const recent = await getRecentQuestions(3, slug);
        setRecentQuestions(recent);
      } catch (err) {
        console.error("Error fetching question:", err);
        setError("質問の取得中にエラーが発生しました");
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

  if (error || !question) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">
              {error || "質問が見つかりませんでした"}
            </p>
            <Button variant="default" onClick={() => navigate("/questions")}>
              質問一覧に戻る
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const publishedDate = question.publishedAt
    ? new Date(question.publishedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <Layout>
      <SEO
        title={question.title}
        description={`${question.category?.title || "質問"}：${question.title}`}
        ogUrl={`/questions/${slug}`}
        ogType="article"
      />
      <div className="min-h-screen w-full bg-base">
        {/* メインコンテンツ */}
        <main className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
          {/* 戻るボタン */}
          <div className="mb-12">
            <button
              onClick={() => navigate("/questions")}
              className="bg-white border border-[#EBEBEB] flex gap-2 items-center px-3 py-[7px] rounded-xl shadow-[0px_1px_1px_0px_rgba(0,0,0,0.08),0px_0px_0px_0px_rgba(0,0,0,0),0px_0px_3px_0px_rgba(0,0,0,0.04)] hover:bg-gray-50 transition"
            >
              <ArrowLeft className="size-5 text-black" strokeWidth={2} />
              <span className="font-noto-sans-jp font-semibold text-sm text-black">
                質問一覧へ
              </span>
            </button>
          </div>

          <motion.div
            className="flex flex-col gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* ヘッダー部分：タイトル + カテゴリ・日付 */}
            <motion.div variants={fadeInUp} className="flex flex-col gap-4 border-b border-[#d0d5dd] pb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-black font-rounded-mplus leading-tight">
                {question.title}
              </h1>
              <div className="flex items-center gap-3 text-sm">
                {question.category && (
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                    {question.category.title}
                  </span>
                )}
                {publishedDate && (
                  <span className="text-muted-foreground">{publishedDate}</span>
                )}
              </div>
            </motion.div>

            {/* 質問ブロック */}
            <motion.div variants={fadeInUp} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden">
                  <img
                    src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Neutral%20face/3D/neutral_face_3d.png"
                    alt="BONOメンバー"
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-medium text-foreground">
                    BONOメンバー
                  </span>
                  <span className="px-2 py-0.5 text-[11px] font-medium bg-blue-100 text-blue-700 rounded">
                    質問
                  </span>
                </div>
              </div>
              <div className="ml-[52px] p-5 bg-white rounded-2xl border border-border">
                {question.questionContent &&
                question.questionContent.length > 0 ? (
                  <PortableText
                    value={question.questionContent}
                    components={portableTextComponents}
                  />
                ) : (
                  <p className="text-muted-foreground">質問内容がありません</p>
                )}
              </div>
            </motion.div>

            {/* 回答ブロック */}
            <motion.div variants={fadeInUp} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#FF6B4A] flex items-center justify-center">
                  <img
                    src="/images/authors/kaikun.jpg"
                    alt="カイクン"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // 画像が読み込めない場合はフォールバック表示
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<span class="text-white text-sm font-bold">K</span>';
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-medium text-foreground">
                    カイクン
                  </span>
                  <span className="px-2 py-0.5 text-[11px] font-medium bg-orange-100 text-orange-700 rounded">
                    回答
                  </span>
                </div>
              </div>
              <div className="ml-[52px] p-5 bg-white rounded-2xl shadow-sm">
                {question.answerContent && question.answerContent.length > 0 ? (
                  <PortableText
                    value={question.answerContent}
                    components={portableTextComponents}
                  />
                ) : (
                  <p className="text-muted-foreground">回答内容がありません</p>
                )}
              </div>
            </motion.div>

            {/* 関連質問 */}
            {relatedQuestions.length > 0 && (
              <motion.div
                variants={fadeInUp}
                className="mt-8 pt-8 border-t border-border"
              >
                <h2 className="text-lg font-bold text-foreground mb-4 font-rounded-mplus">
                  関連する質問
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedQuestions.map((q) => (
                    <QuestionCard key={q._id} question={q} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* 最近の質問 */}
            {recentQuestions.length > 0 && (
              <motion.div
                variants={fadeInUp}
                className="mt-4 pt-8 border-t border-border"
              >
                <h2 className="text-lg font-bold text-foreground mb-4 font-rounded-mplus">
                  最近の質問
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentQuestions.map((q) => (
                    <QuestionCard key={q._id} question={q} />
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

export default QuestionDetail;
