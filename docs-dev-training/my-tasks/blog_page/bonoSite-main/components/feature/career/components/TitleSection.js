import Image from "next/image";
import { useEffect, useState } from "react";

export default function TitleSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="CopyArea mt-16 md:-mt-8 w-full flex-col justify-start items-center inline-flex relative ">
      <div
        className="flex-col w-full justify-center items-center gap-6 lg:gap-10 flex relative"
        aria-hidden="true"
      >
        <div></div>
        <div className="w-full inline-flex justify-between h-full absolute top-1/2 -translate-y-1/2 left-0 -z-10">
          <div className="w-[8px] mt-auto my-auto mx-2 text-green-900 text-[8px] font-semibold leading-loose tracking-[7px]">
            #誰だってものづくりを始められる
          </div>
          <div className="w-[8px] mt-auto my-auto mx-2 text-green-900 text-[8px] font-semibold leading-loose tracking-[7px]">
            #創造性の夜明けがくるぞ
          </div>
        </div>
        {/* UI/UX */}
        <div
          className={`text-center text-orange-500 transition-all duration-700 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "100ms" }}
        >
          <Image
            src="/career/beginner/type/uiux.svg"
            alt="UI/UX"
            className="h-[56px] md:h-[120px] lg:h-[140px] w-auto"
            width={110}
            height={40}
          />
        </div>

        <div
          className={`text-center text-orange-500 text-base md:text-2xl font-bold font-noto-sans leading-snug tracking-[4px] transition-all duration-700 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          未経験からの
        </div>

        {/* CAREER */}
        <div
          className={`text-center text-orange-500 transition-all duration-700 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "500ms" }}
        >
          <Image
            src="/career/beginner/type/type-career.svg"
            alt="CAREER"
            className="h-[40px] md:h-[100px] lg:h-[110px] w-auto"
            width={110}
            height={40}
          />
        </div>
        <div
          className={`text-center text-orange-500 text-base md:text-2xl font-bold font-noto-sans leading-snug tracking-[4px] transition-all duration-700 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "700ms" }}
        >
          UI/UXデザイナー
        </div>

        {/* GUIDE */}
        <div
          className={`text-center text-orange-500 transition-all duration-700 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "900ms" }}
        >
          <Image
            src="/career/beginner/type/type-guide.svg"
            alt="GUIDE"
            className="h-[40px] md:h-[100px] lg:h-[110px] w-auto"
            width={110}
            height={40}
          />
        </div>
        <div
          className={`text-center text-orange-500 text-base md:text-2xl font-bold font-noto-sans leading-snug tracking-[4px] transition-all duration-700 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "1100ms" }}
        >
          転職ガイド
        </div>
      </div>
    </div>
  );
}
