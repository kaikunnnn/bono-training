import React from 'react';

function TitleStance({ mainTitle,stanceNumber, chapterDescription }) {
    const textStrokeStyle = {
        WebkitTextStroke: "0.75px black", // 枠線の太さと色
        fontFamily:"Hind",
        color: "white", // 文字の中身を透明
      };
  return (
    <div className="TitleBlock px-8 py-16 lg:p-16 w-full border-b border-neutral-900 border-opacity-20 flex-col justify-center items-start gap-4 inline-flex ">
        <p className="text-white text-base lg:text-lg font-bold leading-3 tracking-widest" style={textStrokeStyle}>{stanceNumber}</p>
        <h2 className='md:w-[280px] -mb-2 text-neutral-900 text-2xl leading-10 lg:text-3xl lg:leading-[3.2rem] font-bold tracking-widest '>{mainTitle}</h2>
        <div className="text-neutral-900 text-opacity-60 text-base font-normal leading-relaxed tracking-wide ">
        {chapterDescription.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default TitleStance;
