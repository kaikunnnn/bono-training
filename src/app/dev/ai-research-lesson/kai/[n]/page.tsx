import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { KAI } from "../../kai";
import { PROMPTS } from "../../p4";

/**
 * 11/23 別パターン「回の単位」の、1回分のページの試作（#319・AIの案・未決定）。
 * 1回＝1ページ＝1つ作って出す。ページの頭に 完成例・書く枠・終わりの基準・時間、動画は章、最後に提出。
 * 提出ボタンは押せない（記録の仕組みはまだない）。本番には出さない。
 */

export function generateStaticParams() {
  return KAI.map((k) => ({ n: String(k.n) }));
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-2xl border border-border-default bg-surface p-5">
      <h3 className="text-sm font-bold text-text-primary">{title}</h3>
      {children}
    </section>
  );
}

export default async function KaiPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const kai = KAI.find((k) => String(k.n) === n);
  if (!kai) notFound();
  const prompt = kai.promptWhere ? PROMPTS.find((p) => p.where === kai.promptWhere) : undefined;
  const prev = KAI.find((k) => k.n === kai.n - 1);
  const next = KAI.find((k) => k.n === kai.n + 1);
  const label = (k: (typeof KAI)[number]) => (k.n === 0 ? "はじめに" : `回${k.n}`);

  return (
    <>
      <div className="border-b border-dashed border-border-default bg-muted-custom px-4 py-2 font-mono text-xs text-text-muted">
        <div className="mx-auto flex w-full max-w-[860px] flex-wrap items-center gap-x-4 gap-y-1">
          <span>試作 #319 回のページ（サイトのUIではありません・AIの案・未決定）</span>
          <Link href="/dev/ai-research-lesson?dir=r&layout=standard" className="underline">
            レッスンページへ戻る
          </Link>
          <span className="flex flex-wrap gap-2">
            {KAI.map((k) => (
              <Link
                key={k.n}
                href={`/dev/ai-research-lesson/kai/${k.n}`}
                aria-current={k.n === kai.n ? "page" : undefined}
                className={k.n === kai.n ? "font-bold text-text-primary" : "underline"}
              >
                {label(k)}
              </Link>
            ))}
          </span>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-[860px] flex-col gap-8 px-4 py-10">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-bold text-text-muted">
            {label(kai)}・{kai.mode}・{kai.free ? "無料" : "会員"}
          </p>
          <h1 className="font-rounded-mplus text-2xl font-bold leading-snug text-text-primary md:text-[28px]">
            {kai.title}
          </h1>
          <p className="text-sm text-text-muted">かかる時間：{kai.time}</p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="font-rounded-mplus text-lg font-bold text-text-primary">この回で作って出すもの</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Block title="完成例">
              {kai.example.image && (
                <Image
                  src={kai.example.image}
                  alt={kai.example.label}
                  width={640}
                  height={360}
                  className="h-auto w-full rounded-lg"
                />
              )}
              <p className="text-sm text-text-primary">
                {kai.example.href ? (
                  <a href={kai.example.href} className="underline" target="_blank" rel="noreferrer">
                    {kai.example.label}
                  </a>
                ) : (
                  kai.example.label
                )}
              </p>
            </Block>
            <div className="flex flex-col gap-3">
              <Block title="終わりの基準（ここまでできたら1回分）">
                <ul className="flex flex-col gap-1 text-sm text-text-primary">
                  {kai.done.map((d) => (
                    <li key={d}>□ {d}</li>
                  ))}
                </ul>
              </Block>
              {kai.frame.length > 0 && (
                <Block title="書く枠">
                  <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm text-text-primary">
                    {kai.frame.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ol>
                </Block>
              )}
            </div>
          </div>
        </section>

        {prompt && (
          <section className="flex flex-col gap-3">
            <h2 className="font-rounded-mplus text-lg font-bold text-text-primary">コピーして使う頼み方</h2>
            <Block title={prompt.title}>
              <div className="flex flex-col gap-2 whitespace-pre-wrap rounded-lg bg-muted-custom p-4 text-sm leading-relaxed text-text-primary">
                {prompt.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              {prompt.note && <p className="text-xs text-text-muted">※{prompt.note}</p>}
            </Block>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="font-rounded-mplus text-lg font-bold text-text-primary">
            動画（このページの中の章）{kai.total && <span className="ml-2 text-sm font-normal text-text-muted">合計 {kai.total}</span>}
          </h2>
          <ol className="flex flex-col gap-3">
            {kai.chapters.map((c, i) => (
              <li key={c.from} className="flex flex-col gap-3 rounded-2xl border border-border-default bg-surface p-4 sm:flex-row">
                <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-muted-custom sm:w-56">
                  {c.thumb ? (
                    <Image src={c.thumb} alt={`${c.title}のサムネイル`} fill sizes="224px" className="object-cover" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-xs text-text-muted">
                      これから撮る
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-xs text-text-muted">
                    章{i + 1}・もとの{c.from}
                    {c.duration && `・${c.duration}`}
                  </p>
                  <h3 className="text-base font-bold text-text-primary">{c.title}</h3>
                  {c.telop && <p className="text-xs text-text-muted">足すテロップ：{c.telop}</p>}
                  {c.doAfter && (
                    <p className="mt-1 rounded-lg bg-muted-custom px-3 py-2 text-sm text-text-primary">
                      ここで手を動かす：{c.doAfter}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
          {kai.more && (
            <p className="text-sm text-text-muted">
              {kai.more.label}（{kai.more.note}）
            </p>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-rounded-mplus text-lg font-bold text-text-primary">提出する</h2>
          <Block title={`出すもの：${kai.submit}`}>
            <Textarea disabled placeholder="ここにリンクや3行を書いて出す（試作のため入力できません）" />
            <p className="text-xs text-text-muted">見る人：{kai.review}</p>
            <div>
              <Button disabled>提出する（試作）</Button>
            </div>
          </Block>
        </section>

        <nav className="flex justify-between gap-4 border-t border-border-default pt-6 text-sm">
          {prev ? (
            <Link href={`/dev/ai-research-lesson/kai/${prev.n}`} className="underline">
              ← {label(prev)}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/dev/ai-research-lesson/kai/${next.n}`} className="underline">
              {label(next)} →
            </Link>
          )}
        </nav>
      </main>
    </>
  );
}
