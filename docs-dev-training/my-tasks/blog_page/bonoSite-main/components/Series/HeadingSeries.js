// pages/series.js
import React from "react";

const HeadingSeries = ({ props }) => {
  return (
    <>
     <div className="SeriesHeading w-full pb-6 border-b border-gray border-opacity-10 flex-col justify-start items-start gap-4 inline-flex">
          <div className="SmilingFaceWithSunglasses w-10 h-10 relative">
            <div className="LeftLensHighlight w-1 h-1 left-[11.22px] top-[10.13px] absolute origin-top-left rotate-[-25.88deg] bg-gradient-to-b from-white to-white rounded-full" />
            <div className="RightLensHighlight w-1 h-1 left-[31.26px] top-[10.13px] absolute origin-top-left rotate-[-25.88deg] bg-gradient-to-b from-white to-white rounded-full" />
          </div>
          <div className="Ui text-black text-3xl font-bold font-['Noto Sans JP'] leading-10 tracking-wide">
            <h2>{props}</h2>
          </div>
    </div>
    </>
  );
};

export default HeadingSeries;
