import { EventListRow, type EventListRowProps } from "./EventListRow";

/**
 * イベント一覧（/events）の1ブロック（「募集中」または「過去のイベント」）。
 * 見出し（h2）＋件数、行の一覧。0件なら emptyText の1行を出す。
 */
export function EventListSection({
  title,
  rows,
  emptyText,
}: {
  title: string;
  rows: (EventListRowProps & { key: string })[];
  emptyText: string;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-2 border-b border-black/[0.1] pb-2">
        <h2 className="font-rounded-mplus text-lg font-medium leading-[1.5] text-text-primary">
          {title}
        </h2>
        <span className="font-noto-sans-jp text-sm text-text-primary/[0.56]">
          {rows.length}件
        </span>
      </div>
      {rows.length > 0 ? (
        <div className="flex flex-col">
          {rows.map(({ key, ...row }) => (
            <EventListRow key={key} {...row} />
          ))}
        </div>
      ) : (
        <p className="px-1 py-6 font-noto-sans-jp text-sm text-text-primary/[0.56]">
          {emptyText}
        </p>
      )}
    </section>
  );
}
