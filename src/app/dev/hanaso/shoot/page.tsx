/**
 * /dev/hanaso/shoot — 撮影メモ（#296）
 *
 * 撮影中に横に置いて読むページ。構成 → パートごとに「話す順番」と「見せる画面（スクショ）」を記事のように並べる。
 * 2026-11-09 オーナー指示で作り直し：キー操作・撮影チェックは載せない。話す流れが読んで分かり、見せる画面が画像で分かる形に。
 * 中身の出どころ: 構成・言い方 … ../video-plan、前半11項目 … ../before-issues、後半の代表5つ … ../after-mistakes
 * 前半は「画面の順に1回通しで触る」並びにしている（before-issues の並びとは違う）。
 * 本番では /dev ごと proxy で 404。
 */

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { BackToIndex, SHOT_BASE } from "../_parts";

export const metadata: Metadata = {
  title: "ハナソ 撮影メモ (/dev/hanaso/shoot)",
  robots: { index: false, follow: false },
};

const BEFORE = "/dev/hanaso/rec/before.html";
const AFTER = "/dev/hanaso/rec/after.html";
const COMPARE = "/dev/hanaso/rec/compare.html";
const FIGJAM_DOMAIN = "https://www.figma.com/board/DQ5zY0NMCLCHt1Z0upaHCT/?node-id=87-455";
const FIGJAM_UI = "https://www.figma.com/board/DQ5zY0NMCLCHt1Z0upaHCT/?node-id=87-454";

const TITLE = "【間違い探し】一見キレイなAI製アプリ。触ると気付く11の違和感【uiデザイン 初心者】";

/* ---------- 部品 ---------- */

type Shot = { file: string; caption: string };

