
import React from "react";

const TrainingHero = () => {
  return (
    <section 
      className="flex flex-col items-center py-10 gap-4 w-full border-b border-[#e2e8f0]" 
      role="banner"
      aria-labelledby="training-hero-title"
    >
      <h1 
        id="training-hero-title"
        className="font-['Rounded_Mplus_1c_Bold'] text-[36px] text-[#1d382f] text-center text-nowrap leading-[40px]"
      >
        トレーニング。それは"可能性"をひらく扉。
      </h1>
      
      <p 
        className="font-['Noto_Sans'] font-medium text-[16px] text-[#475569] text-center"
        style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
      >
        各コースで身につけたことをアウトプットするお題を並べています🙋
      </p>
    </section>
  );
};

export default TrainingHero;
