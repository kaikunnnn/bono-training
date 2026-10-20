import { NUMBER_CHALLENGE_META } from "@/lib/number-challenge/config";

/**
 * 数字改善チャレンジ トップページのヒーロー。
 * レイアウトは WorkshopHero（/docs/workshop）にそろえ、色はデザイントークンのクラスで指定する。
 */
export default function NumberChallengeHero() {
  return (
    <header className="relative">
      <p className="mt-6 md:mt-8 flex items-center gap-2.5 text-[11px] md:text-[12px] font-semibold tracking-[0.28em] uppercase font-line-seed-jp text-text-muted">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full bg-text-primary"
          aria-hidden
        />
        BONO Challenge
      </p>

      <h1 className="mt-8 md:mt-10 font-line-seed-jp font-extrabold text-[44px] md:text-[68px] leading-[1.15] tracking-[-0.01em] text-text-primary">
        {NUMBER_CHALLENGE_META.title}
      </h1>

      <p className="mt-7 max-w-[680px] text-[15px] md:text-[17px] font-medium leading-[190%] tracking-[0.02em] font-line-seed-jp text-text-secondary">
        <span className="font-bold text-text-primary">
          BONOの数字をユーザーの体験として読み、体験を良くするUIの仮説とプロトタイプをつくるチャレンジです。
        </span>
        参加者はいつでもこのページの資料を見ながら進めます。
      </p>

      <hr className="mt-10 border-t border-border-light" />
    </header>
  );
}
