import Image from "next/image";

/**
 * ワークショップページ共通ヘッダー。BONOロゴ → bo-no.design へのリンク
 */
export default function WorkshopHeader() {
  return (
    <header className="w-full">
      <div className="px-5 md:px-6 h-14 flex items-center">
        <a
          href="https://bo-no.design"
          aria-label="BONO"
          className="inline-flex items-center opacity-100 hover:opacity-70 transition-opacity"
        >
          <Image src="/images/bono-logo.svg" alt="BONO" width={68} height={20} />
        </a>
      </div>
    </header>
  );
}
