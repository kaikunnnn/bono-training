// pages/series.js
import React from "react";

const ContentTitle = ({ props }) => {
  return (
    <>
    {/* Section Title */}
    <div className="ContentSectiontitle flex-col justify-start items-start gap-4 flex  text-left">
        <div className=" self-stretch text-black text-xl font-bold font-['Noto Sans JP'] leading-7 tracking-wide">
            <h3>{props.title}</h3>
        </div>
        <div className="UiUx self-stretch text-black text-opacity-70 text-lg font-medium font-['Noto Sans'] leading-9 tracking-wide">
          <p>
            未経験からUI/UXデザイナーになるためには、デザインの基本原則やツールの習得、ユーザーリサーチやインタラクションデザインの学習、そして実践を通じてスキルを磨き、ポートフォリオ作成やネットワーキングを行うことが重要です
          </p>
        </div>
      </div>

      <div className="Line20 self-stretch h-px border border-white border-opacity-20"></div>
    </>
  );
};

export default ContentTitle;
