
import React from "react";

const TrainingHero = () => {
  return (
    <section 
      className="flex flex-col items-center pt-10 w-full" 
      role="banner"
      aria-labelledby="training-hero-title"
    >
      <div className="w-full flex flex-col gap-4 border-b border-[#e2e8f0] pb-10">
        <h1 
          id="training-hero-title"
          className="font-['Rounded_Mplus_1c_Bold'] text-[36px] text-[#1d382f] text-left text-nowrap leading-[40px]"
        >
          トレーニング。それは"可能性"をひらく扉。
        </h1>
        
        <p className="font-medium text-[16px] text-[#475569] text-left">
          各コースで身につけたことをアウトプットするお題を並べています🙋
        </p>
      </div>
    </section>
  );
};

export default TrainingHero;
