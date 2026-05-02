import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrainingDetail } from "@/lib/services/training";
import ContentWrapper from "@/components/training/ContentWrapper";
import TaskCollectionBlock from "@/components/training/TaskCollectionBlock";
import CategoryTag from "@/components/training/CategoryTag";
import { HalfCircleBg } from "@/components/training/HalfCircleBg";
import IconBlock from "@/components/training/IconBlock";
import { BackButton } from "@/components/common/BackButton";

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
      {/* 戻るボタン - モバイルヘッダーとの間隔を確保 */}
      <div className="pt-4 px-4 sm:px-6 lg:px-8 relative z-10">
        <BackButton href="/training" />
      </div>

      {/* Figmaデザインベースのeyecatchセクション - 全幅 */}
      <div
        className="box-border content-stretch flex flex-col items-center justify-start pb-[120px] pt-12 px-0 relative w-full mb-8 border-b border-slate-200"
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
            <div
              className="relative size-full bg-[url('/assets/backgrounds/gradation/bg-gradation/type-trainingdetail.svg')] bg-cover bg-center bg-no-repeat animate-gradient-scale-slide"
              data-name="Property 1=Variant2"
            >
            </div>
          </div>
        </div>

        {/* 半円オブジェクト（インラインSVG） */}
        <div
          className="absolute left-0 top-[140px] w-full"
          style={{ height: '160px' }}
          data-name="img_half_circle_object"
        >
          <HalfCircleBg />
        </div>

        {/* メインコンテンツ */}
        <div
          className="box-border content-stretch flex flex-col gap-5 items-center justify-start mb-[-120px] pb-6 pt-2 px-4 relative shrink-0 w-full max-w-[768px] mx-auto"
          data-name="wrapper-content"
        >
          {/* アイコンフレーム */}
          <IconBlock
            iconSrc={training.icon}
            iconAlt={`${training.title || 'トレーニング'}のアイコン`}
            size="lg"
            className="sm:!size-[80px] md:!size-[100px] lg:!size-[120px]"
          />

          {/* テキストセクション */}
          <div
            className="box-border content-stretch flex flex-col gap-3 items-center justify-start p-0 relative shrink-0 w-full"
            data-name="text-section"
          >
            {/* カテゴリとタイプ */}
            <div
              className="box-border content-stretch flex flex-row gap-3 sm:gap-5 items-center justify-center flex-wrap p-0 relative shrink-0"
              data-name="section_category_and_tags"
            >
              {/* タイプ */}
              {training.type && (
                <CategoryTag type={training.type as 'challenge' | 'skill' | 'portfolio'} displayMode="type" />
              )}

              {/* カテゴリ */}
              {training.category && (
                <CategoryTag category={training.category} displayMode="category" />
              )}
            </div>

            {/* タイトル */}
            <div
              className="leading-[0] w-full not-italic relative shrink-0 text-[#0d221d] text-[28px] md:text-[32px] text-center tracking-[0.75px] px-4"
            >
              <h1 className="block leading-[1.49] font-rounded-mplus-bold">
                {training.title || 'タイトルなし'}
              </h1>
            </div>

            {/* 説明文 */}
            <div
              className="leading-[0] w-full not-italic relative shrink-0 text-[#0d221d] text-[14px] sm:text-[15px] md:text-[16px] text-center tracking-[1px] px-4"
            >
              <p className="block leading-[1.6]">
                {training.description || ''}
              </p>
            </div>
          </div>

          {/* ボタンコンテナ */}
          <div
            className="box-border content-stretch flex flex-row gap-4 items-center justify-center p-0 relative shrink-0 w-full max-w-[800px]"
            data-name="Button Container"
          >
            {/* はじめるボタン */}
            {firstTask && (
              <Link
                href={`/training/${trainingSlug}/${firstTask.slug}`}
                className="bg-[#0d221d] box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-4 py-3 relative rounded-[1000px] shrink-0 hover:bg-opacity-90 transition-all duration-200"
                data-name="button"
              >
                <div className="absolute border border-[rgba(13,15,24,0.81)] border-solid inset-0 pointer-events-none rounded-[1000px]" />
                <div className="leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[14px] text-center text-nowrap tracking-[0.75px]">
                  <p className="adjustLetterSpacing block leading-none whitespace-pre font-rounded-mplus-bold">
                    はじめる
                  </p>
                </div>
              </Link>
            )}

            {/* 進め方をみるボタン */}
            <button
              className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-4 py-3 relative rounded-[1000px] shrink-0 hover:bg-gray-100 transition-all duration-200"
              data-name="button"
            >
              <div className="absolute border-2 border-[#0d221d] border-solid inset-0 pointer-events-none rounded-[1000px]" />
              <div className="leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap tracking-[0.75px]">
                <p className="adjustLetterSpacing block leading-none whitespace-pre font-rounded-mplus-bold">
                  進め方をみる
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* その他のコンテンツ - 幅制限あり */}
      <ContentWrapper>
        {/* セクション・オーバービュー */}
        <div className="max-w-3xl mx-auto" data-name="section-overview">
          {/* Divider */}
          <div className="w-full h-px bg-gray-200 my-8"></div>

          {/* タスク一覧 */}
          <div data-name="task-collection-block">
            <TaskCollectionBlock
              tasks={training.tasks || []}
              trainingSlug={trainingSlug}
              className="mt-8"
            />
          </div>
        </div>
      </ContentWrapper>
    </>
  );
}
