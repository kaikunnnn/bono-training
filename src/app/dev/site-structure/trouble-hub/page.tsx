/**
 * #267 試作2 — 悩みのハブ「UIの作り方で困った」
 *
 * エアコン裏方のトラブルのハブ（267-A 3・6章）を下敷きにした、症状で切る入口。
 * - 冒頭: 何のページか → 「どこから見る？」の絞り込み → 全項目の一覧（逃げ道）
 * - 各項目は <details id>（#id で直接開ける）: 答え → 確かめる順番 → 詳しい記事 → コース1つ → ロードマップへ
 * - 詳しい記事は本番に実在する公開記事。答えの文言は試作用
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Map as MapIcon } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { getCourse } from "../../course-pages/data";
import { getV6Step } from "../../course-pages/data/roadmap-career-change-v6";
import { Kari, ProtoBar, V6_BASE, courseHref, v6Step } from "../_parts/shared";
import { HashOpener, HubChooser } from "./HubChooser";
import { KINDS, SITUATIONS, TROUBLES, type TroubleItem } from "./data";

export const metadata: Metadata = {
  title: "UIの作り方で困った（#267 試作）",
  robots: { index: false, follow: false },
};


export default function TroubleHubPage() {
  const chooserItems = TROUBLES.map(({ id, title, kind, situations }) => ({ id, title, kind, situations }));

  return (
    <div className="font-noto-sans-jp">
      <HashOpener />
      <ProtoBar
        title="試作2 悩みのハブ「UIの作り方で困った」"
        note="症状（今の困りごと）で切る入口。各項目は #id で直接開ける（例: #spacing）。詳しい記事は本番の公開記事、答えの文言は試作用。"
      />

      <div className="mx-auto w-full max-w-[880px] px-4 pb-24 pt-8 sm:px-6">
        <header>
          <p className="text-xs font-bold text-text-muted">悩みから探す</p>
          <h1 className="mt-2 font-heading text-[28px] font-bold leading-[1.4] text-text-primary md:text-[34px]">
            UIの作り方で困った
          </h1>
          <p className="mt-3 text-base leading-[1.8] text-text-secondary">
            UIを作っている途中で手が止まったときに、何から確かめればいいかをまとめました。
            困りごとごとに、短い答えと確かめる順番、詳しい記事、続けて練習できるコースを並べています。
            どの項目も、最後に転職ロードマップのどの段階の話かが分かるようにしています。
          </p>
        </header>

        <section aria-labelledby="chooser-title" className="mt-8 rounded-[20px] border border-border-light bg-surface p-5 md:p-6">
          <h2 id="chooser-title" className="font-heading text-lg font-bold text-text-primary">
            どこから見る？
          </h2>
          <div className="mt-4">
            <HubChooser items={chooserItems} situations={SITUATIONS} kinds={KINDS} />
          </div>
        </section>

        <section id="all" aria-labelledby="all-title" className="mt-8 scroll-mt-6">
          <h2 id="all-title" className="font-heading text-lg font-bold text-text-primary">
            全項目の一覧（{TROUBLES.length}項目）
          </h2>
          <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {TROUBLES.map((it) => (
              <li key={it.id}>
                <a href={`#${it.id}`} className="text-sm text-text-link hover:underline">
                  {it.title}
                </a>
              </li>
            ))}
          </ul>
        </section>

        {KINDS.map((k) => {
          const items = TROUBLES.filter((t) => t.kind === k.value);
          if (items.length === 0) return null;
          return (
            <section key={k.value} aria-labelledby={`kind-${k.value}`} className="mt-12">
              <h2 id={`kind-${k.value}`} className="font-heading text-xl font-bold text-text-primary">
                {k.label}
              </h2>
              <p className="mt-1 text-sm text-text-muted">{k.lead}</p>
              <div className="mt-4 flex flex-col gap-3">
                {items.map((it) => (
                  <TroubleDetails key={it.id} item={it} />
                ))}
              </div>
            </section>
          );
        })}

        <div className="mt-16 flex flex-col items-start gap-3 rounded-[20px] bg-muted-custom p-5 md:p-6">
          <p className="text-sm leading-[1.8] text-text-secondary">
            ここにない困りごとは、掲示板で質問できます。よく出る質問は、このページの項目に足していきます。
            <Kari />
          </p>
          <Button asChild variant="outline">
            <Link href="/questions">掲示板で質問する</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function TroubleDetails({ item }: { item: TroubleItem }) {
  const course = getCourse(item.course.slug);
  const courseName = course?.shortTitle.text ?? item.course.slug;
  return (
    <details id={item.id} className="group scroll-mt-6 rounded-[20px] border border-border-light bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[20px] p-4 md:p-5 [&::-webkit-details-marker]:hidden">
        <h3 className="font-heading text-base font-bold leading-[1.5] text-text-primary md:text-[17px]">
          {item.title}
        </h3>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className="shrink-0 text-text-muted transition-transform group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>

      <div className="flex flex-col gap-5 border-t border-border-light px-4 pb-5 pt-4 md:px-5">
        <p className="text-sm leading-[1.9] text-text-secondary">
          {item.answer}
          {item.kari ? <Kari /> : null}
        </p>

        <div>
          <p className="text-xs font-bold text-text-muted">確かめる順番</p>
          <ol className="mt-2 flex flex-col gap-1.5">
            {item.checks.map((c, i) => (
              <li key={c} className="flex gap-2 text-sm leading-[1.7] text-text-primary">
                <span className="font-mono text-xs leading-[1.7] text-text-muted">{i + 1}</span>
                {c}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <p className="text-xs font-bold text-text-muted">詳しい記事（無料で読めます）</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {item.articles.map((a) => (
              <li key={a.href}>
                <Link href={a.href} className="inline-flex items-start gap-1 text-sm text-text-link hover:underline">
                  <ArrowRight size={14} aria-hidden="true" className="mt-1 shrink-0" />
                  {a.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[16px] bg-muted-custom p-4">
          <p className="text-xs font-bold text-text-muted">このステップを実践できるコース</p>
          <Link href={courseHref(item.course.slug)} className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-text-primary hover:underline">
            {courseName}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <p className="mt-1 text-xs leading-[1.7] text-text-secondary">{item.course.reason}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border-light pt-4 text-sm">
          <span className="text-text-muted">
            転職ロードマップでは、ステップ{item.step}「{getV6Step(item.step)?.short}」の話です。
          </span>
          <Link href={v6Step(item.step)} className="font-bold text-text-link hover:underline">
            ステップ{item.step}を見る
          </Link>
          <Link href={V6_BASE} className="inline-flex items-center gap-1 font-bold text-text-link hover:underline">
            <MapIcon size={14} color="currentColor" variant="Outline" aria-hidden="true" />
            ロードマップで全体を見る
          </Link>
        </div>
      </div>
    </details>
  );
}
