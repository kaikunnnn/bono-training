/**
 * /dev/hanaso/video-plan — 動画の決まった構成（#296 C）
 *
 * 2026-11-09 オーナー決定。撮影はこの構成で行う。
 * 本番では /dev ごと proxy で 404。
 */

import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { BackToIndex } from "../_parts";

export const metadata: Metadata = {
  title: "ハナソ 動画の構成 (/dev/hanaso/video-plan)",
  robots: { index: false, follow: false },
};

const REC_LINKS = [
  "/dev/hanaso/rec/before.html",
  "/dev/hanaso/rec/after.html",
  "/dev/hanaso/rec/compare.html",
] as const;

const TITLE = "【間違い探し】一見キレイなAI製アプリ。触ると気付く11の違和感【uiデザイン 初心者】";

const AIM =
  "見た人が「AIはすごい。でも気づけるのは基本を知っている人の目。見た目を真似するだけでなく基本を学ぼう」と思い、説明欄のリンクを押す";

const DECIDED: ReactNode[] = [
  "ビフォーはAIが作った（タイトルの「AI製」は事実）",
  <>
    11の違和感は、ビフォーで実際に操作して確かめた11項目（Appleの項目は外し、規約が読めない項目に差し替え）。一覧は{" "}
    <Link href="/dev/hanaso/before-issues" className="underline underline-offset-2">
      /dev/hanaso/before-issues
    </Link>
  </>,
  "冒頭でアフターを見せ、「どう直したのか、AIの使い方もシェアします」と予告する（冒頭の型：問い → アフター → どう直したか → これから何をするか → 目次）",
  "説明欄の行き先：1つ目は「AIではじめるUIリサーチ」（無料コース）、2つ目に「UIデザイン制作の基本」（見た目の基本）も載せる",
  "恐怖で引かない。「審査に落ちる」とは言わない",
  "後半で操作して見せる代表は5つ：メール確認のボタンの目立たせ方／言語の選択フォーム（リストがはみ出す・本文がずれる。触らないと気づけない体験なので入れる）／生年月日の3つの数字欄／アイコンと名前の順番／押せないアイコンがボタンと同じ色",
  "「AIに渡したもの」は実物の FigJam と Claude アプリを映す。細かい中身は有料で解説するので、読めなくてよい（専用の画面は作らない）",
  <>
    収録用の画面：
    {REC_LINKS.map((href, i) => (
      <span key={href}>
        {i > 0 && "・"}
        <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          {href}
        </a>
      </span>
    ))}
    。1台の画面は R＝最初に戻る（入力もリセット）、←＝1画面戻る。compare.html は 1＝最初／2＝メールとパスワード／3＝プロフィール／4＝興味／5＝ホームを両方同時に、6＝言語／7＝生年月日はアフターだけ切り替え、H＝ラベルの表示・非表示。11項目の答え合わせと、14か所の「直った所・残った所」の図は撮影後に作る
  </>,
];

const STRUCTURE: { label: string; time: string; body: string }[] = [
  {
    label: "導入",
    time: "0:00〜1:30",
    body: "ビフォーを映して「パッと見よさそう。でも触ると11個おかしい。分かりますか？」→ アフターを一瞬見せる →「どう直したか、AIの使い方もシェアします」→ 今日は見た目ではなく「正しい動きかどうか」を見抜く話",
  },
  { label: "前半", time: "1:30〜4:30", body: "ビフォーを操作して11項目を指摘" },
  {
    label: "転換",
    time: "4:30〜6:30",
    body: "AIにリサーチ4本を渡して作り直させた。何を聞くか・何を守るかが直った",
  },
  {
    label: "後半・本題",
    time: "6:30〜9:30",
    body: "それでも14か所残った。代表を5つ操作して見せ、残りは一覧で。直らなかったのは「どう見せるか・どこに置くか」",
  },
  { label: "結論・CTA", time: "9:30〜", body: "気づけるのは基本を知っている人の目 → 説明欄へ" },
];

const CAUTIONS = [
  "転換で「メール確認が入った」と言い、後半で同じ画面の見せ方を指摘する。転換では「画面が入った」まで、後半で「でも入れ方が違う」と言い分ける",
  "後半の「何を置くかは正解した」は言い切らず「ほとんど直った」にする（14か所の中に、目的と興味を分けた・「本名でなくて構いません」の一文など、何を置くかの間違いもあるため）",
  "前半は1項目あたり約16秒。後半の14か所は全部見せない",
];

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`} className="border-t border-border pt-6">
      <h2 id={`${id}-title`} className="font-heading text-lg font-bold">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function HanasoVideoPlanPage() {
  return (
    <main className="mx-auto max-w-[800px] px-4 py-6">
      <BackToIndex />
      <h1 className="mt-3 font-heading text-xl font-bold">ハナソ 動画の構成（決定）</h1>
      <p className="mt-2 text-sm leading-relaxed">2026-11-09 オーナー決定。撮影はこの構成で行う。</p>

      <div className="mt-8 flex flex-col gap-8">
        <Section id="title" title="タイトル（決定）">
          <p className="text-base font-bold leading-relaxed">{TITLE}</p>
        </Section>
        <Section id="aim" title="動画の狙い">
          <p className="text-sm leading-relaxed">{AIM}</p>
        </Section>
        <Section id="decided" title="決まったこと">
          <Bullets items={DECIDED} />
        </Section>
        <Section id="structure" title="構成（想定8〜12分）">
          <ol className="flex list-decimal flex-col gap-3 pl-5 text-sm leading-relaxed">
            {STRUCTURE.map((part) => (
              <li key={part.label}>
                <span className="font-bold">{part.label}</span>
                <span className="ml-2 text-muted-foreground">{part.time}</span>
                <p className="mt-1">{part.body}</p>
              </li>
            ))}
          </ol>
        </Section>
        <Section id="cautions" title="言い方の注意">
          <Bullets items={CAUTIONS} />
        </Section>
      </div>

      <div className="mt-10">
        <BackToIndex />
      </div>
    </main>
  );
}
