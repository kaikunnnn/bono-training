import React from "react";

const img =
  "http://localhost:3845/assets/7adedf86cb9e11dbbff0adf4fd9c70e59c4bdbae.png";

const FigmaItem2: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 w-full" data-name="item2">
      {/* Image Container */}
      <div className="h-96 w-full overflow-hidden relative" data-name="image">
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat rounded-t-[350px] rounded-b-5"
          style={{ backgroundImage: `url('${img}')` }}
        >
          <div className="absolute inset-[-3.5px] border-4 border-white pointer-events-none rounded-t-[355px] rounded-b-6" />
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col gap-2 w-full" data-name="DetailContainer">
        {/* Header Section */}
        <div className="flex flex-col gap-2 text-left text-slate-900 w-full">
          {/* Title Section */}
          <div className="flex flex-col gap-1 font-inter font-bold">
            <div className="text-sm">チャレンジ</div>
            <h2 className="text-2xl leading-8">出張申請サービスを作ろう</h2>
          </div>
          <p className="text-xs font-medium leading-4">
            ユーザーヒアリングの基本を実践しよう
          </p>
        </div>

        {/* Details Section */}
        <div className="flex flex-col gap-1 w-full max-w-[362px]">
          {/* Category Row */}
          <div className="flex items-center gap-1">
            <div className="bg-slate-100 rounded px-1 w-15">
              <span className="text-xs font-extrabold text-red-950 text-center">
                筋トレ部位
              </span>
            </div>
            <span className="text-sm font-semibold text-red-950">
              UIビジュアル
            </span>
          </div>

          {/* Difficulty Row */}
          <div className="flex items-center gap-1">
            <div className="bg-slate-100 rounded px-1 w-15">
              <span className="text-xs font-extrabold text-red-950 text-center">
                難易度
              </span>
            </div>
            <span className="text-sm font-semibold text-red-950">やさしい</span>
          </div>
        </div>

        {/* Button */}
        <button className="w-full border border-slate-600 rounded-full py-2.5 px-4">
          <span className="text-base font-semibold text-slate-950">
            トレーニングを見る
          </span>
        </button>
      </div>
    </div>
  );
};

export default FigmaItem2;
