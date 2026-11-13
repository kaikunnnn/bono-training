/**
 * /dev/hanaso-compare — ハナソ新規登録プロトのビフォー／アフター比較（#296）
 *
 * 無料コンテンツ「AIでリサーチするとデザインが正確になる」の材料。
 * 左がビフォー（src/content/materials/ai-research-ui/hanaso-signup.html）、
 * 右がリサーチ4本を反映したアフター（同 hanaso-signup-after.html）。
 * どちらも /dev 配下の Route Handler からログインなしで読む。本番では proxy で 404。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { BackToIndex } from "../hanaso/_parts";

export const metadata: Metadata = {
  title: "ハナソ 新規登録 ビフォー／アフター (/dev/hanaso-compare)",
  robots: { index: false, follow: false },
};

const PANES = [
  {
    key: "before",
    label: "ビフォー",
    note: "リサーチなしで作った想像版",
    src: "/dev/hanaso-compare/before.html",
  },
  {
    key: "after",
    label: "アフター",
    note: "リサーチ4本を渡して作り直した版",
    src: "/dev/hanaso-compare/after.html",
  },
] as const;

export default function HanasoComparePage() {
  return (
    <main className="mx-auto max-w-[1600px] px-4 py-6">
      <BackToIndex />
      <h1 className="mt-3 font-rounded-mplus text-xl font-bold">ハナソ 新規登録 ビフォー／アフター</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        それぞれのページ下の「仕様メモ」に、決めたことと根拠があります。単体で開くときは各見出しのリンクから。
      </p>
      <p className="mt-1 text-sm">
        <Link href="/dev/hanaso-compare/changes" className="underline underline-offset-2">
          変更点の一覧（理由と根拠つき）
        </Link>
      </p>
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {PANES.map((pane) => (
          <section key={pane.key} className="flex min-w-0 flex-col gap-2">
            <h2 className="flex flex-wrap items-baseline gap-2 text-base font-bold">
              {pane.label}
              <span className="text-sm font-normal text-muted-foreground">{pane.note}</span>
              <a
                href={pane.src}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-normal underline underline-offset-2"
              >
                単体で開く
              </a>
            </h2>
            <iframe
              src={pane.src}
              title={`ハナソ 新規登録プロト（${pane.label}）`}
              className="h-[960px] w-full rounded-xl border border-border bg-background"
            />
          </section>
        ))}
      </div>
    </main>
  );
}
