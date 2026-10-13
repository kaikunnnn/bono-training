"use client";

/**
 * テンプレート＝全コース共通: 「仮」タグの表示切り替え — #241
 *
 * KariProvider で囲んだ中の <T f={field} /> は、トグルONのとき kari の文言に「仮」タグを付ける。
 * 画面下に固定のトグルを出す（初期OFF）。
 */

import { createContext, useContext, useState } from "react";
import { FieldText } from "../../course-card-patterns/parts";
import type { Field } from "../data/types";

const KariContext = createContext(false);

export function KariProvider({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <KariContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
        <label className="pointer-events-auto flex cursor-pointer items-center gap-3 rounded-full border border-border-light bg-surface px-4 py-2 font-noto-sans-jp text-xs font-bold text-text-primary shadow-[var(--shadow-popover)]">
          <span className="text-text-muted">確認用</span>
          <span>推測の文言に「仮」タグを表示</span>
          <input
            type="checkbox"
            className="size-4 accent-[var(--text-primary)]"
            checked={show}
            onChange={(e) => setShow(e.target.checked)}
          />
        </label>
      </div>
    </KariContext.Provider>
  );
}

/** 文言（kari のときトグルONで「仮」タグ付き） */
export function T({ f }: { f: Field }) {
  const show = useContext(KariContext);
  return <FieldText field={f} showKari={show} />;
}
