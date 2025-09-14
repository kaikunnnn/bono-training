import Image from "next/image";
import { useState } from "react";

export default function TableOfContents() {
  const [showAlert, setShowAlert] = useState(false);

  const sections = [
    {
      id: "section-1",
      number: "1",
      title: "未経験からなれるの？",
    },
    {
      id: "section-2",
      number: "2",
      title: "習得スキル＆ロードマップ",
    },
    {
      id: "section-3",
      number: "3",
      title: "ポートフォリオのつくり方",
    },
    {
      id: "section-4",
      number: "4",
      title: "会社選び＆採用面接",
    },
    // 必要に応じて追加のセクションを定義
  ];

  const handleBreadClick = () => {
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000); // 3秒後に自動的に閉じる
  };

  return (
    <div className="TableOfCoontens w-full md:w-6/12 px-6 py-6 bg-white rounded-[40px] border border-black flex-col justify-start items-start gap-6 inline-flex z-10">
      <div className="self-stretch justify-center items-center gap-3 inline-flex">
        <Image
          className="w-[22px] h-[22px] animate-float cursor-pointer"
          src="/career/beginner/food-drink-bread.svg"
          alt="パンアイコン"
          width={20}
          height={20}
          onClick={handleBreadClick}
        />
        <div className="text-black text-base font-normal font-['DotGothic16'] leading-relaxed tracking-wide">
          気になるトピックはあるかな？
        </div>
      </div>
      <div className="self-stretch flex-col justify-start items-start flex">
        {sections.map((section) => (
          <div
            key={section.id}
            className="self-stretch px-2.5 py-5 border-b border-black/20 justify-between items-center inline-flex hover:bg-gray-50 transition-colors duration-200"
          >
            <a
              href={`#${section.id}`}
              className="w-full justify-start items-center gap-4 flex transition-opacity group"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(section.id)
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <div className="text-black text-xs font-medium font-['Noto Sans JP'] leading-tight tracking-wide">
                ( {section.number} )
              </div>
              <div className="text-black text-lg font-medium font-['Noto Sans JP'] leading-[28.80px] tracking-wide relative">
                <span className="relative">
                  {section.title}
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full"></span>
                </span>
              </div>
            </a>
            <div data-svg-wrapper>
              <svg
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* ... existing SVG paths ... */}
              </svg>
            </div>
          </div>
        ))}
      </div>
      <div className="self-stretch justify-between items-center inline-flex">
        <div className="text-xxs font-['DotGothic16'] font-medium font-['Noto Sans JP'] leading-none tracking-wide">
          Written by : カイクン
        </div>
        <a
          href="https://takumikai.notion.site/profile-kaikun"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[#4f4f4f] text-[10px] font-medium font-['Noto Sans JP'] underline leading-none tracking-wide hover:text-black transition-colors duration-200"
        >
          (誰?)
        </a>
      </div>

      {/* アラートUI */}
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 animate-fadeIn">
          <div className="flex items-center gap-3">
            <Image
              src="/career/beginner/food-drink-bread.svg"
              alt="パンアイコン"
              width={24}
              height={24}
            />
            <p className="text-gray-800 font-medium">
              パンだよ？コーヒーと相性がいいんだ。なんだと思ったの？
            </p>
            <button
              onClick={() => setShowAlert(false)}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
