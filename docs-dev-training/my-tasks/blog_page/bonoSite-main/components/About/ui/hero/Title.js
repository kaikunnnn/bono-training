import React from "react";

function TitleAbout() {
  // インラインスタイルの定義
  const textStrokeStyle = {
    WebkitTextStroke: "1px black", // 枠線の太さと色
    color: "transparent", // 文字の中身を透明
    opacity: "0.2",
  };

  return (
    <div className="
    w-full
    relative bottom-auto flex-none top-16
    lg:flex lg:items-center justify-between lg:absolute lg:top-0 lg:bottom-0 m-auto gap-5 
    tracking-wider lg:text-center whitespace-nowrap leading-[166.4px]
     max-md:flex-wrap max-md:text-4xl z-[1]
    ">
      <h1 className="flex-auto text-left text-8xl w-auto lg:top-auto lg:text-8xl font-bold lg:text-left lg:px-24" style={textStrokeStyle}>アバウト</h1>
      <h1 className="flex-auto text-center max-md:text-4xl hidden lg:text-8xl lg:block lg:text-right lg:px-24" style={textStrokeStyle}>ボノ</h1>
    </div>
  );
}

export default TitleAbout;