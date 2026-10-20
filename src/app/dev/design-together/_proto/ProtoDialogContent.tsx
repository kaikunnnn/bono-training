"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * 共通 Dialog の DialogContent と同じ見た目で、重なり順だけ上げたもの（#253）。
 *
 * 共通の DialogContent は z-50 固定。動画ページの複製は body 直下の z-[60] の層なので、
 * そのままだと動画ページで開いたダイアログが裏に隠れる。体験ガイド（z-[70]）より上の z-[80] にする。
 * クラスは src/components/ui/dialog.tsx の DialogContent からコピー（z と reduced-motion だけ変更）。
 */
export const ProtoDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay className="z-[80] motion-reduce:animate-none" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-[80] grid w-[calc(100%-32px)] max-w-md translate-x-[-50%] translate-y-[-50%] gap-6 border-0 bg-background px-7 py-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-4 rounded-3xl motion-reduce:animate-none",
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
ProtoDialogContent.displayName = "ProtoDialogContent";
