import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrainingTaskDetail } from "@/lib/services/training";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BackButton } from "@/components/common/BackButton";
import NavigationHeader from "@/components/training/NavigationHeader";
import PortableTextRenderer from "@/components/common/PortableTextRenderer";
import type { SanitySection } from "@/types/training";

interface PageProps {
  params: Promise<{ trainingSlug: string; taskSlug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { trainingSlug, taskSlug } = await params;

  try {
    const task = await getTrainingTaskDetail(trainingSlug, taskSlug);

    return {
      title: `${task.title} | トレーニング | BONO`,
      description: task.description || `${task.trainingTitle}のタスク`,
      openGraph: {
        title: `${task.title} | トレーニング | BONO`,
        description: task.description || `${task.trainingTitle}のタスク`,
      },
    };
  } catch {
    return {
      title: "タスクが見つかりません | BONO",
    };
  }
}

export default async function TaskDetailPage({ params }: PageProps) {
  const { trainingSlug, taskSlug } = await params;

  let task;
  try {
    task = await getTrainingTaskDetail(trainingSlug, taskSlug);
  } catch (error) {
    console.error("Task detail fetch error:", error);
    notFound();
  }

  if (!task) {
    notFound();
  }

  // Sanity Portable Text セクション
  const sanitySections: SanitySection[] | undefined = task.sanitySections;
  const hasSanitySections = sanitySections && sanitySections.length > 0;

  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative size-full">
      {/* 戻るボタン - モバイルヘッダーとの間隔を確保 */}
      <div className="pt-4 px-4 sm:px-6 w-full">
        <BackButton href={`/training/${trainingSlug}`} />
      </div>

      {/* Navigation Section - TRAINING番号表示 */}
      <div className="w-full">
        <NavigationHeader orderIndex={task.order_index} />
      </div>

      {/* Main Content Section */}
      <div className="relative shrink-0 w-full">
        <div className="flex flex-col items-center relative size-full">
          <div className="box-border content-stretch flex flex-col gap-8 items-center justify-start pb-24 pt-0 px-4 md:px-8 lg:px-24 relative w-full">

            {/* Eyecatch Section */}
            <div className="box-border content-stretch flex flex-col gap-5 items-center justify-start pb-4 pt-5 px-0 relative shrink-0 w-full max-w-[741px]">
              <div className="box-border content-stretch flex flex-col gap-5 items-center justify-start p-0 relative shrink-0 w-full">
                {/* Block - カテゴリとタグ */}
                <div className="box-border content-stretch flex flex-row gap-4 items-start justify-center p-0 relative shrink-0 w-full">
                  <div className="bg-[rgba(184,163,4,0.12)] box-border content-stretch flex flex-row gap-2.5 items-center justify-center overflow-clip px-1.5 py-0.5 relative rounded shrink-0">
                    <div className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#5e4700] text-[12px] text-center text-nowrap">
                      <p className="block leading-[16px] whitespace-pre">説明</p>
                    </div>
                  </div>
                </div>

                {/* Heading - タイトルと説明 */}
                <div className="box-border content-stretch flex flex-col gap-4 items-center justify-start p-0 relative shrink-0 w-full max-w-[640px]">
                  <div className="box-border content-stretch flex flex-row gap-2.5 items-end justify-center p-0 relative shrink-0 w-full">
                    <div className="basis-0 font-['Rounded_Mplus_1c:Medium',_sans-serif] grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#1d382f] text-[28px] md:text-[28px] lg:text-[40px] text-center">
                      <h1 className="block leading-[1.28] font-rounded-mplus font-bold">{task.title}</h1>
                    </div>
                  </div>
                  {task.description && (
                    <div className="font-['Rounded_Mplus_1c:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-base md:text-lg lg:text-[20px] text-[#475569] text-center w-full max-w-[477px]">
                      <p className="block leading-[1.69]">{task.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="box-border content-stretch flex flex-col gap-6 items-start justify-start p-0 relative shrink-0 w-full max-w-[740px]">
              {/* 動画プレーヤー */}
              {task.video_full && (
                <div className="mb-8 w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <iframe
                    src={task.video_full}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* コンテンツセクション表示 */}
              <div className="mb-8 w-full">
                {hasSanitySections ? (
                  /* Sanity Portable Text セクション（mainと同じ描画） */
                  sanitySections.map((section) => (
                    <div key={section._key} className="mb-6">
                      {section.sectionTitle && (
                        <h2 className="text-xl font-bold text-[#1d382f] mb-4">{section.sectionTitle}</h2>
                      )}
                      <PortableTextRenderer value={section.content || []} />
                    </div>
                  ))
                ) : task.content ? (
                  /* Markdownフォールバック */
                  <div className="prose prose-gray max-w-none">
                    {task.content}
                  </div>
                ) : !task.description ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <div className="text-yellow-800 font-medium mb-2">
                      コンテンツが利用できません
                    </div>
                    <div className="text-yellow-600 text-sm">
                      このタスクにはまだコンテンツが設定されていません。
                    </div>
                  </div>
                ) : null}
              </div>

              {/* ナビゲーション */}
              <div className="mt-12 pt-8 border-t border-gray-200 w-full">
                <div className="flex items-center justify-between">
                  {task.prev_task ? (
                    <Button variant="outline" asChild>
                      <Link
                        href={`/training/${trainingSlug}/${task.prev_task}`}
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        前のタスク
                      </Link>
                    </Button>
                  ) : (
                    <div />
                  )}

                  {task.next_task ? (
                    <Button asChild>
                      <Link
                        href={`/training/${trainingSlug}/${task.next_task}`}
                      >
                        次のタスク
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link href={`/training/${trainingSlug}`}>
                        トレーニングに戻る
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
