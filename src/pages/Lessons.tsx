import { useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "framer-motion";
import { urlFor } from "@/lib/sanity";
import Layout from "@/components/layout/Layout";
import { useLessons } from "@/hooks/useLessons";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PageHeader from "@/components/common/PageHeader";
import LessonCard from "@/components/lessons/LessonCard";
import SectionHeading from "@/components/common/SectionHeading";
import { Lesson } from "@/types/lesson";
import { SanityLesson } from "@/types/sanity";

// セクション定義
// タブ順序: すべて → 進め方 → UIデザイン → UXデザイン → キャリア → AI → ビジュアル → Figma → ラジオ
interface SubSection {
  id: string;
  label: string;  // 補足（例: "実務・プロセス"）
  title: string;  // セクション名（例: "1本目立ち回り / デザインサイクル"）
  lessonTitles: string[];  // このセクションに属するレッスンタイトル（部分一致）
}

interface Section {
  id: string;
  label: string;
  subSections: SubSection[];
  categories: string[];  // Sanityカテゴリとのマッチング用
}

const SECTIONS: Section[] = [
  {
    id: 'process',
    label: '進め方',
    subSections: [
      {
        id: 'cycle',
        label: '実務・プロセス',
        title: '1本目立ち回り / デザインサイクル',
        lessonTitles: ['デザインサイクル', '1年目の立ち回り']
      },
      {
        id: 'basics',
        label: '入門・基礎',
        title: 'ゼロから情報・デザインの基本の進め方を習得',
        lessonTitles: ['ゼロからはじめる', 'はじめての']
      }
    ],
    categories: []  // BONOカテゴリは「その他」へ
  },
  {
    id: 'ui',
    label: 'UIデザイン',
    subSections: [
      {
        id: 'style',
        label: 'スタイル',
        title: 'UIのつくり方をはじめよう',
        lessonTitles: ['UIビジュアル', 'UIタイポグラフィ', 'UIトレース', 'Webデザインの組み立て', '実装とデザイン']
      },
      {
        id: 'ia',
        label: '情報設計・IA',
        title: '情報設計・使いやすいUIづくりの方法論',
        lessonTitles: ['使いやすいUI', '3構造', 'OOUI', 'UIデザインの基本', 'ナビゲーションUI', 'UIアイデア', 'UI PATTERN', '目的達成', '情報設計']
      },
      {
        id: 'components',
        label: 'コンポーネント・構造',
        title: 'UIの詳細・UIの仕組みと構造',
        lessonTitles: ['マテリアルデザイン', 'Material Design', 'Material You']
      },
      {
        id: 'practice',
        label: 'ハンズオン',
        title: '実践・課題',
        lessonTitles: ['DailyUI', '賃貸アプリ', '出張申請']
      }
    ],
    categories: ['UI', '情報設計']
  },
  {
    id: 'ux',
    label: 'UXデザイン',
    subSections: [
      {
        id: 'experience',
        label: '体験設計',
        title: 'UXデザイン・ユーザーに合った体験を設計',
        lessonTitles: ['UXデザイン', '顧客体験', 'サービスをデザイン']
      },
      {
        id: 'research',
        label: 'リサーチ・分析',
        title: 'UXリサーチ / 課題分析・ユーザー理解で問いを解こう',
        lessonTitles: ['ユーザーインタビュー', 'FAILURE POINT', '商品ページ改善']
      }
    ],
    categories: ['UX']
  },
  {
    id: 'career',
    label: 'キャリア',
    subSections: [
      {
        id: 'job',
        label: '転職・キャリア',
        title: 'ポートフォリオ / 会社の選び方・転職に必要なヒント',
        lessonTitles: ['ポートフォリオ', 'デザイナーになる条件', 'キャリア相談', '勉強会']
      }
    ],
    categories: ['キャリア']
  },
  {
    id: 'ai',
    label: 'AI',
    subSections: [
      {
        id: 'ai-design',
        label: 'AI関連',
        title: 'AI×デザイン',
        lessonTitles: ['AI×UI', 'AIリサーチ', 'プロトタイプ']
      }
    ],
    categories: []
  },
  {
    id: 'visual',
    label: 'ビジュアル',
    subSections: [
      {
        id: 'graphic',
        label: 'グラフィック・訴求',
        title: 'バナー・すべてに通じる伝え方を磨く',
        lessonTitles: ['グラフィック入門', 'バナーデザイン']
      },
      {
        id: 'mood',
        label: 'ムード・トーン',
        title: '空気のつくり方・雰囲気のつくり方',
        lessonTitles: ['センスを盗む']
      }
    ],
    categories: []
  },
  {
    id: 'figma',
    label: 'Figma',
    subSections: [
      {
        id: 'figma-basics',
        label: 'ツール操作',
        title: 'Figmaの使い方',
        lessonTitles: ['Figmaの使い方']
      }
    ],
    categories: ['Figma']
  },
  {
    id: 'radio',
    label: 'ラジオ',
    subSections: [
      {
        id: 'radio-content',
        label: '',  // セクション名なし（README仕様）
        title: '',  // カテゴリ直下にレッスン表示
        lessonTitles: ['BONOラジオ']
      }
    ],
    categories: []
  },
  {
    id: 'others',
    label: 'その他',
    subSections: [],
    categories: []
  }
];

export default function Lessons() {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId?: string }>();
  const { data: lessons, isLoading: loading, error } = useLessons();
  const reduceMotion = useReducedMotion();

  // URLパラメータからアクティブなタブを決定（デフォルトは"all"）
  const activeTab = categoryId || 'all';

  // レッスンをセクション・サブセクションごとにグルーピング
  const groupedLessons = useMemo(() => {
    if (!lessons) return {};

    // セクションID -> サブセクションID -> レッスン配列
    const groups: Record<string, Record<string, SanityLesson[]>> = {};

    // 初期化
    SECTIONS.forEach(section => {
      groups[section.id] = {};
      section.subSections.forEach(sub => {
        groups[section.id][sub.id] = [];
      });
      // サブセクションがない場合のフォールバック
      if (section.subSections.length === 0) {
        groups[section.id]['_default'] = [];
      }
    });

    lessons.forEach((lesson) => {
      const categoryValue =
        typeof lesson.category === "string"
          ? lesson.category
          : lesson.categoryTitle || "";

      const lessonTitle = lesson.title;
      let matched = false;

      // 1. サブセクションのlessonTitlesでマッチング
      for (const section of SECTIONS) {
        if (section.id === 'others') continue;

        for (const sub of section.subSections) {
          const isMatch = sub.lessonTitles.some(t =>
            lessonTitle.toLowerCase().includes(t.toLowerCase())
          );
          if (isMatch) {
            groups[section.id][sub.id].push(lesson);
            matched = true;
            break;
          }
        }
        if (matched) break;
      }

      // 2. カテゴリでマッチング（サブセクションの最初に追加）
      if (!matched && categoryValue) {
        for (const section of SECTIONS) {
          if (section.id === 'others') continue;

          const categoryMatch = section.categories.some(c =>
            categoryValue.toLowerCase().includes(c.toLowerCase())
          );
          if (categoryMatch) {
            // 最初のサブセクションに追加
            const firstSubId = section.subSections[0]?.id || '_default';
            if (groups[section.id][firstSubId]) {
              groups[section.id][firstSubId].push(lesson);
            }
            matched = true;
            break;
          }
        }
      }

      // 3. マッチしない場合はその他へ
      if (!matched) {
        if (!groups['others']['_default']) {
          groups['others']['_default'] = [];
        }
        groups['others']['_default'].push(lesson);
      }
    });

    return groups;
  }, [lessons]);

  // セクションごとの総レッスン数を計算
  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    SECTIONS.forEach(section => {
      let total = 0;
      Object.values(groupedLessons[section.id] || {}).forEach(lessons => {
        total += lessons.length;
      });
      counts[section.id] = total;
    });
    return counts;
  }, [groupedLessons]);

  // 表示すべきセクション（レッスンがあるものだけ）
  const activeSections = useMemo(() => {
    return SECTIONS.filter(section => sectionCounts[section.id] > 0);
  }, [sectionCounts]);

  // 「その他」に含まれるカテゴリ名のリストを作成（デバッグ・確認用）
  const otherCategories = useMemo(() => {
    const others = groupedLessons['others']?.['_default'] || [];
    const categories = new Set(others.map(l =>
      typeof l.category === "string" ? l.category : l.categoryTitle || "未設定"
    ));
    return Array.from(categories);
  }, [groupedLessons]);

  const motionConfig = useMemo(() => {
    const ease = [0.22, 1, 0.36, 1] as const;
    const baseTransition = reduceMotion ? { duration: 0 } : { duration: 0.5, ease };
    const hidden = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 };

    return {
      container: {
        hidden: {},
        show: {
          transition: reduceMotion
            ? { staggerChildren: 0, delayChildren: 0 }
            : { staggerChildren: 0.06, delayChildren: 0.04 },
        },
      },
      item: {
        hidden,
        show: { opacity: 1, y: 0, transition: baseTransition },
      },
    };
  }, [reduceMotion]);

  const handleLessonClick = (slug: string) => {
    navigate(`/lessons/${slug}`);
  };

  // レッスンカードをレンダリング
  const renderLessonCard = (sanityLesson: SanityLesson) => {
    const categoryValue =
      typeof sanityLesson.category === "string"
        ? sanityLesson.category
        : sanityLesson.categoryTitle || "";

    const thumbnailUrl =
      sanityLesson.iconImageUrl ||
      (sanityLesson.iconImage
        ? urlFor(sanityLesson.iconImage).width(216).height(326).url()
        : null) ||
      sanityLesson.thumbnailUrl ||
      (sanityLesson.thumbnail
        ? urlFor(sanityLesson.thumbnail).width(600).height(450).url()
        : null) ||
      "";

    const lesson: Lesson = {
      id: sanityLesson._id,
      title: sanityLesson.title,
      description: sanityLesson.description || "",
      category: categoryValue,
      thumbnail: thumbnailUrl,
      slug: sanityLesson.slug.current,
    };

    return (
      <motion.div key={lesson.id} variants={motionConfig.item}>
        <LessonCard
          lesson={lesson}
          onClick={() => handleLessonClick(lesson.slug)}
        />
      </motion.div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-4 md:p-8">
          <h1 className="text-xl md:text-2xl font-bold mb-4">レッスン一覧</h1>
          <p className="text-red-600">
            エラー:{" "}
            {error instanceof Error
              ? error.message
              : "データの取得に失敗しました"}
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          label="Lesson"
          title="レッスン一覧"
          description="UIデザインを学ぶためのレッスン一覧です。なりたい状態に合わせてコンテンツを選べます。"
        />

        {/* セクションナビゲーション（カテゴリ別URL） */}
        {activeSections.length > 0 && (
          <div className="sticky top-16 z-10 pt-4 mb-8 border-b border-gray-200 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto bg-white">
            <div className="flex flex-nowrap gap-6 min-w-max sm:min-w-0 px-2">
              {/* すべてタブ */}
              <Link
                to="/lessons"
                className={`
                  pb-3 text-sm font-bold transition-colors whitespace-nowrap border-b-2
                  ${activeTab === 'all'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}
                `}
              >
                すべて
                <span className={`ml-2 text-xs font-normal px-2 py-0.5 rounded-full ${activeTab === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {lessons?.length || 0}
                </span>
              </Link>
              {activeSections.map((section) => (
                <Link
                  key={section.id}
                  to={`/lessons/category/${section.id}`}
                  className={`
                    pb-3 text-sm font-bold transition-colors whitespace-nowrap border-b-2
                    ${activeTab === section.id
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}
                  `}
                >
                  {section.label}
                  <span className={`ml-2 text-xs font-normal px-2 py-0.5 rounded-full ${activeTab === section.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {sectionCounts[section.id]}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {lessons && lessons.length === 0 ? (
          <p className="text-zinc-500">レッスンがありません。</p>
        ) : (
          <div className="space-y-20">
            {/* すべて: 全セクション表示 / カテゴリ別: 該当セクションのみ */}
            {activeSections
              .filter((section) => activeTab === 'all' || section.id === activeTab)
              .map((section) => (
              <section key={section.id} id={`section-${section.id}`}>
                {/* カテゴリ見出し（30px） */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight font-rounded-mplus">
                      {section.label}
                    </h2>
                    <span className="text-sm font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded-full flex-shrink-0">
                      {sectionCounts[section.id]}
                    </span>
                    {/* その他の場合のみ、含まれるカテゴリを表示（デバッグ用） */}
                    {section.id === 'others' && otherCategories.length > 0 && (
                      <div className="text-xs text-gray-400 font-mono overflow-x-auto whitespace-nowrap max-w-full">
                        [{otherCategories.join(', ')}]
                      </div>
                    )}
                  </div>

                  {/* サブセクションごとにレッスンを表示 */}
                  <div className="space-y-12">
                    {section.subSections.length > 0 ? (
                      section.subSections.map((sub) => {
                        const subLessons = groupedLessons[section.id]?.[sub.id] || [];
                        if (subLessons.length === 0) return null;

                        return (
                          <div key={sub.id}>
                            {/* セクション見出し（SectionHeading使用） - label/titleがある場合のみ */}
                            {(sub.label || sub.title) && (
                              <div className="mb-6">
                                <SectionHeading
                                  label={sub.label}
                                  title={sub.title}
                                  showUnderline={false}
                                />
                              </div>
                            )}

                            <motion.div
                              variants={motionConfig.container}
                              initial="hidden"
                              whileInView="show"
                              viewport={{ once: true, margin: "-50px" }}
                              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 auto-rows-fr items-stretch"
                            >
                              {/* すべて: 4件まで表示 / カテゴリ別: 全件表示 */}
                              {subLessons
                                .slice(0, activeTab === 'all' ? 4 : undefined)
                                .map(renderLessonCard)}
                            </motion.div>

                            {/* もっと見るボタン */}
                            {activeTab === 'all' && subLessons.length > 4 && (
                              <div className="mt-4 text-right">
                                <Link
                                  to={`/lessons/category/${section.id}`}
                                  className="text-sm text-gray-500 hover:text-gray-800"
                                >
                                  もっと見る（+{subLessons.length - 4}件）→
                                </Link>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      // サブセクションがない場合（その他など）
                      <motion.div
                        variants={motionConfig.container}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 auto-rows-fr items-stretch"
                      >
                        {(groupedLessons[section.id]?.['_default'] || [])
                          .slice(0, activeTab === 'all' ? 8 : undefined)
                          .map(renderLessonCard)}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* カテゴリ全体のもっと見るボタン（すべて表示時） */}
                {activeTab === 'all' && sectionCounts[section.id] > 8 && (
                  <div className="mt-8 text-center">
                    <Button
                      variant="outline"
                      size="lg"
                      asChild
                      className="min-w-[200px] rounded-full"
                    >
                      <Link to={`/lessons/category/${section.id}`}>
                        {section.label}をもっと見る
                      </Link>
                    </Button>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
