import React from 'react';

// propsを直接デストラクチャリングして、各プロパティにデフォルト値を設定
const SeriesTop = ({
  coverbook = {},
  category = {},
  title = '',
  whythis = ''
}) => {
  return (
    <div className="TopSeriesExplain w-full flex-col justify-start items-start gap-8 inline-flex">
        <div className="Frame625516 self-stretch flex-col justify-center items-start gap-6 flex">
            <div className="BookHazimetenouiinformationarchitecture">
                <img className="w-28 h-44 bg-white rounded-tl rounded-tr-xl rounded-bl rounded-br-xl shadow" 
                    src={coverbook.src || 'デフォルトの画像URL'} />
            </div>
            <div className="Aboutseries flex-col justify-start items-start gap-4 flex">
            <div className="Frame625180 px-2.5 py-1.5 bg-blue-200 rounded-full justify-start items-start gap-2.5 inline-flex">
                <div className="text-blue-900 text-sm font-bold font-['Noto Sans JP'] leading-snug tracking-widest">
                    <span>{category.name || 'デフォルトカテゴリー'}</span>
                </div>
            </div>
            <div className="Frame625179 flex-col justify-start items-start flex">
                <div className="Ui text-black text-4xl font-bold font-['Noto Sans JP'] leading-10">
                    <h2>{title}</h2>
                </div>
            </div>
            <div className="Metadescription self-stretch text-black text-base font-normal font-['Noto Sans JP'] leading-relaxed tracking-widest">
                <p>{whythis}</p>    
            </div>
            <div className="Frame625520 justify-start items-start gap-11 inline-flex">
                <div className="Frame625406 justify-center items-center gap-4 flex">
                <div className="Frame625413 px-2 py-1 rounded-md border border-white justify-center items-center gap-2.5 flex">
                    <div className=" text-black text-sm font-bold font-['Noto Sans JP'] leading-snug tracking-widest">金額</div>
                </div>
                <div className="Frame625400 w-32 justify-start items-start gap-1 flex">
                    <div className=" w-4 h-5 text-black text-base font-bold font-['Hind'] leading-relaxed tracking-widest">￥</div>
                    <div className="500 text-black text-2xl font-bold font-['Hind'] leading-normal tracking-widest">5,500~</div>
                    <div className=" text-black text-base font-bold font-['Hind'] leading-relaxed tracking-widest">/月</div>
                </div>
                </div>
                <div className="Frame625405 justify-start items-center gap-4 flex">
                <div className="Frame625412 px-2 py-1 rounded-md border border-white justify-start items-start gap-2.5 flex">
                    <div className=" text-black text-sm font-bold font-['Noto Sans JP'] leading-snug tracking-widest">完了目安</div>
                </div>
                <div className="Frame625400 justify-center items-center gap-1 flex">
                    <div className="2 w-10 text-black text-2xl font-bold font-['Hind'] leading-normal tracking-widest">1~2</div>
                    <div className=" w-8 text-black text-base font-bold font-['Hind'] leading-none tracking-widest">ヶ月</div>
                </div>
                </div>
            </div>
            </div>
        </div>
        <div className="Frame625407 self-stretch h-24 flex-col justify-start items-center gap-2 flex">
            <div className="ButtonPrimaryMediumIcon self-stretch h-16 px-4 py-2.5 bg-black bg-opacity-10 rounded-xl border border-white border-opacity-20 justify-center items-center inline-flex">
            <div className=" text-center text-black text-base font-bold font-['Noto Sans JP'] leading-none">メンバーになって始める</div>
            <div className="IconArrowLongarrow w-8 h-8 p-0.5 rounded-3xl justify-center items-center gap-0.5 flex">
                <div className="Frame18 w-7 h-7 origin-top-left -rotate-90 justify-center items-center flex">
                <div className="NorthEast w-5 h-5 relative origin-top-left rotate-[135deg] flex-col justify-start items-start flex" />
                </div>
            </div>
            </div>
            <div className=" w-72 text-center text-blue-500 text-sm font-normal font-['Noto Sans'] leading-snug tracking-wide">メンバーシップについてはこちら</div>
        </div>
    </div>
  );
};

export default SeriesTop;
