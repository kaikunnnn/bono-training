import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
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

// PortableText用のコンポーネント - スクショ参考のクリーンなスタイル
const portableTextComponents = {
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-[24px] md:text-[28px] font-bold leading-[1.3] text-[#1a1a1a] mt-12 mb-4 first:mt-0 font-rounded-mplus">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-[20px] md:text-[22px] font-bold leading-[1.4] text-[#1a1a1a] mt-10 mb-3 font-rounded-mplus">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-[18px] md:text-[20px] font-semibold leading-[1.4] text-[#1a1a1a] mt-8 mb-2 font-rounded-mplus">
        {children}
      </h4>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-[#E0E0E0] bg-[#FAFAFA] py-4 px-6 my-6 text-[16px] md:text-[18px] leading-[1.8] text-[#444444] rounded-r-lg">
        {children}
      </blockquote>
    ),
    normal: ({ children }: any) => (
      <p className="text-[16px] md:text-[18px] leading-[1.9] text-[#333333] mb-5 tracking-[0.02em]">
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc mb-5 space-y-2 pl-6 text-[#333333]">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal mb-5 space-y-2 pl-6 text-[#333333]">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li className="text-[16px] md:text-[18px] leading-[1.8] text-[#333333]">
        {children}
      </li>
    ),
    number: ({ children }: any) => (
      <li className="text-[16px] md:text-[18px] leading-[1.8] text-[#333333]">
        {children}
      </li>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <strong
        className="font-bold text-[#1a1a1a]"
        style={{ background: "linear-gradient(transparent 60%, #FED7AA 60%)" }}
      >
        {children}
      </strong>
    ),
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => (
      <code className="bg-[#F5F5F5] px-1.5 py-0.5 rounded text-[15px] font-mono text-[#E53E3E]">
        {children}
      </code>
    ),
    link: ({ children, value }: any) => (
      <a
        href={value?.href || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#2563EB] underline decoration-[#2563EB]/30 hover:decoration-[#2563EB] transition-colors"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }: any) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-8 md:my-10">
          <img
            src={value.asset.url}
            alt={value.alt || ""}
            className="w-full h-auto rounded-xl"
            loading="lazy"
          />
          {value.caption && (
            <figcaption className="mt-3 text-[14px] text-[#888888] text-center">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

// ナレッジカード（関連ナレッジ用）- クリーンなスタイル
const KnowledgeCard = ({ knowledge }: { knowledge: Knowledge }) => (
  <Link
    to={`/knowledge/${knowledge.slug.current}`}
    className="group block p-5 bg-white rounded-xl border border-[#EBEBEB] hover:border-[#D0D0D0] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-200"
  >
    <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] bg-[#F5F5F5] text-[#666666] rounded-md mb-3 font-medium">
      {knowledge.category?.emoji && <span>{knowledge.category.emoji}</span>}
      <span>{knowledge.category?.title || "カテゴリなし"}</span>
    </span>
    <h3 className="text-[15px] font-semibold text-[#1a1a1a] leading-[1.5] line-clamp-2 group-hover:text-[#2563EB] transition-colors">
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
        <main className="max-w-[880px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* 戻るボタン */}
          <div className="mb-8 md:mb-12">
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
            className="flex flex-col"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* ヘッダー部分 - スクショ参考のレイアウト */}
            <motion.header variants={fadeInUp} className="mb-12 md:mb-16">
              {/* カテゴリバッジ（最上部） */}
              {knowledge.category && (
                <div className="mb-4 md:mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F4FD] text-[#1E6BB8] rounded-md text-xs font-medium tracking-wide">
                    {knowledge.category.emoji && (
                      <span className="text-sm">{knowledge.category.emoji}</span>
                    )}
                    <span className="uppercase">{knowledge.category.title}</span>
                  </span>
                </div>
              )}

              {/* メインタイトル */}
              <h1 className="text-[28px] md:text-[40px] lg:text-[44px] font-bold text-[#1a1a1a] font-rounded-mplus leading-[1.2] md:leading-[1.15] tracking-tight mb-5 md:mb-6">
                {knowledge.title}
              </h1>

              {/* 説明文（excerpt） */}
              {knowledge.excerpt && (
                <p className="text-[16px] md:text-[18px] lg:text-[20px] text-[#555555] leading-[1.7] max-w-[640px] mb-6 md:mb-8">
                  {knowledge.excerpt}
                </p>
              )}

              {/* メタ情報（日付・タグ） */}
              <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-[#E5E5E5]">
                {publishedDate && (
                  <span className="text-[14px] text-[#888888]">{publishedDate}</span>
                )}
                {knowledge.tags && knowledge.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    {knowledge.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 text-xs bg-[#F5F5F5] text-[#666666] rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.header>

            {/* サムネイル（ヘッダーとコンテンツの間） */}
            {knowledge.thumbnailUrl && (
              <motion.div variants={fadeInUp} className="mb-10 md:mb-14">
                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-[#F0F0F0]">
                  <img
                    src={knowledge.thumbnailUrl}
                    alt={knowledge.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            )}

            {/* 本文 */}
            <motion.article variants={fadeInUp}>
              <div className="prose-container">
                {knowledge.content && knowledge.content.length > 0 ? (
                  <PortableText
                    value={knowledge.content}
                    components={portableTextComponents}
                  />
                ) : (
                  <p className="text-muted-foreground">コンテンツがありません</p>
                )}
              </div>
            </motion.article>

            {/* 関連ナレッジ */}
            {relatedKnowledge.length > 0 && (
              <motion.section
                variants={fadeInUp}
                className="mt-16 md:mt-20 pt-10 md:pt-12 border-t border-[#E5E5E5]"
              >
                <h2 className="text-[20px] md:text-[24px] font-bold text-[#1a1a1a] mb-6 font-rounded-mplus">
                  関連するナレッジ
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedKnowledge.map((k) => (
                    <KnowledgeCard key={k._id} knowledge={k} />
                  ))}
                </div>
              </motion.section>
            )}

            {/* 最近のナレッジ */}
            {recentKnowledge.length > 0 && (
              <motion.section
                variants={fadeInUp}
                className="mt-10 md:mt-12 pt-10 md:pt-12 border-t border-[#E5E5E5]"
              >
                <h2 className="text-[20px] md:text-[24px] font-bold text-[#1a1a1a] mb-6 font-rounded-mplus">
                  最近のナレッジ
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentKnowledge.map((k) => (
                    <KnowledgeCard key={k._id} knowledge={k} />
                  ))}
                </div>
              </motion.section>
            )}
          </motion.div>
        </main>
      </div>
    </Layout>
  );
};

export default KnowledgeDetail;
