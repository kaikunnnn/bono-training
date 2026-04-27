import Link from "next/link";
import TrainingLayout from "@/components/training/TrainingLayout";
import { Button } from "@/components/ui/button";

export default function TaskNotFound() {
  return (
    <TrainingLayout>
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          タスクが見つかりません
        </h2>
        <p className="text-gray-600 mb-6">
          お探しのタスクは存在しないか、削除された可能性があります。
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/training">トレーニング一覧に戻る</Link>
          </Button>
        </div>
      </div>
    </TrainingLayout>
  );
}
