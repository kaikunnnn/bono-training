/**
 * /dev/hanaso/before-issues — ビフォーを実際に操作すると起きること（#296 A）
 *
 * 載せているのは、Playwright で /dev/hanaso-compare/before.html を実際に操作して確かめた項目だけ。
 * スクショは操作した瞬間／直後を撮ったもの（hanaso-shots/issue-*.png、/dev/hanaso-compare/shots から配信）。
 * 並びは「起きたときの重さ」順（ストアの規約・法令 → 入力の誤りを素通し → その他）。
 * 本番では /dev ごと proxy で 404。
 */

import type { Metadata } from "next";
import { BackToIndex, ShotFigure, TagBadge, type BasisTag, type Shot } from "../_parts";

export const metadata: Metadata = {
  title: "ハナソ ビフォーで起きること (/dev/hanaso/before-issues)",
  robots: { index: false, follow: false },
};

type Issue = {
  id: string;
  /** 起きること（見出し） */
  what: string;
  /** 操作 */
  how: string;
  /** なぜ問題か */
  why: string;
  /** 根拠 */
  basis: string;
  tags: BasisTag[];
  shots: Shot[];
};

const ISSUES: Issue[] = [
  {
    id: "age",
    what: "年齢を聞かないので、子どもでも登録できる",
    how: "最初から最後まで進める。年齢や生年月日を聞く画面は一度も出ずに、登録が終わる",
    why: "知らない大人と1対1でやりとりするサービスで、子どもを分けられない",
    basis: "COPPA、業種リサーチ「必須対応リサーチ」（最低年齢の扱いを決める）",
    tags: ["必須"],
    shots: [{ file: "issue-08.png", caption: "年齢を聞かれないまま、登録が終わった直後" }],
  },
  {
    id: "terms",
    what: "利用規約とプライバシーポリシーが押せず、読めない",
    how: "最初の画面の「利用規約」「プライバシーポリシー」の文字を押す。何も起きない（リンクではなく、ただの色付きの文字）",
    why: "「同意したものとみなします」と書いてあるのに、同意する中身を読めない",
    basis: "Apple App Review Guidelines 5.1.1(i)（プライバシーポリシーへのリンクを分かりやすい場所に置く）",
    tags: ["必須"],
    shots: [{ file: "issue-12.png", caption: "規約の文字を押した後。何も起きない" }],
  },
  {
    id: "invalid-mail",
    what: "メールアドレス欄に「aaa」、パスワードに「1」を入れて「登録する」を押すと、そのまま次の画面に進む",
    how: "「メールアドレスで登録」を押し、メールアドレスに「aaa」、パスワードに「1」を入れて「登録する」を押す。エラーは出ず、名前の画面に進む",
    why: "間違ったアドレスで登録でき、確認メールが届かないままアカウントができる。何が悪いのかも分からない",
    basis: "WCAG 3.3.1（入力の誤りを文字で知らせる）",
    tags: ["規格"],
    shots: [
      { file: "issue-01a.png", caption: "「aaa」と「1」を入れた所" },
      { file: "issue-01b.png", caption: "「登録する」を押した直後。エラーは出ず、次の画面へ" },
    ],
  },
  {
    id: "empty-mail",
    what: "何も入れずに「登録する」を押しても進む",
    how: "メールアドレスとパスワードを空のまま「登録する」を押す。名前の画面に進む",
    why: "空のまま登録できてしまう",
    basis: "WCAG 3.3.1",
    tags: ["規格"],
    shots: [{ file: "issue-02.png", caption: "空のまま「登録する」を押した直後" }],
  },
  {
    id: "no-verify",
    what: "登録の途中でメールの確認がなく、そのまま登録が終わる",
    how: "メールアドレスを入れた後、確認の画面を通らずに最後まで進み、「登録が完了しました」と出る。仕様メモでは、確認メールは登録の後に送り、確認する前でもアプリは使える",
    why: "他人のアドレスや打ち間違いのアドレスでも登録が終わる",
    basis: "UIリサーチ「やさしい版」画面2-2、GOV.UK",
    tags: [],
    shots: [{ file: "issue-08.png", caption: "確認の画面を通らず、登録が終わった直後" }],
  },
  {
    id: "language",
    what: "母語も学びたい言語も聞かずに登録が終わり、言語に関係ないタイムラインが出る",
    how: "最後まで進める。言語を聞く画面はなく、ホームには日本語・英語・中国語・イタリア語・韓国語の投稿が混ざって並ぶ",
    why: "言語交換の相手を探せない。大手4サービスはどれも最初に聞いている",
    basis: "業種リサーチ「言語交換SNSリサーチ」",
    tags: [],
    shots: [{ file: "issue-06.png", caption: "登録直後のホーム。言語に関係なく投稿が並ぶ" }],
  },
  {
    id: "empty-name",
    what: "名前とユーザー名を空のまま「次へ」で進める",
    how: "名前とユーザー名を空のまま「次へ」を押す。アイコンの画面に進む",
    why: "相手に表示する名前がないユーザーができる",
    basis: "WCAG 3.3.1",
    tags: ["規格"],
    shots: [{ file: "issue-03.png", caption: "名前・ユーザー名が空のまま「次へ」を押した直後" }],
  },
  {
    id: "real-name",
    what: "名前の例が本名（例：田中 あき）",
    how: "名前の画面を開く。名前の欄に「例：田中 あき」、ユーザー名の欄に「例：aki_tanaka」と出ている",
    why: "知らない人とやりとりするサービスで、本名を出すよう誘導してしまう",
    basis: "業種リサーチ（Slowly はニックネームで参加できる）",
    tags: [],
    shots: [{ file: "issue-07.png", caption: "名前の例が「田中 あき」" }],
  },
  {
    id: "password",
    what: "パスワードが見えない・自動入力を切ってある（autocomplete=\"off\"）",
    how: "パスワードを入れる。伏せ字のままで、表示に切り替えるボタンがない。メールアドレスとパスワードの欄は autocomplete=\"off\" になっている",
    why: "打ち間違いに気づけない。パスワード管理アプリが使えない",
    basis: "NIST SP 800-63B、WCAG 1.3.5",
    tags: ["規格"],
    shots: [{ file: "issue-09.png", caption: "パスワードは伏せ字のまま。表示の切り替えがない" }],
  },
  {
    id: "photo-redo",
    what: "写真を一度選ぶと選び直せない",
    how: "アイコンの丸を押すと写真が入る。もう一度押しても何も変わらず、消すボタンもない",
    why: "違う写真を選んでしまっても、やり直せない",
    basis: "Carbon File uploader",
    tags: [],
    shots: [{ file: "issue-10.png", caption: "写真を選んだ後（サンプルが入る）に、もう一度押した所。変わらず、消すボタンもない" }],
  },
  {
    id: "photo-visibility",
    what: "写真が誰に見えるかの説明がない",
    how: "アイコンの画面を開く。説明は「顔がわかる写真だと、話しかけてもらいやすくなります。」だけ",
    why: "顔写真が誰に見えるのか分からないまま、載せることになる",
    basis: "GDPR 13条",
    tags: ["必須"],
    shots: [{ file: "issue-11.png", caption: "アイコンの画面。誰に見えるかの説明がない" }],
  },
];

