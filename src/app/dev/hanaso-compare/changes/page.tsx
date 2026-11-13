/**
 * /dev/hanaso-compare/changes — ハナソ新規登録アフター版で変えた所の一覧（#296）
 *
 * 変えた内容・理由・根拠を画面ごとに並べ、ビフォー／アフターのスクショを横に置く。
 * 文言はオーナー確認済みの変更リストをそのまま載せている（勝手に言い換えない）。
 * スクショは src/content/materials/ai-research-ui/hanaso-shots/ にあり、
 * /dev/hanaso-compare/shots/[file] の Route Handler から配信する（public/ に置かない＝本番に出さない）。
 * 本番では /dev ごと proxy で 404。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BackToIndex } from "../../hanaso/_parts";

export const metadata: Metadata = {
  title: "ハナソ 新規登録 アフターの変更点 (/dev/hanaso-compare/changes)",
  robots: { index: false, follow: false },
};

/** 根拠の種類。必須＝決まり、規格＝標準規格、提案＝原文になくAIが決めた所 */
type BasisTag = "必須" | "規格" | "提案";

type Change = {
  /** 変えた内容 */
  what: string;
  /** 理由 */
  why: string;
  /** 根拠（見た目だけの変更には無い） */
  basis?: string;
  /** 根拠に含まれる種類（札で出す） */
  tags: BasisTag[];
};

type Shot = { file: string; caption: string };

type Group = {
  id: string;
  title: string;
  /** null = ビフォーにはこの画面がない */
  before: Shot[] | null;
  after: Shot[];
  changes: Change[];
};

const SHOT_BASE = "/dev/hanaso-compare/shots";

