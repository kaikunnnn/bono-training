
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, ExternalLink } from "lucide-react";
import { useMobile, useTablet, useDesktop } from "@/hooks/use-mobile";

const TrainingHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const isTablet = useTablet();
  const isDesktop = useDesktop();

  const handleSignOut = async () => {
    await signOut();
    navigate("/training/login");
  };

  const handleBonoLinkClick = () => {
    window.open("https://bo-no.design", "_blank");
  };

  const LeftSection = () => {
    if (isMobile) {
      return (
        <div className="flex-1 flex items-center justify-start">
          <span className="font-rounded-mplus text-sm font-bold text-[#475569]">
            α版
          </span>
        </div>
      );
    }
    
    if (isTablet) {
      return (
        <div className="flex-1 flex items-center justify-start">
          <span className="font-rounded-mplus text-sm font-bold text-[#475569]">
            αテスト版
          </span>
        </div>
      );
    }

    return (
      <div className="flex-1 flex items-center justify-start max-w-[480px]">
        <span className="font-rounded-mplus text-sm font-bold text-[#475569]">
          αテスト版だよ
        </span>
      </div>
    );
  };

  const CenterSection = () => (
    <div 
      className="flex flex-col items-center gap-[2px] cursor-pointer hover:opacity-80 transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center" 
      onClick={handleBonoLinkClick}
      role="button"
      tabIndex={0}
      aria-label="BONO Design サイトを開く"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleBonoLinkClick();
        }
      }}
    >
      <span className="font-futura text-xl font-bold tracking-[1px] select-none">
        BONO
      </span>
      <span className="font-futura text-[8px] font-bold tracking-[1px] text-slate-500 select-none">
        TRAINING
      </span>
      <ExternalLink className="h-3 w-3 ml-1 opacity-60" aria-hidden="true" />
    </div>
  );

  const RightSection = () => {
    if (isMobile) {
      return (
        <div className="flex-1 flex items-center justify-end">
          {!user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2 min-h-[44px] min-w-[44px]"
                  aria-label="メニューを開く"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border z-50">
                <DropdownMenuItem onClick={() => navigate('/training/about')}>
                  遊び方
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/training/login')}>
                  ログイン
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/training/plan')}>
                  プラン
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/training/signup')}>
                  はじめる
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 p-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border z-50">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  アカウント情報
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/training/plan')}>
                  プランを確認・変更
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      );
    }

    if (isTablet) {
      return (
        <div className="flex-1 flex items-center justify-end gap-2 max-w-[480px]">
          {!user ? (
            <>
              <Link
                to="/training/login"
                className="inline-flex h-10 min-w-[80px] items-center justify-center px-3 py-2 rounded-full border-2 border-slate-700 hover:bg-slate-50 transition-colors touch-manipulation"
                aria-label="ログインページに移動"
              >
                <span className="font-rounded-mplus text-sm font-bold text-slate-700">
                  ログイン
                </span>
              </Link>
              <Link
                to="/training/signup"
                className="inline-flex h-10 min-w-[80px] items-center justify-center px-3 py-2 rounded-full border-2 border-slate-700 hover:bg-slate-50 transition-colors touch-manipulation"
                aria-label="サインアップページに移動"
              >
                <span className="font-rounded-mplus text-sm font-bold text-slate-700">
                  はじめる
                </span>
              </Link>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border z-50">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  アカウント情報
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/training/plan')}>
                  プランを確認・変更
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      );
    }

    // Desktop
    return (
      <div className="flex-1 flex items-center justify-end gap-3 max-w-[480px]">
        {!user ? (
          <>
            <Link
              to="/training/login"
              className="inline-flex h-11 min-w-[90px] items-center justify-center px-4 py-2 rounded-full border-2 border-slate-700 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all touch-manipulation"
              aria-label="ログインページに移動"
            >
              <span className="font-rounded-mplus text-sm font-bold text-slate-700">
                ログイン
              </span>
            </Link>
            <Link
              to="/training/plan"
              className="inline-flex h-11 min-w-[80px] items-center justify-center px-3 py-2 rounded-full border-2 border-slate-700 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all touch-manipulation"
              aria-label="プランページに移動"
            >
              <span className="font-rounded-mplus text-sm font-bold text-slate-700">
                プラン
              </span>
            </Link>
            <Link
              to="/training/signup"
              className="inline-flex h-11 min-w-[90px] items-center justify-center px-4 py-2 rounded-full border-2 border-slate-700 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all touch-manipulation"
              aria-label="サインアップページに移動"
            >
              <span className="font-rounded-mplus text-sm font-bold text-slate-700">
                はじめる
              </span>
            </Link>
          </>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                {user.email ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <span>アカウント</span>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border z-50">
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                アカウント情報
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/training/plan')}>
                プランを確認・変更
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                ログアウト
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full animate-gradient-fade-in"
            style={{
              background: 'linear-gradient(180deg, hsl(var(--training-gradient-start)) 0%, hsl(var(--training-gradient-middle)) 36.7%, transparent 100%)'
            }}>
      <div className="flex justify-between items-center h-[88px] w-full max-w-[1670px] mx-auto px-5">
        <LeftSection />
        <CenterSection />
        <RightSection />
      </div>
    </header>
  );
};

export default TrainingHeader;
