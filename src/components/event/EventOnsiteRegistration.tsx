"use client";

import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { User } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Modal,
  ModalAction,
  ModalContainer,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import EventMoreMenu from "@/components/event/EventMoreMenu";
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
   * 終了後は未申込の人には「受付終了」だけを出す。申込済みの人は取り消しができる（コメント編集は参加者一覧の自分の行で）
   */
  closed?: boolean;
  /** 締め切り日の表示（例: 「10月21日（水）」）。受付中の未申込カードにだけ小さく出す。無ければ出さない */
  deadlineLabel?: string | null;
  /**
   * 以下は /dev/event-registration のプレビュー用（本番のページでは渡さない）。
   * actions: Server Actions の代わりに呼ぶ関数（プレビューでは何もしない関数を渡す）
   * initialError: 最初から出しておくエラー文言（エラー表示を再現する）
   */
  actions?: EventRegistrationActions;
  initialError?: string;
}

/**
 * イベントのサイト上参加申込カード（#218 / Figma 3llH8MesLY3NzoU0hj5AGF 1:314）。
 * サイト上申込のイベントでは、ログイン状態・会員状態にかかわらずこのカードを出す。
 *
 * - 未ログイン: 「メンバー限定」の案内＋「ログインして参加する」（ログイン後このページに戻る）＋はじめての方向けモーダル
 * - ログイン済み・非会員: 「メンバー限定」の案内＋「メンバーになって参加する」
 * - 会員・未申込: 自分のアイコンと名前＋コメント入力（初期値「参加します！」）＋「参加する」
 * - 会員・申込済み: カードではなく1行「✓ 参加中（自分のアイコン）⋯」。⋯ →「参加を取り消す」→ 確認モーダル。
 *   自分のコメントはここには出さない（本文のあとの参加者一覧に出ていて、編集もそこの自分の行で行う）
 * - 受付終了（未ログイン・非会員・未申込の会員）: 帯が「受付終了」＋終了の案内だけ（入力・ボタンなし）
 * - 受付終了（申込済みの会員）: 参加中の1行のまま取り消しできる（取り消すと再申込はできない。確認モーダルで伝える）
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
  initialError,
}: EventOnsiteRegistrationProps) {
  // 取り消した直後か。取り消すとこの場所が「参加する」のカード（受付終了後は「受付終了」）に変わるので、
  // そこへフォーカスを移す（⋯ ボタンが消えてフォーカスの行き先がなくなるため）。
  // 上下2か所のうち、取り消しを操作した方だけが true になる
  const [focusAfterCancel, setFocusAfterCancel] = useState(false);
  const clearFocusAfterCancel = () => setFocusAfterCancel(false);

  // 受付終了後は、申込済みの会員以外には「受付終了」だけを出す（ログイン・課金への案内も出さない）
  if (closed && !(isLoggedIn && hasMemberAccess && registration)) {
    return (
      <ClosedCard
        autoFocus={focusAfterCancel}
        onAutoFocused={clearFocusAfterCancel}
      />
    );
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
        autoFocus={focusAfterCancel}
        onAutoFocused={clearFocusAfterCancel}
      />
    );
  }
  return (
    <RegisteredRow
      slug={slug}
      viewer={profile}
      cancelAction={actions.cancel}
      closed={closed}
      onCancelled={() => setFocusAfterCancel(true)}
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
function ViewerAvatar({ viewer }: { viewer: RegistrantProfile }) {
  return (
    <Avatar className="size-5 shrink-0">
      {viewer.avatarUrl && <AvatarImage src={viewer.avatarUrl} alt="" />}
      <AvatarFallback className="text-muted-foreground">
        <User size={12} color="currentColor" />
      </AvatarFallback>
    </Avatar>
  );
}

function ViewerRow({ viewer }: { viewer: RegistrantProfile }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <ViewerAvatar viewer={viewer} />
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
function ClosedCard({
  autoFocus = false,
  onAutoFocused,
}: {
  /** 取り消した直後（ここへフォーカスを移す） */
  autoFocus?: boolean;
  onAutoFocused?: () => void;
}) {
  const messageRef = useAutoFocus<HTMLParagraphElement>(autoFocus, onAutoFocused);
  return (
    <RegistrationCard band={CLOSED_BAND}>
      <p
        ref={messageRef}
        // 取り消し直後にフォーカスを受けるため（Tab では止まらない）。
        // autoFocus のときだけ付けると、フォーカス直後に外れてフォーカスが body に落ちるので常に付ける
        tabIndex={-1}
        className="text-balance py-2 text-center text-base font-bold text-text-primary outline-none"
      >
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
  autoFocus = false,
  onAutoFocused,
}: {
  slug: string;
  viewer: RegistrantProfile;
  action: RegistrationAction;
  initialState: EventRegistrationActionResult | null;
  deadlineLabel: string | null;
  /** 取り消した直後（「参加する」へフォーカスを移す） */
  autoFocus?: boolean;
  onAutoFocused?: () => void;
}) {
  const submitRef = useAutoFocus<HTMLButtonElement>(autoFocus, onAutoFocused);
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
          ref={submitRef}
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

/**
 * 表示されたときに一度だけフォーカスを移す（取り消し直後に、変わった先のカードへフォーカスを渡す）。
 * 取り消し確認モーダルが閉じるときのフォーカス復帰（⋯ はもう無い）より後に効くよう、描画後に移す。
 */
function useAutoFocus<T extends HTMLElement>(
  enabled: boolean,
  onDone?: () => void,
) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!enabled) return;
    ref.current?.focus();
    onDone?.();
    // 表示されたときの1回だけ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}

