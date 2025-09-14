import dayjs from "dayjs";
import Link from "next/link";
import React from "react";

const ArticleAbout = ({ article }) => {
  // articleが存在することをチェック
  if (!article) {
    return <div>Article not found</div>;
  }
  const textStrokeStyle = {
    WebkitTextStroke: "0.75px black", // 枠線の太さと色
    fontFamily:"Hind",
    color: "white", // 文字の中身を透明
  };

  return (
    <>
      <div> 

        <div className="m-auto">
          <div className="m-8"></div>
          <div className="m-5"></div>

          <div className="TitleBlock flex flex-col gap-3 ">
              <Link href='/about/#stance'>
              <h2 className="H2 text-white text-sm lg:text-xl leading-tight lg:leading-snug font-bold tracking-wide" style={textStrokeStyle}>
スタンス</h2></Link>
            <h1 className="!leading-normal text-4xl md:text-5xl font-bold ">
              {article.title}
            </h1>
            <h4 className="text-lg leading-relaxed text-gray-500">
              {article.description}
            </h4>
          </div>


          <hr className="w-full m-auto border-gray-200" />
          <div className="m-12"></div>

          {/* Article Body */}
          <div className="Article Body
            prose 
            prose-h1:text-4xl
            prose-h2:text-3xl
            prose-h2:mt-24
            prose-h2:leading-relaxed
            prose-h3:text-xl
            prose-h3:mt-16
            prose-lg 
            prose-p:leading-loose
            md:prose-xl 
            m-auto " dangerouslySetInnerHTML={{ __html: article.body }} 
          />

        </div>

      </div>
    </>
  );
};

export default ArticleAbout;
