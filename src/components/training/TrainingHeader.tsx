
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
import { ChevronDown } from "lucide-react";

const TrainingHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/training/login");
  };

  return (
    <header className="flex flex-col items-end w-full">
      {/* Top bar */}
      <div className="w-full px-6">
        <Link 
          to="/"
          className="inline-flex items-center bg-[#0D0F18] border border-white/[0.08] rounded-b-[10px] pl-3 pr-2 py-1"
        >
          <span className="font-['Futura'] text-[10.5px] font-bold tracking-[0.75px] text-white">
            BONO
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="ml-1"
          >
            <path
              d="M5.99935 3.3335V4.66683H10.3927L2.66602 12.3935L3.60602 13.3335L11.3327 5.60683V10.0002H12.666V3.3335H5.99935Z"
              fill="white"
            />
          </svg>
        </Link>
      </div>

      {/* Main header */}
      <div className="flex justify-between items-center w-full h-20 px-5">
        {/* Left block */}
        <div className="flex-1 flex items-center justify-start">
          <Link 
            to="/training/about"
            className="inline-flex h-9 items-center justify-center px-4 py-2 rounded-full border-2 border-[#0D221D] hover:bg-gray-50 transition-colors"
          >
            <span className="font-['Rounded_Mplus_1c'] text-sm font-bold">
              遊び方
            </span>
          </Link>
        </div>

        {/* Center - Logo */}
        <Link to="/training" className="flex flex-col items-center gap-[2px]">
          <span className="font-['Futura'] text-xl font-bold tracking-[1px]">
            BONO
          </span>
          <span className="font-['Futura'] text-[8px] font-bold tracking-[1px] text-[#666666]">
            TRAINING
          </span>
        </Link>

        {/* Right block */}
        <div className="flex-1 flex items-center justify-end gap-3">
          {!user ? (
            <>
              <Link
                to="/training/login"
                className="inline-flex h-9 items-center justify-center px-4 py-2 rounded-full border-2 border-[#0D221D] hover:bg-gray-50 transition-colors"
              >
                <span className="font-['Rounded_Mplus_1c'] text-sm font-bold">
                  ログイン
                </span>
              </Link>
              <Link
                to="/training/plan"
                className="inline-flex h-9 items-center justify-center px-3 py-2 rounded-full border-2 border-[#0D221D] hover:bg-gray-50 transition-colors"
              >
                <span className="font-['Rounded_Mplus_1c'] text-sm font-bold">
                  プラン
                </span>
              </Link>
              <Link
                to="/training/signup"
                className="inline-flex h-9 items-center justify-center px-4 py-2 rounded-full border-2 border-[#0D221D] hover:bg-gray-50 transition-colors"
              >
                <span className="font-['Rounded_Mplus_1c'] text-sm font-bold">
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
              <DropdownMenuContent align="end">
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
      </div>
    </header>
  );
};

export default TrainingHeader;
