/**
 * /dev/hanaso/after-mistakes — リサーチを渡してもAIが間違えた所（#296 B）
 *
 * 載せるのはオーナーが指摘したものだけ（AIが勝手に項目を足さない）。2026-11-09 のオーナー指摘14項目。
 * 「なぜAIが間違えたか」と「間違いの種類」はAIの見立て。
 * スクショはアフター（hanaso-shots/after-*.png、/dev/hanaso-compare/shots から配信）。
 * after-m07 は学びたい言語のリストを開き、スクロールを戻さずに撮ったもの。
 * 本番では /dev ごと proxy で 404。
 */

import type { Metadata } from "next";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BackToIndex, ShotFigure, type Shot } from "../_parts";

export const metadata: Metadata = {
  title: "ハナソ アフターでAIがまだ間違えている所 (/dev/hanaso/after-mistakes)",
  robots: { index: false, follow: false },
};

type KindId = 1 | 2 | 3 | 4;

const KINDS: { id: KindId; short: string; text: string; items: number[] }[] = [
  {
    id: 1,
    short: "リサーチにない所を判断",
    text: "リサーチに答えがない所を、AIが自分の判断で埋めて外した",
    items: [1, 3, 9, 11, 12],
  },
  {
    id: 2,
    short: "Web・PC向けの型",
    text: "Webやパソコン向けの型を、iPhoneアプリにそのまま持ち込んだ",
    items: [6, 7, 10, 12],
  },
  {
    id: 3,
    short: "ビフォーと混ざった",
    text: "ビフォーの作りを残したせいで、方針が混ざった",
    items: [2, 4],
  },
  {
    id: 4,
    short: "見た目の基本",
    text: "見た目の基本（押せる物と押せない物の区別、並べたときの釣り合い、重ねて書かない）を外した",
    items: [2, 5, 13, 14],
  },
];

function KindBadge({ kind }: { kind: KindId }) {
  const k = KINDS.find((x) => x.id === kind);
  if (!k) return null;
  return (
    // Badge は div なので、文中にも置けるよう span に同じ見た目を当てる（_parts の TagBadge と同じ）
    <span className={cn(badgeVariants({ variant: "secondary" }), "shrink-0 px-2 py-0 text-[11px] font-bold")}>
      {k.id}. {k.short}
    </span>
  );
}

type Mistake = {
  no: number;
  /** AIがしたこと（見出し） */
  did: string;
  /** オーナーの指摘（本来どうあるべきか） */
  should: string;
  /** なぜAIが間違えたか（AIの見立て） */
  cause: string;
};

type Group = { id: string; title: string; shots: Shot[]; mistakes: Mistake[] };

