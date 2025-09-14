import Link from "next/link";
import Image from "next/image";

export default function WaveDecorationSection({ children }) {
  return (
    <div className="relative mb-6 lg:mb-12">
      {/* 上部の波線装飾 */}
      <div
        className="absolute top-0 left-0 w-full h-3"
        style={{
          background: "url(/waveline.svg) repeat-x",
          backgroundSize: "auto 100%",
          backgroundPosition: "-6px 0",
        }}
      />

      {/* メインコンテンツ */}
      <div className="py-10 md:py-12 overflow-hidden">
        <div className="flex whitespace-nowrap">
          {/* 最初のセット */}
          <div className="flex flex-row items-center gap-20 animate-scrollLeft">
            <Image
              src="/career/beginner/wave-word-uiux.svg"
              alt="UI/UX"
              className="w-full h-auto"
              width={200}
              height={50}
              style={{
                width: "100%",
                height: "auto",
              }}
            />
            {/* <Image
              src="/career/beginner/wave-word-ura.svg"
              alt="URA"
              width={178}
              height={42}
              priority
              className="w-full h-auto block"
              style={{
                width: "100%",
                height: "auto",
              }}
            />
            <Link href="/ura" className="block relative hover:opacity-80">
              <p className="">裏P</p>
            </Link> */}
            <Image
              src="/career/beginner/wave-word-uiux.svg"
              alt="UI/UX"
              className="w-full h-auto"
              width={200}
              height={50}
              style={{
                width: "100%",
                height: "auto",
              }}
            />
            <Image
              src="/career/beginner/wave-word-uiux.svg"
              alt="UI/UX"
              className="w-full h-auto"
              width={200}
              height={50}
              style={{
                width: "100%",
                height: "auto",
              }}
            />
            <Image
              src="/career/beginner/wave-word-uiux.svg"
              alt="UI/UX"
              className="w-full h-auto"
              width={200}
              height={50}
              style={{
                width: "100%",
                height: "auto",
              }}
            />
          </div>
        </div>
      </div>

      {/* 下部の波線装飾 */}
      <div
        className="absolute bottom-0 left-0 w-full h-3"
        style={{
          background: "url(/waveline.svg) repeat-x",
          backgroundSize: "auto 100%",
          backgroundPosition: "-6px 0",
        }}
      />
    </div>
  );
}
