/**
 * #267 悩みの項目ページ（267-Q 2章・S2）
 *
 * パンくず: トップ > 悩みの一覧 > 項目（267-O 1章。親は悩みの一覧だけ）
 * - 作り込み「情報設計のやり方」: 先に答え → 確かめる順番①〜⑥（図つき・本文の途中の一文リンク1本）
 *   → 主役のカード1枚＋練習のお題 → 人に聞く（掲示板 → フィードバック）→ 関係する悩み → 一覧へ戻る
 * - ほかの13個: 要点2〜3文 → 主役のカード1枚 → 関係する悩み → 一覧へ戻る（主役が「人に見てもらう」なら人に聞くも出す）
 * 中身は _data/hierarchy.ts から。未ログイン／会員は ?state=member。
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchLessons } from "../../../../course-pages/data/sanity-lessons";
import { Kari } from "../../../_parts/shared";
import {
  TROUBLE_GROUPS,
  TROUBLES_BASE,
  getItem,
  isFree,
  kindsOf,
  resolveMain,
  troubleHref,
  troubles,
  type HubItem,
} from "../../_data/hierarchy";
import { DevStateToggle } from "../../_parts/DevStateToggle";
import {
  AskPeople,
  BackToHub,
  Breadcrumb,
  Eyebrow,
  FOCUS,
  FreeBadge,
  ItemCard,
  KindBadge,
  MainCard,
  PHRASE,
} from "../../_parts/hub-parts";
import { IaSteps } from "../../_parts/ia-steps";
import { TOP_BASE, withState } from "../../_parts/top-parts";

/** 作り込む項目（267-P 2章・267-J 3章） */
const DEEP_ID = "information-architecture";

export const dynamicParams = false;