const GROUPS: Group[] = [
  {
    id: "g1",
    title: "1. 登録方法の画面",
    before: [{ file: "before-01.png", caption: "登録方法を選ぶ画面" }],
    after: [{ file: "after-01.png", caption: "登録方法を選ぶ画面" }],
    changes: [
      {
        what: "Appleで続ける（黒いボタン）を一番上に足した",
        why: "Googleのログインを置くなら、条件（名前とメールだけ・メールを隠せる・追跡しない）を満たす別のログインも置く決まりがあり、Appleのログインはその条件を満たす方法のため",
        basis: "Apple App Review Guidelines 4.8（必須：条件を満たす別のログイン。Appleのログインそのものが必須ではない）、Apple HIG（Appleのボタンを他より小さくしない）",
        tags: ["必須"],
      },
      {
        what: "ボタンの文言を「Googleで続ける」「メールで続ける」のように、方法の名前つきにした",
        why: "押したら何が起きるかが文言で分かるようにするため",
        basis: "UIリサーチ「やさしい版」画面1",
        tags: [],
      },
      {
        what: "アカウントを作ると何ができるかを1〜2行足した",
        why: "登録する理由が分からないと、ここで離れてしまうため",
        basis: "UIリサーチ「やさしい版」画面1",
        tags: [],
      },
      {
        what: "「すでにアカウントをお持ちの方」の入口を足した",
        why: "登録済みの人が間違えて新規登録に進まないようにするため",
        basis: "UIリサーチ「やさしい版」画面1",
        tags: [],
      },
      {
        what: "規約とプライバシーポリシーを、押せるリンクの形にした",
        why: "ポリシーは分かりやすい場所から読める必要があるため",
        basis: "Apple 5.1.1(i)（必須）",
        tags: ["必須"],
      },
    ],
  },
  {
    id: "g2",
    title: "2. メール・パスワードの画面",
    before: [{ file: "before-02.png", caption: "メール・パスワード" }],
    after: [{ file: "after-02.png", caption: "メールのエラー表示と、パスワード表示中" }],
    changes: [
      {
        what: "ラベルを欄の上に出し、欄の中の薄い文字（placeholder）をやめた",
        why: "薄い文字は入力すると消え、何の欄か分からなくなるため",
        basis: "GOV.UK、Carbon（UIリサーチ「デザインシステム編」）",
        tags: [],
      },
      {
        what: "自動入力をオフからオンにした（メールとパスワードの欄）",
        why: "ブラウザやパスワード管理アプリの自動入力が使えないと、打つ手間と打ち間違いが増えるため",
        basis: "WCAG 1.3.5（規格）、NIST SP 800-63B（規格）",
        tags: ["規格"],
      },
      {
        what: "入力チェックとエラー表示を足した。欄を離れたときに確かめ、欄の下に文字で出す（例：「name@example.com のような形式で入力してください」）",
        why: "ビフォーは空でも間違っていても先に進めてしまい、何が悪いのか分からないため。色だけでは伝わらない人もいる",
        basis: "WCAG 3.3.1（規格）、GOV.UK（文の型）、Carbon（赤い枠）",
        tags: ["規格"],
      },
      {
        what: "パスワードの表示・非表示の切り替えを足した",
        why: "伏せ字のままだと打ち間違いに気づけないため",
        basis: "NIST（規格）",
        tags: ["規格"],
      },
      {
        what: "パスワードは15文字以上で、大文字や記号の条件は付けない",
        why: "8文字でよいのは2段階認証と組み合わせる場合だけで、ハナソには2段階認証がないため",
        basis: "NIST SP 800-63B-4（規格。GOV.UKは8文字で、ここは出典が食い違う）",
        tags: ["規格"],
      },
    ],
  },
  {
    id: "g3",
    title: "3. メール確認の画面（新しく足した）",
    before: null,
    after: [{ file: "after-03.png", caption: "メール確認" }],
    changes: [
      {
        what: "送り先のアドレス、「リンクを押してください」、再送、アドレスの変更、迷惑メールの案内",
        why: "メールが届かないときに、次に何をすればいいか分かるようにするため",
        basis: "UIリサーチ「やさしい版」画面2-2、GOV.UK",
        tags: [],
      },
      {
        what: "確認リンクの有効期限を24時間にした",
        why: "期限を付けるのは必須。ただ数字は原文になく、「あとで確認して先に進める」作りなので短すぎると切れやすいため",
        basis: "業種リサーチ「必須対応リサーチ」（期限が必須）。24時間はAIの提案",
        tags: ["必須", "提案"],
      },
    ],
  },
  {
    id: "g4",
    title: "4. 言語の画面（新しく足した）",
    before: null,
    after: [{ file: "after-04.png", caption: "学びたい言語のリストを開いた状態" }],
    changes: [
      {
        what: "母語と学びたい言語を、検索つきのリストで1つずつ選ぶ",
        why: "言語交換は、相手の候補を探すのにこの2つが要るため。大手4サービスとも最初に聞いている",
        basis: "業種リサーチ「言語交換SNSリサーチ」、Carbon Dropdown（長いリストは検索で絞る）",
        tags: [],
      },
      {
        what: "母語は日本語を初期値にし、並びは50音順。ひらがな・カタカナ・英語名でも探せる",
        why: "日本の人が使う前提のため",
        basis: "UIリサーチ「やさしい版」画面3（端末の言語を初期値に）、GOV.UK（アルファベット順を日本語に置き換えた）。AIの提案",
        tags: ["提案"],
      },
    ],
  },
  {
    id: "g5",
    title: "5. 目的の画面（新しく足した）",
    before: null,
    after: [{ file: "after-05.png", caption: "目的タグを2つ選んだ状態" }],
    changes: [
      {
        what: "試験対策・留学・仕事・旅行・友だちづくり・異文化交流から、タグで複数選ぶ。1つ以上は必須",
        why: "目的が合う相手を探すため。最初に聞く4つ（母語・学びたい言語・レベル・目的）に入っている",
        basis: "業種リサーチ「言語交換SNSリサーチ」、Carbon Tag",
        tags: [],
      },
    ],
  },
  {
    id: "g6",
    title: "6. 生年月日の画面（新しく足した）",
    before: null,
    after: [{ file: "after-06.png", caption: "生年月日" }],
    changes: [
      {
        what: "日・月・年の3つの数字欄にし、聞く理由を1行と必須の表示を出した",
        why: "18歳未満の人を分けるため。個人の情報を集めるときは、理由を伝えるのが決まりのため",
        basis: "GOV.UK Date input、GDPR 13条（必須）",
        tags: ["必須"],
      },
      {
        what: "「何歳以上か」を先に見せず、そのまま聞く",
        why: "年齢の条件を先に見せると、ごまかして入力されやすいため",
        basis: "COPPA FAQ D.7",
        tags: [],
      },
    ],
  },
  {
    id: "g7",
    title: "7. 18歳未満の画面（新しく足した）",
    before: null,
    after: [{ file: "after-07.png", caption: "18歳未満の生年月日を入れた後" }],
    changes: [
      {
        what: "登録できないことを伝える画面。入力した生年月日は保存しない。戻るは残した",
        why: "最低年齢に届かない人をどうするかは決めておく必要がある。COPPAは一般向けサービスが利用を断ることも認めているので、断る方を選んだ。打ち間違いを直せるよう、戻るは残した",
        basis: "業種リサーチ「必須対応リサーチ」（必須）、COPPA FAQ H.6。18歳はHelloTalkの分け方を参考にした仮の数字（AIの提案）",
        tags: ["必須", "提案"],
      },
    ],
  },
  {
    id: "g8",
    title: "8. プロフィールの画面",
    before: [
      { file: "before-08.png", caption: "名前・ユーザー名" },
      { file: "before-08b.png", caption: "アイコン（写真を選んだ後）" },
    ],
    after: [{ file: "after-08.png", caption: "写真を選んだ状態" }],
    changes: [
      {
        what: "名前の例を、本名からニックネームにした",
        why: "知らない人とやりとりするサービスで、本名を出させないため",
        basis: "業種リサーチ（Slowlyはニックネームとアバターで参加できる）",
        tags: [],
      },
      {
        what: "写真は任意のまま、誰に見えるかの説明を足した",
        why: "写真を必須にするには「中核の機能に要る」という理由が必要。集めた情報を誰に見せるかは、画面で伝える決まりがあるため",
        basis: "Apple 5.1.1(v)（必須）、GDPR 13条（必須）",
        tags: ["必須"],
      },
      {
        what: "写真を×で消して選び直せるようにし、形式とサイズの制限を先に書いた",
        why: "ビフォーは一度選ぶと選び直せないため",
        basis: "Carbon File uploader（形式とサイズの数字はAIの提案）",
        tags: ["提案"],
      },
    ],
  },
  {
    id: "g9",
    title: "9. 興味の画面",
    before: [{ file: "before-09.png", caption: "興味のあるジャンル" }],
    after: [{ file: "after-09.png", caption: "興味のあること" }],
    changes: [
      {
        what: "「任意」の表示、「あとで」ボタン、答えると何が良くなるかの説明を足した",
        why: "答えなくても進めることを分かるようにするため。集める理由も伝える必要があるため",
        basis: "UIリサーチ「やさしい版」画面5、GDPR 13条（必須）",
        tags: ["必須"],
      },
    ],
  },
  {
    id: "g10",
    title: "10. 全体",
    before: [{ file: "before-08.png", caption: "名前・ユーザー名（進み具合の表示なし）" }],
    after: [{ file: "after-10.png", caption: "言語：未選択で「次へ」を押した後" }],
    changes: [
      {
        what: "進み具合の表示を足した（言語→目的→生年月日→プロフィール→興味の5つ）",
        why: "手順が3つ以上あるため。メールで登録した人だけに増える画面は数えず、どの登録方法でも合計が変わらないようにした",
        basis: "Carbon Progress indicator。5つに絞ったのはAIの提案",
        tags: ["提案"],
      },
      {
        what: "「次へ」は押せるままにし、押したら足りない所を欄の下に出し、最初のエラーの欄に移動する",
        why: "押せないボタンでは何が足りないのか伝えられないため",
        basis: "WCAG 3.3.1（規格）。HIGは「押せなくする」、旧Materialは「押せる」で出典が食い違うため、AIの提案",
        tags: ["規格", "提案"],
      },
      {
        what: "タグ、パスワードの目のアイコン、写真の×など、小さな操作も押せる範囲を44以上にした",
        why: "指で押し間違えないようにするため",
        basis: "Apple HIG Buttons",
        tags: [],
      },
    ],
  },
  {
    id: "visual",
    title: "見た目だけの変更（リサーチが根拠ではない）",
    before: [{ file: "before-01.png", caption: "登録方法を選ぶ画面" }],
    after: [{ file: "after-01.png", caption: "登録方法を選ぶ画面" }],
    changes: [
      {
        what: "最初の画面の吹き出しを低くし（330→150）、アイコンを小さくした（148→104）",
        why: "足した文言を1画面に収めるため",
        tags: [],
      },
      {
        what: "本文を縦にスクロールできるようにした",
        why: "足した説明やエラーで、画面に収まらなくなることがあるため",
        tags: [],
      },
    ],
  },
];

