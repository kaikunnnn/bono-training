/**
 * /dev/hanaso/script-v2 — 話す構成とスライド（#296・スライド v2 用）
 *
 * オーナーが送った構成（2026-11-10）を、上から順に「話すこと」と「出すもの」で並べたチェック用ページ。
 * 話すことはメモの言葉をなるべく残して文章にしている（オーナー了承済み）。
 * 出すものは、スライドなら /dev/hanaso/slides-v2.html#番号 を埋め込み（スライドを直すとここにもすぐ出る）、
 * 動画で操作する所なら「ここは動画」と収録用画面のリンク。
 * 大きなまとまり（オーナーの整理）：1 導入（フック）／2 ポイント／3 リサーチ方法と実践／4 結果／5 ただ、まだよくない
 * 本番では /dev ごと proxy で 404。
 */

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { BackToIndex } from "../_parts";

export const metadata: Metadata = {
  title: "ハナソ 話す構成とスライド (/dev/hanaso/script-v2)",
  robots: { index: false, follow: false },
};

const SLIDES = "/dev/hanaso/slides-v2.html";
const BEFORE = "/dev/hanaso/rec/before.html";
const AFTER = "/dev/hanaso/rec/after.html";
const COMPARE = "/dev/hanaso/rec/compare.html";

/* ---------- 部品 ---------- */

/** スライド1枚を本物のまま埋め込む（1920×1080 をページの幅に合わせて縮める） */
function Slide({ no, name }: { no: number; name: string }) {
  return (
    <figure className="flex flex-col gap-1.5">
      <iframe
        src={`${SLIDES}#${no}`}
        title={`スライド${no}枚目：${name}`}
        loading="lazy"
        className="aspect-video w-full rounded-[12px] border border-border"
      />
      <figcaption className="text-xs text-muted-foreground">
        スライド{no}枚目：{name}
        <a href={`${SLIDES}#${no}`} target="_blank" rel="noopener noreferrer" className="ml-2 underline underline-offset-2">
          大きく開く
        </a>
      </figcaption>
    </figure>
  );
}

