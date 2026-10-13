"use client";

/**
 * テンプレート＝全コース共通: 確認用の固定バー — #241
 *
 * - 「仮」タグの表示（初期OFF・画面内の状態）。KariProvider の中の <T f={field} /> が見る
 * - 進捗なし／進行中の会員（URL ?progress=1）、カリキュラムの版 シラバス／シラバス（大）／リスト（URL ?curriculum=syllabus-large|list）
 *   ※ 詳細ページだけ。URL を書き換えてサーバー側で描き直す
 */

import { createContext, useContext, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { FieldText } from "../../course-card-patterns/parts";
import type { Field } from "../data/types";

const KariContext = createContext(false);

export type CurriculumVariant = "syllabus" | "syllabus-large" | "list";

export interface PreviewState {
  progress: boolean;
  curriculum: CurriculumVariant;
}

function Segmented<V extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: V;
  options: { value: V; label: string }[];
  onChange: (v: V) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-text-muted">{label}</span>
      <div className="flex rounded-full bg-muted-custom p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            className={cn(
              "rounded-full px-2.5 py-1 transition-colors",
              value === o.value ? "bg-text-primary text-text-inverse" : "text-text-secondary hover:text-text-primary"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function KariProvider({
  children,
  preview,
}: {
  children: React.ReactNode;
  /** 渡したときだけ、見せ方と進捗の切り替えを出す */
  preview?: PreviewState;
}) {
  const [show, setShow] = useState(false);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (value === null) params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    startTransition(() => {
      router.replace(`${window.location.pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    });
  };

  return (
    <KariContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-3">
        <div
          className={cn(
            "pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-[20px] border border-border-light bg-surface px-4 py-2 font-noto-sans-jp text-xs font-bold text-text-primary shadow-[var(--shadow-popover)] md:rounded-full",
            pending && "opacity-70"
          )}
        >
          <span className="hidden text-text-muted md:inline">確認用</span>
          {preview ? (
            <>
              <Segmented
                label="カリキュラム"
                value={preview.curriculum}
                options={[
                  { value: "syllabus", label: "シラバス" },
                  { value: "syllabus-large", label: "シラバス（大）" },
                  { value: "list", label: "リスト" },
                ]}
                onChange={(v) => setParam("curriculum", v === "syllabus-large" ? null : v)}
              />
              <Segmented
                label="進捗"
                value={preview.progress ? "on" : "off"}
                options={[
                  { value: "off", label: "なし" },
                  { value: "on", label: "進行中の会員" },
                ]}
                onChange={(v) => setParam("progress", v === "on" ? "1" : null)}
              />
            </>
          ) : null}
          <label className="flex cursor-pointer items-center gap-2">
            <span>「仮」タグ</span>
            <input
              type="checkbox"
              className="size-4 accent-[var(--text-primary)]"
              checked={show}
              onChange={(e) => setShow(e.target.checked)}
            />
          </label>
        </div>
      </div>
    </KariContext.Provider>
  );
}

/** 文言（kari のときトグルONで「仮」タグ付き） */
export function T({ f }: { f: Field }) {
  const show = useContext(KariContext);
  return <FieldText field={f} showKari={show} />;
}
