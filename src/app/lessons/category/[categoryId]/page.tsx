import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllLessonsWithArticleIds, urlFor, type LessonWithArticleIds } from "@/lib/sanity";
import PageHeader from "@/components/common/PageHeader";
import { LessonCard } from "@/components/lessons/LessonCard";

// セクション定義
const SECTIONS = [
  {
    id: 'ui',
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
    priorityTitles: [],
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
    priorityTitles: [],
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

interface PageProps {
  params: Promise<{ categoryId: string }>;
}

// メタデータ生成
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoryId } = await params;
  const section = SECTIONS.find(s => s.id === categoryId);

  if (!section) {
    return {
      title: "カテゴリが見つかりません",
    };
  }

  return {
    title: `${section.label} - レッスン一覧`,
    description: section.description,
    openGraph: {
      title: `${section.label} - レッスン一覧 | BONO`,
      description: section.description,
    },
    twitter: {
      title: `${section.label} - レッスン一覧 | BONO`,
      description: section.description,
    },
    alternates: { canonical: `/lessons/category/${categoryId}` },
  };
}

// レッスンをカテゴリでフィルタリング
function filterLessonsByCategory(lessons: LessonWithArticleIds[], categoryId: string) {
  const section = SECTIONS.find(s => s.id === categoryId);
  if (!section) return [];

  const filtered = lessons.filter((lesson) => {
    const categoryValue = lesson.tags?.[0] || "";

    // カテゴリがない場合、othersのみにマッチ
    if (!categoryValue) {
      return categoryId === 'others';
    }

    // othersカテゴリの場合、他のどのセクションにもマッチしないものを取得
    if (categoryId === 'others') {
      for (const s of SECTIONS) {
        if (s.id === 'others') continue;

        const normalizedTitle = lesson.title.toLowerCase().replace(/\s+/g, '');
        const isPriority = s.priorityTitles?.some(priorityTitle => {
          const normalizedPriority = priorityTitle.toLowerCase().replace(/\s+/g, '');
          return normalizedTitle.includes(normalizedPriority);
        });
        if (isPriority) return false;

        if (s.categories.some(c => categoryValue.toLowerCase().includes(c.toLowerCase()))) {
          return false;
        }
      }
      return true;
    }

    // 優先タイトルでのマッチング
    const normalizedTitle = lesson.title.toLowerCase().replace(/\s+/g, '');
    const isPriority = section.priorityTitles?.some(priorityTitle => {
      const normalizedPriority = priorityTitle.toLowerCase().replace(/\s+/g, '');
      return normalizedTitle.includes(normalizedPriority);
    });
    if (isPriority) return true;

    // カテゴリでマッチング
    return section.categories.some(c => categoryValue.toLowerCase().includes(c.toLowerCase()));
  });

  // ソート
  if (section.priorityTitles && section.priorityTitles.length > 0) {
    filtered.sort((a, b) => {
      const titleA = a.title.toLowerCase().replace(/\s+/g, '');
      const titleB = b.title.toLowerCase().replace(/\s+/g, '');

      const indexA = section.priorityTitles!.findIndex(pt =>
        titleA.includes(pt.toLowerCase().replace(/\s+/g, ''))
      );
      const indexB = section.priorityTitles!.findIndex(pt =>
        titleB.includes(pt.toLowerCase().replace(/\s+/g, ''))
      );

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });
  }

  return filtered;
}

export default async function CategoryPage({ params }: PageProps) {
  const { categoryId } = await params;
  const section = SECTIONS.find(s => s.id === categoryId);

  if (!section) {
    notFound();
  }

  const lessons = await getAllLessonsWithArticleIds();
  const filteredLessons = filterLessonsByCategory(lessons, categoryId);

  // 全セクションのレッスン数を計算
  const sectionCounts: Record<string, number> = {};
  SECTIONS.forEach(s => {
    sectionCounts[s.id] = filterLessonsByCategory(lessons, s.id).length;
  });

  // アクティブなセクション
  const activeSections = SECTIONS.filter(s => sectionCounts[s.id] > 0);

  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          label="Lesson"
          title="レッスン一覧"
          description="UIデザインを学ぶためのレッスン一覧です。なりたい状態に合わせてコンテンツを選べます。"
        />

        {/* セクションナビゲーション */}
        <div className="sticky top-16 z-10 bg-base pt-4 mb-8 border-b border-gray-200 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
          <div className="flex flex-nowrap gap-6 min-w-max sm:min-w-0 px-2">
            {/* すべてタブ */}
            <Link
              href="/lessons"
              className="pb-3 text-sm font-bold transition-colors whitespace-nowrap border-b-2 border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
            >
              すべて
              <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {lessons.length}
              </span>
            </Link>
            {activeSections.map((s) => (
              <Link
                key={s.id}
                href={`/lessons/category/${s.id}`}
                className={`pb-3 text-sm font-bold transition-colors whitespace-nowrap border-b-2 ${
                  s.id === categoryId
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                {s.label}
                <span className={`ml-2 text-xs font-normal px-2 py-0.5 rounded-full ${
                  s.id === categoryId ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {sectionCounts[s.id]}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {filteredLessons.length === 0 ? (
          <p className="text-zinc-500">このカテゴリにはレッスンがありません。</p>
        ) : (
          <section>
            <div className="mb-8 border-b border-gray-100 pb-6">
              {/* 親カテゴリ（分野） */}
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                  {section.label}
                </h2>
                <span className="text-sm font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded-full flex-shrink-0">
                  {filteredLessons.length}
                </span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 auto-rows-fr items-stretch">
              {filteredLessons.map((lesson) => {
                const categoryValue = lesson.tags?.[0] || "";
                const thumbnailUrl =
                  lesson.iconImageUrl ||
                  (lesson.iconImage
                    ? urlFor(lesson.iconImage).width(216).height(326).url()
                    : null) ||
                  lesson.thumbnailUrl ||
                  (lesson.thumbnail
                    ? urlFor(lesson.thumbnail).width(600).height(450).url()
                    : null) ||
                  "";

                return (
                  <Link key={lesson._id} href={`/lessons/${lesson.slug.current}`}>
                    <LessonCard
                      lesson={{
                        id: lesson._id,
                        title: lesson.title,
                        description: lesson.description || "",
                        category: categoryValue,
                        thumbnail: thumbnailUrl,
                        slug: lesson.slug.current,
                      }}
                    />
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
