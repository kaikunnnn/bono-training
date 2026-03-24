import { useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { urlFor } from "@/lib/sanity";
import Layout from "@/components/layout/Layout";
import { useLessons } from "@/hooks/useLessons";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PageHeader from "@/components/common/PageHeader";
import LessonCard from "@/components/lessons/LessonCard";
import SectionHeading from "@/components/common/SectionHeading";
import DottedDivider from "@/components/common/DottedDivider";
import { Lesson } from "@/types/lesson";
import { SanityLesson } from "@/types/sanity";

// セクション定義
// タブ順序: おすすめ → 進め方 → UIデザイン → UXデザイン → キャリア → AI → ビジュアル → Figma → ラジオ
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
        // 順序: デザインサイクル → 1年目の立ち回り
        lessonTitles: ['デザインサイクル', '1年目の立ち回り']
      },
      {
        id: 'basics',
        label: '入門・基礎',
        title: 'ゼロから情報・デザインの基本の進め方を習得',
        // 順序: ゼロからUIビジュアル → ゼロからUI情報設計 → はじめてのUIデザイン
        lessonTitles: ['ゼロからはじめるUIビジュアル', 'ゼロからはじめるUI情報設計', 'はじめてのUIデザイン']
      }
    ],
    categories: []
  },
  {
    id: 'ui',
    label: 'UIデザイン',
    subSections: [
      {
        id: 'style',
        label: 'スタイル',
        title: 'UIのつくり方をはじめよう',
        // 順序: UIビジュアル基礎 → センスを盗む → UIタイポグラフィ → UIデザインの基本 → UIトレース → 実装とデザイン
        // ※ Webデザインの組み立て方は除外（その他へ）
        lessonTitles: ['UIビジュアル基礎', 'センスを盗む', 'UIタイポグラフィ', 'UIデザインの基本', 'UIトレース', '実装とデザイン']
      },
      {
        id: 'ia',
        label: '情報設計・IA',
        title: '情報設計・使いやすいUIづくりの方法論',
        // 順序: ゼロからUI情報設計 → OOUI → UIアイデア → UI PATTERN → 目的達成
        // ※ 3構造・ナビゲーションUIはUIの仕組みへ移動、テストデータは除外
        lessonTitles: ['ゼロからはじめるUI情報設計', 'OOUI', 'UIアイデア', 'UI PATTERN', '目的達成']
      },
      {
        id: 'structure',
        label: 'UIの仕組み',
        title: 'UIの詳細・UIの仕組みと構造',
        // 順序: 3構造 → ナビゲーションUI → 使いやすいUI → マテリアルデザイン → Material Design → Material You
        lessonTitles: ['3構造', 'ナビゲーションUI', '使いやすいUI', 'マテリアルデザイン', 'Material Design', 'Material You']
      },
      {
        id: 'practice',
        label: 'ハンズオン',
        title: '実践・課題',
        // 順序: DailyUI → 賃貸アプリ → UIデザインの基本-応用 → 出張申請
        lessonTitles: ['DailyUI', '賃貸アプリ', 'UIデザインの基本-応用', '出張申請']
      }
    ],
    categories: ['UI']
  },
  {
    id: 'ux',
    label: 'UXデザイン',
    subSections: [
      {
        id: 'experience',
        label: '体験設計',
        title: 'UXデザイン・ユーザー価値デザインのきほん',
        // 順序: UXデザインってなに？ → 顧客体験デザイン
        // ※ ゼロからサービスをデザインはお題へ
        lessonTitles: ['UXデザインってなに', '顧客体験デザイン']
      },
      {
        id: 'research',
        label: 'リサーチ・分析',
        title: 'UXリサーチ / 課題分析・ユーザー理解で問いを解こう',
        // 順序: ユーザーインタビュー → FAILURE POINT → 商品ページ改善
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
        // 順序: ポートフォリオ → キャリア相談 → BONOフィードバック集
        // ※ UIUXデザイナーになる条件・BONO勉強会アーカイブは除外
        lessonTitles: ['ポートフォリオ', 'キャリア相談', 'BONOフィードバック']
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
        lessonTitles: ['AI×UIリサーチ']
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
        // 順序: グラフィック入門 → バナーデザイン
        lessonTitles: ['グラフィック入門', 'バナーデザイン']
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
        // 順序: Figmaの使い方入門 → Figmaの使い方初級
        lessonTitles: ['Figmaの使い方入門', 'Figmaの使い方初級']
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
        label: '',
        title: '',
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

// おすすめタブ用のセクション定義
// ※ lessonTitlesは実際のSanityデータのタイトルに合わせる
const RECOMMENDED_SECTIONS: SubSection[] = [
  {
    id: 'beginners',
    label: '入門・基礎',
    title: 'デザインの基礎をはじめよう',
    // 実際のタイトル: ゼロからはじめるUIビジュアル、ゼロからはじめるUI情報設計、UIデザインの基本、UIが上手くなる人の"デザインサイクル"
    lessonTitles: ['ゼロからはじめるUIビジュアル', 'ゼロからはじめるUI情報設計', 'UIデザインの基本', 'UIが上手くなる人の']
  },
  {
    id: 'popular',
    label: 'みんなが学んでる',
    title: 'よく見られているレッスン',
    // 実際のタイトル: UIビジュアル基礎、ゼロからはじめるUI情報設計、UXデザインってなに？、Figmaの使い方入門
    lessonTitles: ['UIビジュアル基礎', 'ゼロからはじめるUI情報設計', 'UXデザインってなに？', 'Figmaの使い方入門']
  },
  {
    id: 'ia',
    label: '情報設計',
    title: 'UIの使いやすさをデザインしよう',
    // 実際のタイトル: ゼロからはじめるUI情報設計、使いやすいUIの秘密、OOUI コンテンツ中心のUI設計、ナビゲーションUIの基本
    lessonTitles: ['ゼロからはじめるUI情報設計', '使いやすいUIの秘密', 'OOUI コンテンツ中心のUI設計', 'ナビゲーションUIの基本']
  },
  {
    id: 'ux',
    label: 'UXデザイン',
    title: 'ユーザーの課題を解決しよう',
    // 実際のタイトル: UXデザインってなに？、FAILURE POINT 課題発見の方法、顧客体験デザインの基本、ゼロからはじめるユーザーインタビュー
    lessonTitles: ['UXデザインってなに？', 'FAILURE POINT 課題発見の方法', '顧客体験デザインの基本', 'ゼロからはじめるユーザーインタビュー']
  }
];

export default function Lessons() {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId?: string }>();
  const { data: lessons, isLoading: loading, error } = useLessons();
  const reduceMotion = useReducedMotion();

  // URLパラメータからアクティブなタブを決定（デフォルトは"recommended"）
  const activeTab = categoryId || 'recommended';

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

    // lessonTitlesの順序でソート
    SECTIONS.forEach(section => {
      section.subSections.forEach(sub => {
        const lessonsInSub = groups[section.id]?.[sub.id];
        if (lessonsInSub && lessonsInSub.length > 0) {
          groups[section.id][sub.id] = lessonsInSub.sort((a, b) => {
            const aIndex = sub.lessonTitles.findIndex(t =>
              a.title.toLowerCase().includes(t.toLowerCase())
            );
            const bIndex = sub.lessonTitles.findIndex(t =>
              b.title.toLowerCase().includes(t.toLowerCase())
            );
            // マッチしないものは最後に
            const aOrder = aIndex === -1 ? 999 : aIndex;
            const bOrder = bIndex === -1 ? 999 : bIndex;
            return aOrder - bOrder;
          });
        }
      });
    });

    return groups;
  }, [lessons]);

  // おすすめタブ用のレッスングルーピング
  const recommendedLessons = useMemo(() => {
    if (!lessons) return {};

    const groups: Record<string, SanityLesson[]> = {};

    RECOMMENDED_SECTIONS.forEach(section => {
      groups[section.id] = [];
    });

    // 各おすすめセクションのlessonTitlesでマッチング
    RECOMMENDED_SECTIONS.forEach(section => {
      section.lessonTitles.forEach(titlePattern => {
        const matchedLesson = lessons.find(lesson =>
          lesson.title.toLowerCase().includes(titlePattern.toLowerCase())
        );
        if (matchedLesson && !groups[section.id].some(l => l._id === matchedLesson._id)) {
          groups[section.id].push(matchedLesson);
        }
      });
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
          <div className="sticky top-16 z-10 pt-4 mb-8 border-b border-gray-200 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
            <div className="flex flex-nowrap gap-6 min-w-max sm:min-w-0 px-2 justify-center">
              {/* おすすめタブ */}
              <Link
                to="/lessons"
                className={`
                  pb-3 px-3 text-sm font-bold transition-colors whitespace-nowrap border-b-2
                  ${activeTab === 'recommended'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}
                `}
              >
                おすすめ
              </Link>
              {activeSections.map((section) => (
                <Link
                  key={section.id}
                  to={`/lessons/category/${section.id}`}
                  className={`
                    pb-3 px-3 text-sm font-bold transition-colors whitespace-nowrap border-b-2
                    ${activeTab === section.id
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}
                  `}
                >
                  {section.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {lessons && lessons.length === 0 ? (
          <p className="text-zinc-500">レッスンがありません。</p>
        ) : activeTab === 'recommended' ? (
          /* おすすめタブ: 4つのキュレーションセクション */
          <div className="space-y-16">
            {RECOMMENDED_SECTIONS.map((section, index) => {
              const sectionLessons = recommendedLessons[section.id] || [];
              if (sectionLessons.length === 0) return null;

              return (
                <section key={section.id}>
                  {/* セクション間のドット区切り線 */}
                  {index > 0 && (
                    <DottedDivider className="mb-12" />
                  )}

                  {/* セクション見出し */}
                  <div className="mb-6">
                    <SectionHeading
                      label={section.label}
                      title={section.title}
                      showUnderline={false}
                    />
                  </div>

                  <motion.div
                    variants={motionConfig.container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 auto-rows-fr items-stretch"
                  >
                    {sectionLessons.map(renderLessonCard)}
                  </motion.div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="space-y-20">
            {/* カテゴリ別: 該当セクションのみ */}
            {activeSections
              .filter((section) => section.id === activeTab)
              .map((section, index, filteredSections) => (
              <section key={section.id} id={`section-${section.id}`}>
                {/* セクション間のドット区切り線 */}
                {index > 0 && (
                  <DottedDivider className="mb-12" />
                )}
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
                      section.subSections
                        .filter(sub => (groupedLessons[section.id]?.[sub.id] || []).length > 0)
                        .map((sub, subIndex) => {
                          const subLessons = groupedLessons[section.id]?.[sub.id] || [];

                          return (
                            <div key={sub.id}>
                              {/* サブセクション間のドット区切り線 */}
                              {subIndex > 0 && (
                                <DottedDivider className="mb-12" />
                              )}
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
                                {/* カテゴリ別: 全件表示 */}
                                {subLessons.map(renderLessonCard)}
                              </motion.div>

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
                          .map(renderLessonCard)}
                      </motion.div>
                    )}
                  </div>
                </div>

              </section>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
