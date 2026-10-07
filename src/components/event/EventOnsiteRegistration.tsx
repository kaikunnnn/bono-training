"use client";

import { useActionState, useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { User } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MembershipGuideModal from "@/components/event/MembershipGuideModal";
import { withPricingFrom } from "@/lib/activity-utils";
import { trackPricingCtaClick } from "@/lib/activity-client";
import {
  registerForEvent,
  updateRegistrationComment,
  cancelRegistration,
  type EventRegistrationActionResult,
} from "@/app/events/[slug]/actions";
import {
  DEFAULT_REGISTRATION_COMMENT,
  REGISTRATION_COMMENT_MAX_LENGTH,
  type RegistrantProfile,
} from "@/lib/events/onsite-registration";

type RegistrationAction = (
  prev: EventRegistrationActionResult | null,
  formData: FormData,
) => Promise<EventRegistrationActionResult | null>;

export type EventRegistrationActions = {
  register: RegistrationAction;
  update: RegistrationAction;
  cancel: RegistrationAction;
};

/** 実際の Server Actions（本番のページはこれを使う） */
const SERVER_ACTIONS: EventRegistrationActions = {
  register: registerForEvent,
  update: updateRegistrationComment,
  cancel: cancelRegistration,
};

export type RegisteredMode = "view" | "edit" | "confirm-cancel";

/** 文字数カウンターを出し始める文字数（上限が近づいたときだけ控えめに出す） */
const COUNTER_VISIBLE_FROM = REGISTRATION_COMMENT_MAX_LENGTH - 20;

const DEFAULT_BAND = "参加はこちら";
const CLOSED_BAND = "受付終了";
const MEMBERS_ONLY_MESSAGE = "このイベントはBONOメンバー限定です";
const CLOSED_MESSAGE = "このイベントの申込受付は終了しました";

interface EventOnsiteRegistrationProps {
  slug: string;
  isLoggedIn: boolean;
  hasMemberAccess: boolean;
  /** ログイン中の本人の名前・アイコン（会員のときにカードへ出す）。未ログインなら null */
  viewer: RegistrantProfile | null;
  /** 本人の申込（未申込なら null）。サーバーで毎回最新を読んだ値 */
  registration: { comment: string; updatedAt: string } | null;
  /**
   * 申込の受付が終了しているか（開催日の日本時間 23:59:59.999 を過ぎた）。サーバーで毎回判定した値。
   * 終了後は未申込の人には「受付終了」だけを出す。申込済みの人はコメント編集・取り消しができる
   */
  closed?: boolean;
  /** 締め切り日の表示（例: 「10月21日（水）」）。受付中の未申込カードにだけ小さく出す。無ければ出さない */
  deadlineLabel?: string | null;
  /**
   * 以下は /dev/event-registration のプレビュー用（本番のページでは渡さない）。
   * actions: Server Actions の代わりに呼ぶ関数（プレビューでは何もしない関数を渡す）
   * initialMode: 申込済みのときの最初の表示（編集中・取り消し確認中を再現する）
   * initialError: 最初から出しておくエラー文言（エラー表示を再現する）
   */
  actions?: EventRegistrationActions;
  initialMode?: RegisteredMode;
  initialError?: string;
}

/**
 * イベントのサイト上参加申込カード（#218 / Figma 3llH8MesLY3NzoU0hj5AGF 1:314）。
 * サイト上申込のイベントでは、ログイン状態・会員状態にかかわらずこのカードを出す。
 *
 * - 未ログイン: 「メンバー限定」の案内＋「ログインして参加する」（ログイン後このページに戻る）＋はじめての方向けモーダル
 * - ログイン済み・非会員: 「メンバー限定」の案内＋「メンバーになって参加する」
 * - 会員・未申込: 自分のアイコンと名前＋コメント入力（初期値「参加します！」）＋「参加する」
 * - 会員・申込済み: 帯が「✓ 参加申込済み」＋コメント（読み取り専用）＋編集・取り消し
 * - 受付終了（未ログイン・非会員・未申込の会員）: 帯が「受付終了」＋終了の案内だけ（入力・ボタンなし）
 * - 受付終了（申込済みの会員）: 申込済みの表示のまま編集・取り消しできる（取り消すと再申込はできない）
 *
 * 表示の切り替えは props（サーバーの値）で決める。上部と本文下の2か所に置かれるため、
 * 操作後は revalidatePath で両方が同じ状態に揃う。
 */
export default function EventOnsiteRegistration({
  slug,
  isLoggedIn,
  hasMemberAccess,
  viewer,
  registration,
  closed = false,
  deadlineLabel = null,
  actions = SERVER_ACTIONS,
  initialMode = "view",
  initialError,
}: EventOnsiteRegistrationProps) {
  // 受付終了後は、申込済みの会員以外には「受付終了」だけを出す（ログイン・課金への案内も出さない）
  if (closed && !(isLoggedIn && hasMemberAccess && registration)) {
    return <ClosedCard />;
  }
  const deadline = closed ? null : deadlineLabel;
  if (!isLoggedIn) return <GuestCard slug={slug} deadlineLabel={deadline} />;
  if (!hasMemberAccess) return <NonMemberCard deadlineLabel={deadline} />;

  const profile = viewer ?? { name: "メンバー", avatarUrl: null };
  const initialState: EventRegistrationActionResult | null = initialError
    ? { ok: false, error: initialError }
    : null;
  if (!registration) {
    return (
      <RegisterForm
        slug={slug}
        viewer={profile}
        action={actions.register}
        initialState={initialState}
        deadlineLabel={deadline}
      />
    );
  }
  // 申込内容が更新されたら（編集・再申込）、編集モードなどの手元の状態をリセットする
  return (
    <RegisteredView
      key={registration.updatedAt}
      slug={slug}
      viewer={profile}
      comment={registration.comment}
      actions={actions}
      initialMode={initialMode}
      initialState={initialState}
      closed={closed}
    />
  );
}

// ---------------------------------------------------------------------------
// カードの外枠（全状態で共通）
// ---------------------------------------------------------------------------

/**
 * 半透明の白カード＋上部の帯。
 * Figma では帯が絶対配置（カードの内側 1px に収まる幅）なので、ここでは帯を最初の子にして
 * 左右上 1px 内側に置き、本文は px16 / pt12 / pb12 で同じ位置関係を再現する。
 */
function RegistrationCard({
  band,
  deadlineLabel,
  children,
}: {
  band: ReactNode;
  /** 受付中の未申込カードにだけ、ボタンの下に「締め切り：10月21日（水）」を小さく出す */
  deadlineLabel?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="w-full max-w-[640px] rounded-[24px] border border-[var(--event-card-border)] bg-[var(--event-card-bg)] text-left shadow-[var(--shadow-event-card)]">
      <p className="mx-px mt-px flex items-center justify-center gap-1 rounded-t-[22px] bg-[var(--event-card-band-bg)] py-[7px] text-center text-sm font-medium leading-[21px] text-[var(--event-card-band-text)]">
        {band}
      </p>
      <div className="flex flex-col gap-4 px-4 py-3">
        {children}
        {deadlineLabel && (
          <p className="-mt-2 text-center text-[13px] leading-5 text-text-muted">
            締め切り：{deadlineLabel}
          </p>
        )}
      </div>
    </div>
  );
}

function RegisteredBand() {
  return (
    <>
      <Check className="size-4 text-text-success" aria-hidden="true" />
      参加申込済み
    </>
  );
}

/** 未ログイン・非会員向けの「メンバー限定」案内 */
function MembersOnlyMessage({ sub }: { sub?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 pt-1 text-center">
      <p className="text-balance text-base font-bold text-text-primary">
        {MEMBERS_ONLY_MESSAGE}
      </p>
      {sub && <p className="text-sm text-text-muted">{sub}</p>}
    </div>
  );
}

/** 自分のアイコン（20px）＋名前 */
function ViewerRow({ viewer }: { viewer: RegistrantProfile }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar className="size-5">
        {viewer.avatarUrl && <AvatarImage src={viewer.avatarUrl} alt="" />}
        <AvatarFallback className="text-muted-foreground">
          <User size={12} color="currentColor" />
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0 truncate text-sm font-medium leading-6 text-[var(--event-card-ink)]">
        {viewer.name}
      </span>
    </div>
  );
}

