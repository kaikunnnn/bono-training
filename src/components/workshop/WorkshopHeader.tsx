import Image from "next/image";

/**
 * ワークショップページ共通ヘッダー。BONOロゴ → bo-no.design へのリンク
 */
export default function WorkshopHeader() {
  return (
    <header className="w-full">
      <div className="px-5 md:px-6 h-14 flex items-center justify-between">
        <a
          href="https://bo-no.design"
          aria-label="BONO"
          className="inline-flex items-center opacity-100 hover:opacity-70 transition-opacity"
        >
          <Image src="/images/bono-logo.svg" alt="BONO" width={68} height={20} />
        </a>
        <a
          href="https://liveq.page/e2/0c5035efcd6c6bfe4162"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] font-bold font-line-seed-jp text-text-primary border border-border-default rounded-full px-4 py-1.5 hover:bg-base transition-colors"
        >
          質問する
        </a>
      </div>
    </header>
  );
}
