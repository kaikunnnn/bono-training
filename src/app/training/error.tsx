"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TrainingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Training error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        トレーニングの読み込みでエラーが発生しました
      </h2>
      <p className="text-gray-600 mb-6">
        {error.message || "しばらく経ってからもう一度お試しください。"}
      </p>
      <div className="flex gap-4">
        <Button onClick={reset}>再試行</Button>
        <Button variant="outline" asChild>
          <Link href="/">ホームに戻る</Link>
        </Button>
      </div>
    </div>
  );
}
