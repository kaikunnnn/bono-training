/**
 * /dev/hanaso — ハナソ教材（新規登録のビフォー／アフター）の作業ページ一覧（#296 D）
 *
 * 無料コンテンツ「AIでリサーチするとデザインが正確になる」の材料をまとめた入口。
 * 本番では /dev ごと proxy で 404。
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ハナソ 作業ページ一覧 (/dev/hanaso)",
  robots: { index: false, follow: false },
};

const PAGES = [
  {
    href: "/dev/hanaso/script-v2",
    title: "話す構成とスライド（v2）",
    note: "送ってもらった構成の順に、話すことと出すもの（スライドの埋め込み・動画の所）を並べたチェック用ページ",
  },
  {
    href: "/dev/hanaso-compare",
    title: "ビフォー・アフター比較",
    note: "リサーチなしで作ったビフォーと、リサーチを渡して作り直したアフターを並べて触れる",
  },
  {
    href: "/dev/hanaso-compare/changes",
    title: "アフターで変えた所",
    note: "画面ごとに、変えた内容と理由・根拠をスクショつきで並べた一覧",
  },
  {
    href: "/dev/hanaso/before-issues",
    title: "ビフォーで起きること",
    note: "ビフォーを実際に操作すると何が起きるか。操作して確かめたものだけ載せている",
  },
  {
    href: "/dev/hanaso/after-mistakes",
    title: "アフターでAIがまだ間違えている所",
    note: "オーナーの指摘14項目と、なぜAIが間違えたかの見立て",
  },
  {
    href: "/dev/hanaso/video-plan",
    title: "動画の構成（決定）",
    note: "タイトル・狙い・構成・言い方の注意。撮影はこの構成で行う",
  },
] as const;

/** 動画の収録専用の画面（Route Handler でアプリだけを返す。サイトのメニュー・操作バーは映らない） */
const REC_PAGES = [
  {
    href: "/dev/hanaso/slides-v2.html",
    title: "スライド v2（13枚・リサーチを軸にした構成。← → で前後、G で一覧、F で全画面）",
  },
  {
    href: "/dev/hanaso/slides.html",
    title: "スライド 前の版（15枚・間違い探しの構成。← → で前後、G で一覧、F で全画面）",
  },
  {
    href: "/dev/hanaso/rec/before.html",
    title: "ビフォー（1台）",
  },
  {
    href: "/dev/hanaso/rec/after.html",
    title: "アフター（1台）",
  },
  {
    href: "/dev/hanaso/rec/compare.html",
    title: "ビフォー・アフターを左右に並べる",
  },
] as const;

const REC_KEYS_SINGLE = ["R … 最初の画面に戻る（入力・選択もリセット）", "← … 1画面戻る"];

const REC_KEYS_COMPARE = [
  "1 … 最初の画面 ／ 2 … メールとパスワード ／ 3 … プロフィール（ビフォーは名前・ユーザー名） ／ 4 … 興味 ／ 5 … ホーム（両方を同時に切り替え）",
  "6 … 言語 ／ 7 … 生年月日（アフターだけ切り替え。ビフォーは今の画面のまま）",
  "H … 「ビフォー」「アフター」の文字を出す・隠す",
  "R … 両方を最初の画面に戻す ／ ← … 両方を1画面戻す（iPhone の中をクリックした後は、その1台だけ）",
];

export default function HanasoIndexPage() {
  return (
    <main className="mx-auto max-w-[800px] px-4 py-6">
      <h1 className="font-heading text-xl font-bold">ハナソ 新規登録 作業ページ一覧</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        言語交換SNS「ハナソ」の新規登録画面を教材にした、動画づくりの作業ページです。
      </p>
      <Link
        href="/dev/hanaso/shoot"
        className="mt-6 block rounded-[20px] border-2 border-foreground bg-muted p-4 transition-colors hover:bg-accent"
      >
        <h2 className="text-lg font-bold">撮影メモ →</h2>
        <p className="mt-1 text-sm leading-relaxed">
          撮影中に横に置いて読むページ。構成と、パートごとの話す順番・見せる画面（スクショつき）を記事のように並べている
        </p>
        <p className="mt-2 text-xs text-muted-foreground">/dev/hanaso/shoot</p>
      </Link>
      <ul className="mt-6 flex flex-col gap-3">
        {PAGES.map((page) => (
          <li key={page.href}>
            <Link
              href={page.href}
              className="block rounded-[20px] border border-border p-4 transition-colors hover:bg-muted"
            >
              <h2 className="text-base font-bold">{page.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{page.note}</p>
              <p className="mt-2 text-xs text-muted-foreground">{page.href}</p>
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="rec-title" className="mt-10 border-t border-border pt-6">
        <h2 id="rec-title" className="font-heading text-lg font-bold">
          収録用の画面
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          画面録画用。アプリ（iPhone）だけを画面の真ん中に大きく出す。キー操作をしても画面には何も出ない。文字の入力中（入力欄にカーソルがあるとき）はキーが効かない。
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {REC_PAGES.map((page) => (
            <li key={page.href} className="text-sm">
              <a
                href={page.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline underline-offset-2"
              >
                {page.title}
              </a>
              <span className="ml-2 text-xs text-muted-foreground">{page.href}</span>
            </li>
          ))}
        </ul>
        <h3 className="mt-5 text-sm font-bold">キー操作（1台の画面）</h3>
        <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed">
          {REC_KEYS_SINGLE.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
        <h3 className="mt-4 text-sm font-bold">キー操作（左右に並べる画面）</h3>
        <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed">
          {REC_KEYS_COMPARE.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
