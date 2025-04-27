
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const TrainingHeader = () => {
  const { user } = useAuth();

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
            to="/training/guide"
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
        <div className="flex-1 flex items-center justify-end gap-4">
          {!user ? (
            <>
              <Link
                to="/auth"
                className="inline-flex h-9 items-center justify-center px-4 py-2 rounded-full border-2 border-[#0D221D] hover:bg-gray-50 transition-colors"
              >
                <span className="font-['Rounded_Mplus_1c'] text-sm font-bold">
                  ログイン
                </span>
              </Link>
              <Link
                to="/auth?mode=signup"
                className="inline-flex h-9 items-center justify-center px-4 py-2 rounded-full border-2 border-[#0D221D] hover:bg-gray-50 transition-colors"
              >
                <span className="font-['Rounded_Mplus_1c'] text-sm font-bold">
                  はじめる
                </span>
              </Link>
            </>
          ) : (
            <Link
              to="/training/dashboard"
              className="inline-flex h-9 items-center justify-center px-4 py-2 rounded-full border-2 border-[#0D221D] hover:bg-gray-50 transition-colors"
            >
              <span className="font-['Rounded_Mplus_1c'] text-sm font-bold">
                マイページ
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default TrainingHeader;
