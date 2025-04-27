
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const TrainingHeader = () => {
  const { user } = useAuth();

  return (
    <header className="w-full h-20 px-6 md:px-8">
      <div className="max-w-[1670px] mx-auto h-full flex justify-between items-center">
        <div className="flex items-center">
          <span className="font-['Futura'] text-xl font-bold tracking-wider">BONO</span>
          <span className="text-[8px] text-gray-600 ml-1.5">TRAINING</span>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <Link 
            to="/training/guide"
            className="flex items-center justify-center px-4 py-3 rounded-full border-2 border-[#0D221D] font-['Rounded_Mplus_1c'] text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            遊び方
          </Link>
          
          {!user ? (
            <>
              <Link 
                to="/auth"
                className="flex items-center justify-center px-4 py-3 rounded-full border-2 border-[#0D221D] font-['Rounded_Mplus_1c'] text-sm font-bold hover:bg-gray-50 transition-colors"
              >
                ログイン
              </Link>
              <Link 
                to="/auth?mode=signup"
                className="flex items-center justify-center px-4 py-3 rounded-full border-2 border-[#0D221D] font-['Rounded_Mplus_1c'] text-sm font-bold hover:bg-gray-50 transition-colors"
              >
                はじめる
              </Link>
            </>
          ) : (
            <Link 
              to="/training/dashboard"
              className="flex items-center justify-center px-4 py-3 rounded-full border-2 border-[#0D221D] font-['Rounded_Mplus_1c'] text-sm font-bold hover:bg-gray-50 transition-colors"
            >
              マイページ
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default TrainingHeader;
