/**
 * #267 勉強法・キャリアのハブ（267-Q 2章・S3）の共通部品
 *
 * 悩みの一覧（troubles/page.tsx）と同じ見た目: HubHeader → 目次チップ → カード → 人に聞く → 次に整えたいこと。
 * 違い: 勉強法・キャリアは項目ごとのページがまだ無い（次の段）ので、カードは「いちばん答えになっている今ある記事・レッスン」へ直接つなぎ、
 * カードの下に今ある記事・レッスンを最大3本並べる（リンクは hierarchy.ts のデータ。実在は localhost で確かめた）。
 *
 * カードの絵（S1 のスクショへの指摘「同じ表紙を何枚も並べない」）:
 * - リンクの中から、まだこのハブで使っていない絵を順に探す。/guide → 記事のサムネイル（横長）、/lessons → レッスンの表紙（2:3）
 * - 使える絵が無ければ、アイコンの枠（トップの入口と同じグラデーション）
 * 画像は Sanity の CDN を直接（unoptimized。Vercel の画像最適化は使わない＝402 対策）。
 */

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { DocumentText } from "iconsax-react";
import { getAllGuidesFromSanity, getStoriesList } from "@/lib/sanity";
import { PURPOSE_ICON_GRADIENT } from "@/styles/gradients";
import { cn } from "@/lib/utils";
import { fetchLessons } from "../../../course-pages/data/sanity-lessons";
import type { LessonMap, ResolvedLesson } from "../../../course-pages/data/types";
import { LessonCover } from "../../../course-pages/template/shared";
import { Kari } from "../../_parts/shared";
import type { HubItem, LinkRef } from "../_data/hierarchy";
import { FOCUS, KindBadge, PHRASE } from "./hub-parts";

// ------------------------------------------------------------
// データ（絵と数）
// ------------------------------------------------------------

export type ItemVisual =
  | { type: "guide"; url: string; title: string }
  | { type: "lesson"; lesson: ResolvedLesson }
  | { type: "icon" };

/** 中身の分からない共通の表紙（「BONO」だけの仮の表紙）は、絵として使わない */
export const isGenericCover = (url: string | null | undefined) => !url || url.includes("bono-cover");

const lessonSlugOf = (href: string) => (href.startsWith("/lessons/") ? href.slice("/lessons/".length) : null);
const guideSlugOf = (href: string) => (href.startsWith("/guide/") ? href.slice("/guide/".length) : null);

/** ハブの全項目のリンクから、レッスンの表紙と記事のサムネイルをまとめて引く */
export async function fetchHubMedia(items: HubItem[]) {
  const lessonSlugs = [...new Set(items.flatMap((it) => it.links.map((l) => lessonSlugOf(l.href)).filter((s): s is string => Boolean(s))))];
  const [lessons, guides] = await Promise.all([
    fetchLessons(lessonSlugs),
    getAllGuidesFromSanity().catch((error) => {
      console.error("[dev/site-structure] /guide の記事の取得に失敗", error);
      return [];
    }),
  ]);
  const guideThumbs = new Map(guides.filter((g) => g.thumbnailUrl).map((g) => [g.slug, { url: g.thumbnailUrl!, title: g.title }]));

  // 上の項目から順に、まだ使っていない絵を選ぶ
  const used = new Set<string>();
  const visuals: Record<string, ItemVisual> = {};
  for (const it of items) {
    let picked: ItemVisual = { type: "icon" };
    for (const l of it.links) {
      const g = guideSlugOf(l.href);
      const s = lessonSlugOf(l.href);
      if (g && guideThumbs.has(g) && !used.has(`g:${g}`)) {
        used.add(`g:${g}`);
        picked = { type: "guide", ...guideThumbs.get(g)! };
        break;
      }
      const cover = s ? lessons[s]?.iconImageUrl : null;
      if (s && cover && !isGenericCover(cover) && !used.has(`u:${cover}`)) {
        used.add(`u:${cover}`);
        picked = { type: "lesson", lesson: lessons[s]! };
        break;
      }
    }
    visuals[it.id] = picked;
  }
  return { lessons, visuals, lessonSlugs };
}

/** ハブの頭に出す数（データから数える） */
export function hubCounts(items: HubItem[]) {
  const hrefs = new Set(items.flatMap((it) => it.links.map((l) => l.href)));
  const list = [...hrefs];
  return {
    items: items.length,
    guides: list.filter((h) => h.startsWith("/guide/")).length,
    lessons: list.filter((h) => h.startsWith("/lessons/")).length,
    stories: list.filter((h) => h.startsWith("/stories/")).length,
  };
}

export function coversFrom(lessonSlugs: string[], lessons: LessonMap) {
  return lessonSlugs.map((s) => lessons[s] ?? null).filter((l) => l && !isGenericCover(l.iconImageUrl));
}

