import Link from "next/link";
import React from "react";
import AudioPlayer from "./AudioPlayer";

const PodCastStory = ({
  link,
  title,
  explain,
  timestamp,
  description,
  audioSrc,
}) => {
  const textStrokeStyle = {
    WebkitTextStroke: "0.75px black", // 枠線の太さと色
    fontFamily: "Hind",
    color: "white", // 文字の中身を透明
  };
  return (
    <div className="PodcastEpisodeItem w-full md:p-12 p-6 bg-white border border-neutral-900 border-opacity-90 flex-col justify-start items-start md:gap-4 gap-2 inline-flex">
      <div className="self-stretch justify-self-end items-center md:items-start gap-3 inline-flex flex-col ">
        <Link
          href={`/podcast/${link}`}
          className="hover:opacity-70 block w-full"
        >
          <div className="grow w-full shrink basis-0 flex-col justify-center md:justify-between md:items-center md:flex-row-reverse gap-4 inline-flex">
            <div className="Title w-full flex flex-col md:items-start md:justify-between  gap-3">
              <p className="text-gray-500 w-full md:text-md text-xs -mt-2 font-bold leading-snug tracking-wide">
                キャリア
              </p>
              <h1 className="self-stretch  text-neutral-900 md:text-2xl text-xl font-bold leading-[160%] tracking-wide">
                {title}
              </h1>
            </div>
          </div>
        </Link>
      </div>
      <div className="self-stretch flex-col justify-start items-start gap-2 flex">
        <div className="self-stretch text-neutral-700 text-opacity-80 md:text-base text-sm font-normal leading-relaxed tracking-wide">
          {explain}
        </div>
      </div>
      <AudioPlayer src={audioSrc} />
    </div>
  );
};

export default PodCastStory;
