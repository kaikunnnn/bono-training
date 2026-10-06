/**
 * /dev/event-registration — イベントのサイト上参加申込（#218）の表示確認
 *
 * 本物のコンポーネント（EventParticipantAvatars / EventParticipantList /
 * EventOnsiteRegistration / EventRegistrationButton）にモックデータを渡して、
 * 人数・状態ごとの見た目と、ページ全体の並びを一覧する。
 * DB・Sanity には触れない。申込UIのボタンは何も送信しない（PreviewOnsiteRegistration）。
 * 未ログイン・非会員の案内ボタンは本物と同じく /login・/subscription へ移動する。
 */

import { Metadata } from "next";
import Link from "next/link";
import EventParticipantAvatars from "@/components/event/EventParticipantAvatars";
import EventParticipantList from "@/components/event/EventParticipantList";
import EventRegistrationButton from "@/components/event/EventRegistrationButton";
import type {
  EventParticipant,
  EventParticipantSummary,
} from "@/lib/events/onsite-registration";
import PreviewOnsiteRegistration from "./PreviewOnsiteRegistration";

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

const REGISTERED = {
  comment: "数字を見ながら改善するのは初めてなので楽しみです。よろしくお願いします！",
  updatedAt: "2026-10-06T00:00:00.000Z",
};

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
    <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-dashed border-gray-300 bg-white p-4">
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

function FullPageMock({ view }: { view: "member" | "non-member" }) {
  const summary = summaryOf(12);
  const isMember = view === "member";

  const registrationUi = (
    <div className="flex w-full flex-col items-center gap-3">
      <EventParticipantAvatars {...summary} />
      {isMember ? (
        <PreviewOnsiteRegistration registration={null} />
      ) : (
        <EventRegistrationButton isLoggedIn hasMemberAccess={false} />
      )}
    </div>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-background">
      <div className="mx-auto max-w-[800px] px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-[96px] w-[96px] items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
              日付カード
            </div>
            <span className="text-sm text-gray-500">（ Event ）</span>
            <h1 className="max-w-[720px] text-balance font-rounded-mplus text-3xl font-bold leading-[148%] text-[#101828] md:text-5xl">
              BONOの数字改善をしようぜ
            </h1>
            <p className="max-w-[560px] text-balance text-base leading-relaxed text-[#4B5563] md:text-lg">
              1か月かけて、自分のプロダクトの数字を見ながら改善する。毎週日曜の午前に4回集まります。
            </p>
            {registrationUi}
            <div className="mt-4 flex aspect-video w-full max-w-[640px] items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
              サムネイル
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[640px] flex-col gap-3 text-sm leading-relaxed text-gray-500">
            <p className="font-bold text-gray-700">（本文のプレースホルダー）</p>
            <p>
              イベントの概要、日程、対象者、当日の流れなどが入ります。ここは Sanity
              のリッチテキストが表示される場所です。
            </p>
            <p>
              キックオフ・相談会2回・成果発表の4回。各回の内容と準備するものを書きます。
            </p>
          </div>

          {isMember && (
            <div className="mx-auto w-full max-w-[640px]">
              <EventParticipantList participants={participantsOf(12)} />
            </div>
          )}

          <div className="mx-auto flex w-full max-w-[640px] justify-center border-t border-gray-200 pt-6">
            {registrationUi}
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
              note="0人は何も出さない／1〜4人はアイコンだけ／5人以上はアイコン4個＋「N人が参加中」。アイコン未設定の人は人型の代替アイコン（非会員に名前を渡さないため頭文字は使わない）。読み上げは role=group と「N人が参加」。"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 3, 4, 5, 12].map((n) => (
                <Variant key={n} label={`${n}人`}>
                  {n === 0 ? <EmptyNote /> : <EventParticipantAvatars {...summaryOf(n)} />}
                </Variant>
              ))}
            </div>
          </section>

          {/* 2. 申込UIの状態 */}
          <section>
            <SectionHeading
              title="2. 申込UIの状態"
              note="未ログイン・非会員は既存の EventRegistrationButton（今まで通りの案内）。会員は EventOnsiteRegistration。"
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Variant label="未ログイン">
                <EventRegistrationButton isLoggedIn={false} hasMemberAccess={false} />
              </Variant>
              <Variant label="ログイン済み・非会員">
                <EventRegistrationButton isLoggedIn hasMemberAccess={false} />
              </Variant>
              <Variant label="会員・未申込">
                <PreviewOnsiteRegistration registration={null} />
              </Variant>
              <Variant label="会員・申込済み">
                <PreviewOnsiteRegistration registration={REGISTERED} />
              </Variant>
              <Variant label="会員・コメント編集中">
                <PreviewOnsiteRegistration registration={REGISTERED} initialMode="edit" />
              </Variant>
              <Variant label="会員・取り消し確認">
                <PreviewOnsiteRegistration
                  registration={REGISTERED}
                  initialMode="confirm-cancel"
                />
              </Variant>
              <Variant label="エラー（申込に失敗）">
                <PreviewOnsiteRegistration
                  registration={null}
                  initialError="参加申込に失敗しました。時間をおいてもう一度お試しください"
                />
              </Variant>
              <Variant label="エラー（コメント更新に失敗）">
                <PreviewOnsiteRegistration
                  registration={REGISTERED}
                  initialMode="edit"
                  initialError="コメントの更新に失敗しました。時間をおいてもう一度お試しください"
                />
              </Variant>
            </div>
          </section>

          {/* 3. 会員向けコメント一覧 */}
          <section>
            <SectionHeading
              title="3. 参加者のコメント（会員だけに表示）"
              note="新しい申込順。アイコン未設定の人は掲示板のコメントと同じく名前の頭文字。長いコメント・長い名前は折り返す。"
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Variant label="3人">
                <EventParticipantList participants={participantsOf(3)} />
              </Variant>
              <Variant label="12人">
                <EventParticipantList participants={participantsOf(12)} />
              </Variant>
            </div>
          </section>

          {/* 4. ページ全体 */}
          <section>
            <SectionHeading
              title="4. ページ全体の並び（12人参加）"
              note="ヘッダー → アイコン列 → 申込UI → サムネイル → 本文 → 参加者のコメント（会員のみ）→ 下部のアイコン列＋申込UI。非会員には一覧を出さない（代わりの一言も出さない）。"
            />
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-gray-700">会員の見え方（未申込）</span>
                <FullPageMock view="member" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-gray-700">
                  非会員（ログイン済み）の見え方
                </span>
                <FullPageMock view="non-member" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
