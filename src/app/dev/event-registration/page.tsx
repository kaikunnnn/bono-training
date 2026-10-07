/**
 * /dev/event-registration — イベントのサイト上参加申込（#218）の表示確認
 *
 * 本物のコンポーネント（EventParticipantAvatars / EventParticipantList /
 * EventOnsiteRegistration / EventRegistrationButton / RichTextSection）にモックデータを渡して、
 * 人数・状態ごとの見た目と、ページ全体の並びを一覧する。
 * DB・Sanity には触れない。申込カードの送信ボタンは何も送信しない（PreviewOnsiteRegistration）。
 * 未ログイン・非会員の案内ボタンは本物と同じく /login・/subscription へ移動する。
 */

import { Metadata } from "next";
import Link from "next/link";
import EventParticipantAvatars from "@/components/event/EventParticipantAvatars";
import {
  EventParticipantsLink,
  EventParticipantsMembersOnly,
} from "@/components/event/EventParticipantsNav";
import EventRegistrationButton from "@/components/event/EventRegistrationButton";
import RichTextSection from "@/components/article/RichTextSection";
import type { PortableTextBlock } from "@portabletext/types";
import {
  formatRegistrationDeadline,
  type EventParticipant,
  type EventParticipantSummary,
  type RegistrantProfile,
} from "@/lib/events/onsite-registration";
import PreviewOnsiteRegistration from "./PreviewOnsiteRegistration";
import PreviewParticipantList from "./PreviewParticipantList";

export const metadata: Metadata = {
  title: "イベント参加申込の表示確認 (/dev/event-registration)",
  robots: { index: false, follow: false },
};

// ---------------------------------------------------------------------------
// モックデータ
// ---------------------------------------------------------------------------

