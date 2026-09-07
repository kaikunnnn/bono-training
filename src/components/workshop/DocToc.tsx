import type { TocItem } from "@/lib/workshop/toc";

interface DocTocProps {
  headings: TocItem[];
}

/**
 * ドキュメント詳細ページの目次。h2/h3へのアンカーリンク一覧
 */
export default function DocToc({ headings }: DocTocProps) {
  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="目次"
      className="bg-base rounded-[16px] px-6 py-5 md:px-7 md:py-6"
    >
      <p className="text-[12px] font-bold tracking-[0.18em] uppercase text-text-muted mb-3 font-line-seed-jp">
        このページの内容
      </p>
      <ul className="space-y-2">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-5" : undefined}>
            <a
              href={`#${h.id}`}
              className="text-[14px] leading-[1.8] font-line-seed-jp text-text-secondary hover:text-text-link underline underline-offset-4 decoration-border-default hover:decoration-current transition-colors"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
