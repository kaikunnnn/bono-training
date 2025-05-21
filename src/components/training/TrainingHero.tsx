
import React from "react";
import { Link } from "react-router-dom";

const TrainingHero = () => {
  return (
    <div className="flex flex-col items-center pt-36 gap-10 w-full px-4">
      <div className="flex items-center gap-5 font-['Inter'] text-[48px] font-bold text-[#1D382F]">
        <span>デザトレつかって</span>
        <span className="[text-stroke:1.69px_#1D382F] text-black">ポートフォリオ作成</span>
      </div>
      
      <div className="w-full max-w-[502px] text-center font-['Noto_Sans'] text-xl font-bold text-[rgba(13,15,24,0.8)] leading-8">
        <span>SNS情報ばっかり見て肩こわばってない？</span>
        <br />
        <span>そうだ！デザイン筋を鍛える旅に出かけようっ！</span>
      </div>
      
      <Link
        to="/training/guide"
        className="inline-flex items-center justify-center px-4 py-3 rounded-full border border-[rgba(13,15,24,0.9)] bg-[#0D221D] text-white font-['Rounded_Mplus_1c'] text-sm font-bold tracking-wider hover:bg-[#1D382F] transition-colors"
      >
        使い方を見る
      </Link>
    </div>
  );
};

export default TrainingHero;
