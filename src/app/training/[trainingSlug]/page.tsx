import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrainingDetail } from "@/lib/services/training";
import ContentWrapper from "@/components/training/ContentWrapper";
import TaskCollectionBlock from "@/components/training/TaskCollectionBlock";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ trainingSlug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { trainingSlug } = await params;

  try {
    const training = await getTrainingDetail(trainingSlug);

    return {
      title: `${training.title} | トレーニング | BONO`,
      description: training.description,
      openGraph: {
        title: `${training.title} | トレーニング | BONO`,
        description: training.description,
        images: training.thumbnailImage ? [training.thumbnailImage] : undefined,
      },
      twitter: {
        title: `${training.title} | トレーニング | BONO`,
        description: training.description,
      },
      alternates: { canonical: `/training/${trainingSlug}` },
    };
  } catch {
    return {
      title: "トレーニングが見つかりません | BONO",
    };
  }
}

export default async function TrainingDetailPage({ params }: PageProps) {
  const { trainingSlug } = await params;

  let training;
  try {
    training = await getTrainingDetail(trainingSlug);
  } catch (error) {
    console.error("Training detail fetch error:", error);
    notFound();
  }

  if (!training) {
    notFound();
  }

  // 最初のタスクを取得
  const sortedTasks = [...(training.tasks || [])].sort(
    (a, b) => a.order_index - b.order_index
  );
  const firstTask = sortedTasks[0];

  return (
    <>
      {/* Eyecatch セクション */}
      <div
        className="box-border content-stretch flex flex-col items-center justify-start pb-[120px] pt-24 px-0 relative w-full mb-8 border-b border-slate-200"
        data-name="training-overview"
      >
        {/* 背景 */}
        <div
          className="absolute h-[400px] left-0 overflow-clip top-[-96px] w-full"
          data-name="bg"
        >
          <div
            className="absolute h-[400px] left-[-10%] overflow-clip top-[-10px] w-[120%]"
            data-name="表紙"
          >
            <div className="relative size-full bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 bg-cover bg-center bg-no-repeat" />
          </div>
        </div>

        {/* メインコンテンツ */}
        <div
          className="box-border content-stretch flex flex-col gap-5 items-center justify-start mb-[-120px] pb-6 pt-2 px-4 relative shrink-0 w-full max-w-[768px] mx-auto"
          data-name="wrapper-content"
        >
          {/* アイコン */}
          <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] lg:w-[120px] lg:h-[120px] bg-white rounded-full shadow-lg flex items-center justify-center text-4xl">
            {training.type === "challenge" ? "🎯" : "📚"}
          </div>

          {/* テキストセクション */}
          <div className="box-border content-stretch flex flex-col gap-3 items-center justify-start p-0 relative shrink-0 w-full">
            {/* タイプ */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[rgba(184,163,4,0.12)] text-[#5E4700]">
                {training.type === "challenge"
                  ? "チャレンジ"
                  : training.type === "portfolio"
                    ? "ポートフォリオ"
                    : "スキル"}
              </span>
            </div>

            {/* タイトル */}
            <h1 className="text-[28px] md:text-[32px] text-center tracking-[0.75px] font-bold text-[#0d221d] px-4">
              {training.title}
            </h1>

            {/* 説明文 */}
            <p className="text-[14px] sm:text-[15px] md:text-[16px] text-center tracking-[1px] text-[#0d221d] px-4 leading-[1.6]">
              {training.description}
            </p>
          </div>

          {/* ボタンコンテナ */}
          <div className="flex flex-row gap-4 items-center justify-center w-full max-w-[800px]">
            {/* はじめるボタン */}
            {firstTask && (
              <Button asChild className="rounded-full px-6">
                <Link href={`/training/${trainingSlug}/${firstTask.slug}`}>
                  はじめる
                </Link>
              </Button>
            )}

            {/* 進め方をみるボタン */}
            <Button variant="outline" className="rounded-full px-6">
              進め方をみる
            </Button>
          </div>
        </div>
      </div>

      {/* タスク一覧 */}
      <ContentWrapper>
        <div className="max-w-3xl mx-auto py-8">
          <TaskCollectionBlock
            tasks={training.tasks || []}
            trainingSlug={trainingSlug}
            className="mt-8"
          />
        </div>
      </ContentWrapper>
    </>
  );
}