function ErrorMessage({
  id,
  state,
}: {
  id: string;
  state: EventRegistrationActionResult | null;
}) {
  if (!state || state.ok) return null;
  return (
    <p id={id} role="alert" className="px-[21px] text-sm text-text-error">
      {state.error}
    </p>
  );
}

/** コメント入力（Figma のピル型 h48・角丸24） */
function CommentField({
  value,
  onChange,
  disabled,
  id,
  errorId,
  hasError,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  id: string;
  errorId: string;
  hasError: boolean;
}) {
  const counterId = `${id}-counter`;
  const showCounter = value.length >= COUNTER_VISIBLE_FROM;
  const describedBy =
    [hasError ? errorId : null, showCounter ? counterId : null]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div className="flex w-full flex-col gap-1">
      <label htmlFor={id} className="sr-only">
        参加コメント
      </label>
      {/* React 19 のフォームはアクション後に非制御の入力をリセットするため、制御コンポーネントにして失敗時も入力を残す */}
      <Input
        id={id}
        name="comment"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={REGISTRATION_COMMENT_MAX_LENGTH}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        className="h-12 rounded-[24px] bg-surface px-[21px] text-base text-text-primary md:text-base"
      />
      {showCounter && (
        <span
          id={counterId}
          className="px-[21px] text-right text-xs text-text-muted"
        >
          {value.length}/{REGISTRATION_COMMENT_MAX_LENGTH}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 状態ごとの中身
// ---------------------------------------------------------------------------

/** 受付終了（未ログイン・非会員・未申込の会員）。入力欄・ボタンは出さない */
function ClosedCard() {
  return (
    <RegistrationCard band={CLOSED_BAND}>
      <p className="text-balance py-2 text-center text-base font-bold text-text-primary">
        {CLOSED_MESSAGE}
      </p>
    </RegistrationCard>
  );
}

function GuestCard({
  slug,
  deadlineLabel,
}: {
  slug: string;
  deadlineLabel: string | null;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // ログイン後にこのイベントページへ戻す（ログイン側の sanitizeRedirect で "/" 始まりだけ許可される）
  const loginHref = `/login?redirectTo=${encodeURIComponent(`/events/${slug}`)}`;

  return (
    <>
      <RegistrationCard band={DEFAULT_BAND} deadlineLabel={deadlineLabel}>
        <MembersOnlyMessage sub="参加するにはログインしてください" />
        <div className="flex flex-col items-center gap-1">
          <Button asChild size="large" className="w-full">
            <Link href={loginHref}>ログインして参加する</Link>
          </Button>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => setIsModalOpen(true)}
          >
            はじめての方はこちら
          </Button>
        </div>
      </RegistrationCard>
      <MembershipGuideModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}

function NonMemberCard({ deadlineLabel }: { deadlineLabel: string | null }) {
  const router = useRouter();
  const handleMemberRegister = () => {
    trackPricingCtaClick("event");
    router.push(withPricingFrom("/subscription", "event"));
  };

  return (
    <RegistrationCard band={DEFAULT_BAND} deadlineLabel={deadlineLabel}>
      <MembersOnlyMessage />
      <Button
        type="button"
        size="large"
        className="w-full"
        onClick={handleMemberRegister}
      >
        メンバーになって参加する
      </Button>
    </RegistrationCard>
  );
}

function RegisterForm({
  slug,
  viewer,
  action,
  initialState,
  deadlineLabel,
}: {
  slug: string;
  viewer: RegistrantProfile;
  action: RegistrationAction;
  initialState: EventRegistrationActionResult | null;
  deadlineLabel: string | null;
}) {
  const [comment, setComment] = useState(DEFAULT_REGISTRATION_COMMENT);
  const [state, formAction, pending] = useActionState(action, initialState);
  const fieldId = `event-register-comment-${useId()}`;
  const errorId = `${fieldId}-error`;

  return (
    <RegistrationCard band={DEFAULT_BAND} deadlineLabel={deadlineLabel}>
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="slug" value={slug} />
        <div className="flex flex-col gap-2">
          <ViewerRow viewer={viewer} />
          <CommentField
            id={fieldId}
            errorId={errorId}
            hasError={!!state && !state.ok}
            value={comment}
            onChange={setComment}
            disabled={pending}
          />
          <ErrorMessage id={errorId} state={state} />
        </div>
        <Button
          type="submit"
          size="large"
          className="w-full"
          disabled={pending || comment.trim().length === 0}
        >
          {pending ? "送信中…" : "参加する"}
        </Button>
      </form>
    </RegistrationCard>
  );
}

function RegisteredView({
  slug,
  viewer,
  comment,
  actions,
  initialMode,
  initialState,
  closed,
}: {
  slug: string;
  viewer: RegistrantProfile;
  comment: string;
  actions: EventRegistrationActions;
  initialMode: RegisteredMode;
  initialState: EventRegistrationActionResult | null;
  /** 受付終了後か（取り消すと再申込できないことを確認文に添える） */
  closed: boolean;
}) {
  const [mode, setMode] = useState<RegisteredMode>(initialMode);
  const [draft, setDraft] = useState(comment);
  // initialState（プレビュー用のエラー）は、いま開いている方（編集 or 取り消し確認）にだけ出す
  const [editState, editAction, editPending] = useActionState(
    actions.update,
    initialMode === "edit" ? initialState : null,
  );
  const [cancelState, cancelAction, cancelPending] = useActionState(
    actions.cancel,
    initialMode === "confirm-cancel" ? initialState : null,
  );
  const fieldId = `event-edit-comment-${useId()}`;
  const editErrorId = `${fieldId}-error`;
  const cancelErrorId = `${fieldId}-cancel-error`;

  if (mode === "edit") {
    return (
      <RegistrationCard band={<RegisteredBand />}>
        <form action={editAction} className="flex flex-col gap-4">
          <input type="hidden" name="slug" value={slug} />
          <div className="flex flex-col gap-2">
            <ViewerRow viewer={viewer} />
            <CommentField
              id={fieldId}
              errorId={editErrorId}
              hasError={!!editState && !editState.ok}
              value={draft}
              onChange={setDraft}
              disabled={editPending}
            />
            <ErrorMessage id={editErrorId} state={editState} />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="large"
              className="flex-1"
              disabled={editPending}
              onClick={() => {
                setDraft(comment);
                setMode("view");
              }}
            >
              やめる
            </Button>
            <Button
              type="submit"
              size="large"
              className="flex-1"
              disabled={editPending || draft.trim().length === 0}
            >
              {editPending ? "保存中…" : "保存する"}
            </Button>
          </div>
        </form>
      </RegistrationCard>
    );
  }

  return (
    <RegistrationCard band={<RegisteredBand />}>
      <div className="flex flex-col gap-2">
        <ViewerRow viewer={viewer} />
        {/* 送ったコメント（読み取り専用）。入力欄と同じピル型で控えめな色。長いコメントは折り返す */}
        <p className="min-h-12 whitespace-pre-wrap break-words rounded-[24px] border border-input bg-muted-custom px-[21px] py-[11px] text-base leading-6 text-text-secondary">
          {comment}
        </p>
      </div>

      {mode === "confirm-cancel" ? (
        <form action={cancelAction} className="flex flex-col gap-3">
          <input type="hidden" name="slug" value={slug} />
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-sm font-medium text-text-primary">
              参加を取り消しますか？
            </p>
            {closed && (
              <p className="text-balance text-[13px] leading-5 text-text-muted">
                受付終了後に取り消すと、再度申し込むことはできません
              </p>
            )}
          </div>
          <ErrorMessage id={cancelErrorId} state={cancelState} />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="large"
              className="flex-1"
              disabled={cancelPending}
              onClick={() => setMode("view")}
            >
              やめる
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="large"
              className="flex-1"
              disabled={cancelPending}
            >
              {cancelPending ? "取り消し中…" : "取り消す"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex justify-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMode("edit")}
          >
            コメントを編集
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-text-muted"
            onClick={() => setMode("confirm-cancel")}
          >
            参加を取り消す
          </Button>
        </div>
      )}
    </RegistrationCard>
  );
}
