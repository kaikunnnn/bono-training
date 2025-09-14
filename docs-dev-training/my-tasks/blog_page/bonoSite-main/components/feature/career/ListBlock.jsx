import Link from "next/link";

export default function ListBlock({
  title = "サービスについて知る",
  description = "BONOでUIUXデザインを学んで創造して楽しむ旅をスタートしよう",
  buttonText = "はじめる",
  href = "https://bo-no.design/service",
}) {
  return (
    <Link href={href} className="block">
      <div className="py-3 px-5 md:px-6 md:py-5 w-full rounded-3xl border border-white flex justify-between items-center gap-6 hover:bg-white/10 transition-colors">
        <div className="self-stretch h-[61px] flex-col justify-center items-center gap-2 flex">
          <div className="self-stretch text-justify text-white text-base font-bold font-['Noto Sans JP'] leading-6">
            {title}
          </div>
          <div className="self-stretch text-justify text-white/60 text-xs font-medium font-['Noto Sans JP'] leading-none">
            {description}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full border border-white justify-center items-center gap-2.5 inline-flex overflow-hidden">
          <div className="text-justify text-white text-[13px] font-bold font-['DotGothic16']">
            {buttonText}
          </div>
        </div>
      </div>
    </Link>
  );
}