/**
 * 申込済み（#218 決定: P3）。カードではなく1行「✓ 参加中（自分のアイコン）⋯」。
 * 自分のコメントは出さない（参加者一覧の自分の行で見る・編集する）。
 * ⋯ →「参加を取り消す」→ 確認モーダル →「取り消す」で cancelRegistration を呼ぶ。
 */
function RegisteredRow({
  slug,
  viewer,
  cancelAction,
  closed,
  onCancelled,
}: {
  slug: string;
  viewer: RegistrantProfile;
  cancelAction: RegistrationAction;
  /** 受付終了後か（取り消すと再申込できないことを確認モーダルで伝える） */
  closed: boolean;
  /** 取り消しに成功したとき（親が、変わった先のカードへフォーカスを移す） */
  onCancelled: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="inline-flex h-10 max-w-full items-center gap-2 rounded-full border border-text-success/15 bg-success-feedback pl-3 pr-1.5">
      <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-text-success">
        <Check className="size-4 shrink-0" aria-hidden="true" />
        参加中
      </span>
      <ViewerAvatar viewer={viewer} />
      <span className="sr-only">{viewer.name}</span>
      <EventMoreMenu
        triggerRef={triggerRef}
        label="参加のメニュー"
        className="text-[var(--event-card-band-text)]"
        items={[
          {
            label: "参加を取り消す",
            destructive: true,
            onSelect: () => setConfirmOpen(true),
          },
        ]}
      />
      <CancelConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        slug={slug}
        closed={closed}
        cancelAction={cancelAction}
        onCancelled={onCancelled}
        returnFocusTo={triggerRef}
      />
    </div>
  );
}

/** 「参加を取り消しますか？」の確認モーダル（既存の Modal。ブラウザの confirm は使わない） */
function CancelConfirmModal({
  open,
  onOpenChange,
  slug,
  closed,
  cancelAction,
  onCancelled,
  returnFocusTo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  closed: boolean;
  cancelAction: RegistrationAction;
  onCancelled: () => void;
  /** 閉じたときにフォーカスを戻す先（⋯ ボタン） */
  returnFocusTo: { current: HTMLElement | null };
}) {
  const errorId = `event-cancel-error-${useId()}`;
  const [state, formAction, pending] = useActionState(
    async (
      prev: EventRegistrationActionResult | null,
      formData: FormData,
    ) => {
      const result = await cancelAction(prev, formData);
      if (result?.ok) {
        // 成功するとこの1行ごと「参加する」のカードに変わる（revalidatePath）。
        // 変わった先のカードへフォーカスを移すよう親に伝え、モーダルも閉じておく
        onCancelled();
        onOpenChange(false);
      }
      return result;
    },
    null,
  );

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        // 送信中は閉じない（Esc・外側クリックも）
        if (!pending) onOpenChange(next);
      }}
    >
      <ModalContainer
        className="max-w-sm gap-5"
        onCloseAutoFocus={(e) => {
          // メニューから開いたモーダルは、開く直前のフォーカス（消えたメニュー項目）に戻ろうとするので、
          // ⋯ が残っていれば ⋯ へ戻す。取り消し成功で ⋯ が消えたときは、変わった先のカードが
          // 自分でフォーカスを取るので、ここでは何もしない（body へ落とさない）
          e.preventDefault();
          const target = returnFocusTo.current;
          if (target?.isConnected) target.focus();
        }}
      >
        <form action={formAction} className="grid gap-5">
          <input type="hidden" name="slug" value={slug} />
          <ModalHeader hideCloseButton>
            <ModalTitle className="text-xl">参加を取り消しますか？</ModalTitle>
            <ModalDescription className="text-sm leading-relaxed text-text-secondary">
              取り消すと、参加者一覧からも表示されなくなります。
              {closed && (
                <>
                  <br />
                  <span className="font-medium text-text-error">
                    受付終了後に取り消すと、再度申し込むことはできません。
                  </span>
                </>
              )}
            </ModalDescription>
          </ModalHeader>
          <ErrorMessage id={errorId} state={state} />
          <ModalAction vertical={false}>
            <Button
              type="button"
              variant="secondary"
              size="large"
              className="flex-1"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              やめる
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="large"
              className="flex-1"
              disabled={pending}
              aria-describedby={state && !state.ok ? errorId : undefined}
            >
              {pending ? "取り消し中…" : "取り消す"}
            </Button>
          </ModalAction>
        </form>
      </ModalContainer>
    </Modal>
  );
}