const GROUPS: Group[] = [
  {
    id: "method",
    title: "登録方法を選ぶ画面",
    shots: [{ file: "after-01.png", caption: "アフターの登録方法を選ぶ画面" }],
    mistakes: [
      {
        no: 1,
        did: "足した説明文のブロックの上下の余白がほかとずれている",
        should: "説明文を足したことで、そのブロックとほかのブロックの間の余白が変な感じになっている",
        cause:
          "文言を足すとき、もとの余白の組み方を見直さず、1画面に収めることを優先した。リサーチは「何を書くか」までで、余白には答えがなかった",
      },
      {
        no: 2,
        did: "「メールで始める」ボタンにだけ影があり、Apple・Googleのボタンにはない",
        should: "影の有無がそろっておらず、並べたときのバランスがおかしい",
        cause:
          "メールのボタンはビフォーの見た目をそのまま残し、Apple・Googleは別の型（Appleの黒いボタンなど）で足した。並べたときの釣り合いを見ていない",
      },
      {
        no: 3,
        did: "「すでにアカウントをお持ちの方はログイン」を、登録ボタンと規約の間に置いた",
        should:
          "ログインは画面の一番下に置く。規約とプライバシーポリシーは登録ボタンの近くに置くべきなので、間にログインが挟まるのはおかしい",
        cause:
          "リサーチ（UI やさしい版 画面1）の項目を上から順に足した。どこに置くかの答えはリサーチになく、規約は「押す前に読む物」なのでボタンの近く、という関係を考えていない",
      },
    ],
  },
  {
    id: "verify",
    title: "メール確認の画面",
    shots: [{ file: "after-03.png", caption: "アフターのメール確認画面" }],
    mistakes: [
      {
        no: 4,
        did: "「メールを確認してください」と言いながら、「あとで確認して先へ」のボタンを目立たせた",
        should:
          "どちらを優先すればいいか分からない。先へ進めるならこの画面は出さなくていいし、確認させたいならここで止めるべき（その場で止めるケースも多い）",
        cause:
          "ビフォーの「確認しなくても進める」作りを残しつつ、リサーチの確認画面を足したので、2つの方針が混ざった。リサーチ（GOV.UK）には「確認するまで進めない」型も載っていたので、根拠が足りなかったのではなく判断の誤り",
      },
      {
        no: 5,
        did: "メールのアイコンの背景を、ボタンと同じ緑の塗りにした",
        should: "アイコンは押せないのに、ボタンと同じ見た目になっている",
        cause: "ボタン用の色をそのまま使い回した。押せる物と押せない物を見た目で分ける、という基本を当てはめていない",
      },
    ],
  },
  {
    id: "lang",
    title: "話す言語・学びたい言語の画面",
    shots: [
      { file: "after-10.png", caption: "上に進み具合の表示がある" },
      {
        file: "after-m07.png",
        caption: "学びたい言語のリストを開いた所。選択肢が画面からはみ出し、本文が下にずれて見出しが隠れている",
      },
    ],
    mistakes: [
      {
        no: 6,
        did: "進み具合の表示を、見慣れない形にした",
        should: "見たことのないパターンで違和感がある",
        cause:
          "Carbon の Progress indicator（主にパソコンの業務画面の部品）の考え方をスマホに持ち込んだ。iPhoneアプリでよく見る形かは確かめていない",
      },
      {
        no: 7,
        did: "学びたい言語のリストが画面に収まらない",
        should: "選択肢が画面からはみ出すので、出し方を変えたい",
        cause:
          "Carbon の Dropdown（パソコン向け）の形をそのまま使った。スマホでの出し方はリサーチになかった。開くと本文が下にずれる不具合も同じ所で起きている",
      },
      {
        no: 8,
        did: "母語に日本語を最初から入れ、選ぶ欄として出した",
        should:
          "端末の言語設定（iPhoneで設定している言語や地域）から自動で当てるならよい。選ばせるなら、端末の設定から引いてきた値を入れておく",
        cause: "見本なので「端末の言語＝日本語」と決め打ちで入れた。端末から取った値だと画面で分かる作りにしていない",
      },
    ],
  },
  {
    id: "purpose",
    title: "目的と興味",
    shots: [
      { file: "after-05.png", caption: "目的の画面" },
      { file: "after-09.png", caption: "興味の画面" },
    ],
    mistakes: [
      {
        no: 9,
        did: "「何のために学びますか」（目的）と、最後の「興味」を別々の画面にした",
        should: "意味が似ているので、別々にするのは微妙",
        cause:
          "業種リサーチで「目的」と「興味」が別の項目として挙がっていたので、それぞれ画面にした。使う人から見て違いが分かるかは考えていない",
      },
    ],
  },
  {
    id: "birthday",
    title: "生年月日の画面",
    shots: [{ file: "after-06.png", caption: "アフターの生年月日の画面" }],
    mistakes: [
      {
        no: 10,
        did: "生年月日を、日・月・年の3つの数字欄にした",
        should: "iPhoneのドラムロール（回して選ぶ形）で選べるようにしたい",
        cause:
          "GOV.UK（Webの行政サービス）の型を採った。iPhoneアプリの標準の日付の選び方との比較は調べておらず、「手を出さなかった所」にも挙げていたのに、そのまま作った",
      },
    ],
  },
  {
    id: "profile",
    title: "プロフィールの画面",
    shots: [{ file: "after-08.png", caption: "アフターのプロフィール画面" }],
    mistakes: [
      {
        no: 11,
        did: "ニックネームを先に、写真を後に並べた",
        should: "写真（アイコン）が名前より先に来るべき",
        cause: "ビフォーの並び順をそのまま残した。リサーチには並び順の答えがなかった",
      },
      {
        no: 12,
        did: "写真の右に、ラベルと「別の写真を選ぶ」を並べた",
        should: "機能はしているが使いづらい。もっと良い見せ方があるはず",
        cause:
          "Carbon の File uploader（ファイルを添付する部品）の形を、アイコン選びに当てはめた。アバター専用の型はリサーチになかった",
      },
      {
        no: 13,
        did: "「別の写真を選ぶ」を、押せるように見えない文字にした",
        should: "普通のリンクに見えず、押せる感じがない",
        cause: "文字のボタンにしたが、押せることを示す見た目を付けていない",
      },
      {
        no: 14,
        did: "「本名でなくて構いません」と書き添えた",
        should: "ラベルが「ニックネーム」なので、この文は要らない",
        cause: "業種リサーチの「本名を出させない」を文でも念押しした。ラベルで伝わることを重ねて書いた",
      },
    ],
  },
];

