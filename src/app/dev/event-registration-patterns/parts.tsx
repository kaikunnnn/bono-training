"use client";

/**
 * /dev/event-registration-patterns 用の提案コンポーネント（#218 フォローアップ）。
 * 本番の EventOnsiteRegistration は変更せず、ここで「申込済み」の見せ方を比べる。
 * すべて手元の state だけで動く（Server Actions・DB には触れない）。
 */

import { useId, useRef, useState, type ReactNode, type Ref } from "react";
import { Check, MoreHorizontal } from "lucide-react";
import { User } from "iconsax-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Modal,
  ModalAction,
  ModalContainer,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import {
  DEFAULT_REGISTRATION_COMMENT,
  REGISTRATION_COMMENT_MAX_LENGTH,
  type RegistrantProfile,
} from "@/lib/events/onsite-registration";
import { DEADLINE_LABEL, KICKOFF_LABEL, ME, stripAvatars } from "./mock";

export type RegisteredPattern = "p1" | "p2" | "p3";

// ---------------------------------------------------------------------------
// カードの外枠（本番 EventOnsiteRegistration の RegistrationCard と同じクラス）
// 帯の右端に ⋯ を置けるよう、帯を relative にして右に action スロットを足した
// ---------------------------------------------------------------------------

export function CardShell({
  band,
  bandAction,
  deadlineLabel,
  children,
}: {
  band: ReactNode;
  /** 帯の右端に置く要素（⋯ ボタン） */
  bandAction?: ReactNode;
  deadlineLabel?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="w-full max-w-[640px] rounded-[24px] border border-[var(--event-card-border)] bg-[var(--event-card-bg)] text-left shadow-[var(--shadow-event-card)]">
      <div className="relative mx-px mt-px rounded-t-[22px] bg-[var(--event-card-band-bg)]">
        <p className="flex items-center justify-center gap-1 px-10 py-[7px] text-center text-sm font-medium leading-[21px] text-[var(--event-card-band-text)]">
          {band}
        </p>
        {bandAction && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {bandAction}
          </div>
        )}
      </div>
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

/** 自分のアイコン（20px）＋名前（本番の ViewerRow と同じ） */
export function ViewerRow({ viewer = ME }: { viewer?: RegistrantProfile }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <ViewerAvatar viewer={viewer} />
      <span className="min-w-0 truncate text-sm font-medium leading-6 text-[var(--event-card-ink)]">
        {viewer.name}
      </span>
    </div>
  );
}

function ViewerAvatar({ viewer = ME }: { viewer?: RegistrantProfile }) {
  return (
    <Avatar className="size-5 shrink-0">
      {viewer.avatarUrl && <AvatarImage src={viewer.avatarUrl} alt="" />}
      <AvatarFallback className="text-muted-foreground">
        <User size={12} color="currentColor" />
      </AvatarFallback>
    </Avatar>
  );
}

function SuccessCheck({ className }: { className?: string }) {
  return (
    <Check
      className={cn("size-4 shrink-0 text-text-success", className)}
      aria-hidden="true"
    />
  );
}

// ---------------------------------------------------------------------------
// ⋯ メニュー（共通）
// ---------------------------------------------------------------------------

/**
 * ⋯ ボタン＋メニュー。掲示板のコメント（QuestionCommentItem）と同じ組み方。
 * メニューから開くモーダルはメニューの外（兄弟）に置くこと（中に置くとメニューと一緒に閉じる）。
 */