export function generateStaticParams() {
  return troubles.map((t) => ({ slug: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getItem("troubles", slug);
  return {
    title: item ? `${item.name}｜悩みの一覧（#267 試作）` : "悩みの項目（#267 試作）",
    robots: { index: false, follow: false },
  };
}

const H2 = cn("font-heading text-[24px] font-bold leading-[1.45] text-text-primary lg:text-[28px]", PHRASE);

export default async function TroubleItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ state?: string }>;
}) {
  const [{ slug }, { state }] = await Promise.all([params, searchParams]);
  const member = state === "member";
  const item = getItem("troubles", slug);
  if (!item) notFound();

  const deep = item.id === DEEP_ID;
  const related = item.related
    .map((r) => ({ ...r, item: getItem("troubles", r.id) }))
    .filter((r): r is typeof r & { item: HubItem } => Boolean(r.item));
  const main = item.main ? resolveMain(item.main) : null;
  const lessons = await fetchLessons(
    [...new Set([item.thumb, main?.lessonSlug, ...related.map((r) => r.item.thumb)].filter((s): s is string => Boolean(s)))]
  );
  const group = TROUBLE_GROUPS.find((g) => g.id === item.group);
  const no = String(troubles.indexOf(item) + 1).padStart(2, "0");
  const practice = item.links.find((l) => l.kind === "お題");
  const others = item.links.filter((l) => l !== practice);
  const hub = withState(TROUBLES_BASE, member);
  const backLabel = `${troubles.length}の悩みの一覧へ戻る`;

  return (
    <div className="pb-24">
      <article className="mx-auto w-full max-w-[920px] px-4 pt-6 sm:px-6 lg:px-12 lg:pt-8">
        <Breadcrumb
          items={[
            { label: "トップ", href: withState(TOP_BASE, member) },
            { label: "悩みの一覧", href: hub },
            { label: item.name },
          ]}
        />

        {/* 頭: 名前（検索の言葉）とこんなとき（本人の言葉） */}
        <header className="mt-10">
          <Eyebrow>
            <span className="font-latin tracking-[0.2em]">{no}</span>
            {group ? <span className="ml-3">{group.label}の悩み</span> : null}
          </Eyebrow>
          <h1 className={cn("mt-4 font-heading text-[30px] font-bold leading-[1.35] tracking-[-0.01em] text-text-primary sm:text-[40px]", PHRASE)}>
            {item.name}
            {item.nameKari ? <Kari className="ml-2 align-middle" /> : null}
          </h1>
          <p className="mt-4 font-noto-sans-jp text-base leading-[1.8] text-text-secondary">
            <span className="mr-2 inline-flex items-center rounded-full border border-border-default px-2 py-px align-middle text-xs font-bold text-text-secondary">
              こんなとき
            </span>
            {item.when}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {!member && isFree(item) ? <FreeBadge /> : null}
            {kindsOf(item).map((k) => (
              <KindBadge key={k} kind={k} />
            ))}
          </div>
        </header>

        {/* 先に答え */}
        <section aria-label="要点" className="mt-10 rounded-[24px] bg-surface p-6 shadow-[var(--shadow-xs)] ring-1 ring-border-light md:p-8">
          <p className="font-noto-sans-jp text-xs font-bold text-cta-primary-hover">先に答え</p>
          <div className="mt-3 flex flex-col gap-2 font-noto-sans-jp text-base leading-[1.9] text-text-primary md:text-[17px]">
            {(item.summary ?? []).map((s) => (
              <p key={s}>
                {s}
                <Kari />
              </p>
            ))}
          </div>
          <p className="mt-4 border-t border-border-light pt-4 font-noto-sans-jp text-sm text-text-secondary">
            <span className="mr-1.5 font-bold text-cta-primary-hover">読むとできること</span>
            {item.canDo}
            <Kari />
          </p>
        </section>

        <div className="mt-16 flex flex-col gap-16 lg:mt-20 lg:gap-20">
          {deep ? <IaSteps /> : null}

          {/* 主役のカード1枚（＋練習のお題） */}
          {item.main ? (
            <section aria-labelledby="main-title" className="scroll-mt-24">
              <h2 id="main-title" className={H2}>
                {deep ? "手を動かして身につける" : main?.type === "people" ? "まず試すこと" : "まず開く1本"}
              </h2>
              <p className="mt-3 font-noto-sans-jp text-sm leading-[1.8] text-text-secondary">
                {main?.type === "people"
                  ? "この悩みは、読むより人に見てもらうほうが早く進みます。"
                  : main?.type === "course"
                    ? "この悩みを扱っているコースの章です。"
                    : "この悩みにいちばん近いレッスンです。"}
                <Kari />
              </p>
              <div className="mt-6">
                <MainCard item={item} lessons={lessons} member={member} />
              </div>

              {practice ? (
                <div className="mt-4 flex flex-col gap-4 rounded-[24px] border border-border-light bg-surface p-6 sm:flex-row sm:items-center md:p-8">
                  <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-muted-custom" aria-hidden="true">
                    <Image src="/assets/emoji/book.svg" alt="" width={40} height={40} unoptimized />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-1.5">
                      <KindBadge kind="お題" />
                      {!member ? <FreeBadge /> : null}
                    </div>
                    <h3 className="mt-2 font-heading text-lg font-bold leading-[1.5] text-text-primary">{practice.label}</h3>
                    <p className="mt-1 font-noto-sans-jp text-sm leading-[1.7] text-text-secondary">
                      上の①〜⑥と同じ題材で、要件の整理から画面まで通して作ります。
                      <Kari />
                    </p>
                  </div>
                  <Link
                    href={practice.href}
                    className={cn(
                      "group inline-flex shrink-0 items-center gap-1.5 rounded-[4px] border-b border-border-default pb-0.5 text-sm font-bold text-text-primary hover:border-text-primary",
                      FOCUS
                    )}
                  >
                    お題を見る
                    <ArrowUpRight size={14} aria-hidden="true" className="text-text-muted group-hover:text-text-primary" />
                  </Link>
                </div>
              ) : null}

              {others.length > 0 ? (
                <div className="mt-8">
                  <h3 className="font-noto-sans-jp text-sm font-bold text-text-primary">あわせて読む</h3>
                  <ul className="mt-3 border-t border-border-light">
                    {others.map((l) => (
                      <li key={l.href} className="border-b border-border-light">
                        <Link
                          href={l.href}
                          className={cn("group -mx-3 flex items-center justify-between gap-4 rounded-[8px] px-3 py-4 transition-colors hover:bg-hover", FOCUS)}
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <KindBadge kind={l.kind} />
                            <span className="min-w-0 font-noto-sans-jp text-sm leading-[1.6] text-text-primary">{l.label}</span>
                          </span>
                          <ArrowUpRight
                            size={16}
                            aria-hidden="true"
                            className="shrink-0 text-text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text-primary motion-reduce:transition-none"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}

          {deep || main?.type === "people" ? (
            <AskPeople
              boardLabel="この悩みを掲示板で聞く"
              lead={
                <>
                  {deep ? "⑥まで確かめても決められないときは、今の画面を見せて聞いてください。" : "自分で確かめきれないところは、今の画面を見せて聞いてください。"}「{item.name}」を読んだことを添えると、答えがもらいやすくなります。
                  <Kari />
                </>
              }
            />
          ) : null}

          {related.length > 0 ? (
            <section aria-labelledby="related-title">
              <h2 id="related-title" className={H2}>
                関係する悩み
              </h2>
              <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <li key={r.id}>
                    <ItemCard
                      item={r.item}
                      href={withState(troubleHref(r.item.id), member)}
                      lesson={r.item.thumb ? lessons[r.item.thumb] : null}
                      member={member}
                      reason={r.reason}
                      compact
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="border-t border-border-light pt-10">
            <BackToHub href={hub} label={backLabel} />
          </div>
        </div>
      </article>

      <DevStateToggle base={troubleHref(item.id)} member={member} />
    </div>
  );
}
