"use client";

import { Suspense, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { IntentPrefetchLink } from "@/components/common/IntentPrefetchLink";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import Logo from "@/components/common/Logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { WelcomeToast } from "@/components/auth/WelcomeToast";
import { SignUpTracker } from "@/components/analytics/SignUpTracker";
import { AnnouncementBar } from "./AnnouncementBar";
import { Menu } from "lucide-react";
import { MemberGate } from "./MemberPromiseProvider";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { BoardNewDot } from "@/components/questions/BoardNewDot";
import { StaleSessionCleaner } from "@/components/auth/StaleSessionCleaner";
import { MemberStatusRecorder } from "@/components/analytics/MemberStatusRecorder";
import { SiteVisitRecorder } from "@/components/analytics/SiteVisitRecorder";
import type { LayoutMemberState } from "@/lib/services/layout-member-state";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

// #277 Phase 3 B 試作: 会員依存の部品（Suspense の中で会員情報が確定してから描画する）
const bellFor = (m: LayoutMemberState) =>
  m.user ? <NotificationBell key={m.user.id} userId={m.user.id} initialUnreadCount={m.unreadCount} /> : null;
const dotFor = (m: LayoutMemberState) => (m.user && m.boardUnseen ? <BoardNewDot /> : null);
const memberEffects = (
  <MemberGate fallback={null}>
    {(m) => (
      <>
        {!m.user && m.invalidSession && <StaleSessionCleaner />}
        {m.memberStatus && <MemberStatusRecorder status={m.memberStatus} />}
        {m.user && <SiteVisitRecorder userId={m.user.id} />}
      </>
    )}
  </MemberGate>
);

/**
 * レイアウトコンポーネント
 * デスクトップ: 左にSidebar（200px）、右にメインコンテンツ
 * モバイル: ハンバーガーメニューでSidebar開閉
 *
 * 以下のページは独自のレイアウトを使用するため、グローバルナビを非表示:
 * - /contents/[slug]: ArticleSideNavNew を使用
 * - /blog/*: BlogHeader/Footer を使用
 * - /feedback-apply/submit: フォーム専用ページ
 */
export function Layout({ children, className }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isGradientVisible, setIsGradientVisible] = useState(false);
  const pathname = usePathname();

  // グラデーションのフェードインアニメーション
  useEffect(() => {
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
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // グローバルナビを非表示にするページ
  const shouldSkipGlobalLayout = (() => {
    if (!pathname) return false;
    if (pathname.startsWith("/contents/")) return true;
    if (pathname.startsWith("/blog")) return true;
    if (pathname === "/feedback-apply/submit") return true;
    // #139: 投稿モードは専用シェル（PostFlowShell）を使うためグローバルナビ非表示
    if (pathname === "/questions/new") return true;
    if (pathname.startsWith("/docs")) return true; // 共有用ドキュメント（ワークショップ等）は独立表示
    return false;
  })();

  if (shouldSkipGlobalLayout) {
    return (
      <>
        {memberEffects}
        {children}
        <Toaster />
        <Suspense fallback={null}>
          <WelcomeToast />
        <SignUpTracker />
        </Suspense>
      </>
    );
  }

  // /dev/top6: 背景白 + サイドバー右端に薄いボーダーのパターン確認用（このページのみの見た目差分）
  const isTop6 = pathname?.startsWith("/dev/top6") ?? false;
  const isTop5 = pathname?.startsWith("/dev/top5") ?? false;
  // 本番トップ `/` と、ログイン中でも新トップを見られる /top（同一構成）
  const isHome = pathname === "/" || pathname === "/top";
  // `/`, /top, /dev/top5, /dev/top6: ヘッダーグラデーションの高さを半分にする（新トップの見た目）
  const isHalfGradient = isHome || isTop5 || isTop6;
  // お知らせバー（#220）は /top と /mypage のみ（`/` には出さない）
  const showAnnouncement = pathname === "/top" || pathname === "/mypage";

  return (
    <div className={cn("min-h-screen flex relative", isTop6 ? "bg-white" : "bg-base", className)}>
      {/* ヘッダーグラデーション（mainと同じ） */}
      <div
        className={cn(
          "fixed inset-x-0 top-0 pointer-events-none z-0 transition-opacity duration-1000 ease-out",
          isHalfGradient ? "h-[74px]" : "h-[148px]"
        )}
        style={{
          background:
            "linear-gradient(180deg, rgb(230, 230, 239) 0%, rgb(250, 242, 237) 44.3%, rgb(249, 248, 246) 84.3%, rgba(249, 248, 246, 0) 100%)",
          opacity: isGradientVisible ? 1 : 0,
        }}
      />

      {/* デスクトップ用サイドバー（1024px以上）。MacBook Air等のノートPCで
          非最大化・ズーム時もサイドバーが出るよう、閾値を xl(1280) → lg(1024) に下げた。 */}
      <aside
        className={cn(
          "hidden lg:block fixed left-0 top-0 h-screen z-10",
          isTop6 && "border-r border-black/10"
        )}
      >
        <MemberGate fallback={<Sidebar user={undefined} />}>
          {(m) => <Sidebar user={m.user} notificationSlot={bellFor(m)} boardDotSlot={dotFor(m)} />}
        </MemberGate>
      </aside>

      {/* モバイル・タブレット用ヘッダーバー（1024px未満） */}
      <div
        className={cn(
          "lg:hidden fixed top-0 left-0 right-0 z-50 flex flex-col transition-all duration-200",
          isScrolled ? "backdrop-blur-sm bg-white/50" : "bg-transparent"
        )}
      >
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
              <SheetContent
                side="left"
                className="p-0 w-[280px] h-full"
                // メニュー内のリンクを選択したら、遷移先が同じ場合もSheetを閉じる
                onClick={(e) => {
                  if (e.target instanceof Element && e.target.closest("a")) {
                    setIsSidebarOpen(false);
                  }
                }}
                // 開いた時に検索boxへ自動フォーカスさせない（モバイルでキーボードが出てしまうため）
                onOpenAutoFocus={(e) => e.preventDefault()}
                // 黒い半透明オーバーレイを出さない（透明のまま外側タップで閉じる挙動は維持）
                overlayClassName="bg-transparent"
              >
                <MemberGate fallback={<Sidebar user={undefined} />}>
                  {(m) => <Sidebar user={m.user} />}
                </MemberGate>
              </SheetContent>
            </Sheet>
          </div>

          {/* BONOロゴ（中央）: mainと同様、常に / にリンク（ログイン済みなら / が /mypage にリダイレクト） */}
          <IntentPrefetchLink href="/" className="flex items-center">
            <Logo width={68} height={20} />
          </IntentPrefetchLink>

          {/* 通知ベル（右寄せ・#160 S3）。ログイン時のみ notificationSlot が渡る */}
          <MemberGate fallback={null}>
            {(m) => (m.user ? <div className="absolute right-4">{bellFor(m)}</div> : null)}
          </MemberGate>
        </div>
      </div>

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col lg:ml-[200px] relative z-[1] min-w-0 w-full lg:w-[calc(100%-200px)]">
        <main className="flex-1 pt-14 lg:pt-0 min-w-0 w-full">
          {/* お知らせバー: main の先頭に置く。タブレット以下は pt-14 により固定ヘッダーの真下、
              PC はサイドバー右のメインブロック最上部（全幅）になる */}
          {showAnnouncement && <AnnouncementBar />}
          {memberEffects}
          {children}
        </main>
        <Footer />
      </div>
      <Toaster />
      <Suspense fallback={null}>
        <WelcomeToast />
        <SignUpTracker />
      </Suspense>
    </div>
  );
}

export default Layout;
