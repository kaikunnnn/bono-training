import React from 'react';

const Story = () => {
    
    const headerText = "BONOとは";
    const h1Text = "クリエイションを\nはじめよう!!";
    const divText = "BONOを知ってくれた方はUIやUXのデザイン関連で知ってくれたかもしれません。BONO自体はデジタルをベースにしたデザインが学べるコンテンツがメインになるサービスです。まずは未経験者を中心に、次に現場1-2年目の方向けに基礎がリアルに身につくサービス提供を目指しています🙋\n\nただそれは「手段」の話なんです。\nデザインのスキルが身につけられたらそれでいいのか？共感できない方針や事業の歯車として数十年働くためのスキルを身につけるのか？でいうと確実にNOです🧐\n\nBONOでは自分が変だと思うこと、課題だと思うことを少しでも変えられるようなアイデアや具体的な創造物をつくるデジタルスキルとしてのデザインを提供していきたいと考えています。面白がってアイデアを形にする人を増やしたいし、僕もそうありたい🧘\n\n最初のきっかけは転職や足りないスキルを補うことかもしれません。ただ、BONOを通してただ”つくる”以上の創造したもので世の中とか変わっていく楽しさも身につけられる場所になれたらと思っています👋"
    const textStrokeStyle = {
        WebkitTextStroke: "1px #F2FF5F", // 枠線の太さと色
        color: "transparent", // 文字の中身を透明
      };    
    const bgStoryColor = {
        backgroundColor: "#343E43", // 文字の中身を透明にするのではなく、背景色を設定
    };

    return (
        <div className="px-8 w-full bg-gray-800 flex-col font-black justify-start items-center inline-flex" style={bgStoryColor}>
            <div className="text-white flex flex-col w-full md:max-w-[560px]  gap-8  mt-32 md:mt-56 text-base font-bold leading-7 tracking-wider ">
                <div className='flex gap-4 flex-col md:max-w-[560px] '>
                    <div class="text-base font-bold leading-none tracking-[4px]" style={textStrokeStyle}>CONCEPT</div>
                    <h1 className="text-white text-4xl font-bold lg:text-5xl leading-[3.2rem] lg:leading-[5rem] tracking-[8px]">
                        {h1Text.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br /></React.Fragment>)}
                    </h1>
                </div>
                
                <div class=" text-gray-300 text-base font-medium leading-[38.40px] tracking-wide">
                    {divText.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br /></React.Fragment>)}
                </div>

                <div class="w-full justify-between items-end inline-flex ">
                    <p className="text-xl leading-none" style={{ transform: 'scaleX(-1)' }}>🚕</p>
                    <img class="w-[272px] h-[138px]" src="/about/welcomeBono.png" />
                 </div>
            </div>
        </div>
    );
}

export default Story;