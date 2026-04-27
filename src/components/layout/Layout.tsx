"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  user?: {
    id: string;
    email: string;
  } | null;
}

/**
 * レイアウトコンポーネント
 * デスクトップ: 左にSidebar（200px）、右にメインコンテンツ
 * モバイル: ハンバーガーメニューでSidebar開閉
 *
 * 以下のページは独自のレイアウトを使用するため、グローバルナビを非表示:
 * - /articles/[slug]: ArticleSideNavNew を使用
 * - /training/*: TrainingLayout を使用
 * - /blog/*: BlogHeader/Footer を使用
 * - /feedback-apply/submit: フォーム専用ページ
 */
export function Layout({ children, className, user }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // グローバルナビを非表示にするページ
  const shouldSkipGlobalLayout = (() => {
    if (!pathname) return false;

    // /articles/[slug] - 記事詳細（独自サイドナビ）
    if (pathname.startsWith("/articles/") && pathname !== "/articles") return true;

    // /training/* - トレーニングページ（TrainingLayout使用）
    if (pathname.startsWith("/training")) return true;

    // /blog/* - ブログページ（独自ヘッダー・フッター）
    if (pathname.startsWith("/blog")) return true;

    // /feedback-apply/submit - フォーム専用ページ
    if (pathname === "/feedback-apply/submit") return true;

    return false;
  })();

  // 独自レイアウトを持つページでは children のみ返す
  if (shouldSkipGlobalLayout) {
    return <>{children}</>;
  }

  return (
    <div className={cn("min-h-screen flex bg-base", className)}>
      {/* デスクトップ用サイドバー（1024px以上） */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen">
        <Sidebar user={user} />
      </aside>

      {/* モバイル用ハンバーガーメニュー（1024px未満） */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 bg-white rounded-lg shadow-md"
              aria-label="メニューを開く"
              aria-expanded={isSidebarOpen}
            >
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px] h-full">
            <Sidebar user={user} />
          </SheetContent>
        </Sheet>
      </div>

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col lg:ml-[200px]">
        <main className="flex-1 pt-16 lg:pt-0">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