/** 小さめのスクショ。押すと原寸で開く */
function Thumb({ shot }: { shot: Shot }) {
  const src = `${SHOT_BASE}/${shot.file}`;
  return (
    <figure className="flex w-[132px] shrink-0 flex-col gap-1">
      <a href={src} target="_blank" rel="noopener noreferrer">
        {/* dev 専用・Route Handler 配信の固定サイズ画像のため next/image の最適化は不要 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={shot.caption}
          width={417}
          height={836}
          loading="lazy"
          className="h-auto w-full rounded-[12px] border border-border"
        />
      </a>
      <figcaption className="text-[11px] leading-snug text-muted-foreground">{shot.caption}</figcaption>
    </figure>
  );
}

function OpenLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button asChild variant="outline" size="sm">
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    </Button>
  );
}

/** パートの冒頭に置く「このパートで見せるもの」 */
function ShowBox({ links, shots }: { links: ReactNode; shots?: Shot[] }) {
  return (
    <div className="mt-4 rounded-[16px] bg-muted p-4">
      <p className="text-sm font-bold">見せるもの</p>
      <div className="mt-2 flex flex-wrap gap-2">{links}</div>
      {shots && shots.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {shots.map((s) => (
            <Thumb key={s.file} shot={s} />
          ))}
        </div>
      )}
    </div>
  );
}

/** 話す順番（箇条書き） */
function Talk({ items }: { items: ReactNode[] }) {
  return (
    <ol className="mt-4 flex list-decimal flex-col gap-2 pl-5 text-[15px] leading-relaxed">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ol>
  );
}

/** 1つの指摘：画像の横に「触る」「言う」 */
type Item = { no: number; title: string; touch: string; say: string; shots: Shot[] };

function ItemBlock({ item }: { item: Item }) {
  return (
    <li className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:gap-5">
      <div className="flex gap-2">
        {item.shots.map((s) => (
          <Thumb key={s.file} shot={s} />
        ))}
      </div>
      <div className="min-w-0 text-[15px] leading-relaxed">
        <h4 className="font-heading font-bold">
          {item.no}. {item.title}
        </h4>
        <p className="mt-2">
          <span className="mr-2 text-sm text-muted-foreground">触る</span>
          {item.touch}
        </p>
        <p className="mt-1">
          <span className="mr-2 text-sm text-muted-foreground">言う</span>
          {item.say}
        </p>
      </div>
    </li>
  );
}

/** 画面ごとのまとまり */
function Stop({ title, items }: { title: string; items: Item[] }) {
  return (
    <div className="mt-6">
      <h3 className="font-heading text-base font-bold">{title}</h3>
      <ul className="mt-3 flex flex-col gap-4">
        {items.map((it) => (
          <ItemBlock key={it.no} item={it} />
        ))}
      </ul>
    </div>
  );
}

function Part({ id, no, title, time, children }: { id: string; no: number; title: string; time: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 border-t-2 border-foreground pt-6">
      <h2 id={`${id}-title`} className="font-heading text-xl font-bold">
        {no}. {title}
        <span className="ml-3 text-sm font-normal text-muted-foreground">{time}</span>
      </h2>
      {children}
    </section>
  );
}

/* ---------- 中身 ---------- */

const OUTLINE = [
  { id: "intro", title: "導入", time: "0:00〜1:30", body: "ビフォーで問いかけ、アフターを一瞬見せて、今日やることを言う" },
  { id: "before", title: "前半", time: "1:30〜4:30", body: "ビフォーを最初から最後まで触って、11の違和感を見つける" },
  { id: "pivot", title: "転換", time: "4:30〜6:30", body: "AIに渡したリサーチ4本を見せる。中身はほとんど直った" },
  { id: "after", title: "後半", time: "6:30〜9:30", body: "直したアフターでも14か所残った。代表5つを触って見せる" },
  { id: "cta", title: "結論", time: "9:30〜", body: "気づけたのは基本を知っている目。説明欄へ" },
];

/* 前半：画面の順に1回通しで触る */
const BEFORE_STOPS: { title: string; items: Item[] }[] = [
  {
    title: "最初の画面（登録方法を選ぶ）",
    items: [
      {
        no: 1,
        title: "利用規約とプライバシーポリシーが押せない",
        touch: "下の小さな文字の「利用規約」を押す。何も起きない",
        say: "「同意したものとみなします」と書いてあるのに、同意する中身が読めない",
        shots: [{ file: "issue-12.png", caption: "押しても何も起きない" }],
      },
    ],
  },
  {
    title: "メールアドレス・パスワードの画面",
    items: [
      {
        no: 2,
        title: "パスワードが見えない・自動入力が効かない",
        touch: "「メールアドレスで登録」→ メールに「aaa」、パスワードに「1」を入れる。パスワードは伏せ字のままで、表示に切り替えるボタンがない",
        say: "打ち間違いに気づけない。パスワード管理アプリも使えない設定になっている",
        shots: [{ file: "issue-09.png", caption: "伏せ字のまま" }],
      },
      {
        no: 3,
        title: "「aaa」と「1」で登録できる",
        touch: "そのまま「登録する」。エラーなしで次へ進む",
        say: "間違ったアドレスで登録できてしまう。何が悪いのかも教えてくれない",
        shots: [
          { file: "issue-01a.png", caption: "「aaa」と「1」" },
          { file: "issue-01b.png", caption: "そのまま次へ" },
        ],
      },
      {
        no: 4,
        title: "空のままでも進む",
        touch: "左上の「＜」で戻り、両方消して空のまま「登録する」。また進む",
        say: "何も入れなくても登録できる",
        shots: [{ file: "issue-02.png", caption: "空でも次へ" }],
      },
    ],
  },
  {
    title: "名前・ユーザー名の画面",
    items: [
      {
        no: 5,
        title: "名前が空のまま進める",
        touch: "何も入れずに「次へ」。アイコンの画面に進む",
        say: "相手に表示する名前がないユーザーができてしまう",
        shots: [{ file: "issue-03.png", caption: "空でも次へ" }],
      },
      {
        no: 6,
        title: "名前の例が本名",
        touch: "欄の中の「例：田中 あき」を指す",
        say: "知らない人とやりとりするサービスなのに、本名を書かせる方向に誘っている",
        shots: [{ file: "issue-07.png", caption: "例：田中 あき" }],
      },
    ],
  },
  {
    title: "アイコンの画面",
    items: [
      {
        no: 7,
        title: "写真を選び直せない",
        touch: "丸を押すと写真が入る。もう一度押しても変わらず、消すボタンもない",
        say: "違う写真を選んでしまったら、やり直せない",
        shots: [{ file: "issue-10.png", caption: "もう一度押しても同じ" }],
      },
      {
        no: 8,
        title: "写真が誰に見えるか書いていない",
        touch: "説明文を指す。「顔がわかる写真だと、話しかけてもらいやすくなります。」だけ",
        say: "顔写真が誰に見えるのか分からないまま、載せることになる",
        shots: [{ file: "issue-11.png", caption: "説明はこれだけ" }],
      },
    ],
  },
  {
    title: "登録が終わった後（ホーム）",
    items: [
      {
        no: 9,
        title: "メールの確認がないまま登録が終わる",
        touch: "「あとで設定する」→「始める」→「登録が完了しました」",
        say: "確認の画面を一度も通っていない。打ち間違いのアドレスでも、他人のアドレスでも登録が終わる",
        shots: [{ file: "issue-08.png", caption: "確認なしで完了" }],
      },
      {
        no: 10,
        title: "言語を一度も聞かれない",
        touch: "ホームの投稿を見せる。日本語・英語・中国語・イタリア語・韓国語が混ざって並ぶ",
        say: "言語交換のアプリなのに、母語も学びたい言語も聞いていない。これでは相手を探せない。大手の4つのサービスはどれも最初に聞いている",
        shots: [{ file: "issue-06.png", caption: "言語に関係ない投稿" }],
      },
      {
        no: 11,
        title: "年齢を聞かない",
        touch: "ここまでを振り返る。年齢や生年月日を聞く画面は一度も出なかった",
        say: "知らない大人と1対1でやりとりするサービスなのに、子どもでも登録できる",
        shots: [{ file: "issue-08.png", caption: "年齢を聞かずに完了" }],
      },
    ],
  },
];

/* 後半：アフターを頭から通して、止まる所が4つ（代表5つ） */
const AFTER_STOPS: { title: string; items: Item[] }[] = [
  {
    title: "メールの確認の画面",
    items: [
      {
        no: 1,
        title: "「確認して」と言いながら「あとで」を目立たせている",
        touch: "「メールで始める」→ アドレスと15文字以上のパスワード →「確認メールを送る」。下の「あとで確認して先へ」が目立つボタンになっている",
        say: "確認してほしいのか、先に進んでほしいのか分からない。進めていいならこの画面は要らないし、確認させたいならここで止めるべき",
        shots: [{ file: "after-03.png", caption: "メールの確認" }],
      },
      {
        no: 2,
        title: "押せないアイコンが、ボタンと同じ色",
        touch: "同じ画面の上のメールのアイコンを指す",
        say: "緑の塗りで、押せるボタンに見える。でも押せない",
        shots: [{ file: "after-03.png", caption: "上のアイコン" }],
      },
    ],
  },
  {
    title: "言語の画面",
    items: [
      {
        no: 3,
        title: "学びたい言語のリストが画面に収まらない",
        touch: "「あとで確認して先へ」→「学びたい言語」の欄を押してリストを開く。選択肢がはみ出し、本文がずれる",
        say: "見ているだけでは分からない。触って初めて気づく",
        shots: [{ file: "after-m07.png", caption: "リストを開いた所" }],
      },
    ],
  },
  {
    title: "生年月日の画面",
    items: [
      {
        no: 4,
        title: "生年月日が、日・月・年の3つの数字の欄",
        touch: "学びたい言語と目的を選んで「次へ」。生年月日の画面を見せる",
        say: "これはWebでよく見る形。iPhoneなら、回して選ぶドラムロールで選べるようにしたい",
        shots: [{ file: "after-06.png", caption: "3つの数字の欄" }],
      },
    ],
  },
  {
    title: "プロフィールの画面",
    items: [
      {
        no: 5,
        title: "写真（アイコン）が名前の後",
        touch: "18歳以上になる日付（例：1990年1月1日）を入れて「次へ」",
        say: "アイコンは名前より先に来るべき",
        shots: [{ file: "after-08.png", caption: "名前が先・写真が後" }],
      },
    ],
  },
];

/* ---------- ページ ---------- */

export default function HanasoShootPage() {
  return (
    <main className="mx-auto max-w-[800px] px-4 py-6">
      <BackToIndex />
      <h1 className="mt-3 font-heading text-2xl font-bold">ハナソ 撮影メモ</h1>
      <p className="mt-3 text-sm text-muted-foreground">タイトル</p>
      <p className="text-base font-bold leading-relaxed">{TITLE}</p>
      <p className="mt-3 text-[15px] leading-relaxed">
        見た人が「AIはすごい。でも気づけるのは基本を知っている人の目。見た目を真似するだけでなく、基本を学ぼう」と思って、説明欄のリンクを押す動画にする。
      </p>

      {/* 構成 */}
      <section aria-labelledby="outline-title" className="mt-8 rounded-[16px] border border-border p-5">
        <h2 id="outline-title" className="font-heading text-lg font-bold">
          構成（8〜12分）
        </h2>
        <ol className="mt-3 flex flex-col gap-2 text-[15px] leading-relaxed">
          {OUTLINE.map((o, i) => (
            <li key={o.id} className="flex gap-3">
              <span className="w-24 shrink-0 text-sm text-muted-foreground">{o.time}</span>
              <span>
                <a href={`#${o.id}`} className="font-bold underline underline-offset-2">
                  {i + 1}. {o.title}
                </a>
                　{o.body}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-10 flex flex-col gap-12">
        {/* 1. 導入 */}
        <Part id="intro" no={1} title="導入" time="0:00〜1:30">
          <ShowBox
            links={
              <>
                <OpenLink href={BEFORE}>ビフォー</OpenLink>
                <OpenLink href={COMPARE}>ビフォー・アフターを並べる</OpenLink>
              </>
            }
            shots={[
              { file: "before-01.png", caption: "ビフォー（最初の画面）" },
              { file: "after-01.png", caption: "アフター（最初の画面）" },
            ]}
          />
          <Talk
            items={[
              "ビフォーを映して「AIに作らせた、アプリの新規登録の画面です」",
              "「パッと見よさそう。でも触ると11個おかしい所があります。いくつ気づけますか？」",
              "並べる画面でアフターを一瞬見せて「これを直したのがこっち」",
              "「どう直したのか、AIをどう使ったのかもシェアします」",
              "「今日は見た目の話ではなく、正しい動きかどうかを見抜く話です」",
              "流れを言う：まずビフォーを触って11個 → AIに何を渡して直させたか → 直したアフターでもまだ残った間違い → 気づけるようになるには",
            ]}
          />
        </Part>

        {/* 2. 前半 */}
        <Part id="before" no={2} title="前半：ビフォーを触る" time="1:30〜4:30">
          <ShowBox links={<OpenLink href={BEFORE}>ビフォー</OpenLink>} />
          <Talk
            items={[
              "「では最初から触っていきます」。登録を最初から最後まで1回通し、画面ごとに止まって指摘する",
              "1つあたり15秒くらい。怖がらせる言い方（危ない・審査に落ちる）はしない",
            ]}
          />
          {BEFORE_STOPS.map((s) => (
            <Stop key={s.title} title={s.title} items={s.items} />
          ))}
          <Talk
            items={[
              "締め：「ここまでで11個。どれも、見ているだけでは分からず、触ると気づくものでした」",
            ]}
          />
        </Part>

        {/* 3. 転換 */}
        <Part id="pivot" no={3} title="転換：AIに何を渡したか" time="4:30〜6:30">
          <ShowBox
            links={
              <>
                <OpenLink href={FIGJAM_DOMAIN}>FigJam 業種のリサーチ</OpenLink>
                <OpenLink href={FIGJAM_UI}>FigJam UIのリサーチ</OpenLink>
                <span className="inline-flex h-9 items-center rounded-[10px] border border-dashed border-border px-4 text-sm text-muted-foreground">
                  Claude アプリ（アプリを開く）
                </span>
                <OpenLink href={AFTER}>アフター</OpenLink>
              </>
            }
            shots={[
              { file: "after-02.png", caption: "エラーが出るように" },
              { file: "after-03.png", caption: "メールの確認が入った" },
              { file: "after-04.png", caption: "言語を聞くように" },
              { file: "after-06.png", caption: "生年月日を聞くように" },
            ]}
          />
          <Talk
            items={[
              "「これをAIに直させました。渡したのは、リサーチ4本です」",
              "FigJam を映す：業種のリサーチ2本（言語交換SNSのリサーチ、守らないといけない決まりのリサーチ）と、UIのリサーチ2本（新規登録の基本の動き、部品ごとの見せ方）。中身は読めなくてよい（詳しくは有料で解説）",
              "Claude アプリを映す：リサーチを渡して作り直させた所。ここも読めなくてよい",
              "アフターを触って見せる：エラーが出る、メールの確認の画面が入った、言語を聞く、生年月日を聞く",
              "「何を聞くか・何を守るかは、ほとんど直りました」（「全部正解した」とは言わない）",
              "メールの確認は、ここでは「画面が入った」までにする。入れ方がおかしい話は後半で",
            ]}
          />
        </Part>

        {/* 4. 後半 */}
        <Part id="after" no={4} title="後半：直したアフターでも残った間違い" time="6:30〜9:30">
          <ShowBox
            links={
              <>
                <OpenLink href={AFTER}>アフター</OpenLink>
                <OpenLink href="/dev/hanaso/after-mistakes">14か所の一覧</OpenLink>
              </>
            }
          />
          <Talk
            items={[
              "「じゃあ完璧かというと、触ってみるとまだ14か所おかしい」",
              "「全部は見せないので、代表を5つ触ります」。アフターを最初から通し、4つの画面で止まる",
            ]}
          />
          {AFTER_STOPS.map((s) => (
            <Stop key={s.title} title={s.title} items={s.items} />
          ))}
          <Talk
            items={[
              "残りの9か所は一覧で見せる（一覧の図は撮影後に作る）",
              "まとめ：「リサーチを渡すと、何を聞くか・何を守るかは直る。残ったのは、どう見せるか・どこに置くか」",
              "「ここに気づけたのは、UIの基本を知っている人の目でした」",
            ]}
          />
        </Part>

        {/* 5. 結論 */}
        <Part id="cta" no={5} title="結論・説明欄へ" time="9:30〜">
          <Talk
            items={[
              "「AIはすごい。リサーチを渡せば、中身はかなり正しくなる」",
              "「でも、おかしい所に気づけるのは基本を知っている人の目。見た目を真似するだけでなく、基本を学ぶのがおすすめです」",
              "説明欄の1つ目：「AIではじめるUIリサーチ」（無料コース）。今日のように、リサーチを作ってAIに渡すやり方",
              "説明欄の2つ目：「UIデザイン制作の基本」。どう見せるか・どこに置くかの基本",
            ]}
          />
        </Part>
      </div>

      <div className="mt-12">
        <BackToIndex />
      </div>
    </main>
  );
}
