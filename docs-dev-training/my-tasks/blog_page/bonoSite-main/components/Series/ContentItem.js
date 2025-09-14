// pages/series.js
import Link from "next/link";
import React from "react";

const ContentItem = ({ props,path }) => {
  
  // コンテンツタグの出しわけ
  let displayText = "無料";

  if (props.contentiscommunity) {
    displayText = "コミュニティ限定";
  } else if (props.contentispremium) {
    displayText = "プレミアム限定";
  }

  return (
    <>
      {/* Content Item */}
      <Link  href={`/series/${path}/${props.slug}`} className="ContentItem self-stretch h-32 flex-col justify-start items-start gap-7 flex text-left">
        <div className="Frame625166 self-stretch justify-between items-center inline-flex">
          <div className="Frame625165 justify-start items-center gap-16 flex">
            <div className="TableitemHead justify-start items-center gap-8 flex">
              <div className="Frame625526 flex-col justify-start items-center gap-2.5 inline-flex">
                <div className="Rectangle131 w-56 h-32 bg-neutral-200 bg-opacity-90 rounded-md" />
                <div className="Frame625528 bg-blue-500 rounded-full justify-start items-center gap-1.5 inline-flex">
                  <div className="Frame625527 flex-col justify-start items-center gap-7 inline-flex">
                    <div className="PlayArrowFill0Wght400Grad0Opsz481 w-6 h-6 relative" />
                  </div>
                </div>
              </div>
              <div className="Frame625523 flex-col justify-center items-start gap-3 inline-flex">
                <div className="Ui w-96 text-black text-base font-bold font-['Noto Sans'] leading-relaxed tracking-wide">
                  <h4>{props.title}</h4>
                </div>
                <div className="Frame625524 justify-start items-center gap-8 inline-flex">
                  <div className="Free text-black text-opacity-70 text-sm font-bold font-['Noto Sans'] leading-snug tracking-wide">
                    <p>{displayText}</p>
                  </div>
                  <div className="32 text-black text-opacity-70 text-sm font-normal font-['Noto Sans'] leading-snug tracking-wide">
                    <p>12:32</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="ButtonSecondTinyIcon p-3.5 bg-zinc-100 rounded-full justify-start items-center flex">
            <div className="IconArrowLongarrow w-7 h-7 p-0.5 rounded-3xl justify-center items-center gap-0.5 flex">
              <div className="Frame18 w-6 h-6 origin-top-left -rotate-90 justify-center items-center flex">
                <div className="NorthEast w-4 h-4 relative origin-top-left rotate-[135deg] flex-col justify-start items-start flex" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
};

export default ContentItem;
