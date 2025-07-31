
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
import { ChevronDown, Menu } from "lucide-react";
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

  const handleTrainingHomeClick = () => {
    navigate("/training");
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
    <div className="flex flex-col items-center gap-[2px] cursor-pointer" onClick={handleTrainingHomeClick}>
      <span className="font-futura text-xl font-bold tracking-[1px]">
        BONO
      </span>
      <span className="font-futura text-[8px] font-bold tracking-[1px] text-[#666666]">
        TRAINING
      </span>
    </div>
  );

  const RightSection = () => (
    <div className="flex-1 flex items-center justify-end max-w-[480px]">
      <button
        onClick={() => window.open("https://bo-no.design", "_blank", "noopener,noreferrer")}
        className="inline-flex items-center justify-center px-4 h-10 rounded-full border-2 border-[#0d221d] transition-colors"
      >
        <span className="font-rounded-mplus text-sm font-bold">
          BONOに戻る
        </span>
      </button>
    </div>
  );

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
