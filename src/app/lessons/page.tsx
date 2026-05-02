import { Metadata } from "next";
import Link from "next/link";
import { getAllLessonsWithArticleIds, urlFor, type LessonWithArticleIds } from "@/lib/sanity";
// TODO: LessonCardに進捗表示を追加する際に使用
// import { getMultipleLessonProgress } from "@/lib/services/progress";
import PageHeader from "@/components/common/PageHeader";
import { LessonCard } from "@/components/lessons/LessonCard";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "レッスン一覧",
  description:
    "UIUXデザインを体系的に学べるレッスン一覧。初心者から実践レベルまで、段階的にスキルアップできるコンテンツを提供しています。",
  openGraph: {
    title: "レッスン一覧 | BONO",
    description:
      "UIUXデザインを体系的に学べるレッスン一覧。初心者から実践レベルまで、段階的にスキルアップできるコンテンツを提供しています。",
  },
  twitter: {
    title: "レッスン一覧 | BONO",
    description:
      "UIUXデザインを体系的に学べるレッスン一覧。初心者から実践レベルまで、段階的にスキルアップできるコンテンツを提供しています。",
  },
  alternates: { canonical: "/lessons" },
};

// セクション定義（mainブランチと同じ subSections 入れ子構造）
interface SubSection {
  id: string;
  label: string;
  title: string;
  lessonTitles: string[];
}

interface Section {
  id: string;
  label: string;
  subSections: SubSection[];
  categories: string[];
}

const SECTIONS: Section[] = [
  {
    id: 'process',
    label: '進め方',
    subSections: [
      { id: 'cycle', label: '実務・プロセス', title: '1本目立ち回り / デザインサイクル', lessonTitles: ['デザインサイクル', '1年目の立ち回り'] },
      { id: 'basics', label: '入門・基礎', title: 'ゼロから情報・デザインの基本の進め方を習得', lessonTitles: ['ゼロからはじめるUIビジュアル', 'ゼロからはじめるUI情報設計', 'はじめてのUIデザイン'] },
    ],
    categories: ['進め方'],
  },
  {
    id: 'ui',
    label: 'UIデザイン',
    subSections: [
      { id: 'style', label: 'スタイル', title: 'UIのつくり方をはじめよう', lessonTitles: ['UIビジュアル基礎', 'センスを盗む', 'UIタイポグラフィ', 'UIデザインの基本', 'UIトレース', '実装とデザイン'] },
      { id: 'structure', label: 'UIの仕組み', title: 'UIの詳細・UIの仕組みと構造', lessonTitles: ['3構造', 'マテリアルデザイン', 'Material Design', 'Material You'] },
      { id: 'practice', label: 'ハンズオン', title: '実践・課題', lessonTitles: ['DailyUI', '賃貸アプリ', 'UIデザインの基本-応用', '出張申請'] },
    ],
    categories: ['UI'],
  },
  {
    id: 'ia',
    label: '情報設計',
    subSections: [
      { id: 'methodology', label: '方法論', title: '使いやすいUIの方法論', lessonTitles: ['OOUI', '使いやすいUI', 'ナビゲーションUI'] },
      { id: 'organize', label: '情報整理', title: '情報を整理してデザインする方法', lessonTitles: ['ゼロからはじめるUI情報設計', 'UIアイデア', 'UI PATTERN', '目的達成'] },
    ],
    categories: ['情報設計'],
  },
  {
    id: 'ux',
    label: 'UXデザイン',
    subSections: [
      { id: 'experience', label: '体験設計', title: 'UXデザイン・ユーザー価値デザインのきほん', lessonTitles: ['UXデザインってなに', '顧客体験デザイン'] },
      { id: 'research', label: 'リサーチ・分析', title: 'UXリサーチ / 課題分析・ユーザー理解で問いを解こう', lessonTitles: ['ユーザーインタビュー', 'FAILURE POINT', '商品ページ改善'] },
    ],
    categories: ['UX'],
  },
  {
    id: 'career',
    label: 'キャリア',
    subSections: [
      { id: 'job', label: '転職・キャリア', title: 'ポートフォリオ / 会社の選び方・転職に必要なヒント', lessonTitles: ['ポートフォリオ', 'キャリア相談', 'BONOフィードバック'] },
    ],
    categories: ['キャリア'],
  },
  {
    id: 'ai',
    label: 'AI',
    subSections: [
      { id: 'ai-design', label: 'AI関連', title: 'AI×デザイン', lessonTitles: ['AI×UIリサーチ'] },
    ],
    categories: ['AI'],
  },
  {
    id: 'visual',
    label: 'ビジュアル',
    subSections: [
      { id: 'graphic', label: 'グラフィック・訴求', title: 'バナー・すべてに通じる伝え方を磨く', lessonTitles: ['グラフィック入門', 'バナーデザイン'] },
    ],
    categories: ['ビジュアル'],
  },
  {
    id: 'figma',
    label: 'Figma',
    subSections: [
      { id: 'figma-basics', label: 'ツール操作', title: 'Figmaの使い方', lessonTitles: ['Figmaの使い方入門', 'Figmaの使い方初級'] },
    ],
    categories: ['Figma'],
  },
  {
    id: 'radio',
    label: 'ラジオ',
    subSections: [
      { id: 'radio-content', label: '', title: '', lessonTitles: ['BONOラジオ'] },
    ],
    categories: ['ラジオ'],
  },
  {
    id: 'others',
    label: 'その他',
    subSections: [],
    categories: ['その他'],
  },
];

