import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrainingTaskDetail } from "@/lib/services/training";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative size-full">
        {/* Navigation Header */}
        <div className="w-full border-b border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link
              href={`/training/${trainingSlug}`}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {task.trainingTitle || "トレーニング"}に戻る
            </Link>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="relative w-full">
          <div className="flex flex-col items-center relative size-full">
            <div className="box-border content-stretch flex flex-col gap-8 items-center justify-start pb-24 pt-8 px-4 md:px-8 lg:px-24 relative w-full">
              {/* Eyecatch Section */}
              <div className="box-border content-stretch flex flex-col gap-5 items-center justify-start pb-4 pt-5 px-0 relative shrink-0 w-full max-w-[741px]">
                <div className="box-border content-stretch flex flex-col gap-5 items-center justify-start p-0 relative shrink-0 w-full">
                  {/* カテゴリタグ */}
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center px-[6px] py-[2px] rounded text-xs font-medium bg-[rgba(184,163,4,0.12)] text-[#5E4700]">
                      説明
                    </span>
                    <span className="text-sm text-gray-500">
                      Task {String(task.order_index).padStart(2, "0")}
                    </span>
                  </div>

                  {/* タイトル */}
                  <h1 className="text-[28px] md:text-[32px] lg:text-[40px] text-center font-bold text-[#1d382f]">
                    {task.title}
                  </h1>

                  {/* 説明 */}
                  {task.description && (
                    <p className="text-base md:text-lg lg:text-[20px] text-[#475569] text-center max-w-[477px]">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="w-full max-w-[740px]">
                {/* 動画プレーヤー（動画がある場合） */}
                {task.video_full && (
                  <div className="mb-8 aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <iframe
                      src={task.video_full}
                      className="w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* マークダウンコンテンツ */}
                {task.content ? (
                  <div className="prose prose-gray max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {task.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <div className="text-yellow-800 font-medium mb-2">
                      コンテンツが利用できません
                    </div>
                    <div className="text-yellow-600 text-sm">
                      このタスクにはまだコンテンツが設定されていません。
                    </div>
                  </div>
                )}

                {/* ナビゲーション */}
                <div className="mt-12 pt-8 border-t border-gray-200">
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
