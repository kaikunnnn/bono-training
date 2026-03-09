import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "framer-motion";
import { urlFor } from "@/lib/sanity";
import Layout from "@/components/layout/Layout";
import { useLessons } from "@/hooks/useLessons";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PageHeader from "@/components/common/PageHeader";
import LessonCard from "@/components/lessons/LessonCard";
import { Lesson } from "@/types/lesson";
import { SanityLesson } from "@/types/sanity";

// セクション定義（親カテゴリ：分野、中カテゴリ：なりたい状態）
const SECTIONS = [
  {
    id: 'visual',
    label: 'UIデザイン',
    title: '魅力的なビジュアルを作れるようになる',
    description: 'UIデザインの基礎、タイポグラフィ、配色など、美しい見た目を作るためのスキル。',
    priorityTitles: [
      'UI Visual 基礎',
      '0から始まる UI Visual',
      'グラフィック入門',
      'UIがうまくなる人のデザインサイクル',
      'センスを盗む技術',
      'UIタイポグラフィ入門'
    ],
    categories: [
      'UIデザイン', 'UI', 'ui', 'Ui', 
      'ビジュアル', 'Visual', 'visual', 
      'グラフィック', 'Graphic', 'graphic', 
      '配色', 'Color', 'color', 
      'タイポグラフィ', 'Typography', 'typography', 
      '文字', 'フォント', 
      'あしらい', '装飾', 
      'UIビジュアル', '見た目', '表現',
      '基本の進め方'
    ]
  },
  {
    id: 'ia',
    label: '情報設計',
    title: '迷わない画面構造を作れるようになる',
    description: 'ユーザーが迷わず目的を達成できる画面遷移や、情報の整理整頓（IA）を学ぶスキル。',
    priorityTitles: [
      '使いやすい UI の秘密',
      '3 構造で始める UI デザイン入門',
      '0から始める UI 情報設計',
      'コンテンツ中心の UI 設計',
      'UIデザインの基本',
      'ナビゲーション UI の基本'
    ],
    categories: [
      '情報設計', 'IA', 'Information', 'アーキテクチャ',
      'ワイヤーフレーム', 'Wireframe', 'wireframe',
      'プロトタイピング', 'Prototyping', 'prototype',
      '画面設計', '構造', '骨組み', 'UI設計',
      '遷移', 'ナビゲーション'
    ]
  },
  {
    id: 'ux',
    label: 'UXデザイン',
    title: 'ユーザー体験を設計できるようになる',
    description: 'ユーザーインタビューやリサーチを通じて、本当に求められる価値を見つけ出すスキル。',
    priorityTitles: [
      'ゼロから始めるユーザーインタビュー',
      'UXデザインって何',
      '初めてのUXデザイン'
    ],
    categories: [
      'UXデザイン', 'UX', 'ux', 'Ux', 
      'リサーチ', 'Research', 'research', 
      'ユーザー', '体験', '顧客価値', 'ユーザー理解',
      '課題発見', '仮説検証', 'ペルソナ', 'ジャーニーマップ'
    ]
  },
  {
    id: 'figma',
    label: 'Figma',
    title: 'プロの道具を使いこなせるようになる',
    description: 'Figmaの基本操作から応用テクニックまで、効率的にデザインするためのツールスキル。',
    priorityTitles: [], // 指定があれば追加
    categories: [
      'Figma', 'figma', 'FIGMA', 
      'ツール', 'Tool', 'tool', 
      '操作', '使い方', 
      'プロトタイプ', 
      '実装', 'ハンドオフ', 'オートレイアウト'
    ]
  },
  {
    id: 'career',
    label: 'キャリア',
    title: 'デザイナーとしてキャリアを切り開く',
    description: 'ポートフォリオ制作、面接対策、マインドセットなど、プロとして活躍するための知識。',
    priorityTitles: [], // 指定があれば追加
    categories: [
      'キャリア', 'Career', 'career', 
      'ポートフォリオ', 'Portfolio', 'portfolio', 
      '未経験', '転職', '就職', '採用', 
      '面接', 'マインドセット', '考え方', 
      '働き方', '仕事'
    ]
  },
  {
    id: 'others',
    label: 'その他',
    title: 'Other Topics',
    description: 'その他のトピック',
    priorityTitles: [],
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

  // 各セクションの「もっと見る」状態を管理
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // カテゴリごとにグルーピング
  const groupedLessons = useMemo(() => {
    if (!lessons) return {};
    
    const groups: Record<string, SanityLesson[]> = {};
    
    // セクションIDで初期化
    SECTIONS.forEach(section => {
      groups[section.id] = [];
    });
    
    lessons.forEach((lesson) => {
      const categoryValue =
        typeof lesson.category === "string"
          ? lesson.category
          : lesson.categoryTitle || "";
          
      // カテゴリがない場合はその他へ
      if (!categoryValue) {
        groups['others'].push(lesson);
        return;
      }

      // どのセクションに属するか判定
      let matchedSectionId = 'others';
      
      // 1. 優先タイトルでのマッチングを試行
      for (const section of SECTIONS) {
        if (section.id === 'others') continue;
        
        // タイトルが部分一致するかチェック（スペース除去や小文字化で柔軟に）
        const normalizedTitle = lesson.title.toLowerCase().replace(/\s+/g, '');
        const isPriority = section.priorityTitles?.some(priorityTitle => {
          const normalizedPriority = priorityTitle.toLowerCase().replace(/\s+/g, '');
          return normalizedTitle.includes(normalizedPriority);
        });

        if (isPriority) {
          matchedSectionId = section.id;
          break;
        }
      }

      // 2. 優先タイトルでマッチしなかった場合、カテゴリでマッチング
      if (matchedSectionId === 'others') {
        for (const section of SECTIONS) {
          if (section.id === 'others') continue;
          
          // 部分一致で判定（大文字小文字を区別しない比較も考慮）
          if (section.categories.some(c => categoryValue.toLowerCase().includes(c.toLowerCase()))) {
            matchedSectionId = section.id;
            break;
          }
        }
      }
      
      groups[matchedSectionId].push(lesson);
    });
    
    // 各グループ内でソート（優先タイトル順 → その他の順）
    SECTIONS.forEach(section => {
      if (!section.priorityTitles || section.priorityTitles.length === 0) return;
      
      groups[section.id].sort((a, b) => {
        const titleA = a.title.toLowerCase().replace(/\s+/g, '');
        const titleB = b.title.toLowerCase().replace(/\s+/g, '');
        
        const indexA = section.priorityTitles!.findIndex(pt => 
          titleA.includes(pt.toLowerCase().replace(/\s+/g, ''))
        );
        const indexB = section.priorityTitles!.findIndex(pt => 
          titleB.includes(pt.toLowerCase().replace(/\s+/g, ''))
        );
        
        // 両方とも優先リストにある場合、リスト順に並べる
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        // 片方だけ優先リストにある場合、優先リストにある方を前に
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        // 両方とも優先リストにない場合、元の順序（作成日など）を維持
        return 0;
      });
    });
    
    return groups;
  }, [lessons]);

  // 表示すべきセクション（レッスンがあるものだけ）
  const activeSections = useMemo(() => {
    return SECTIONS.filter(section => groupedLessons[section.id]?.length > 0);
  }, [groupedLessons]);

  // 「その他」に含まれるカテゴリ名のリストを作成（デバッグ・確認用）
  const otherCategories = useMemo(() => {
    const others = groupedLessons['others'] || [];
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
                    {groupedLessons[section.id].length}
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
                <div className="mb-8 border-b border-gray-100 pb-6">
                  {/* 親カテゴリ（分野） */}
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                      {section.label}
                    </h2>
                    <span className="text-sm font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded-full flex-shrink-0">
                      {groupedLessons[section.id].length}
                    </span>
                    {/* その他の場合のみ、含まれるカテゴリを表示（デバッグ用） */}
                    {section.id === 'others' && otherCategories.length > 0 && (
                      <div className="text-xs text-gray-400 font-mono overflow-x-auto whitespace-nowrap max-w-full">
                        [{otherCategories.join(', ')}]
                      </div>
                    )}
                  </div>

                  {/* 中カテゴリ（なりたい状態） */}
                  <div className="mb-3">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                      <span className="w-1 h-6 bg-blue-500 rounded-full inline-block"></span>
                      {section.title}
                    </h3>
                  </div>

                  {/* 説明文 */}
                  <p className="text-gray-600 text-sm md:text-base ml-3 pl-1">
                    {section.description}
                  </p>
                </div>

                <motion.div
                  variants={motionConfig.container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-50px" }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 auto-rows-fr items-stretch"
                >
                  {/* すべて: 8件まで表示 / カテゴリ別: 全件表示 */}
                  {groupedLessons[section.id]
                    .slice(0, activeTab === 'all' && !expandedSections[section.id] ? 8 : undefined)
                    .map((sanityLesson) => {
                    // バッジ表示テキスト（本来のカテゴリ名を表示）
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
                      category: categoryValue, // 元のカテゴリ名を表示
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
                  })}
                </motion.div>

                {/* もっと見るボタン（すべて表示時 & 8件以上ある場合のみ） */}
                {activeTab === 'all' && groupedLessons[section.id].length > 8 && (
                  <div className="mt-8 text-center">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => toggleSection(section.id)}
                      className="min-w-[200px] rounded-full"
                    >
                      {expandedSections[section.id] ? '閉じる' : `もっと見る（${groupedLessons[section.id].length - 8}件）`}
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
