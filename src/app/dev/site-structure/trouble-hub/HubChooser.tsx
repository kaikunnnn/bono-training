"use client";

/**
 * #267 試作2 — 「どこから見る？」の絞り込みと、URLの # で項目を開く処理
 *
 * - 状況と悩みの種類を選ぶと、当てはまる項目へのリンクが出る（項目は <details id> で、押すとその項目だけ開く）
 * - 当てはまるものが無いときも、全項目の一覧と掲示板への逃げ道を必ず出す
 * - ページを #id 付きで開いたとき・#が変わったときに、その項目を開いてスクロールする
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import type { Situation, TroubleKind } from "./data";

interface ChooserItem {
  id: string;
  title: string;
  kind: TroubleKind;
  situations: Situation[];
}

function openFromHash() {
  const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (!id) return;
  const el = document.getElementById(id);
  if (el instanceof HTMLDetailsElement) {
    el.open = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
}

/** 一度だけ置く。#id の項目を開く */
export function HashOpener() {
  useEffect(() => {
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);
  return null;
}

const SELECT =
  "h-10 w-full rounded-[12px] border border-border-light bg-surface px-3 text-sm text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary";

export function HubChooser({
  items,
  situations,
  kinds,
}: {
  items: ChooserItem[];
  situations: { value: Situation; label: string }[];
  kinds: { value: TroubleKind; label: string }[];
}) {
  const [situation, setSituation] = useState<Situation | "">("");
  const [kind, setKind] = useState<TroubleKind | "">("");

  const matched = useMemo(
    () =>
      items.filter(
        (it) => (situation === "" || it.situations.includes(situation)) && (kind === "" || it.kind === kind)
      ),
    [items, situation, kind]
  );
  const touched = situation !== "" || kind !== "";

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs font-bold text-text-secondary">
          1. いまの状況は？
          <select className={SELECT} value={situation} onChange={(e) => setSituation(e.target.value as Situation | "")}>
            <option value="">すべて</option>
            {situations.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-bold text-text-secondary">
          2. 困っていることの種類は？
          <select className={SELECT} value={kind} onChange={(e) => setKind(e.target.value as TroubleKind | "")}>
            <option value="">すべて</option>
            {kinds.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div aria-live="polite">
        {touched ? (
          matched.length > 0 ? (
            <>
              <p className="text-xs text-text-muted">当てはまりそうな項目（{matched.length}件）</p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {matched.map((it) => (
                  <li key={it.id}>
                    <a
                      href={`#${it.id}`}
                      // 同じ # をもう一度押したときは hashchange が来ないので、ここでも開く
                      onClick={() => window.setTimeout(openFromHash, 0)}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-text-link hover:underline"
                    >
                      <ArrowDown size={14} aria-hidden="true" />
                      {it.title}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-text-secondary">
              この組み合わせに当てはまる項目はまだありません。
              <a href="#all" className="font-bold text-text-link hover:underline">
                全項目の一覧
              </a>
              から探すか、
              <Link href="/questions" className="font-bold text-text-link hover:underline">
                掲示板で質問
              </Link>
              してみてください。
            </p>
          )
        ) : (
          <p className="text-xs text-text-muted">選ぶと、当てはまりそうな項目が出ます。</p>
        )}
      </div>

      <p className="text-xs text-text-muted">
        見つからないときは
        <a href="#all" className="ml-1 font-bold text-text-link hover:underline">
          全項目の一覧へ
        </a>
      </p>
    </div>
  );
}
