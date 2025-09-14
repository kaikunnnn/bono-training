import React from "react";


function CardInvitation() {
    const textStrokeStyle = {
        WebkitTextStroke: "0.75px black", // 枠線の太さと色
        fontFamily:"Hind",
        color: "white", // 文字の中身を透明
      };
      const YellowtailFont = {
            fontFamily: 'Yellowtail',
      }
  return (
    <div class=" bg-zinc-100 mt-2 lg:mt-20 border lg:w-[560px] border-gray-600 1px border-opacity-0 flex-col justify-start items-center inline-flex z-[10] shadow-md">
    <div class="self-stretch pt-4 pb-8 flex-col justify-start items-start gap-2 flex border-b 1px">
        <div class="self-stretch px-4 justify-between items-start inline-flex">
            <div class="text-neutral-600 text-opacity-80 text-[8px] lg:text-[10px] font-['Hind'] tracking-[4px]">INVITATION</div>
            <div class="rotate-90 relative  -right-12 top-12 text-neutral-600 text-opacity-80 text-[8px] lg:text-[10px] font-['Hind'] tracking-[4px]">FOR CREATION</div>
        </div>
        <div class="self-stretch p-10 pt-16 lg:p-24 lg:pt-32 lg:pb-24 flex-col justify-start items-start gap-4 flex">
            <div class="flex-col justify-start items-start gap-2 lg:gap-4 flex">
                <div class="text-pink-400 text-base font-normal font-['Pacifico'] leading-relaxed tracking-[2.50px]">Welcome to</div>
                <div class="w-[164px] h-[49px] relative lg:w-[280px] lg:h-[auto] -ml-1">
                    <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/54efd72b8f11154e4e2433d9a1a389ca6983ee0247baf0e7196081bf052c3c1e?apiKey=571efe123eaa45f0948e57ed8fcfad3f&" className="self-start mt-0 -ml-0 w-full aspect-[3.33]" aria-label='Welcome Image' role='img'/>
                </div>
            </div>
            <div class="self-stretch h-[62px] flex-col justify-start items-start gap-1 lg:gap-2 flex">
                <div class="self-stretch text-lg lg:text-xl font-bold leading-[28.80px] tracking-widest" style={textStrokeStyle}>ようこそ！</div>
                <div class="self-stretch text-lg lg:text-xl font-bold leading-[28.80px] tracking-widest"  style={textStrokeStyle}>クリエイションの夜明けへ</div>
            </div>
        </div>
    </div>
    <div class="w-full border-neutral-900 border-opacity-10"></div>
    <div class="self-stretch  py-4 flex-col justify-start items-center flex">
        <div class="self-stretch px-10 py-8 lg:p-24 justify-start items-center gap-2.5 inline-flex">
            <div class="grow shrink basis-0 text-neutral-900 text-sm lg:text-base lg:leading-[3rem] font-medium font-['Zen Kaku Gothic'] leading-[33.60px]  tracking-widest">
            BONOは”こうあったらいいのでは?”を<br/>
            考えて→形にするスキルを身につけ、<br/>
            クリエイションの夜明けを<br/>
            実現する人たちのためのサービスです<br/><br/>
            夜明けの意味する“曙”のように<br/>
            新しい自分の創造性と出会える場所へ<br/>
            ようこそ〜🙋<br/>
            </div>
        </div>
        <div class="self-stretch px-8 justify-between items-end  inline-flex">
            <div class="py-4 flex-col justify-start items-start gap-0.5 inline-flex">
                <div class="text-neutral-900 text-opacity-80 text-xs font-normal font-['Yellowtail'] leading-tight tracking-wider" >Waiting at dawn city.</div>
                <div class="text-neutral-900 text-opacity-80 text-xl font-normal font-['Yellowtail'] leading-tight tracking-wider">Kaikun</div>
            </div>
            <div class="w-20 h-[78.84px] relative ml-4">
              <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/ac403ce9219d1ea2f69bedabb6edd7bc1bc5be287ebb6fd83a009d86f1d81c05?apiKey=571efe123eaa45f0948e57ed8fcfad3f&" className="flex-1 shrink-0 w-full aspect-[1.02] max-w-[100px]" aria-label='Image' role='img'/>
            </div>
        </div>
    </div>
</div>
  );
}

export default CardInvitation;