export function MoreMenu({
  label,
  items,
  className,
  triggerRef,
}: {
  /** ボタンの読み上げ名（例: 「参加のメニュー」） */
  label: string;
  items: { label: string; onSelect: () => void; destructive?: boolean }[];
  className?: string;
  triggerRef?: Ref<HTMLButtonElement>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="ghost"
          size="unstyled"
          aria-label={label}
          className={cn(
            "h-7 w-7 rounded-full text-[var(--event-card-band-text)] hover:bg-black/[0.06] hover:text-text-primary data-[state=open]:bg-black/[0.06]",
            className,
          )}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            onSelect={item.onSelect}
            className={cn(
              "cursor-pointer",
              item.destructive && "text-destructive focus:text-destructive",
            )}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** 「参加を取り消しますか？」の確認モーダル（既存の Modal を使う） */
export function CancelConfirmModal({
  open,
  onOpenChange,
  closed,
  onConfirm,
  returnFocusTo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 受付終了後（取り消すと再申込できないことを添える） */
  closed: boolean;
  onConfirm: () => void;
  /**
   * 閉じたときにフォーカスを戻す先（⋯ ボタン）。メニューから開いたモーダルは、
   * 開く直前のフォーカス（＝消えたメニュー項目）に戻ろうとして body に落ちるため、明示的に戻す
   */
  returnFocusTo?: { current: HTMLElement | null };
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContainer
        className="max-w-sm gap-5"
        onCloseAutoFocus={(e) => {
          const target = returnFocusTo?.current;
          if (target?.isConnected) {
            e.preventDefault();
            target.focus();
          }
        }}
      >
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
        <ModalAction vertical={false}>
          <Button
            type="button"
            variant="secondary"
            size="large"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            やめる
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="large"
            className="flex-1"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            取り消す
          </Button>
        </ModalAction>
      </ModalContainer>
    </Modal>
  );
}

/** ⋯ →「参加を取り消す」→ 確認モーダル のひとまとまり */
export function CancelMenu({
  closed,
  onConfirm,
  triggerClassName,
}: {
  closed: boolean;
  onConfirm: () => void;
  triggerClassName?: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <MoreMenu
        triggerRef={triggerRef}
        label="参加のメニュー"
        className={triggerClassName}
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
        closed={closed}
        onConfirm={onConfirm}
        returnFocusTo={triggerRef}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// 未申込・受付終了（本番の見た目を写したもの。押すと手元の state だけ変わる）
// ---------------------------------------------------------------------------

export function UnregisteredCard({
  onRegister,
}: {
  onRegister: (comment: string) => void;
}) {
  const [comment, setComment] = useState(DEFAULT_REGISTRATION_COMMENT);
  const fieldId = `pattern-register-${useId()}`;
  return (
    <CardShell band="参加はこちら" deadlineLabel={DEADLINE_LABEL}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          onRegister(comment.trim());
        }}
      >
        <div className="flex flex-col gap-2">
          <ViewerRow />
          <label htmlFor={fieldId} className="sr-only">
            参加コメント
          </label>
          <Input
            id={fieldId}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={REGISTRATION_COMMENT_MAX_LENGTH}
            autoComplete="off"
            className="h-12 rounded-[24px] bg-surface px-[21px] text-base text-text-primary md:text-base"
          />
        </div>
        <Button
          type="submit"
          size="large"
          className="w-full"
          disabled={comment.trim().length === 0}
        >
          参加する
        </Button>
      </form>
    </CardShell>
  );
}

export function ClosedCard() {
  return (
    <CardShell band="受付終了">
      <p className="text-balance py-2 text-center text-base font-bold text-text-primary">
        このイベントの申込受付は終了しました
      </p>
    </CardShell>
  );
}

// ---------------------------------------------------------------------------
// 申込済みのパターン
// ---------------------------------------------------------------------------

/** P1 「参加中」カード（おすすめ） */
export function P1Card({
  closed,
  onCancel,
  commentsHref,
}: {
  closed: boolean;
  onCancel: () => void;
  /** 参加者のコメント一覧へのページ内リンク（無ければ出さない） */
  commentsHref?: string;
}) {
  return (
    <CardShell
      band={
        <>
          <SuccessCheck />
          参加中
        </>
      }
      bandAction={<CancelMenu closed={closed} onConfirm={onCancel} />}
    >
      <div className="flex flex-col gap-2">
        <ViewerRow />
        <p className="text-sm leading-6 text-text-secondary">
          {KICKOFF_LABEL} のキックオフでお会いしましょう！
        </p>
        {commentsHref && (
          <a
            href={commentsHref}
            className="self-start text-xs leading-5 text-text-muted underline-offset-2 hover:text-text-secondary hover:underline"
          >
            コメントは参加者一覧で編集できます
          </a>
        )}
      </div>
    </CardShell>
  );
}

/**
 * P2 無効ボタン「申込済み」。
 * 押せない状態だが、opacity-50 のグレー（＝条件未達・壊れて見える）ではなく、
 * 成功の薄い緑（bg-success-feedback / text-text-success）で「完了」と読めるようにする。
 * 本採用するなら ui/button.tsx に variant を足す（いまは提案なのでここで className を当てている）。
 */
export function P2Card({
  closed,
  onCancel,
}: {
  closed: boolean;
  onCancel: () => void;
}) {
  return (
    <CardShell band="参加はこちら">
      <div className="flex flex-col gap-4">
        <ViewerRow />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="large"
            variant="unstyled"
            disabled
            className="flex-1 border border-text-success/15 bg-success-feedback text-text-success shadow-none disabled:opacity-100"
          >
            <Check aria-hidden="true" />
            申込済み
          </Button>
          <CancelMenu
            closed={closed}
            onConfirm={onCancel}
            triggerClassName="h-12 w-12 shrink-0 rounded-[16px] border border-border-default bg-surface hover:bg-hover"
          />
        </div>
      </div>
    </CardShell>
  );
}

/** P3 コンパクト1行（カードなし） */
export function P3Compact({
  closed,
  onCancel,
}: {
  closed: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="inline-flex h-10 max-w-full items-center gap-2 rounded-full border border-text-success/15 bg-success-feedback pl-3 pr-1.5">
      <span className="flex items-center gap-1 text-sm font-bold text-text-success">
        <SuccessCheck />
        参加中
      </span>
      <ViewerAvatar />
      <CancelMenu closed={closed} onConfirm={onCancel} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// アイコン列（ラベル付きの提案）
// ---------------------------------------------------------------------------

export type StripVariant = "right-label" | "left-label";

/**
 * 参加者アイコン列（ラベル付き）。
 * - right-label（おすすめ）: アイコンの右に 1〜4人「参加中」/ 5人以上「N人が参加中」
 * - left-label: 左に「参加中のメンバー」＋アイコン（5人以上は右に「ほかN人」）
 */
export function LabeledAvatarStrip({
  count,
  avatarUrls,
  variant = "right-label",
}: {
  count: number;
  avatarUrls: (string | null)[];
  variant?: StripVariant;
}) {
  if (count <= 0) return null;
  const visible = avatarUrls.slice(0, 4);
  const avatars = (
    <div className="flex shrink-0 -space-x-2" aria-hidden="true">
      {visible.map((url, i) => (
        <Avatar key={i} className="size-8 ring-2 ring-background">
          {url && <AvatarImage src={url} alt="" />}
          <AvatarFallback className="text-muted-foreground">
            <User size={16} color="currentColor" />
          </AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
  const labelClass = "whitespace-nowrap text-sm text-text-muted";

  if (variant === "left-label") {
    return (
      <div
        role="group"
        aria-label={`${count}人が参加中`}
        className="flex flex-wrap items-center justify-center gap-2"
      >
        <span className={labelClass} aria-hidden="true">
          参加中のメンバー
        </span>
        {avatars}
        {count > 4 && (
          <span className={labelClass} aria-hidden="true">
            ほか{count - 4}人
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={`${count}人が参加中`}
      className="flex items-center gap-2"
    >
      {avatars}
      <span className={labelClass} aria-hidden="true">
        {count >= 5 ? `${count}人が参加中` : "参加中"}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// アイコン列＋申込カード（状態を受け取って描画するだけ）
// ---------------------------------------------------------------------------

/** 本人以外の参加人数（アイコン列のモック） */
export const OTHERS_COUNT = 4;

export function RegistrationArea({
  pattern,
  registered,
  closed,
  onRegister,
  onCancel,
  commentsHref,
  othersCount = OTHERS_COUNT,
}: {
  pattern: RegisteredPattern;
  registered: boolean;
  closed: boolean;
  onRegister: (comment: string) => void;
  onCancel: () => void;
  commentsHref?: string;
  othersCount?: number;
}) {
  const count = othersCount + (registered ? 1 : 0);
  // 新しい順なので、申込直後は本人のアイコンが先頭に来る
  const avatarUrls = registered
    ? [ME.avatarUrl, ...stripAvatars(othersCount)]
    : stripAvatars(othersCount);

  let card: ReactNode;
  if (!registered) {
    card = closed ? <ClosedCard /> : <UnregisteredCard onRegister={onRegister} />;
  } else if (pattern === "p1") {
    card = <P1Card closed={closed} onCancel={onCancel} commentsHref={commentsHref} />;
  } else if (pattern === "p2") {
    card = <P2Card closed={closed} onCancel={onCancel} />;
  } else {
    card = <P3Compact closed={closed} onCancel={onCancel} />;
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center",
        registered && pattern === "p3" ? "gap-3" : "gap-8",
      )}
    >
      <LabeledAvatarStrip count={count} avatarUrls={avatarUrls} />
      {card}
    </div>
  );
}
