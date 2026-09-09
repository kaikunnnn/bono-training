"use client";

/**
 * 目次のスクロール連動ハイライト（scroll-spy）だけを担う小さな Client 葉。
 * 大セクションの id を IntersectionObserver で監視し、現在地を強調する。
 * レイアウト本体（HowToTocLayout）は Server Component のまま。
 */
import { useEffect, useState } from "react";

export interface TocItem {
  id: string;
  label: string;
}

export default function HowToTocNav({ toc }: { toc: TocItem[] }) {
  const [active, setActive] = useState<string>(toc[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  return (
    <nav aria-label="目次" className="sticky top-24">
      <p className="mb-3 font-heading text-xs tracking-[1.6px] text-text-muted">
        目次
      </p>
      <ul className="flex flex-col gap-3 border-l border-border-light pl-4">
        {toc.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block text-[13px] leading-snug transition-colors ${
                active === item.id
                  ? "font-heading font-bold text-text-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
