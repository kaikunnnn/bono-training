"use client";

/**
 * 追従する目次（いま読んでいる見出しを強調）— #243 v6
 * IntersectionObserver で見出しの位置を見て、読んでいる項目に aria-current="true" を付ける。
 * 置き場所（sticky・表示するブレークポイント）は呼び出し側で決める。
 */

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface SpyItem {
  id: string;
  label: string;
  /** 小さな番号など（例: 01） */
  meta?: string;
}

export default function ScrollSpy({
  items,
  label,
  title,
  className,
}: {
  items: SpyItem[];
  /** nav の aria-label */
  label: string;
  /** 目次の上の小さな見出し（任意） */
  title?: string;
  className?: string;
}) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const targets = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0 || typeof IntersectionObserver === "undefined") return;

    // 画面の上から30%の線より上に頭が来た最後の見出しを「読んでいる」とみなす（無ければ先頭）
    const pick = () => {
      const line = window.innerHeight * 0.3;
      let current = targets[0].id;
      for (const t of targets) {
        if (t.getBoundingClientRect().top <= line) current = t.id;
      }
      setActive(current);
    };
    const io = new IntersectionObserver(pick, {
      rootMargin: "-20% 0px -70% 0px",
      threshold: [0, 1],
    });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label={label} className={className}>
      {title ? (
        <p className="font-mono text-[11px] uppercase leading-[1.5] tracking-[0.12em] text-text-muted">{title}</p>
      ) : null}
      <ol className={cn("relative flex flex-col border-l border-border-light", title && "mt-3")}>
        {items.map((it) => {
          const current = it.id === active;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                onClick={() => setActive(it.id)}
                aria-current={current ? "true" : undefined}
                className={cn(
                  "relative -ml-px flex gap-2 border-l-2 py-1.5 pl-3 pr-1 text-sm leading-[1.5] transition-colors duration-200",
                  "focus-visible:rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary",
                  current
                    ? "border-text-primary font-bold text-text-primary"
                    : "border-transparent text-text-muted hover:text-text-primary"
                )}
              >
                {it.meta ? <span className="shrink-0 font-latin text-xs leading-[1.75] tabular-nums">{it.meta}</span> : null}
                <span className="min-w-0">{it.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
