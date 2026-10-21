import type { ReactNode } from "react";
import Image from "next/image";
import { Clock, Star } from "lucide-react";

// #251 の複製（progress-feed/_proto/mypage/ProtoArticleRows.tsx）を /dev/peers 内にコピー。
// このプロトには記事ページが無いので、リンク（Link）を外して見た目だけにした

const THUMB = "/images/top5/thumbnail-uihimitsu.jpg";

function RowText({ title, lessonTitle }: { title: string; lessonTitle: string }) {
  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      <p
        className="m-0 w-full overflow-hidden text-ellipsis whitespace-nowrap text-black"
        style={{ fontFamily: "'Rounded Mplus 1c', sans-serif", fontWeight: 700, fontSize: 14, lineHeight: "32px" }}
      >
        {title}
      </p>
      <div className="flex items-center w-full overflow-hidden">
        <span
          className="text-gray-500 whitespace-nowrap flex-shrink-0"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, lineHeight: "20px" }}
        >
          by&nbsp;
        </span>
        <span
          className="text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis"
          style={{ fontFamily: "'Inter', 'Noto Sans JP', sans-serif", fontSize: 12, lineHeight: "20px" }}
        >
          {lessonTitle}
        </span>
      </div>
    </div>
  );
}

function Thumb() {
  return (
    <div
      className="flex-shrink-0 overflow-hidden bg-muted-custom"
      style={{ width: 85, minWidth: 85, height: 48, borderRadius: 8 }}
    >
      <Image src={THUMB} alt="" width={85} height={48} className="w-full h-full object-cover" />
    </div>
  );
}

/** お気に入りの1行（BookmarksSectionClient の BookmarkItem の見た目を複製） */
export function ProtoBookmarkRow({ title, lessonTitle }: { title: string; lessonTitle: string }) {
  return (
    <div className="w-full flex items-center gap-3 bg-white" style={{ minHeight: "68px", padding: "16px" }}>
      <div className="flex items-center gap-3 flex-1 min-w-0 no-underline">
        <Thumb />
        <RowText title={title} lessonTitle={lessonTitle} />
      </div>
      <span className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ padding: 8 }} aria-hidden>
        <Star style={{ width: 20, height: 20 }} fill="#FFC107" stroke="#FFC107" strokeWidth={1.5} />
      </span>
    </div>
  );
}

/** 閲覧履歴の1行（HistorySectionClient の HistoryItem の見た目を複製） */
export function ProtoHistoryRow({ title, lessonTitle, ago }: { title: string; lessonTitle: string; ago: string }) {
  return (
    <div
      className="w-full block no-underline"
      style={{
        minHeight: 68,
        display: "flex",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#FFFFFF",
        padding: 16,
        cursor: "pointer",
        transition: "background-color 0.2s ease",
      }}
    >
      <Thumb />
      <RowText title={title} lessonTitle={lessonTitle} />
      <div className="flex-shrink-0 flex items-center gap-1" style={{ color: "#9CA3AF" }}>
        <Clock style={{ width: 16, height: 16 }} />
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, lineHeight: "20px" }}>{ago}</span>
      </div>
    </div>
  );
}

/** リストの外枠（MySection の縦並び部分と同じ） */
export function ProtoRowList({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-0 rounded-2xl overflow-hidden shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04)]">
      {children}
    </div>
  );
}
