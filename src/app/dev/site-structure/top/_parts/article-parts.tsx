/**
 * #267 まとめ記事の共通部品（267-R 4章）— 勉強法（R1）とキャリア（R2）で使う
 *
 * 形（上から）: パンくず → h1＋一言 → 前置き → 目的から選ぶ（各節へのページ内リンク）
 *   → 節 01〜（h2: 短い答え → 番号つきの手順 → 実物のサムネイル → 詳しくは → 目的から選ぶ↑。h3 の小見出しも同じ形）
 *   → コースで進める（ArticleCourseCta）→ 次に整えたいこと（hub-parts の NextSteps）→ 書いた人と確認日
 * 型の参考: エアコン屋の裏方「仕事まわりガイド」（型だけ借りる）。外の定石は 267-R 9章（柱のページ・ページ内リンク）。
 *
 * 文言は _data/hierarchy.ts の項目（name・when・summary・steps・links[].reason）から読む。
 * サムネイルはレッスンの表紙（LessonCover）と記事のサムネイル。Sanity の CDN を直接（unoptimized。402 対策）。
 * ページ全体で同じ画像は2回使わない（上の節から順に、まだ使っていない絵を選ぶ）。
 * 節の id は今までのハブと同じ `item-<id>`（トップの「学び方とキャリア」の帯からのリンクがそのまま届く）。
 * 色はトークンだけ。アクセントは深い緑（cta-primary）。オレンジは使わない。
 */

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllGuidesFromSanity } from "@/lib/sanity";
import { cn } from "@/lib/utils";
import { fetchLessons } from "../../../course-pages/data/sanity-lessons";
import type { ResolvedLesson } from "../../../course-pages/data/types";
import { LessonCover } from "../../../course-pages/template/shared";
import { Kari } from "../../_parts/shared";
import { getItem, type GuideArticle, type HubItem, type LinkRef, type Parent } from "../_data/hierarchy";
import { isGenericCover } from "./guide-hub";
import { Breadcrumb, FOCUS, FreeBadge, KindBadge, PAGE, PHRASE, type Crumb } from "./hub-parts";

/** 本文の幅（1行を短く） */
export const ARTICLE = "mx-auto w-full max-w-[760px]";
const CHOOSE_ID = "choose";
const anchorOf = (id: string) => `item-${id}`;
const pad2 = (n: number) => String(n).padStart(2, "0");

// ------------------------------------------------------------
// データ（節と、そこで使う絵）
// ------------------------------------------------------------

export type Thumb =
  | { type: "lesson"; href: string; label: string; lesson: ResolvedLesson }
  | { type: "guide"; href: string; label: string; url: string };

export interface ArticleBlock {
  item: HubItem;
  thumbs: Thumb[];
}

export interface ArticleSection extends ArticleBlock {
  no: string;
  subs: ArticleBlock[];
}

const lessonSlugOf = (href: string) => (href.startsWith("/lessons/") ? href.slice("/lessons/".length) : null);
const guideSlugOf = (href: string) => (href.startsWith("/guide/") ? href.slice("/guide/".length) : null);
/** 中身の分からない表紙（BONO だけの共通の表紙・灰色の下地だけの _base.png）は絵として使わない */
const isBlankCover = (url: string | null | undefined) => isGenericCover(url) || Boolean(url?.endsWith("_base.png"));

/** 記事の節を組み、各節・小見出しで使うサムネイルを選ぶ（ページ全体で同じ絵を2回使わない） */
export async function buildArticle(parent: Parent, article: GuideArticle): Promise<ArticleSection[]> {
  const refs = article.sections.map((sec) => ({
    item: getItem(parent, sec.id),
    subs: (sec.subIds ?? []).map((id) => getItem(parent, id)).filter((it): it is HubItem => Boolean(it)),
  }));
  const all = refs.flatMap((r) => (r.item ? [r.item, ...r.subs] : r.subs));
  const lessonSlugs = [...new Set(all.flatMap((it) => it.links.map((l) => lessonSlugOf(l.href)).filter((s): s is string => Boolean(s))))];

  const [lessons, guides] = await Promise.all([
    fetchLessons(lessonSlugs),
    getAllGuidesFromSanity().catch((error) => {
      console.error("[dev/site-structure] /guide の記事の取得に失敗", error);
      return [];
    }),
  ]);
  const guideThumbs = new Map(guides.filter((g) => g.thumbnailUrl).map((g) => [g.slug, g.thumbnailUrl!]));

  const used = new Set<string>();
  const pick = (item: HubItem): Thumb[] => {
    const out: Thumb[] = [];
    for (const l of item.links) {
      if (out.length >= 3) break;
      const s = lessonSlugOf(l.href);
      const g = guideSlugOf(l.href);
      const lesson = s ? lessons[s] : null;
      if (lesson && !isBlankCover(lesson.iconImageUrl) && !used.has(lesson.iconImageUrl!)) {
        used.add(lesson.iconImageUrl!);
        out.push({ type: "lesson", href: l.href, label: l.label, lesson });
        continue;
      }
      const url = g ? guideThumbs.get(g) : undefined;
      if (url && !used.has(url)) {
        used.add(url);
        out.push({ type: "guide", href: l.href, label: l.label, url });
      }
    }
    return out;
  };

  return refs.flatMap((r, i) => {
    if (!r.item) {
      // hierarchy.ts の読み込み時に確かめているので、ここに来るのは想定外。黙って消さずログに残す
      console.warn(`[dev/site-structure] まとめ記事の節の項目が無い: ${article.sections[i].id}`);
      return [];
    }
    const head = { item: r.item, thumbs: pick(r.item) };
    return [{ ...head, no: pad2(i + 1), subs: r.subs.map((sub) => ({ item: sub, thumbs: pick(sub) })) }];
  });
}

