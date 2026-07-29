"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, BookOpen, RotateCcw } from "lucide-react";

export default function ArticleDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Article detail error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center px-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-text-primary">
          記事を読み込めませんでした
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          この記事の読み込み中にエラーが発生しました。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            もう一度試す
          </Button>
          <Button variant="outline" asChild>
            <Link href="/lessons">
              <BookOpen className="w-4 h-4 mr-2" />
              レッスン一覧へ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