// レッスンをカテゴリでグルーピング
function groupLessonsByCategory(lessons: LessonWithArticleIds[]) {
  const groups: Record<string, LessonWithArticleIds[]> = {};

  // セクションIDで初期化
  SECTIONS.forEach(section => {
    groups[section.id] = [];
  });

  lessons.forEach((lesson) => {
    const categoryValue = lesson.tags?.[0] || "";

    // カテゴリがない場合はその他へ
    if (!categoryValue) {
      groups['others'].push(lesson);
      return;
    }

    // どのセクションに属するか判定
    let matchedSectionId = 'others';

    // 1. subSections の lessonTitles でマッチング
    for (const section of SECTIONS) {
      if (section.id === 'others') continue;

      const normalizedTitle = lesson.title.toLowerCase().replace(/\s+/g, '');
      const isMatch = section.subSections.some(sub =>
        sub.lessonTitles.some(lt =>
          normalizedTitle.includes(lt.toLowerCase().replace(/\s+/g, ''))
        )
      );

      if (isMatch) {
        matchedSectionId = section.id;
        break;
      }
    }

    // 2. lessonTitles でマッチしなかった場合、カテゴリでマッチング
    if (matchedSectionId === 'others') {
      for (const section of SECTIONS) {
        if (section.id === 'others') continue;

        if (section.categories.some(c => categoryValue.toLowerCase().includes(c.toLowerCase()))) {
          matchedSectionId = section.id;
          break;
        }
      }
    }

    groups[matchedSectionId].push(lesson);
  });

  // 各グループ内でソート（lessonTitles 順 → その他の順）
  SECTIONS.forEach(section => {
    // 全subSectionsの lessonTitles をフラットに結合
    const allLessonTitles = section.subSections.flatMap(sub => sub.lessonTitles);
    if (allLessonTitles.length === 0) return;

    groups[section.id].sort((a, b) => {
      const titleA = a.title.toLowerCase().replace(/\s+/g, '');
      const titleB = b.title.toLowerCase().replace(/\s+/g, '');

      const indexA = allLessonTitles.findIndex(lt =>
        titleA.includes(lt.toLowerCase().replace(/\s+/g, ''))
      );
      const indexB = allLessonTitles.findIndex(lt =>
        titleB.includes(lt.toLowerCase().replace(/\s+/g, ''))
      );

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });
  });

  return groups;
}

export default async function LessonsPage() {
  const lessons = await getAllLessonsWithArticleIds();

  // カテゴリでグルーピング
  const groupedLessons = groupLessonsByCategory(lessons);

  // 表示すべきセクション（レッスンがあるものだけ）
  const activeSections = SECTIONS.filter(section => groupedLessons[section.id]?.length > 0);

  // TODO: LessonCardに進捗表示を追加する際に使用
  // const lessonsForProgress = lessons.map((lesson) => ({
  //   lessonId: lesson._id,
  //   articleIds: lesson.articleIds,
  // }));
  // const progressMap = await getMultipleLessonProgress(lessonsForProgress);

  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          label="テーマ別に鍛えよう"
          title="レッスン一覧"
          description="UIデザインを学ぶためのレッスン一覧です。なりたい状態に合わせてコンテンツを選べます。"
        />

        {/* セクションナビゲーション */}
        {activeSections.length > 0 && (
          <div className="sticky top-16 z-10 bg-base pt-4 mb-8 border-b border-gray-200 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
            <div className="flex flex-nowrap gap-6 min-w-max sm:min-w-0 px-2">
              {/* すべてタブ */}
              <span className="pb-3 text-sm font-bold transition-colors whitespace-nowrap border-b-2 border-black text-black">
                すべて
                <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full bg-black text-white">
                  {lessons.length}
                </span>
              </span>
              {activeSections.map((section) => (
                <Link
                  key={section.id}
                  href={`/lessons/category/${section.id}`}
                  className="pb-3 text-sm font-bold transition-colors whitespace-nowrap border-b-2 border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                >
                  {section.label}
                  <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    {groupedLessons[section.id].length}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {lessons.length === 0 ? (
          <p className="text-zinc-500">レッスンがありません。</p>
        ) : (
          <div className="space-y-20">
            {activeSections.map((section) => (
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
                  </div>

                  {/* サブセクションタイトル */}
                  {section.subSections.length > 0 && section.subSections[0].title && (
                    <div className="mb-3">
                      <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-500 rounded-full inline-block"></span>
                        {section.subSections[0].title}
                      </h3>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 auto-rows-fr items-stretch">
                  {groupedLessons[section.id].slice(0, 8).map((lesson) => {
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

                {/* もっと見るボタン（8件以上ある場合のみ） */}
                {groupedLessons[section.id].length > 8 && (
                  <div className="mt-8 text-center">
                    <Button
                      variant="outline"
                      size="large"
                      asChild
                      className="min-w-[200px] rounded-full"
                    >
                      <Link href={`/lessons/category/${section.id}`}>
                        もっと見る（{groupedLessons[section.id].length - 8}件）
                      </Link>
                    </Button>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
