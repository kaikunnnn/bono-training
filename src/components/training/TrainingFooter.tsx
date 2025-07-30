import React from "react";
import { Youtube, Twitter } from "lucide-react";

const TrainingFooter = () => {
  return (
    <footer className="w-full border-t border-[#d4d4d8] bg-white">
      <div className="mx-auto max-w-[1280px] px-6 py-12">
        {/* Main Block */}
        <div className="flex justify-between items-start mb-8">
          {/* Left Section */}
          <div className="flex-1">
            {/* SNS Links */}
            <div className="mb-6">
              <div className="flex gap-4 mb-4">
                <a 
                  href="https://www.youtube.com/channel/UCghPjck_LzxNMs2tI4PPYlQ/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#475569] hover:text-training-text-primary transition-colors"
                >
                  <Youtube size={20} />
                  <span className="text-sm font-medium">YouTube</span>
                </a>
                <a 
                  href="https://x.com/takumii_kai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#475569] hover:text-training-text-primary transition-colors"
                >
                  <Twitter size={20} />
                  <span className="text-sm font-medium">Twitter</span>
                </a>
              </div>
            </div>

            {/* About BONO Training */}
            <div>
              <h3 className="text-base font-semibold text-training-text-primary mb-3">
                ボノトレについて
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed max-w-md">
                BONOトレーニングは、UI/UXデザインスキルを実践的に身につけるための短期集中型トレーニングプラットフォームです。
                毎日の小さなチャレンジを通じて、確実にスキルアップを図れます。
              </p>
            </div>
          </div>

          {/* Right Section - Logo Area */}
          <div className="flex-shrink-0 ml-8">
            <div className="w-36 h-36 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-training-text-primary font-bold text-lg">BONO</span>
            </div>
          </div>
        </div>

        {/* Central Message */}
        <div className="text-center py-8 border-t border-gray-100">
          <p className="text-lg font-medium text-training-text-primary">
            毎日のデザイン筋トレで、確実にスキルアップ
          </p>
        </div>

        {/* Bottom Section */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
          {/* Copyright */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-training-text-primary rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">B</span>
            </div>
            <span className="text-sm text-[#475569]">
              © 2024 BONO Training. All rights reserved.
            </span>
          </div>

          {/* Version/Status */}
          <div className="text-sm text-[#475569]">
            Version 1.0.0 - Active
          </div>
        </div>
      </div>
    </footer>
  );
};

export default TrainingFooter;