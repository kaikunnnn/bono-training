import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import WorkshopMarkdown from "@/components/workshop/WorkshopMarkdown";
import { DIRECTIONS, DIRECTION_KEYS, ROWS, THUMBS, type DirectionKey } from "../../directions";
import { loadDrafts } from "../../drafts";

/**
 * 試作の記事ページ（#319・試作だけ）。レッスンページの行を押すとここへ来る（dir=r 以外）。
 * タイトルは選んでいる案の記事名、中身は rebono の下書き（11/14時点の番号）をそのまま出す。本番には出さない。
 */

export default async function DraftArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ dir?: string; layout?: string }>;
}) {
  const { number } = await params;
  const sp = await searchParams;
  const dir: DirectionKey = DIRECTION_KEYS.includes(sp.dir as DirectionKey) ? (sp.dir as DirectionKey) : "q";
  const layout = sp.layout === "standard" ? "standard" : "persona";
  const direction = DIRECTIONS[dir];
  const rows = direction.rows ?? ROWS;
  const rowIndex = rows.findIndex((r) => r.number === number);
  if (rowIndex < 0) notFound();
  const row = rows[rowIndex];
  const title = direction.articleTitles[rowIndex];
  const thumb = row.thumb ?? THUMBS[row.number];
  const drafts = await loadDrafts(number, row.type, row.drafts);
  const back = `/dev/ai-research-lesson?dir=${dir}&layout=${layout}`;
  const hrefOf = (n: string) => `/dev/ai-research-lesson/a/${n}?dir=${dir}&layout=${layout}`;
  const prev = rows[rowIndex - 1];
  const next = rows[rowIndex + 1];

  return (
    <>
      <div className="border-b border-dashed border-border-default bg-muted-custom px-4 py-2 font-mono text-xs text-text-muted">
        <div className="mx-auto flex w-full max-w-[860px] flex-wrap items-center gap-x-4 gap-y-1">
          <span>試作 #319 記事ページ（中身は下書き・サイトのUIではありません）</span>
          <Link href={back} className="underline">
            レッスンページへ戻る（{direction.label}）
          </Link>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-[860px] flex-col gap-8 px-4 py-10">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-bold text-text-muted">
            {row.number}・{row.free ? "無料" : "会員"}
            {row.duration && `・${row.duration}`}
          </p>
          <h1 className="font-rounded-mplus text-2xl font-bold leading-snug text-text-primary md:text-[28px]">{title}</h1>
          {thumb && (
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted-custom">
              <Image src={thumb} alt={`${title}のサムネイル`} fill sizes="860px" className="object-cover" />
            </div>
          )}
        </header>

        {drafts.length === 0 ? (
          <p className="rounded-2xl border border-border-default bg-surface p-5 text-sm text-text-muted">
            この回の記事の下書きは、まだありません。
          </p>
        ) : (
          drafts.map((d, i) => (
            <section key={d.number} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1 rounded-2xl bg-muted-custom px-4 py-3 text-xs text-text-muted">
                <h2 className="text-sm font-bold text-text-primary">
                  下書き {d.number}「{d.title}」
                </h2>
                <span>rebono/AIリサーチではじめるUIデザイン/{d.file}</span>
                {d.videoUrl && !(row.oneVideo && i > 0) && (
                  <a href={d.videoUrl} target="_blank" rel="noreferrer" className="underline">
                    動画を開く（Vimeo{d.videoDuration && `・${d.videoDuration}`}）
                  </a>
                )}
              </div>
              <WorkshopMarkdown content={d.body} className="max-w-none" />
            </section>
          ))
        )}

        <nav className="flex justify-between gap-4 border-t border-border-default pt-6 text-sm">
          {prev ? (
            <Link href={hrefOf(prev.number)} className="underline">
              ← {direction.articleTitles[rowIndex - 1]}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={hrefOf(next.number)} className="underline">
              {direction.articleTitles[rowIndex + 1]} →
            </Link>
          )}
        </nav>
      </main>
    </>
  );
}