const TAG_STYLE: Record<BasisTag, { variant: "dark" | "secondary" | "outline"; className?: string }> = {
  必須: { variant: "dark" },
  規格: { variant: "secondary" },
  提案: { variant: "outline", className: "border-dashed border-muted-foreground text-muted-foreground" },
};

function TagBadge({ tag }: { tag: BasisTag }) {
  const style = TAG_STYLE[tag];
  return (
    // Badge は div なので、文中（dd 内）に置けるよう span に同じ見た目を当てる
    <span className={cn(badgeVariants({ variant: style.variant }), "shrink-0 px-2 py-0 text-[11px] font-bold", style.className)}>
      {tag}
    </span>
  );
}

function ShotFigure({ shot, label }: { shot: Shot; label: string }) {
  return (
    <figure className="flex flex-col gap-1.5">
      {/* dev 専用・Route Handler 配信の固定サイズ画像のため next/image の最適化は不要 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${SHOT_BASE}/${shot.file}`}
        alt={`${label}：${shot.caption}`}
        width={417}
        height={836}
        loading="lazy"
        className="h-auto w-full"
      />
      <figcaption className="text-xs text-muted-foreground">{shot.caption}</figcaption>
    </figure>
  );
}

function ShotColumn({ label, shots }: { label: string; shots: Shot[] | null }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="text-sm font-bold">{label}</p>
      {shots ? (
        shots.map((shot) => <ShotFigure key={shot.file} shot={shot} label={label} />)
      ) : (
        <div className="flex aspect-[417/836] w-full items-center justify-center rounded-[20px] border border-dashed border-border bg-muted p-4 text-center text-sm text-muted-foreground">
          ビフォーにはこの画面がない
        </div>
      )}
    </div>
  );
}

export default function HanasoChangesPage() {
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-6">
      <BackToIndex />
      <p className="mt-1 text-sm">
        <Link href="/dev/hanaso-compare" className="underline underline-offset-2">
          ← ビフォー／アフターの比較に戻る
        </Link>
      </p>
      <h1 className="mt-3 font-heading text-xl font-bold">ハナソ 新規登録 アフターで変えた所</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        変えた内容・理由・根拠を画面ごとに並べています。根拠の札は次のとおりです。
      </p>
      <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <TagBadge tag="必須" />
          守らないといけない決まり（ストアの規約、GDPR など）
        </li>
        <li className="flex items-center gap-2">
          <TagBadge tag="規格" />
          標準の規格（WCAG、NIST）
        </li>
        <li className="flex items-center gap-2">
          <TagBadge tag="提案" />
          リサーチの原文になく、AIが決めた所
        </li>
      </ul>

      <nav aria-label="目次" className="mt-6 rounded-[20px] border border-border p-4">
        <p className="text-sm font-bold">目次</p>
        <ol className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {GROUPS.map((group) => (
            <li key={group.id}>
              <a href={`#${group.id}`} className="underline underline-offset-2">
                {group.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-8 flex flex-col gap-10">
        {GROUPS.map((group) => (
          <section
            key={group.id}
            id={group.id}
            aria-labelledby={`${group.id}-title`}
            className="scroll-mt-6 border-t border-border pt-6"
          >
            <h2 id={`${group.id}-title`} className="font-heading text-lg font-bold">
              {group.title}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
              <ul className="flex flex-col gap-5">
                {group.changes.map((change) => (
                  <li key={change.what}>
                    <h3 className="text-base font-bold leading-relaxed">{change.what}</h3>
                    <dl className="mt-2 flex flex-col gap-1.5 text-sm leading-relaxed">
                      <div className="flex gap-3">
                        <dt className="w-10 shrink-0 text-muted-foreground">理由</dt>
                        <dd className="min-w-0">{change.why}</dd>
                      </div>
                      {change.basis && (
                        <div className="flex gap-3">
                          <dt className="w-10 shrink-0 text-muted-foreground">根拠</dt>
                          <dd className="min-w-0">
                            {change.basis}
                            {change.tags.length > 0 && (
                              <span className="ml-2 inline-flex flex-wrap gap-1 align-middle">
                                {change.tags.map((tag) => (
                                  <TagBadge key={tag} tag={tag} />
                                ))}
                              </span>
                            )}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-2 items-start gap-4">
                <ShotColumn label="ビフォー" shots={group.before} />
                <ShotColumn label="アフター" shots={group.after} />
              </div>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm">
        <Link href="/dev/hanaso-compare" className="underline underline-offset-2">
          ← ビフォー／アフターの比較に戻る
        </Link>
      </p>
    </main>
  );
}