/** 項目番号 → 種類（KINDS の items から引く。データの真実は KINDS 側の1か所） */
function kindsOf(no: number): KindId[] {
  return KINDS.filter((k) => k.items.includes(no)).map((k) => k.id);
}

export default function HanasoAfterMistakesPage() {
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-6">
      <BackToIndex />
      <h1 className="mt-3 font-heading text-xl font-bold">ハナソ 新規登録 アフターでAIがまだ間違えている所</h1>
      <p className="mt-2 text-base leading-relaxed">
        リサーチを渡すと、正しい方向のヒントは得られる。それでもAIは、ぱっと見では分からない間違いを残した。気づけたのは、基本を知っている人の目だった。
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        指摘：オーナー（2026-11-09）。『なぜAIが間違えたか』はAIの見立て
      </p>

      <section aria-labelledby="kinds-title" className="mt-8 border-t border-border pt-6">
        <h2 id="kinds-title" className="font-heading text-lg font-bold">
          間違いの種類（AIの見立て）
        </h2>
        <ol className="mt-3 flex flex-col gap-2 text-sm leading-relaxed">
          {KINDS.map((k) => (
            <li key={k.id} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
              <span className="sm:w-48 sm:shrink-0">
                <KindBadge kind={k.id} />
              </span>
              <span className="min-w-0">
                {k.text}
                <span className="ml-2 text-muted-foreground">項目 {k.items.join(", ")}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs text-muted-foreground">1つの項目が複数の種類に入ることがある。</p>
      </section>

      <div className="mt-8 flex flex-col gap-10">
        {GROUPS.map((g) => (
          <section
            key={g.id}
            id={g.id}
            aria-labelledby={`${g.id}-title`}
            className="scroll-mt-6 border-t border-border pt-6"
          >
            <h2 id={`${g.id}-title`} className="font-heading text-lg font-bold">
              {g.title}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
              <div className="flex min-w-0 flex-col gap-8">
                {g.mistakes.map((m) => (
                  <article key={m.no} id={`m${m.no}`} aria-labelledby={`m${m.no}-title`} className="scroll-mt-6">
                    <h3 id={`m${m.no}-title`} className="font-heading text-base font-bold leading-relaxed">
                      {m.no}. {m.did}
                    </h3>
                    <p className="mt-1.5 flex flex-wrap gap-1">
                      {kindsOf(m.no).map((k) => (
                        <KindBadge key={k} kind={k} />
                      ))}
                    </p>
                    <dl className="mt-3 flex flex-col gap-2 text-sm leading-relaxed">
                      <div className="flex gap-3">
                        <dt className="w-28 shrink-0 text-muted-foreground">オーナーの指摘</dt>
                        <dd className="min-w-0 font-bold">{m.should}</dd>
                      </div>
                      <div className="flex gap-3">
                        <dt className="w-28 shrink-0 text-muted-foreground">なぜAIが間違えたか</dt>
                        <dd className="min-w-0">{m.cause}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
              <div className="grid grid-cols-2 items-start gap-4">
                {g.shots.map((shot) => (
                  <ShotFigure key={shot.file} shot={shot} label="アフター" />
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-10 text-xs text-muted-foreground">追加の指摘はここに足していく。</p>
      <div className="mt-6">
        <BackToIndex />
      </div>
    </main>
  );
}
