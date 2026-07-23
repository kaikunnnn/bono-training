import Link from "next/link";

/**
 * /dev/top5 系ページ専用の簡易ナビ（本番には出さない開発用UI）。
 * ページ全体とコンポーネント個別確認ページを行き来しやすくするためのもの。
 */
export function DevNav({ current }: { current: "page" | "components" }) {
  return (
    <div className="sticky top-0 z-50 flex items-center gap-4 border-b border-black/10 bg-white/90 px-4 py-2 backdrop-blur">
      <Link href="/dev" className="font-mono text-xs text-gray-500 hover:underline">
        ← /dev
      </Link>
      <span className="text-gray-300">|</span>
      <Link
        href="/dev/top5"
        className={`font-mono text-xs hover:underline ${
          current === "page" ? "font-bold text-[#6d56ff]" : "text-gray-500"
        }`}
      >
        ページ全体
      </Link>
      <Link
        href="/dev/top5/components"
        className={`font-mono text-xs hover:underline ${
          current === "components" ? "font-bold text-[#6d56ff]" : "text-gray-500"
        }`}
      >
        コンポーネント確認
      </Link>
    </div>
  );
}
