/**
 * モーダルコンポーネント
 *
 * Dialogをベースにした構造化されたモーダルUI
 * ヘッダー、タイトル、コンテンツ、アクションの4ブロック構成
 *
 * 使用例:
 * ```tsx
 * <Modal open={open} onOpenChange={setOpen}>
 *   <ModalHeader badge="はじめての方へ">
 *     <ModalTitle>
 *       タイトルテキスト
 *     </ModalTitle>
 *   </ModalHeader>
 *   <ModalContent>
 *     コンテンツ
 *   </ModalContent>
 *   <ModalAction>
 *     <Button>アクション</Button>
 *   </ModalAction>
 * </Modal>
 * ```
 */

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ============================================
// Modal Root
// ============================================
const Modal = DialogPrimitive.Root;

// ============================================
// Modal Trigger
// ============================================
const ModalTrigger = DialogPrimitive.Trigger;

// ============================================
// Modal Portal
// ============================================
const ModalPortal = DialogPrimitive.Portal;

// ============================================
// Modal Overlay
// ============================================
const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
ModalOverlay.displayName = 'ModalOverlay';

// ============================================
// Modal Container (メインコンテナ)
// ============================================
const ModalContainer = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <ModalPortal>
    <ModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // エンター/イグジットは「フェード + 下から上にふわっと」で統一。
        // 旧 shadcn の slide-in-from-left-1/2 / top-[48%]（中央寄せ補正）は
        // Tailwind v4 では translate プロパティと transform が二重適用になり
        // 「左上から右下に流れて見える」バグの原因になるため使わないこと。
        'fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-32px)] max-w-md translate-x-[-50%] translate-y-[-50%] gap-6 border-0 bg-background px-7 py-6 shadow-2xl rounded-3xl duration-300 ease-out data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-2 data-[state=closed]:duration-200',
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </ModalPortal>
));
ModalContainer.displayName = 'ModalContainer';

// ============================================
// Modal Header (バッジ + 閉じるボタン)
// ============================================
interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** ヘッダーに表示するバッジテキスト */
  badge?: string;
  /** バッジのカスタムクラス */
  badgeClassName?: string;
  /** 閉じるボタンを非表示にする */
  hideCloseButton?: boolean;
}

const ModalHeader = ({
  className,
  children,
  badge,
  badgeClassName,
  hideCloseButton = false,
  ...props
}: ModalHeaderProps) => (
  <div
    className={cn('flex items-start justify-between gap-4', className)}
    {...props}
  >
    <div className="flex flex-col gap-3 text-left flex-1">
      {badge && (
        <span
          className={cn(
            'inline-flex self-start px-3 py-1 text-xs font-bold text-primary border border-primary/30 rounded-full',
            badgeClassName
          )}
        >
          {badge}
        </span>
      )}
      <div className="flex flex-col space-y-3 text-left w-full h-fit">
        {children}
      </div>
    </div>
    {!hideCloseButton && (
      <DialogPrimitive.Close asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-full text-muted-foreground/60 hover:text-foreground flex-shrink-0 -mr-2 -mt-1"
        >
          <X className="h-5 w-5" strokeWidth={2.5} />
          <span className="sr-only">Close</span>
        </Button>
      </DialogPrimitive.Close>
    )}
  </div>
);
ModalHeader.displayName = 'ModalHeader';

// ============================================
// Modal Title
// ============================================
const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'mt-0 text-[22px] font-semibold leading-[1.4] tracking-tight text-foreground/90 font-noto-sans-jp',
      className
    )}
    {...props}
  />
));
ModalTitle.displayName = 'ModalTitle';

// ============================================
// Modal Description (アクセシビリティ用、通常は非表示)
// ============================================
const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
ModalDescription.displayName = 'ModalDescription';

// ============================================
// Modal Content (メインコンテンツエリア)
// ============================================
interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** コンテンツとアクション間に区切り線を表示 */
  withSeparator?: boolean;
}

const ModalContent = ({
  className,
  children,
  withSeparator = false,
  ...props
}: ModalContentProps) => (
  <div className={cn('', className)} {...props}>
    {children}
    {withSeparator && (
      <div className="border-t border-dashed border-gray-200 mt-6" />
    )}
  </div>
);
ModalContent.displayName = 'ModalContent';

// ============================================
// Modal Action (ボタンエリア)
// ============================================
interface ModalActionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** ボタンを縦並びにする（デフォルト: true） */
  vertical?: boolean;
}

const ModalAction = ({
  className,
  children,
  vertical = true,
  ...props
}: ModalActionProps) => (
  <div
    className={cn(
      vertical ? 'flex flex-col gap-3' : 'flex flex-row gap-3',
      className
    )}
    {...props}
  >
    {children}
  </div>
);
ModalAction.displayName = 'ModalAction';

// ============================================
// Modal Close (プログラム的に閉じるためのトリガー)
// ============================================
const ModalClose = DialogPrimitive.Close;

export {
  Modal,
  ModalTrigger,
  ModalPortal,
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalAction,
  ModalClose,
};
