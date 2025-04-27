
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const TrainingHeader = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-end w-full bg-white">
      {/* Top bar */}
      <div className="flex items-center px-3 py-1 rounded-b-[10px] border border-white/[0.08] bg-[#0D0F18]">
        <span className="font-['Futura'] text-[10.5px] font-bold text-white tracking-[0.75px]">
          BONO
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="arrow-icon"
        >
          <path
            d="M5.99935 3.3335V4.66683H10.3927L2.66602 12.3935L3.60602 13.3335L11.3327 5.60683V10.0002H12.666V3.3335H5.99935Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Main header */}
      <div className="flex justify-between items-center w-full h-20 px-5 md:flex-row md:items-center">
        {/* Left side - How to play */}
        <div className="hidden md:flex items-center gap-4">
          <div className="h-16 px-2">
            <Link 
              to="/training/guide"
              className="flex items-center justify-center px-4 py-3 rounded-full border-2 border-[#0D221D] font-['Rounded_Mplus_1c'] text-sm font-bold"
            >
              遊び方
            </Link>
          </div>
        </div>

        {/* Center - Logo */}
        <div className="flex flex-col items-center relative">
          <span className="font-['Futura'] text-xl font-bold tracking-wider text-black">
            BONO
          </span>
          <span className="font-['Futura'] text-[8px] font-bold tracking-wider text-[#666]">
            TRAINING
          </span>
        </div>

        {/* Right side - Auth buttons */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <>
              <div className="h-16 px-2">
                <Link
                  to="/auth"
                  className="flex items-center justify-center px-4 py-3 rounded-full border-2 border-[#0D221D] font-['Rounded_Mplus_1c'] text-sm font-bold"
                >
                  ログイン
                </Link>
              </div>
              <div className="h-16 px-2">
                <Link
                  to="/auth?mode=signup"
                  className="flex items-center justify-center px-4 py-3 rounded-full border-2 border-[#0D221D] font-['Rounded_Mplus_1c'] text-sm font-bold"
                >
                  はじめる
                </Link>
              </div>
            </>
          ) : (
            <div className="h-16 px-2">
              <Link
                to="/training/dashboard"
                className="flex items-center justify-center px-4 py-3 rounded-full border-2 border-[#0D221D] font-['Rounded_Mplus_1c'] text-sm font-bold"
              >
                マイページ
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingHeader;