/** 外部に取りに行かないよう、色つきの丸アイコンを data URI で作る */
function mockAvatar(bg: string, letter: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="${bg}"/><text x="40" y="53" font-size="34" text-anchor="middle" fill="white" font-family="sans-serif" font-weight="bold">${letter}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const COLORS = ["#F97316", "#0EA5E9", "#22C55E", "#A855F7", "#EF4444", "#14B8A6"];

const NAMES = [
  "かい",
  "デザイン勉強中のさとう",
  "Yuki",
  "たなか",
  "とても長い名前のメンバーさん_UIUXデザイナー見習い_2026",
  "みずき",
  "Ken",
  "はるか",
  "もりした",
  "Aoi",
  "なかむら",
  "りょう",
];

const COMMENTS = [
  "参加します！",
  "数字を見ながら改善するのは初めてなので楽しみです。よろしくお願いします！",
  "参加します！",
  "毎週日曜の午前なら参加できそうです。キックオフから出ます。",
  "前回のイベントでは途中で止まってしまったので、今回は最後の成果発表までやり切りたいです。改善の前後で数字がどう変わったかをちゃんと記録して、みんなと共有できるようにします。長いコメントの折り返し確認用の文章です。",
  "参加します！",
  "よろしくお願いします🙌",
  "参加します！",
  "Figmaで作った画面の改善を数字で検証したいです",
  "参加します！",
  "途中参加になるかもしれませんが参加します",
  "参加します！",
];

// 3人目・6人目・10人目はアイコン未設定（代替アイコンの確認用）
const NO_AVATAR = new Set([2, 5, 9]);

const ALL_PARTICIPANTS: EventParticipant[] = NAMES.map((name, i) => ({
  id: `mock-${i}`,
  name,
  avatarUrl: NO_AVATAR.has(i)
    ? null
    : mockAvatar(COLORS[i % COLORS.length], String.fromCharCode(65 + i)),
  comment: COMMENTS[i],
  createdAt: new Date(Date.UTC(2026, 9, 12 - i)).toISOString(),
}));

function participantsOf(n: number): EventParticipant[] {
  return ALL_PARTICIPANTS.slice(0, n);
}

/** 本番のサーバー関数（get_event_participant_summary）と同じ形：新しい順のアイコン最大4件＋人数 */
function summaryOf(n: number): EventParticipantSummary {
  return {
    totalCount: n,
    avatarUrls: participantsOf(n)
      .slice(0, 4)
      .map((p) => p.avatarUrl),
  };
}

/** 申込カードに出す「自分」（プレビュー用） */
const ME: RegistrantProfile = {
  name: "かい",
  avatarUrl: mockAvatar("#F97316", "K"),
};

const REGISTERED = {
  comment: "数字を見ながら改善するのは初めてなので楽しみです。よろしくお願いします！",
  updatedAt: "2026-10-06T00:00:00.000Z",
};

/** 締め切り日の表示（本番イベントの開始 2026-10-21 20:00 JST から出す → 「10月21日（水）」） */
const DEADLINE = formatRegistrationDeadline("2026-10-21T11:00:00.000Z");

/** 本文のモック（本物の RichTextSection で描画して、本文の文字サイズを実際のページと揃える） */
function span(key: string, text: string) {
  return { _type: "span", _key: key, text, marks: [] };
}
function block(
  key: string,
  text: string,
  style: "normal" | "h2" = "normal",
): PortableTextBlock {
  return { _type: "block", _key: key, style, markDefs: [], children: [span(`${key}-s`, text)] };
}
function bullet(key: string, text: string): PortableTextBlock {
  return {
    _type: "block",
    _key: key,
    style: "normal",
    listItem: "bullet",
    level: 1,
    markDefs: [],
    children: [span(`${key}-s`, text)],
  };
}

const MOCK_CONTENT: PortableTextBlock[] = [
  block(
    "p1",
    "1か月かけて、自分のプロダクトの数字を見ながら改善するイベントです。毎週日曜の午前に4回集まり、改善の前後で数字がどう変わったかを共有します。",
  ),
  block("h1", "こんな人におすすめ", "h2"),
  bullet("l1", "作った画面を、数字で振り返ったことがない人"),
  bullet("l2", "改善案は出せるけれど、効果を確かめる方法がわからない人"),
  bullet("l3", "ひとりだと途中で止まってしまう人"),
  block("h2", "日程", "h2"),
  block(
    "p2",
    "キックオフ・相談会2回・成果発表の4回です。各回の内容と準備するものは、参加申込のあとに Slack でお知らせします。",
  ),
];

// ---------------------------------------------------------------------------
// 表示用の小物
// ---------------------------------------------------------------------------

function SectionHeading({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-4 border-b border-gray-200 pb-2">
      <h2 className="text-lg font-bold text-text-primary font-rounded-mplus">
        {title}
      </h2>
      {note && (
        <p className="mt-1 text-xs leading-relaxed text-text-primary/60 font-noto-sans-jp">
          {note}
        </p>
      )}
    </div>
  );
}

function Variant({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-dashed border-gray-300 bg-base p-4">
      <span className="self-start rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 font-noto-sans-jp">
        {label}
      </span>
      <div className="flex min-h-[40px] flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

function EmptyNote() {
  return <span className="text-xs text-gray-400">（何も表示しない）</span>;
}

// ---------------------------------------------------------------------------
// ページ全体の並び（src/app/events/[slug]/page.tsx と同じ順・同じクラス）
// ---------------------------------------------------------------------------

type FullPageView = "guest" | "non-member" | "member" | "member-registered";

function FullPageMock({ view }: { view: FullPageView }) {
  const summary = summaryOf(12);
  const isMember = view === "member" || view === "member-registered";

  const registered = view === "member-registered";
  // 本物の page.tsx と同じ: 上部だけアイコン列の下に「コメント一覧への動線」（N2）
  const registrationUi = (position: "top" | "bottom") => (
    <div className={`flex w-full flex-col items-center ${registered ? "gap-4" : "gap-8"}`}>
      <div className="flex flex-col items-center gap-2">
        <EventParticipantAvatars {...summary} />
        {position === "top" && (
          <EventParticipantsLink variant={isMember ? "member" : "guest"} />
        )}
      </div>
      <PreviewOnsiteRegistration
        access={isMember ? "member" : view === "guest" ? "guest" : "non-member"}
        viewer={ME}
        registration={view === "member-registered" ? REGISTERED : null}
        deadlineLabel={DEADLINE}
      />
    </div>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-base">
      <div className="mx-auto max-w-[800px] px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-[96px] w-[96px] items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
              日付カード
            </div>
            <span className="text-sm text-gray-500">（ Event ）</span>
            <h1 className="max-w-[720px] text-balance font-rounded-mplus text-3xl font-bold leading-[148%] text-[#101828] md:text-5xl lg:text-[52px]">
              BONOの数字改善をしようぜ
            </h1>
            <p className="max-w-[560px] text-balance text-base leading-relaxed text-[#4B5563] md:text-lg">
              1か月かけて、自分のプロダクトの数字を見ながら改善する。毎週日曜の午前に4回集まります。
            </p>
            {registrationUi("top")}
            <div className="mt-4 flex aspect-video w-full max-w-[640px] items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
              サムネイル
            </div>
          </div>

          {/* 本文: 本物と同じ RichTextSection（文字サイズ・余白を実際のページと揃える） */}
          <div className="mx-auto w-full max-w-[640px]">
            <RichTextSection content={MOCK_CONTENT} />
          </div>

          <div className="mx-auto w-full max-w-[640px]">
            {isMember ? (
              <PreviewParticipantList
                participants={participantsOf(12)}
                ownRegistrationId={registered ? ALL_PARTICIPANTS[0].id : null}
              />
            ) : (
              <EventParticipantsMembersOnly />
            )}
          </div>

          <div className="mx-auto flex w-full max-w-[640px] justify-center border-t border-gray-200 pt-6">
            {registrationUi("bottom")}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ページ
// ---------------------------------------------------------------------------

export default function Page() {
  return (
    <div className="min-h-screen bg-base">
      <div className="mx-auto w-full min-w-0 max-w-[1080px] px-4 py-12 sm:px-6">
        <header className="mb-10 border-b border-gray-200 pb-4">
          <p className="text-sm font-bold text-text-primary/50 font-noto-sans-jp">
            <Link href="/dev" className="underline hover:text-text-primary">
              Dev Portal
            </Link>{" "}
            / #218 イベントのサイト上参加申込
          </p>
          <h1 className="mt-1 font-rounded-mplus text-2xl font-bold text-text-primary">
            参加者表示と申込UIの状態一覧
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-primary/60 font-noto-sans-jp">
            本物のコンポーネントにモックデータを渡して表示しています。申込UIのボタンは何も送信しません。
            アイコンと人数は誰にでも、名前とコメントは有料会員にだけ表示します。
            表示するのは「いま有料会員の参加者」だけです（解約すると自動で消え、再課金で戻ります）。
          </p>
        </header>

        <div className="flex flex-col gap-14">
          {/* 1. アイコン列 */}
          <section>
            <SectionHeading
              title="1. 参加者アイコン列（誰にでも表示）"
              note="0人は何も出さない／1〜4人はアイコン＋「参加中」／5人以上はアイコン4個＋「N人が参加中」（ラベルA。アイコンだけだと何の列か分からないため必ず文字を添える）。アイコン未設定の人は人型の代替アイコン（非会員に名前を渡さないため頭文字は使わない）。読み上げは role=group と「N人が参加中」。"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 3, 4, 5, 12].map((n) => (
                <Variant key={n} label={`${n}人`}>
                  {n === 0 ? <EmptyNote /> : <EventParticipantAvatars {...summaryOf(n)} />}
                </Variant>
              ))}
            </div>
          </section>

          {/* 2. 申込カードの状態 */}
          <section>
            <SectionHeading
              title="2. 申込カードの状態（サイト上申込のイベント）"
              note="未申込の状態は同じカード（Figma 1:314）で表示。申込済みはカードではなく「✓ 参加中（自分のアイコン）⋯」の1行（#218 決定 P3。自分のコメントは出さず、本文のあとの一覧の自分の行で編集）。取り消しは ⋯ → 確認モーダル（プレビューでは成功扱いでモーダルが閉じるだけ）。未ログイン・非会員には入力欄を出さず「メンバー限定」を先に伝える。未ログインの「ログインして参加する」はログイン後このイベントページへ戻る（/login?redirectTo=）。受付中の未申込カードには「締め切り：10月21日（水）」を小さく出す（締め切り＝開催日の日本時間 23:59:59.999）。"
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Variant label="1. 未ログイン">
                <PreviewOnsiteRegistration access="guest" registration={null} deadlineLabel={DEADLINE} />
              </Variant>
              <Variant label="2. ログイン済み・非会員">
                <PreviewOnsiteRegistration access="non-member" registration={null} deadlineLabel={DEADLINE} />
              </Variant>
              <Variant label="3. 会員・未申込（Figma どおり）">
                <PreviewOnsiteRegistration viewer={ME} registration={null} deadlineLabel={DEADLINE} />
              </Variant>
              <Variant label="4. 会員・申込済み（参加中の1行。⋯ →「参加を取り消す」→ 確認モーダル）">
                <PreviewOnsiteRegistration viewer={ME} registration={REGISTERED} />
              </Variant>
              <Variant label="7. エラー（申込に失敗）">
                <PreviewOnsiteRegistration
                  viewer={ME}
                  registration={null}
                  initialError="参加申込に失敗しました。時間をおいてもう一度お試しください"
                  deadlineLabel={DEADLINE}
                />
              </Variant>
              <Variant label="アイコン未設定・長い名前">
                <PreviewOnsiteRegistration
                  viewer={{ name: NAMES[4], avatarUrl: null }}
                  registration={null}
                  deadlineLabel={DEADLINE}
                />
              </Variant>
              <Variant label="申込済み・アイコン未設定">
                <PreviewOnsiteRegistration
                  viewer={{ name: NAMES[4], avatarUrl: null }}
                  registration={REGISTERED}
                />
              </Variant>
            </div>
          </section>

          {/* 2a. 受付終了 */}
          <section>
            <SectionHeading
              title="2a. 受付終了（開催日の日本時間 23:59:59.999 を過ぎた後）"
              note="未ログイン・非会員・未申込の会員は、帯「受付終了」＋終了の案内だけ（入力欄・ログイン/課金ボタンなし）。申込済みの会員は参加中の1行のまま取り消しができる（コメント編集は一覧の自分の行で）。取り消すと再申込できないので、確認モーダルに赤字で一言添える（4 の ⋯ から確認）。申込はサーバー側でも現在時刻で拒否する（「申込の受付は終了しました」）。"
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Variant label="1. 受付終了・未ログイン">
                <PreviewOnsiteRegistration access="guest" registration={null} closed deadlineLabel={DEADLINE} />
              </Variant>
              <Variant label="2. 受付終了・ログイン済み・非会員">
                <PreviewOnsiteRegistration access="non-member" registration={null} closed deadlineLabel={DEADLINE} />
              </Variant>
              <Variant label="3. 受付終了・会員・未申込（取り消し後も同じ）">
                <PreviewOnsiteRegistration viewer={ME} registration={null} closed deadlineLabel={DEADLINE} />
              </Variant>
              <Variant label="4. 受付終了・会員・申込済み（⋯ から取り消し可。再申込不可の注意つき）">
                <PreviewOnsiteRegistration viewer={ME} registration={REGISTERED} closed />
              </Variant>
            </div>
          </section>

          {/* 2b. Googleフォームのイベント（従来どおり） */}
          <section>
            <SectionHeading
              title="2b. Googleフォームのイベント（従来どおり・変更なし）"
              note="サイト上申込の対象に入っていないイベントは、これまでの EventRegistrationButton のまま。"
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Variant label="未ログイン">
                <EventRegistrationButton isLoggedIn={false} hasMemberAccess={false} />
              </Variant>
              <Variant label="ログイン済み・非会員">
                <EventRegistrationButton isLoggedIn hasMemberAccess={false} />
              </Variant>
              <Variant label="会員">
                <EventRegistrationButton
                  isLoggedIn
                  hasMemberAccess
                  registrationUrl="https://forms.gle/example"
                />
              </Variant>
            </div>
          </section>

          {/* 3. 会員向けコメント一覧 */}
          <section>
            <SectionHeading
              title="3. 参加者のコメント（会員だけに表示）"
              note="新しい申込順。アイコン未設定の人は掲示板のコメントと同じく名前の頭文字。長いコメント・長い名前は折り返す。自分の行には「あなた」と ⋯ →「コメントを編集」（その場で1行入力・300字まで。プレビューでは保存しても中身は変わらない）。未ログイン・非会員には一覧の代わりに「メンバーだけが見られます」の案内（上部の「メンバーはみんなのコメントが見られます ↓」の飛び先）。※このページは一覧が複数あるため、上部の動線リンクは最初の id=participants へ飛ぶ。動作確認は本物のイベントページで。"
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Variant label="3人">
                <PreviewParticipantList participants={participantsOf(3)} />
              </Variant>
              <Variant label="12人・自分が申込済み（自分の行で編集）">
                <PreviewParticipantList
                  participants={participantsOf(12)}
                  ownRegistrationId={ALL_PARTICIPANTS[1].id}
                />
              </Variant>
              <Variant label="非会員・未ログイン（一覧の代わりの案内）">
                <EventParticipantsMembersOnly />
              </Variant>
            </div>
          </section>

          {/* 4. ページ全体 */}
          <section>
            <SectionHeading
              title="4. ページ全体の並び（12人参加）"
              note="ヘッダー → アイコン列＋動線（上部だけ）→ 申込カード／参加中の1行 → サムネイル → 本文（本物の RichTextSection）→ 参加者のコメント（会員）／「メンバーだけが見られます」の案内（非会員）→ 下部のアイコン列＋申込カード。"
            />
            <div className="flex flex-col gap-8">
              {(
                [
                  ["guest", "未ログインの見え方"],
                  ["non-member", "非会員（ログイン済み）の見え方"],
                  ["member", "会員の見え方（未申込）"],
                  ["member-registered", "会員の見え方（申込済み）"],
                ] as const
              ).map(([view, label]) => (
                <div key={view} className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-gray-700">{label}</span>
                  <FullPageMock view={view} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
