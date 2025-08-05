import React from "react";
import { Youtube, Twitter } from "lucide-react";

const TrainingFooter = () => {
  return (
    <div className="size-full flex justify-center">
      <div className="max-w-[1280px] w-[88%]">
        <div data-name="footer-main-block" className="px-0 py-12 flex flex-col md:flex-row md:justify-between gap-8 md:gap-0">
          <div className="flex flex-col md:flex-row gap-8 md:gap-[68px]">
            {/* SNS Section */}
            <div data-name="content-block-sns" className="w-full md:w-[178px] flex flex-col gap-4">
              <h3 className="text-[#1D382F] font-['Noto_Sans_JP'] font-medium text-sm">SNS</h3>
              <div className="flex flex-col gap-3">
                <a 
                  href="https://www.youtube.com/channel/UCghPjck_LzxNMs2tI4PPYlQ/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[rgba(13,15,24,0.8)] font-['Noto_Sans_Display'] font-normal text-sm hover:text-[#1D382F]/80 transition-colors"
                >
                  <Youtube size={16} />
                  YouTube
                </a>
                <a 
                  href="https://x.com/takumii_kai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[rgba(13,15,24,0.8)] font-['Noto_Sans_Display'] font-normal text-sm hover:text-[#1D382F]/80 transition-colors"
                >
                  <Twitter size={16} />
                  X
                </a>
              </div>
            </div>

            {/* About BONO Section */}
            <div data-name="content-block-about" className="w-full md:w-[239px] flex flex-col gap-4">
              <h3 className="text-[#1D382F] font-['Noto_Sans_JP'] font-medium text-sm">ボノトレについて</h3>
              <p className="text-[rgba(13,15,24,0.8)] font-['Noto_Sans_Display'] font-normal text-sm leading-relaxed adjustLetterSpacing">
                BONOを運営するカイクンが実験的に作成した。デザイントレーニングのサイトです。作るを前提に基礎を磨くお題を用意してアウトプットでつながることを画策中です。
              </p>
            </div>
          </div>

          {/* Logo Section */}
          <div data-name="logo-area" className="w-full md:w-[144px] h-[144px] flex flex-col items-center justify-center">
            <div className="text-[#1D382F] font-['Futura'] font-bold text-[39.45px] leading-[31.562px] tracking-tight">
              BONO
            </div>
            <div className="text-[#1D382F] font-['Futura'] font-bold text-[15.78px] mt-1">
              TRAINING
            </div>
          </div>
        </div>

        {/* Message Section */}
        <div data-name="message" className="flex justify-center py-6">
          <p className="text-[#1D382F] font-rounded-mplus font-bold text-xs text-center adjustLetterSpacing">
            机上の空論ではなく人に響く体験を<br />
            クリエイションしていこう
          </p>
        </div>

        {/* Bottom Section */}
        <div data-name="bottom-section" className="flex justify-between items-center py-4">
          <div className="text-[rgba(13,15,24,0.8)] font-['Doto'] font-bold text-xs">
            COPYRIGHT ©BONO
          </div>
          <div className="text-[rgba(13,15,24,0.8)] font-['Doto'] font-bold text-xs">
            STATUS: alpha test
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingFooter;