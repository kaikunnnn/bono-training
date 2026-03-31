import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PenSquare } from "lucide-react";
import { motion } from "framer-motion";
import {
  getAllQuestions,
  getQuestionCategories,
  getQuestionsByCategory,
} from "@/lib/sanity";
import type { Question, QuestionCategory } from "@/types/sanity";
import Layout from "@/components/layout/Layout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PageHeader from "@/components/common/PageHeader";
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
      staggerChildren: 0.05,
    },
  },
};

// 質問カード
const QuestionCard = ({ question }: { question: Question }) => {
  const publishedDate = question.publishedAt
    ? new Date(question.publishedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <motion.div variants={fadeInUp}>
      <Link
        to={`/questions/${question.slug.current}`}
        className="block p-5 bg-white rounded-xl border border-[#E5E7EB] hover:border-primary hover:shadow-lg transition-all group"
      >
        <div className="flex items-start gap-4">
          {/* アイコン */}
          <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-lg flex-shrink-0">
            💭
          </div>

          {/* コンテンツ */}
          <div className="flex-1 min-w-0">
            {/* タイトル + カテゴリ・日付 */}
            <div className="flex flex-col gap-2">
              <h3 className="text-[16px] font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-0">
                {question.title}
              </h3>
              <div className="flex items-center gap-2">
                {question.category && (
                  <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full font-medium">
                    {question.category.title}
                  </span>
                )}
                {publishedDate && (
                  <span className="text-xs text-muted-foreground">
                    {publishedDate}
                  </span>
                )}
              </div>
            </div>

            {/* 質問内容プレビュー */}
            {question.questionExcerpt && (
              <p className="text-[14px] text-muted-foreground line-clamp-2 mt-2">
                {question.questionExcerpt}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const QuestionList = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [questionsData, categoriesData] = await Promise.all([
          getAllQuestions(),
          getQuestionCategories(),
        ]);
        setQuestions(questionsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching questions:", err);
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
          const filtered = await getQuestionsByCategory(selectedCategory);
          setQuestions(filtered);
        } catch (err) {
          console.error("Error fetching filtered questions:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(true);
        try {
          const all = await getAllQuestions();
          setQuestions(all);
        } catch (err) {
          console.error("Error fetching all questions:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFiltered();
  }, [selectedCategory]);

  if (loading && questions.length === 0) {
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
        title="みんなの質問"
        description="BONOメンバーから寄せられた質問と回答をまとめています。Figmaの使い方、キャリア相談、デザイン全般など様々なカテゴリの質問が閲覧できます。"
        ogUrl="/questions"
        ogType="website"
      />
      <div className="min-h-screen w-full">
        {/* メインコンテンツ */}
        <main className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
          {/* ページヘッダー */}
          <PageHeader
            label="Q&A"
            title="みんなの質問"
            description="BONOメンバーから寄せられた質問と回答をまとめています"
          >
            <Link to="/questions/new">
              <Button variant="default" size="medium">
                <PenSquare className="mr-2 h-4 w-4" />
                質問する
              </Button>
            </Link>
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

          {/* 質問リスト */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">質問がまだありません</p>
            </div>
          ) : (
            <motion.div
              className="flex flex-col gap-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {questions.map((question) => (
                <QuestionCard key={question._id} question={question} />
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </Layout>
  );
};

export default QuestionList;
