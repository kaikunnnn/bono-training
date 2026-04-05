import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import Logo from "@/components/common/Logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  /**
   * ヘッダーグラデーションの種類
   * - 'default': Figma仕様のグラデーション（青紫→クリーム→透明）
   * - 'top': トップページ専用デザイン
   * - 'none': グラデーションなし
   */
  headerGradient?: 'default' | 'top' | 'none';
}

/**
 * レイアウトコンポーネント
 * デスクトップ: 左にSidebar（200px）、右にメインコンテンツ
 * モバイル: ハンバーガーメニューでSidebar開閉
 */
const Layout = ({ children, className, headerGradient = 'default' }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isGradientVisible, setIsGradientVisible] = useState(false);

  // グラデーションのフェードインアニメーション
  useEffect(() => {
    // マウント後に少し遅延させてからフェードイン開始
    const timer = setTimeout(() => {
      setIsGradientVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // スクロール検知（タブレット以下でヘッダー背景を切り替え）
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 初期状態をチェック

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={cn("min-h-screen flex bg-base relative", className)}>
      {/* ヘッダーグラデーション（fixed: スクロールしても固定表示 + フェードインアニメーション） */}
      {headerGradient === 'default' && (
        <div
          className="fixed inset-x-0 top-0 h-[148px] pointer-events-none z-0 transition-opacity duration-1000 ease-out"
          style={{
            background:
              "linear-gradient(180deg, rgb(230, 230, 239) 0%, rgb(250, 242, 237) 44.3%, rgb(249, 248, 246) 84.3%, rgba(249, 248, 246, 0) 100%)",
            opacity: isGradientVisible ? 1 : 0,
          }}
        />
      )}
      {headerGradient === 'top' && (
        <div
          className="fixed inset-x-0 top-0 h-[600px] sm:h-[700px] lg:h-[800px] pointer-events-none z-0 transition-opacity duration-1000 ease-out"
          style={{
            background:
              "linear-gradient(180deg, rgba(226, 232, 228, 0.6) 0%, rgba(242, 243, 240, 0.3) 50%, transparent 100%)",
            opacity: isGradientVisible ? 1 : 0,
          }}
        />
      )}
      {/* デスクトップ用サイドバー（1280px以上） */}
      <aside className="hidden xl:block fixed left-0 top-0 h-screen z-10">
        <Sidebar />
      </aside>

      {/* モバイル・タブレット用ヘッダーバー（1280px未満） */}
      {/* モバイル・タブレット用ヘッダーバー - Pattern D: backdrop-blur-sm bg-white/50 */}
      <div className={cn(
        "xl:hidden fixed top-0 left-0 right-0 z-50 flex flex-col transition-all duration-200",
        isScrolled ? "backdrop-blur-sm bg-white/50" : "bg-transparent"
      )}>
        {/* Row 1: ハンバーガー + ロゴ */}
        <div className="h-14 flex items-center justify-center relative">
          {/* ハンバーガーメニュー（左寄せ） */}
          <div className="absolute left-4">
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

          {/* BONOロゴ（中央） */}
          <Link to="/" className="flex items-center">
            <Logo width={68} height={20} />
          </Link>
        </div>

      </div>

      {/* メインコンテンツエリア（グラデーションの上に配置） */}
      <div className="flex-1 flex flex-col xl:ml-[200px] relative z-[1] min-w-0 w-full xl:w-[calc(100%-200px)]">
        <main className="flex-1 pt-14 xl:pt-0 min-w-0 w-full">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
