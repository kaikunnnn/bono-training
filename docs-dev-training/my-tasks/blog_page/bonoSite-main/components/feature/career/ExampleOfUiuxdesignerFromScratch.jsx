"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const interviews = [
  {
    id: 1,
    name: "りんねる",
    avatar:
      "https://cdn.prod.website-files.com/601a66c348d38c1c180fd166/671af4636848b1669a83bbc2_Profile-Image-1.png",
    title: "PR企業からUI/UXデザイナーへ未経験転職した話",
    tags: ["未経験からUI/UXデザイナー転職"],
    company: "制作会社",
    history: "PR系の会社",
    url: "https://youtu.be/SSYCTSQn7y4",
  },
  {
    id: 2,
    name: "Hanzo",
    avatar:
      "https://cdn.prod.website-files.com/601a66c348d38c1c180fd166/674e91d6ad445fc967b004c2_You%E3%81%AF%E3%81%A8%E3%82%99%E3%81%86%E3%82%84%E3%81%A6%E3%83%86%E3%82%99%E3%82%B5%E3%82%99%E3%82%A4%E3%83%8A%E3%83%BC%E3%81%AB%20thumbnail-p-1080.jpg",
    title: "公務員からUI/UXデザイナーに転職!計画的に諦めずに学習するコツ",
    tags: ["未経験からUI/UXデザイナー転職"],
    company: "事業会社",
    history: "公務員・バリスタ",
    url: "https://www.bo-no.design/contents/youhadouyatedezainanihanzo",
  },
  {
    id: 3,
    name: "Tara",
    avatar:
      "https://cdn.prod.website-files.com/601a66c348d38c1c180fd166/6721965fbe211c512f5635ab_YouTube%20Studio%20Maxresdefault-p-1080.webp",
    title: "仕事しながらUI/UXデザイナーに未経験転職した勉強法",
    tags: ["未経験からUI/UXデザイナー転職"],
    company: "事業会社",
    history: "飲料メーカー",
    url: "https://youtu.be/XLq01yuJ1UA",
  },
  {
    id: 4,
    name: "うしまる",
    avatar:
      "https://cdn.prod.website-files.com/601a66c348d38c1c180fd166/67219bbf3301bf47e56836ab_Maxresdefault%201280x720%20(2)-p-1080.webp",
    title: "CS経験を活かしてスピード内定、自己分析の差別化コツは？",
    tags: ["未経験からUI/UXデザイナー転職"],
    company: "事業会社",
    history: "カスタマーサポート",
    url: "https://youtu.be/AUS8IljopvI",
  },
  {
    id: 5,
    name: "Boi",
    avatar:
      "https://cdn.prod.website-files.com/601a66c348d38c1c180fd166/6721965e4d3d28dcde3ce463_Maxresdefault%20(1)-p-1080.webp",
    title: "地図で会社探し？会社辞めてデザイン勉強した話",
    tags: ["未経験からUI/UXデザイナー転職"],
    company: "制作会社",
    history: "営業",
    url: "https://youtu.be/YJsumqB3dv4",
  },
];

const duplicatedInterviews = [...interviews, ...interviews];

function InterviewCard({ interview }) {
  return (
    <a
      href={interview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full max-w-[400px] md:max-w-[560px] bg-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:bg-slate-50 transition-all duration-300 my-2"
    >
      <div className="p-2 pb-[34px] flex flex-col gap-3">
        <div className="relative w-full aspect-[394/224] rounded-[8.8px] overflow-hidden shadow-[1px_1px_8px_rgba(0,0,0,0.06)]">
          <Image
            src={interview.avatar}
            alt={interview.name}
            className="absolute inset-0 w-full h-full object-cover"
            width={394}
            height={224}
          />
        </div>

        <div className="px-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h5 className="text-sm">{interview.name}</h5>
            <h3 className="text-lg font-medium text-green-950 leading-normal ">
              {interview.title}
            </h3>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-[10.52px] pb-1 border-b border-black/5">
              <span className="text-sm text-slate-600">成果</span>
              <span className="text-sm text-neutral-500">{interview.tags}</span>
            </div>
            <div className="flex gap-[10.52px] pb-1 border-b border-black/5">
              <span className="text-sm text-slate-600">就職</span>
              <span className="text-sm text-neutral-500">
                {interview.company}
              </span>
            </div>
            <div className="flex gap-[10.52px] pb-1 border-b border-black/5">
              <span className="text-sm text-slate-600">経歴</span>
              <span className="text-sm text-neutral-500">
                {interview.history}
              </span>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

export default function InterviewSection() {
  return (
    <section className="w-full py-16 lg:py-24 bg-gradient-to-b bg-[#f5f2f1]">
      <div className="p-0 m-0 w-full">
        {/* Heading */}
        <div className="mx-auto md:max-w-2xl flex flex-col justify-start items-center gap-2 relative">
          <Image
            className="absolute -top-10 right-2 md:-top-16 md:-right-10 w-24 h-24 md:w-32 md:h-32"
            src="/career/beginner/badge-following.png"
            alt="Voice Main Image"
            width={128}
            height={128}
          />
          <Image
            className="w-[143.5px] h-[132.3px] md:w-[205px] md:h-[189px] mb-5"
            src="/career/beginner/voice-main-image.png"
            alt="Voice Main Image"
            width={205}
            height={189}
          />
          <div className=" flex flex-col justify-center items-center gap-5">
            <div className="w-full text-center text-[#1e1e1e] text-2xl sm:text-[26px] font-medium leading-relaxed">
              未経験から
              <br />
              UIUXデザイナーになった人の
              <br />
              声を除いてみよう👀
            </div>
            <div className="w-8/12 md:w-full max-w-sm md:max-w-none text-center text-[#1e1e1e] text-sm md:text-base md:leading-8 font-medium font-['Noto Sans JP'] leading-7">
              &ldquo;デザインはオリジナリティを発揮するもの。と思い込んではいけません。
              <br />
              まずは世の中の良いものに目を向けて&ldquo;定番&rdquo;の表現を吸収していくのです&rdquo;
            </div>
            <Link
              href="https://www.bo-no.design/rdm/users/all"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="px-6 py-4 bg-white rounded-full border-2 border-green-950 justify-center items-center gap-2.5 inline-flex overflow-hidden hover:bg-gray-50 transition-colors">
                <div className="text-green-950 text-sm font-bold leading-snug">
                  インタビューを見る
                </div>
              </div>
            </Link>
          </div>
        </div>
        {/* Interview List - Horizontal scroll for all viewport sizes */}
        <div className="mt-12">
          <div className="relative overflow-hidden">
            <div className="flex gap-4 animate-scroll">
              {[...interviews, ...interviews, ...interviews].map(
                (interview, index) => (
                  <div
                    key={`${interview.id}-${index}`}
                    className="flex-none w-[280px] md:w-[410px]"
                  >
                    <InterviewCard interview={interview} />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// アニメーションとスクロールバー非表示のスタイルを追加
const styles = `
  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(calc(-280px * ${interviews.length}));
    }
  }
  
  .animate-scroll {
    animation: scroll 30s linear infinite;
  }
  
  .animate-scroll:hover {
    animation-play-state: paused;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// スタイルをヘッドに追加
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
