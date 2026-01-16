import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * レイアウトコンポーネント
 * デスクトップ: 左にSidebar（200px）、右にメインコンテンツ
 * モバイル: ハンバーガーメニューでSidebar開閉
 */
const Layout = ({ children, className }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={cn("min-h-screen flex bg-base", className)}>
      {/* デスクトップ用サイドバー（1024px以上） */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen">
        <Sidebar />
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
            <Sidebar />
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
};

export default Layout;