export default function HanasoBeforeIssuesPage() {
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-6">
      <BackToIndex />
      <h1 className="mt-3 font-heading text-xl font-bold">ハナソ 新規登録 ビフォーで起きること</h1>
      <p className="mt-2 text-base leading-relaxed">
        見た目は整っていて、ぱっと見では問題が分からない。でも実際に使うと、次のことが起きる。
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        起きたときの重さの順に並べています。どれもビフォーを実際に操作して確かめたものです。根拠の札は次のとおりです。
      </p>
      <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <TagBadge tag="必須" />
          守らないといけない決まり（ストアの規約、法令）
        </li>
        <li className="flex items-center gap-2">
          <TagBadge tag="規格" />
          標準の規格（WCAG、NIST）
        </li>
      </ul>

      <div className="mt-8 flex flex-col gap-10">
        {ISSUES.map((issue, i) => (
          <section
            key={issue.id}
            id={issue.id}
            aria-labelledby={`${issue.id}-title`}
            className="scroll-mt-6 border-t border-border pt-6"
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
              <div className="min-w-0">
                {issue.tags.includes("必須") && (
                  <p className="mb-2">
                    <TagBadge tag="必須" />
                  </p>
                )}
                <h2 id={`${issue.id}-title`} className="font-heading text-lg font-bold leading-relaxed">
                  {i + 1}. {issue.what}
                </h2>
                <dl className="mt-3 flex flex-col gap-2 text-sm leading-relaxed">
                  <div className="flex gap-3">
                    <dt className="w-20 shrink-0 text-muted-foreground">操作</dt>
                    <dd className="min-w-0">{issue.how}</dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="w-20 shrink-0 text-muted-foreground">なぜ問題か</dt>
                    <dd className="min-w-0 font-bold">{issue.why}</dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="w-20 shrink-0 text-muted-foreground">根拠</dt>
                    <dd className="min-w-0">
                      {issue.basis}
                      {issue.tags.length > 0 && (
                        <span className="ml-2 inline-flex flex-wrap gap-1 align-middle">
                          {issue.tags.map((tag) => (
                            <TagBadge key={tag} tag={tag} />
                          ))}
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="grid grid-cols-2 items-start gap-4">
                {issue.shots.map((shot) => (
                  <ShotFigure key={shot.file} shot={shot} label="ビフォー" />
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10">
        <BackToIndex />
      </div>
    </main>
  );
}