// ------------------------------------------------------------
// 記事の頭
// ------------------------------------------------------------

export function ArticleHeader({ crumbs, article }: { crumbs: Crumb[]; article: GuideArticle }) {
  return (
    <header className={cn(PAGE, "pt-6 pb-10 lg:pt-8 lg:pb-14")}>
      <Breadcrumb items={crumbs} />
      <div className={cn(ARTICLE, "mt-10 lg:mt-14")}>
        <h1 className={cn("font-heading text-[32px] font-bold leading-[1.3] tracking-[-0.01em] text-text-primary sm:text-[44px]", PHRASE)}>
          {article.title}
          <Kari className="ml-2 align-middle" />
        </h1>
        <p className="mt-3 font-heading text-base font-medium leading-[1.6] text-text-secondary sm:text-lg">
          {article.sub}
          <Kari />
        </p>
        <p className="mt-8 max-w-[36em] font-noto-sans-jp text-base leading-[2] text-text-secondary">
          {article.intro}
          <Kari />
        </p>
      </div>
    </header>
  );
}

// ------------------------------------------------------------
// 目的から選ぶ（各節へのページ内リンク）
// ------------------------------------------------------------

export function PurposeChooser({ sections, title = "目的から選ぶ" }: { sections: ArticleSection[]; title?: string }) {
  return (
    <section id={CHOOSE_ID} aria-labelledby={`${CHOOSE_ID}-title`} className={cn(ARTICLE, "scroll-mt-24")}>
      <h2 id={`${CHOOSE_ID}-title`} className="font-heading text-lg font-bold leading-[1.5] text-text-primary">
        {title}
      </h2>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {sections.map((s) => (
          <li key={s.item.id}>
            <a
              href={`#${anchorOf(s.item.id)}`}
              className={cn(
                "group flex h-full items-start gap-4 rounded-[20px] border border-border-light bg-surface p-5 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] duration-200 hover:border-border-default hover:shadow-[var(--shadow-md)]",
                FOCUS
              )}
            >
              <span className="mt-0.5 shrink-0 font-latin text-xs tracking-[0.2em] text-cta-primary-hover" aria-hidden="true">
                {s.no}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className={cn("font-heading text-base font-bold leading-[1.5] text-text-primary", PHRASE)}>
                  {s.item.name}
                  {s.item.nameKari ? <Kari /> : null}
                </span>
                <span className="font-noto-sans-jp text-[13px] leading-[1.7] text-text-muted">{s.item.when}</span>
              </span>
              <ArrowDown
                size={16}
                aria-hidden="true"
                className="mt-1 shrink-0 text-text-muted transition-transform group-hover:translate-y-0.5 group-hover:text-text-primary motion-reduce:transition-none"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ------------------------------------------------------------
// 節の中身
// ------------------------------------------------------------

function Answer({ item }: { item: HubItem }) {
  const [first, ...rest] = item.summary ?? [];
  if (!first) return null;
  return (
    <div className="mt-6 flex max-w-[36em] flex-col gap-4">
      <p className="font-noto-sans-jp text-[17px] font-medium leading-[1.95] text-text-primary">{first}</p>
      {rest.map((s, i) => (
        <p key={s} className="font-noto-sans-jp text-base leading-[2] text-text-secondary">
          {s}
          {i === rest.length - 1 ? <Kari /> : null}
        </p>
      ))}
    </div>
  );
}

function Steps({ steps }: { steps?: string[] }) {
  if (!steps?.length) return null;
  return (
    <div className="mt-8 rounded-[20px] bg-muted-custom px-5 py-6 sm:px-7">
      <p className="font-noto-sans-jp text-xs font-bold tracking-[0.08em] text-text-muted">
        進め方
        <Kari />
      </p>
      <ol className="mt-4 flex flex-col gap-4">
        {steps.map((s, i) => (
          <li key={s} className="flex items-start gap-3.5">
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface font-latin text-sm font-bold text-cta-primary-hover shadow-[var(--shadow-xs)]"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <span className="pt-0.5 font-noto-sans-jp text-[15px] leading-[1.8] text-text-primary">{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Thumbs({ thumbs }: { thumbs: Thumb[] }) {
  if (thumbs.length === 0) return null;
  return (
    <ul className="mt-8 flex flex-wrap items-end gap-x-5 gap-y-6" aria-label="この節で使うレッスン・記事">
      {thumbs.map((t) => (
        <li key={t.href} className={t.type === "lesson" ? "w-[88px] sm:w-[112px]" : "w-[168px] sm:w-[248px]"}>
          <Link href={t.href} className={cn("group flex flex-col gap-2 rounded-[10px]", FOCUS)}>
            {t.type === "lesson" ? (
              <LessonCover
                lesson={t.lesson}
                sizes="112px"
                className="w-full shadow-[var(--shadow-md)] ring-1 ring-black/[0.06] transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
              />
            ) : (
              <span className="relative block aspect-[1200/630] w-full overflow-hidden rounded-[10px] bg-muted-strong shadow-[var(--shadow-md)] ring-1 ring-black/[0.06] transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
                <Image src={t.url} alt="" fill sizes="248px" unoptimized className="object-cover" />
              </span>
            )}
            <span className="line-clamp-2 font-noto-sans-jp text-xs leading-[1.6] text-text-secondary group-hover:text-text-primary">
              {t.label}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** 外のリンク（本番ページ）。理由を一行添える */
function MoreLinks({ links }: { links: LinkRef[] }) {
  if (links.length === 0) return null;
  return (
    <div className="mt-8">
      <p className="font-noto-sans-jp text-sm font-bold text-text-primary">詳しくは</p>
      <ul className="mt-2 flex flex-col border-t border-border-light">
        {links.slice(0, 3).map((l) => (
          <li key={l.href} className="border-b border-border-light">
            <Link
              href={l.href}
              className={cn("group -mx-3 flex items-start gap-3 rounded-[8px] px-3 py-4 transition-colors hover:bg-hover", FOCUS)}
            >
              <span className="mt-[2px] w-[64px] shrink-0">
                <KindBadge kind={l.kind} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-noto-sans-jp text-[15px] font-bold leading-[1.6] text-text-primary [overflow-wrap:anywhere] group-hover:underline group-hover:underline-offset-4">
                  {l.label}
                </span>
                {l.reason ? (
                  <span className="font-noto-sans-jp text-[13px] leading-[1.7] text-text-muted">
                    {l.reason}
                    <Kari />
                  </span>
                ) : null}
              </span>
              <ArrowUpRight
                size={16}
                aria-hidden="true"
                className="mt-1 shrink-0 text-text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text-primary motion-reduce:transition-none"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BackToChoose({ label = "目的から選ぶ" }: { label?: string }) {
  return (
    <a
      href={`#${CHOOSE_ID}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[6px] font-noto-sans-jp text-sm font-medium text-text-muted transition-colors hover:text-text-primary hover:underline hover:underline-offset-4",
        FOCUS
      )}
    >
      {label}
      <ArrowUp size={14} aria-hidden="true" />
    </a>
  );
}

function SubSection({ block }: { block: ArticleBlock }) {
  const { item } = block;
  return (
    <section id={anchorOf(item.id)} aria-labelledby={`${anchorOf(item.id)}-title`} className="mt-16 scroll-mt-24 border-t border-dashed border-border-default pt-12">
      <h3 id={`${anchorOf(item.id)}-title`} className={cn("font-heading text-[21px] font-bold leading-[1.45] text-text-primary sm:text-[24px]", PHRASE)}>
        {item.name}
        {item.nameKari ? <Kari /> : null}
      </h3>
      <p className="mt-2 font-noto-sans-jp text-[13px] leading-[1.7] text-text-muted">
        <span className="mr-1.5 font-bold text-text-secondary">こんなとき</span>
        {item.when}
      </p>
      <Answer item={item} />
      <Steps steps={item.steps} />
      <Thumbs thumbs={block.thumbs} />
      <MoreLinks links={item.links} />
    </section>
  );
}

export function ArticleSectionView({ section }: { section: ArticleSection }) {
  const { item } = section;
  const id = anchorOf(item.id);
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-t border-border-light pt-14 lg:pt-16">
      <p className="font-latin text-sm font-bold tracking-[0.2em] text-cta-primary-hover" aria-hidden="true">
        {section.no}
      </p>
      <h2 id={`${id}-title`} className={cn("mt-2 font-heading text-[26px] font-bold leading-[1.4] text-text-primary sm:text-[32px]", PHRASE)}>
        <span className="sr-only">{section.no} </span>
        {item.name}
        {item.nameKari ? <Kari /> : null}
      </h2>
      <p className="mt-3 font-noto-sans-jp text-[13px] leading-[1.7] text-text-muted">
        <span className="mr-1.5 font-bold text-text-secondary">こんなとき</span>
        {item.when}
      </p>
      <Answer item={item} />
      <Steps steps={item.steps} />
      <Thumbs thumbs={section.thumbs} />
      <MoreLinks links={item.links} />
      {section.subs.map((sub) => (
        <SubSection key={sub.item.id} block={sub} />
      ))}
      <div className="mt-10">
        <BackToChoose />
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// コースで進める（次に整えたいことの直前。記事から、コースと料金へ進む道）
// 検索から記事に来た人がコース・料金へ進む道がなかったため（GA4: 記事への検索流入 721 回 → 課金 1 件）。
// 目立たせすぎない: 白い面＋細い線。ボタンは1つだけ（未ログインは料金、会員は続きから）。
// ------------------------------------------------------------

export interface CourseCtaItem {
  /** 形の印（コース・ロードマップ） */
  tag: "コース" | "ロードマップ";
  label: string;
  href: string;
  reason: string;
  /** 無料で読める範囲の一言（例: 最初のレッスンは無料） */
  free?: string;
}

function CtaTag({ tag }: { tag: CourseCtaItem["tag"] }) {
  if (tag === "コース") return <KindBadge kind="コース" />;
  // KindBadge の Kind に「ロードマップ」は無いので、同じ見た目で出す
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full border border-border-light px-2 py-px font-noto-sans-jp text-[11px] font-medium leading-[1.6] text-text-secondary">
      {tag}
    </span>
  );
}

export function ArticleCourseCta({
  id = "course",
  title,
  lead,
  items,
  action,
}: {
  id?: string;
  title: ReactNode;
  lead: ReactNode;
  items: CourseCtaItem[];
  action: { label: string; href: string; note?: ReactNode };
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 rounded-[24px] border border-border-light bg-surface p-6 shadow-[var(--shadow-xs)] sm:p-8"
    >
      <h2 id={`${id}-title`} className={cn("font-heading text-[22px] font-bold leading-[1.45] text-text-primary lg:text-[24px]", PHRASE)}>
        {title}
      </h2>
      <div className="mt-3 max-w-[36em] font-noto-sans-jp text-sm leading-[1.9] text-text-secondary">{lead}</div>
      <ul className="mt-6 flex flex-col border-t border-border-light">
        {items.map((it) => (
          <li key={it.href} className="border-b border-border-light">
            <Link
              href={it.href}
              className={cn("group -mx-3 flex items-start gap-3 rounded-[8px] px-3 py-4 transition-colors hover:bg-hover", FOCUS)}
            >
              <span className="mt-[2px] hidden w-[88px] shrink-0 sm:block">
                <CtaTag tag={it.tag} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="sm:hidden">
                  <CtaTag tag={it.tag} />
                </span>
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span
                    className={cn(
                      "font-noto-sans-jp text-[15px] font-bold leading-[1.6] text-text-primary group-hover:underline group-hover:underline-offset-4",
                      PHRASE
                    )}
                  >
                    {it.label}
                  </span>
                  {it.free ? <FreeBadge>{it.free}</FreeBadge> : null}
                </span>
                <span className="font-noto-sans-jp text-[13px] leading-[1.7] text-text-muted">
                  {it.reason}
                  <Kari />
                </span>
              </span>
              <ArrowUpRight
                size={16}
                aria-hidden="true"
                className="mt-1 shrink-0 text-text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text-primary motion-reduce:transition-none"
              />
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
        <Button variant="default" size="lg" asChild>
          <Link href={action.href}>
            {action.label}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
        {action.note ? <p className="font-noto-sans-jp text-xs leading-[1.7] text-text-muted">{action.note}</p> : null}
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// 書いた人と確認日
// ------------------------------------------------------------

export function ArticleByline({ author, checkedAt, children }: { author: string; checkedAt: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border-light pt-6 font-noto-sans-jp text-xs text-text-muted">
      <p>
        <span className="mr-2 font-bold text-text-secondary">書いた人</span>
        {author}
      </p>
      <p>
        <span className="mr-2 font-bold text-text-secondary">確認日</span>
        <time dateTime={checkedAt}>{checkedAt.replaceAll("-", ".")}</time>
      </p>
      {children}
    </div>
  );
}
