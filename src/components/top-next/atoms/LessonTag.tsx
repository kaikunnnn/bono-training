/**
 * レッスンカード左上のグレーピルタグ（新トップページ Figma Make HANDOFF由来）
 *
 * LessonCard の variant="cover"（src/components/lessons/LessonCard.tsx）にも
 * 同等のマークアップがインラインで存在する。将来的にはそちらもこの Atom に
 * 差し替える想定。
 */
export function LessonTag() {
  return (
    <div className="flex items-center gap-1 self-start rounded-[61px] border border-[rgba(102,102,102,0.04)] bg-[rgba(102,102,102,0.06)] px-2 py-1.5">
      <p className="font-noto-sans-jp text-[11px] font-bold uppercase leading-normal text-[#666]">
        レッスン
      </p>
    </div>
  );
}
