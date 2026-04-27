import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-8xl font-bold text-muted-foreground/30 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">
          ページが見つかりません
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          お探しのページは存在しないか、移動した可能性があります。
          URLをご確認ください。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              ホームに戻る
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/lessons">
              <ArrowLeft className="w-4 h-4 mr-2" />
              レッスン一覧へ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
