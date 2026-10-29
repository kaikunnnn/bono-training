/**
 * #267 新しいトップの試作 — まだ無いページの「準備中」をまとめた仮ページ
 *
 * ?what= で、どのページの代わりかを出し分ける（troubles / skill / work）。
 * 先のページはこのスライスでは作らない（267-M 5章）。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DevStateToggle } from "../_parts/DevStateToggle";
import { COMING_BASE as COMING, TOP_BASE, withState } from "../_parts/top-parts";

export const metadata: Metadata = {
  title: "準備中（#267 試作）",
  robots: { index: false, follow: false },
};

const PAGES: Record<string, { title: string; body: string; plan: string[] }> = {
  troubles: {
    title: "悩みから探す",
    body: "UIをつくるときのつまずきを、学ぶ人の言葉で16項目に並べた一覧ページになる予定です。",
    plan: [
      "「最初の1画面が作れない」「見た目がなんとなく素人っぽい」のような項目が並ぶ",
      "項目を開くと、まず読む記事・使うコース・ロードマップの位置がまとまっている",
    ],
  },
  skill: {
    title: "02 UIデザインのスキルを伸ばす",
    body: "スキルを伸ばしたい人の入口ページ（ロードマップの全体ページを兼ねる）になる予定です。",
    plan: [
      "見出しとこんな人向け（1行）",
      "ロードマップのステップ・このタイプのよくある悩み・使うコース",
      "トレーニング（お題）もこのページの中に入る",
    ],
  },
  work: {
    title: "03 実務の悩みを解決する",
    body: "仕事でデザインしている人の入口ページ（ロードマップの全体ページを兼ねる）になる予定です。",
    plan: [
      "見出しとこんな人向け（1行）",
      "「何を解決するのか決められない」「AIに任せたら判断できなくなった」などの悩み",
      "ロードマップのステップ・使うコース",
    ],
  },
};

export default async function ComingPage({
  searchParams,
}: {
  searchParams: Promise<{ what?: string; state?: string }>;
}) {
  const { what, state } = await searchParams;
  const member = state === "member";
  const page = PAGES[what ?? ""] ?? null;

  return (
    <div className="pb-24">
      <div className="mx-auto w-full max-w-[720px] px-6 pt-12 font-noto-sans-jp">
        <p className="text-xs font-bold text-text-muted">準備中</p>
        <h1 className="mt-2 font-heading text-[28px] font-bold leading-[1.4] text-text-primary">
          {page ? page.title : "このページは準備中です"}
        </h1>
        {page ? (
          <>
            <p className="mt-4 text-sm leading-[1.8] text-text-secondary">{page.body}</p>
            <h2 className="mt-8 font-heading text-base font-bold text-text-primary">ここに入るもの</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-[1.8] text-text-secondary">
              {page.plan.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-4 text-sm leading-[1.8] text-text-secondary">
            新しいトップの試作から、まだ作っていないページへのリンクはここに集めています。
          </p>
        )}

        <Button variant="outline-ghost" size="sm" className="mt-10" asChild>
          <Link href={withState(TOP_BASE, member)}>
            <ArrowLeft aria-hidden="true" />
            新しいトップへ戻る
          </Link>
        </Button>
      </div>

      <DevStateToggle base={what ? `${COMING}?what=${encodeURIComponent(what)}` : COMING} member={member} />
    </div>
  );
}
