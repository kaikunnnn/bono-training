import React from "react";
import { ViewAllButton } from "./ViewAllButton";
import { EmptyState } from "./EmptyState";

/**
 * preview モード用のセクションラッパー
 * タイトル + 「すべてみる」リンク + コンテンツ
 */
export function MySection({
  title,
  viewAllTab,
  isEmpty,
  emptyMessage,
  emptyLink,
  horizontal,
  children,
}: {
  title: string;
  viewAllTab: string;
  isEmpty: boolean;
  emptyMessage: string;
  emptyLink?: string;
  horizontal?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section className="w-full pt-8 pb-10 flex flex-col items-start gap-3 border-b border-black/10">
      <div className="flex items-center justify-between w-full" style={{ gap: 16 }}>
        <h2
          className="text-slate-950"
          style={{
            fontFamily: "'Rounded Mplus 1c', sans-serif",
            fontSize: 16,
            fontWeight: 600,
            lineHeight: "24px",
          }}
        >
          {title}
        </h2>
        <ViewAllButton tab={viewAllTab} />
      </div>
      {isEmpty ? (
        <EmptyState message={emptyMessage} link={emptyLink} />
      ) : horizontal ? (
        <div className="flex gap-[10px] w-full">
          {React.Children.map(children, (child) => (
            <div className="flex-1 min-w-0">{child}</div>
          ))}
        </div>
      ) : (
        <div className="flex w-full flex-col gap-0 rounded-2xl overflow-hidden shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04)]">
          {children}
        </div>
      )}
    </section>
  );
}
