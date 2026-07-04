import Image from "next/image";
import { WS_THEME } from "./theme";

/**
 * ワークショップページ共通ヘッダー。BONOロゴ → bo-no.design へのリンク
 */
export default function WorkshopHeader() {
  return (
    <header
      className="w-full border-b"
      style={{ borderColor: WS_THEME.hairline }}
    >
      <div className="max-w-[1080px] mx-auto px-5 md:px-8 h-14 flex items-center">
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
