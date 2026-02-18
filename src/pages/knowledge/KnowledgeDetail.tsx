import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Tag } from "lucide-react";
import {
  getKnowledge,
  getRelatedKnowledge,
  getRecentKnowledge,
} from "@/lib/sanity";
import type { Knowledge } from "@/types/sanity";
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

// ナレッジカード（関連ナレッジ用）
const KnowledgeCard = ({ knowledge }: { knowledge: Knowledge }) => (
  <Link
    to={`/knowledge/${knowledge.slug.current}`}
    className="block p-4 bg-white rounded-lg border border-border hover:border-primary hover:shadow-md transition-all"
  >
    <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full mb-2">
      {knowledge.category?.emoji} {knowledge.category?.title || "カテゴリなし"}
    </span>
    <h3 className="text-[15px] font-medium text-foreground line-clamp-2">
      {knowledge.title}
    </h3>
  </Link>
);

const KnowledgeDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [knowledge, setKnowledge] = useState<Knowledge | null>(null);
  const [relatedKnowledge, setRelatedKnowledge] = useState<Knowledge[]>([]);
  const [recentKnowledge, setRecentKnowledge] = useState<Knowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) {
        setError("ナレッジのスラッグが指定されていません");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getKnowledge(slug);

        if (!data) {
          setError("ナレッジが見つかりませんでした");
          setLoading(false);
          return;
        }

        setKnowledge(data);

        // 関連ナレッジと最近のナレッジを取得
        if (data.category?.slug?.current) {
          const related = await getRelatedKnowledge(
            data.category.slug.current,
            slug,
            3
          );
          setRelatedKnowledge(related);
        }

        const recent = await getRecentKnowledge(3, slug);
        setRecentKnowledge(recent);
      } catch (err) {
        console.error("Error fetching knowledge:", err);
        setError("ナレッジの取得中にエラーが発生しました");
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

  if (error || !knowledge) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">
              {error || "ナレッジが見つかりませんでした"}
            </p>
            <Button variant="default" onClick={() => navigate("/knowledge")}>
              ナレッジ一覧に戻る
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const publishedDate = knowledge.publishedAt
    ? new Date(knowledge.publishedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <Layout>
      <SEO
        title={knowledge.title}
        description={knowledge.excerpt}
        ogUrl={`/knowledge/${slug}`}
        ogType="article"
      />
      <div className="min-h-screen w-full bg-base">
        {/* メインコンテンツ */}
        <main className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
          {/* 戻るボタン */}
          <div className="mb-12">
            <button
              onClick={() => navigate("/knowledge")}
              className="bg-white border border-[#EBEBEB] flex gap-2 items-center px-3 py-[7px] rounded-xl shadow-[0px_1px_1px_0px_rgba(0,0,0,0.08),0px_0px_0px_0px_rgba(0,0,0,0),0px_0px_3px_0px_rgba(0,0,0,0.04)] hover:bg-gray-50 transition"
            >
              <ArrowLeft className="size-5 text-black" strokeWidth={2} />
              <span className="font-noto-sans-jp font-semibold text-sm text-black">
                ナレッジ一覧へ
              </span>
            </button>
          </div>

          <motion.div
            className="flex flex-col gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* ヘッダー部分 */}
            <motion.div variants={fadeInUp} className="flex flex-col gap-4">
              {/* サムネイル */}
              {knowledge.thumbnailUrl && (
                <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-4">
                  <img
                    src={knowledge.thumbnailUrl}
                    alt={knowledge.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex flex-col gap-4 border-b border-[#d0d5dd] pb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-black font-rounded-mplus leading-tight">
                  {knowledge.title}
                </h1>
                {/* カテゴリ・日付 */}
                <div className="flex items-center gap-3 text-sm flex-wrap">
                  {knowledge.category && (
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                      {knowledge.category.emoji} {knowledge.category.title}
                    </span>
                  )}
                  {publishedDate && (
                    <span className="text-muted-foreground">{publishedDate}</span>
                  )}
                </div>
                {/* タグ */}
                {knowledge.tags && knowledge.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    {knowledge.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 text-muted-foreground rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* 本文 */}
            <motion.div variants={fadeInUp}>
              <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                {knowledge.content && knowledge.content.length > 0 ? (
                  <PortableText
                    value={knowledge.content}
                    components={portableTextComponents}
                  />
                ) : (
                  <p className="text-muted-foreground">コンテンツがありません</p>
                )}
              </div>
            </motion.div>

            {/* 関連ナレッジ */}
            {relatedKnowledge.length > 0 && (
              <motion.div
                variants={fadeInUp}
                className="mt-8 pt-8 border-t border-border"
              >
                <h2 className="text-lg font-bold text-foreground mb-4 font-rounded-mplus">
                  関連するナレッジ
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedKnowledge.map((k) => (
                    <KnowledgeCard key={k._id} knowledge={k} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* 最近のナレッジ */}
            {recentKnowledge.length > 0 && (
              <motion.div
                variants={fadeInUp}
                className="mt-4 pt-8 border-t border-border"
              >
                <h2 className="text-lg font-bold text-foreground mb-4 font-rounded-mplus">
                  最近のナレッジ
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentKnowledge.map((k) => (
                    <KnowledgeCard key={k._id} knowledge={k} />
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

export default KnowledgeDetail;