/** 記事のサムネイルを3枚、少し重ねて並べる（ハブの頭の右。表紙の扇と同じ枠） */
export function GuideCollage({ visuals }: { visuals: ItemVisual[] }) {
  const guides = visuals.filter((v): v is Extract<ItemVisual, { type: "guide" }> => v.type === "guide").slice(0, 3);
  if (guides.length === 0) return null;
  const POS = [
    "left-[4%] top-[20%] w-[52%] -rotate-[5deg] z-[1]",
    "left-[24%] top-[10%] w-[54%] z-[3]",
    "left-[44%] top-[24%] w-[52%] rotate-[5deg] z-[2]",
  ];
  return (
    <div className="relative aspect-[16/8] overflow-hidden rounded-[24px] border border-border-light bg-muted-custom">
      {guides.map((g, i) => (
        <div
          key={g.url}
          className={cn("absolute aspect-[1200/630] overflow-hidden rounded-[10px] bg-muted-strong shadow-[var(--shadow-md)] ring-1 ring-black/[0.06]", POS[i])}
        >
          <Image src={g.url} alt="" fill sizes="(min-width: 1280px) 320px, 50vw" unoptimized className="object-cover" />
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------------------
// カード
// ------------------------------------------------------------

function Visual({ visual }: { visual: ItemVisual }) {
  if (visual.type === "guide") {
    return (
      <div className="relative aspect-[1200/630] w-[78%] translate-y-[10%] overflow-hidden rounded-[10px] bg-muted-strong shadow-[var(--shadow-md)] ring-1 ring-black/[0.06] transition-transform duration-300 group-hover:translate-y-[6%] motion-reduce:transition-none motion-reduce:group-hover:translate-y-[10%]">
        <Image src={visual.url} alt="" fill sizes="(min-width: 1280px) 280px, 70vw" unoptimized className="object-cover" />
      </div>
    );
  }
  if (visual.type === "lesson") {
    return (
      <div className="h-[78%] translate-y-[6%] transition-transform duration-300 group-hover:translate-y-[2%] motion-reduce:transition-none motion-reduce:group-hover:translate-y-[6%]">
        <LessonCover lesson={visual.lesson} sizes="96px" className="h-full w-auto shadow-[var(--shadow-md)] ring-1 ring-black/[0.06]" />
      </div>
    );
  }
  return (
    <span
      className="flex size-16 items-center justify-center rounded-[20px] border-[0.5px] border-black/10 text-text-primary"
      style={{ backgroundImage: PURPOSE_ICON_GRADIENT }}
      aria-hidden="true"
    >
      <DocumentText size={30} color="currentColor" variant="Outline" />
    </span>
  );
}

/** 外のリンク（/stories など本番ページ）。試作の中のリンクではないので state は付けない */
function LinkRow({ link }: { link: LinkRef }) {
  return (
    <li>
      <Link
        href={link.href}
        className={cn(
          "group/link -mx-2 flex items-start gap-2.5 rounded-[8px] px-2 py-2 transition-colors hover:bg-hover",
          FOCUS
        )}
      >
        <span className="mt-[1px] shrink-0">
          <KindBadge kind={link.kind} />
        </span>
        <span className="min-w-0 flex-1 font-noto-sans-jp text-[13px] leading-[1.6] text-text-primary [overflow-wrap:anywhere] line-clamp-2">
          {link.label}
          {link.kind === "体験談" ? <Kari /> : null}
        </span>
        <ArrowUpRight
          size={14}
          aria-hidden="true"
          className="mt-1 shrink-0 text-text-muted transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 group-hover/link:text-text-primary motion-reduce:transition-none"
        />
      </Link>
    </li>
  );
}

export function GuideItemCard({ item, visual, no }: { item: HubItem; visual: ItemVisual; no: string }) {
  const primary = item.links[0];
  return (
    <article
      id={`item-${item.id}`}
      className="flex h-full scroll-mt-24 flex-col overflow-hidden rounded-[20px] border border-border-light bg-surface shadow-[var(--shadow-xs)] transition-[box-shadow,border-color] duration-200 hover:border-border-default hover:shadow-[var(--shadow-md)]"
    >
      {/* 上半分: いちばん答えになっている記事・レッスンへ */}
      <Link href={primary?.href ?? "#"} className={cn("group flex flex-col", FOCUS)}>
        <div className="relative flex h-[172px] items-end justify-center overflow-hidden bg-muted-custom">
          <span className="absolute top-3 left-4 font-latin text-xs tracking-[0.2em] text-text-muted" aria-hidden="true">
            {no}
          </span>
          <div className={cn("flex h-full w-full justify-center", visual.type === "icon" ? "items-center" : "items-end")}>
            <Visual visual={visual} />
          </div>
        </div>
        <div className="flex flex-col gap-2.5 px-5 pt-5">
          <h3 className={cn("font-heading text-lg font-bold leading-[1.45] text-text-primary group-hover:underline group-hover:underline-offset-4", PHRASE)}>
            {item.name}
            {item.nameKari ? <Kari /> : null}
          </h3>
          <p className="font-noto-sans-jp text-xs leading-[1.6] text-text-muted">
            <span className="mr-1.5 font-bold text-text-secondary">こんなとき</span>
            {item.when}
          </p>
          <p className="border-t border-border-light pt-2.5 font-noto-sans-jp text-sm leading-[1.7] text-text-secondary">
            <span className="mr-1.5 text-xs font-bold text-cta-primary-hover">できること</span>
            {item.canDo}
            <Kari />
          </p>
        </div>
      </Link>

      {/* 下半分: 今ある記事・レッスン（最大3本） */}
      <div className="mt-auto px-5 pt-3 pb-4">
        <p className="mb-1 font-noto-sans-jp text-[11px] font-bold tracking-[0.08em] text-text-muted">ここから読める</p>
        <ul className="flex flex-col">
          {item.links.slice(0, 3).map((l) => (
            <LinkRow key={l.href} link={l} />
          ))}
        </ul>
      </div>
    </article>
  );
}

/** 小さく置く項目（本・Figma）。カードにせず1行で */
export function SmallItemRow({ item }: { item: HubItem }) {
  return (
    <div id={`item-${item.id}`} className="scroll-mt-24 rounded-[20px] border border-dashed border-border-default px-5 py-5 md:flex md:items-center md:gap-8">
      <div className="min-w-0 md:w-[320px] md:shrink-0">
        <h3 className={cn("font-heading text-base font-bold leading-[1.5] text-text-primary", PHRASE)}>{item.name}</h3>
        <p className="mt-1 font-noto-sans-jp text-xs leading-[1.6] text-text-muted">{item.when}</p>
      </div>
      <ul className="mt-3 flex flex-1 flex-col md:mt-0 md:grid md:grid-cols-2 md:gap-x-6">
        {item.links.slice(0, 3).map((l) => (
          <LinkRow key={l.href} link={l} />
        ))}
      </ul>
    </div>
  );
}

// ------------------------------------------------------------
// 先輩の道のり（/stories の今ある体験談。名前は出さず、題とタグだけ）
// ------------------------------------------------------------

/** 題に名前の入っていない体験談を選んだ（2026-10-29 に /stories で実在を確かめた） */
const STORY_SLUGS = [
  "sobo-selfregi-uiux-dai",
  "dokugaku-kangaete-tsukuru-graphic-uiux-koji",
  "youhadouyatedezainanimiyu",
  "youhadouyatedezainanitara",
  "youhadouyatedezainani-nakano",
];

export async function StoriesRow({ id = "stories" }: { id?: string }) {
  const all = await getStoriesList().catch((error) => {
    console.error("[dev/site-structure] /stories の取得に失敗", error);
    return [];
  });
  const bySlug = new Map(all.map((s) => [s.slug?.current, s]));
  // Sanity に無いものは出さない（黙って消さず、ログに残す）
  const rows = STORY_SLUGS.flatMap((slug) => {
    const s = bySlug.get(slug);
    if (!s) {
      console.warn(`[dev/site-structure] 体験談が見つからない: ${slug}`);
      return [];
    }
    return [{ slug, title: s.title, tag: (s.tags ?? []).find((t) => t === "未経験" || t === "業界経験あり") }];
  });
  if (rows.length === 0) return null;

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id={`${id}-title`} className={cn("font-heading text-[24px] font-bold leading-[1.45] text-text-primary lg:text-[28px]", PHRASE)}>
            先輩の道のり
          </h2>
          <p className="mt-3 max-w-[560px] font-noto-sans-jp text-sm leading-[1.8] text-text-secondary">
            BONOで学んで転職した人に、何をどの順で進めたかを聞きました。
            <Kari />
          </p>
        </div>
        <Link
          href="/stories"
          className={cn("group inline-flex shrink-0 items-center gap-1.5 font-noto-sans-jp text-sm font-bold text-text-primary hover:underline hover:underline-offset-4", FOCUS)}
        >
          体験談をすべて見る
          <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </Link>
      </div>
      <ul className="mt-6 grid grid-cols-1 border-t border-border-light md:grid-cols-2 md:gap-x-12">
        {rows.map((r) => (
          <li key={r.slug} className="border-b border-border-light">
            <Link
              href={`/stories/${r.slug}`}
              className={cn("group -mx-3 flex items-center justify-between gap-4 rounded-[8px] px-3 py-5 transition-colors hover:bg-hover", FOCUS)}
            >
              <span className="flex min-w-0 flex-col gap-1.5">
                {r.tag ? (
                  <span className="w-fit rounded-full border border-border-light px-2 py-px font-noto-sans-jp text-[11px] font-medium text-text-secondary">
                    {r.tag}
                  </span>
                ) : null}
                <span className="line-clamp-2 font-noto-sans-jp text-[15px] font-bold leading-[1.6] text-text-primary">{r.title}</span>
              </span>
              <ArrowUpRight
                size={18}
                aria-hidden="true"
                className="shrink-0 text-text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text-primary motion-reduce:transition-none"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SectionTitle({ id, title, lead }: { id: string; title: string; lead?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
      <h2 id={id} className={cn("font-heading text-[26px] font-bold leading-[1.4] text-text-primary lg:text-[32px]", PHRASE)}>
        {title}
      </h2>
      {lead ? <p className="font-noto-sans-jp text-sm text-text-muted">{lead}</p> : null}
    </div>
  );
}