/** 動画で操作して見せる所 */
function Video({ text, links }: { text: string; links?: { href: string; label: string }[] }) {
  return (
    <div className="rounded-[12px] border-2 border-dashed border-border p-4">
      <p className="text-sm font-bold">ここは動画</p>
      <p className="mt-1 text-sm leading-relaxed">{text}</p>
      {links && links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {links.map((l) => (
            <Button key={l.href} asChild variant="outline" size="sm">
              <a href={l.href} target="_blank" rel="noopener noreferrer">
                {l.label}
              </a>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

/** 小さなパート：話すこと → 出すもの */
function Part({ title, say, note, children }: { title: string; say: string[]; note?: string; children: ReactNode }) {
  return (
    <div className="mt-8">
      <h3 className="font-heading text-base font-bold">{title}</h3>
      <div className="mt-3 flex flex-col gap-2 text-[15px] leading-relaxed">
        {say.map((s) => (
          <p key={s}>{s}</p>
        ))}
      </div>
      {note && <p className="mt-2 text-sm text-muted-foreground">※ {note}</p>}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}

/** 大きなまとまり（1〜5） */
function Block({ id, no, title, aim, children }: { id: string; no: number; title: string; aim: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mt-12 scroll-mt-6 border-t-2 border-foreground pt-6">
      <h2 id={`${id}-title`} className="font-heading text-xl font-bold">
        {no}. {title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{aim}</p>
      {children}
    </section>
  );
}

const OUTLINE = [
  { id: "hook", title: "導入（フック）", aim: "AIで作った一見よさそうなUI、実はよくないを見せる" },
  { id: "point", title: "ポイント", aim: "AIで2つの要素をリサーチすると「普通」のクオリティに上げられる" },
  { id: "method", title: "リサーチ方法と実践", aim: "2つのリサーチと4ステップ → Claudeで見せる" },
  { id: "result", title: "結果", aim: "こうなります（比較）" },
  { id: "still", title: "ただ、まだよくない", aim: "まだダメな所 → 判断する目 → 宣伝" },
];

/* ---------- ページ ---------- */

export default function HanasoScriptV2Page() {
  return (
    <main className="mx-auto max-w-[800px] px-4 py-6">
      <BackToIndex />
      <h1 className="mt-4 font-heading text-2xl font-bold">話す構成とスライド</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        送ってもらった構成を上から順に並べ、パートごとに「話すこと」と「出すもの」を置いたページです。話すことはメモの言葉をなるべく残しています。スライドは本物を埋め込んでいるので、スライドを直すとここにもすぐ出ます。
      </p>

      <nav aria-label="構成" className="mt-6 rounded-[16px] bg-muted p-4">
        <p className="text-sm font-bold">構成</p>
        <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5 text-sm leading-relaxed">
          {OUTLINE.map((o) => (
            <li key={o.id}>
              <a href={`#${o.id}`} className="font-bold underline underline-offset-2">
                {o.title}
              </a>
              <span className="ml-2 text-muted-foreground">{o.aim}</span>
            </li>
          ))}
        </ol>
      </nav>

      {/* ===== 1 導入（フック） ===== */}
      <Block id="hook" no={1} title={OUTLINE[0].title} aim={OUTLINE[0].aim}>
        <Part
          title="AIで作った、一見よさそうなUI"
          say={[
            "こういうUIがあって、AIで作ったんですけど、なんかよさそう。",
            "でも、間違ってます。例えばこの2点がおかしい。",
            "言語交換のサービスなのに、言語の設定がない。",
            "フォームで間違えても、エラーが出ない。",
          ]}
          note="業種とUIの視点は次で話すので、ここでは「この2点がおかしい」を強調する"
        >
          <Video
            text="ビフォーを触って、言語の設定がないこと・間違えてもエラーが出ないことを見せる"
            links={[{ href: BEFORE, label: "収録用ビフォー" }]}
          />
          <Slide no={2} name="一見よさそう" />
          <Slide no={3} name="あるはずの部品がない" />
        </Part>

        <Part title="他にもおかしい所がある" say={["他にも、この辺もおかしい。全部で11か所あります。"]}>
          <Slide no={4} name="他にも11か所" />
        </Part>

        <Part
          title="アフターを先に見せる"
          say={[
            "ある工夫をすると、アフターでこのダメなところを直せます。",
            "確かにアフターの方が良い。このやり方を教えましょう。",
          ]}
          note="ここで「知りたい」と思わせて惹きつける。1枚目（タイトル）はこのフックの位置で出す"
        >
          <Video
            text="ビフォーとアフターを並べて、さっきの2点が直っているのを見せる"
            links={[{ href: COMPARE, label: "左右に並べる画面" }]}
          />
          <Slide no={1} name="タイトル" />
        </Part>
      </Block>

      {/* ===== 2 ポイント ===== */}
      <Block id="point" no={2} title={OUTLINE[1].title} aim={OUTLINE[1].aim}>
        <Part
          title="2つの方向性で間違っている"
          say={[
            "この間違いは、2つの方向で間違っています。",
            "1つは業種・サービスの視点。この業種に必要なものがない。",
            "もう1つはUIの基本の視点。UI的におかしいところがある。",
          ]}
        >
          <Slide no={5} name="間違いは2つの方向" />
        </Part>

        <Part
          title="これにどう気づくか"
          say={[
            "これにどう気づくか？ 2つのポイントで気づくことができます。",
            "1つは自分のデザインスキルを上げる。もう1つはAIを使う。",
            "今回は、AIで基本をリサーチして教えてもらうやり方で修正します！",
            "AIで2つの要素をリサーチすると、「普通」のクオリティまで上げることができます。",
          ]}
          note="「普通まで上げられる。その先は自分の目」で、5の締めにつなげる"
        >
          <Slide no={6} name="どうやって気づく？" />
        </Part>
      </Block>

      {/* ===== 3 リサーチ方法と実践 ===== */}
      <Block id="method" no={3} title={OUTLINE[2].title} aim={OUTLINE[2].aim}>
        <Part
          title="どうリサーチするか"
          say={[
            "何をリサーチするかというと、2つです。",
            "1つ目は、作るものに関係するサービス・業種のリサーチ。必要なルールや一般的なやり方を学びます。",
            "2つ目はUIのリサーチ。基本的なUIパターンや挙動について学びます。",
            "この2つを整理して1つずつ反映してもらうことで、初歩的なミスに気づけます。",
            "やり方としては、リサーチをする、UIに必要な要素をまとめる、デザインを制作する、必要な要素でチェックする、の4つです。",
          ]}
          note="図で考え方を見せ、その流れで動画に進む"
        >
          <Slide no={7} name="リサーチするのは2つ" />
          <Slide no={8} name="やり方は4ステップ" />
        </Part>

        <Part
          title="ClaudeでAIリサーチ"
          say={["というわけで、リサーチをしてみましょう。リサーチを2つの観点で行います。"]}
          note="リサーチ済みのアーティファクトをClaudeアプリで見せながら喋る"
        >
          <Slide no={9} name="Claudeでリサーチ（アーティファクトを貼る枠）" />
          <Video text="Claudeアプリで、リサーチ済みのアーティファクト（業種・UIの2つ）を開いて見せる" />
        </Part>
      </Block>

      {/* ===== 4 結果 ===== */}
      <Block id="result" no={4} title={OUTLINE[3].title} aim={OUTLINE[3].aim}>
        <Part title="こうなります" say={["こうなります。"]} note="直った所は、動画で比べながら喋る">
          <Video text="ビフォーとアフターを並べて、直った所を見せる" links={[{ href: COMPARE, label: "左右に並べる画面" }]} />
          <Slide no={10} name="こうなる" />
        </Part>
      </Block>

      {/* ===== 5 ただ、まだよくない ===== */}
      <Block id="still" no={5} title={OUTLINE[4].title} aim={OUTLINE[4].aim}>
        <Part title="まだダメな部分がある" say={["ただ、まだダメな部分が存在します。"]} note="動画で見せるのは、前に決めた代表の5つ">
          <Video text="アフターを触って、代表の5つを見せる" links={[{ href: AFTER, label: "収録用アフター" }]} />
          <Slide no={11} name="まだダメな所" />
        </Part>

        <Part
          title="ここはどうするのか（締め）"
          say={[
            "ここはどうするのか？",
            "必要なのは、UIの基本制作能力。一般的なUIの知見と制作経験です。",
            "AIで普通までは上げられる。その先は、判断する目が必要だと思います！",
          ]}
        >
          <Slide no={12} name="判断する目" />
        </Part>

        <Part title="宣伝" say={["BONOやってるので、気になった方は続きをどうぞ！"]}>
          <Slide no={13} name="続きはBONOで" />
        </Part>
      </Block>

      <div className="mt-12">
        <BackToIndex />
      </div>
    </main>
  );
}
