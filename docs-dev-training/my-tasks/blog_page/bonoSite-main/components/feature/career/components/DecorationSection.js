import Image from "next/image";
import Link from "next/link";

export default function DecorationSection() {
  return (
    <div className="Decoration w-11/12 md:w-12/12 lg:w-8/12 mb-6 md:-mt-16 lg:-mt-32 md:mb-4 lg:mb-16 h-auto gap-auto justify-between inline-flex items-end">
      <div className="py-3 pt-4 px-5 origin-top-left -rotate-6 bg-white rounded-full border border-black/20 justify-between items-center gap-2.5 flex h-fit w-auto">
        <div className="text-[#131212] text-xs font-bold leading-relaxed tracking-wide">
          &ldquo;人に寄り添うインターネットの
          <br />
          ものづくりをはじめよう&rdquo;
        </div>
        <div className="w-12 h-12 flex items-center justify-center absolute -top-8 left-4">
          <Image
            className="h-auto border border-black/20 rounded-full "
            src="/career/beginner/kaikun-icon.png"
            alt="カイクンのアイコン"
            width={40}
            height={40}
          />
        </div>
      </div>
      <div className="relative z-10">
        <Link href="https://www.bo-no.design/" className="cursor-pointer">
          <Image
            className="h-1/2 z-10"
            src="/career/beginner/bokennosyo.png"
            alt="冒険の書のイメージ"
            width={100}
            height={130}
          />
        </Link>
        <Image
          className="absolute -z-10 -bottom-5 left-4"
          src="/sun.svg"
          alt="太陽のイメージ"
          width={120}
          height={120}
        />
      </div>

      <div className="w-20 h-20 bg-gradient-to-bl from-[#f2bbe0] to-[#fccbc0] rounded-full border-4 blur-[85px] absolute top-1/2 -translate-y-1/2 right-0 -z-10" />
    </div>
  );
}
