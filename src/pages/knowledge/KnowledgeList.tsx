import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import {
  getAllKnowledge,
  getKnowledgeCategories,
  getKnowledgeByCategory,
} from "@/lib/sanity";
import type { Knowledge, KnowledgeCategory } from "@/types/sanity";
import Layout from "@/components/layout/Layout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import SEO from "@/components/common/SEO";
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

// カテゴリごとのデフォルト絵文字
const defaultCategoryEmoji: Record<string, string> = {
  "career": "🚀",
  "skill": "🛠️",
  "mindset": "💡",
  "process": "📋",
};

// ナレッジカード
const KnowledgeCard = ({ knowledge }: { knowledge: Knowledge }) => {
  const publishedDate = knowledge.publishedAt
    ? new Date(knowledge.publishedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const categorySlug = knowledge.category?.slug?.current || "";
  const emoji = knowledge.category?.emoji || defaultCategoryEmoji[categorySlug] || "📝";

  return (
    <motion.div variants={fadeInUp}>
      <Link
        to={`/knowledge/${knowledge.slug.current}`}
        className={cn(
          "bg-white flex flex-col rounded-[24px] shadow-[0px_1px_8px_0px_rgba(0,0,0,0.08)]",
          "cursor-pointer transition-all duration-200",
          "hover:shadow-[0px_1px_12px_0px_rgba(0,0,0,0.12)] hover:translate-y-[-2px]",
          "w-full h-full overflow-hidden",
          "min-h-[280px]"
        )}
      >
        {/* サムネイル */}
        {knowledge.thumbnailUrl ? (
          <div className="relative h-36 bg-gray-100">
            <img
              src={knowledge.thumbnailUrl}
              alt={knowledge.title}
              className="w-full h-full object-cover"
            />
            {knowledge.featured && (
              <span className="absolute top-2 left-2 px-2 py-1 text-xs bg-yellow-400 text-yellow-900 rounded-full font-medium">
                ⭐ 注目
              </span>
            )}
          </div>
        ) : (
          <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-4xl">{emoji}</span>
            {knowledge.featured && (
              <span className="absolute top-2 left-2 px-2 py-1 text-xs bg-yellow-400 text-yellow-900 rounded-full font-medium">
                ⭐ 注目
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 p-5 flex-1">
          {/* カテゴリバッジ */}
          {knowledge.category && (
            <div className="flex items-center">
              <span className="inline-flex items-center justify-center px-2.5 py-1.5 bg-primary/10 rounded-full">
                <span className="font-noto-sans-jp text-[12px] font-medium text-primary leading-none">
                  {emoji} {knowledge.category.title}
                </span>
              </span>
            </div>
          )}

          {/* タイトル */}
          <h3 className="font-rounded-mplus text-[15px] font-bold text-foreground leading-[1.5] line-clamp-2">
            {knowledge.title}
          </h3>

          {/* 概要 */}
          <p className="font-noto-sans-jp text-[13px] text-muted-foreground leading-[1.6] line-clamp-2 flex-1">
            {knowledge.excerpt}
          </p>

          {/* タグ */}
          {knowledge.tags && knowledge.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {knowledge.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[11px] bg-gray-100 text-muted-foreground rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

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

const KnowledgeList = () => {
  const [knowledgeList, setKnowledgeList] = useState<Knowledge[]>([]);
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [knowledgeData, categoriesData] = await Promise.all([
          getAllKnowledge(),
          getKnowledgeCategories(),
        ]);
        setKnowledgeList(knowledgeData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching knowledge:", err);
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
          const filtered = await getKnowledgeByCategory(selectedCategory);
          setKnowledgeList(filtered);
        } catch (err) {
          console.error("Error fetching filtered knowledge:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(true);
        try {
          const all = await getAllKnowledge();
          setKnowledgeList(all);
        } catch (err) {
          console.error("Error fetching all knowledge:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFiltered();
  }, [selectedCategory]);

  if (loading && knowledgeList.length === 0) {
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
        title="お役立ちナレッジ"
        description="BONOのナレッジベース。キャリア、スキル、マインドセット、実務プロセスなど、デザイナーに役立つ情報をまとめています。"
        ogUrl="/knowledge"
        ogType="website"
      />
      <div className="min-h-screen w-full">
        {/* メインコンテンツ */}
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
          {/* ページヘッダー */}
          <PageHeader
            label="Knowledge"
            title="お役立ちナレッジ"
            description="デザイナーのキャリアやスキルアップに役立つ情報をまとめています"
          />

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
                {cat.emoji && `${cat.emoji} `}{cat.title}
              </Button>
            ))}
          </motion.div>

          {/* ナレッジグリッド */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : knowledgeList.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-muted-foreground">ナレッジがまだありません</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {knowledgeList.map((knowledge) => (
                <KnowledgeCard key={knowledge._id} knowledge={knowledge} />
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </Layout>
  );
};

export default KnowledgeList;
