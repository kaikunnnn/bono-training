"use client";

import { ArrowLeft } from "lucide-react";
import { Book1, Edit2 } from "iconsax-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ASSIGNMENTS, COURSE_NAME, ME, assignmentLabel } from "../_data";

interface ReturnToTaskBarProps {
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 本文エリアの下に固定する「課題に戻る」と、押したあとの仮画面（中央のダイアログ）。
 * PCではサイドナビ（200px）にかからないよう lg:left-[200px] で本文エリアに合わせる。
 */
export function ReturnToTaskBar({
  label,
  open,
  onOpenChange,
}: ReturnToTaskBarProps) {
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--card-border-subtle)] bg-base/95 backdrop-blur-sm lg:left-[200px]">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <p className="hidden min-w-0 flex-1 text-sm text-text-secondary sm:block">
            <span className="text-xs text-text-muted">休憩中の課題</span>
            <br />
            <span className="font-bold text-text-primary">
              {assignmentLabel(ME.assignmentNo)}
            </span>
            <span className="text-xs text-text-muted">
              ・今日は{ME.todayMinutes}分作業
            </span>
          </p>
          <Button
            size="large"
            className="w-full sm:w-auto sm:min-w-[240px]"
            onClick={() => onOpenChange(true)}
            aria-haspopup="dialog"
          >
            <Edit2 size={18} color="currentColor" aria-hidden />
            {label}
          </Button>
        </div>
      </div>

      <ReturnDialog open={open} onOpenChange={onOpenChange} />
    </>
  );
}

/** 「課題に戻る」を押したあとの仮画面（中央のダイアログ）。マイページ組み込み版でも使う */
export function ReturnDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0">
        <p className="text-xs font-bold text-text-muted">
          プロトの仮画面（ここで課題のページが開きます）
        </p>
        <p className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary">
          <Book1 size={16} color="currentColor" variant="Bulk" aria-hidden />
          {COURSE_NAME}
        </p>
        <DialogTitle className="mt-1.5 font-heading text-[22px] font-bold leading-snug text-text-primary">
          課題{ME.assignmentNo}「{ASSIGNMENTS[ME.assignmentNo]}」に戻ります
        </DialogTitle>
        <DialogDescription asChild>
          <p className="mt-4 rounded-[14px] bg-muted px-4 py-3 text-sm leading-relaxed text-text-secondary">
            前回は
            <b className="font-bold text-text-primary">{ME.stuckOn}</b>
            を考えているところで止まっています。今日は{ME.todayMinutes}
            分作業しました。
          </p>
        </DialogDescription>
        <DialogClose asChild>
          <Button variant="outline-ghost" size="large" className="mt-6 w-full">
            <ArrowLeft aria-hidden />
            同期のページにもどる
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
