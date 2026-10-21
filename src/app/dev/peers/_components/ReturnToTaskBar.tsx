"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { Book1, Edit2 } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { ASSIGNMENTS, COURSE_NAME, ME } from "../_data";

interface ReturnToTaskBarProps {
  label: string;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

/**
 * 下固定の「課題に戻る」と、押したあとの仮画面（列の中に出るシート）。
 * 列（max-w 約390px）の中に sticky で置くので、PCでもサイドナビには被らない。
 */
export function ReturnToTaskBar({
  label,
  open,
  onOpen,
  onClose,
}: ReturnToTaskBarProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className="sticky bottom-0 z-40 mt-auto">
      <div className="border-t border-[var(--card-border-subtle)] bg-base/95 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm">
        <Button
          size="large"
          className="w-full"
          onClick={onOpen}
          aria-haspopup="dialog"
        >
          <Edit2 size={18} color="currentColor" aria-hidden />
          {label}
        </Button>
      </div>

      {open && (
        <>
          {/* 列の中だけを暗くする（PCのサイドナビには掛けない） */}
          <div
            className="absolute inset-x-0 bottom-0 h-dvh bg-overlay motion-safe:animate-in motion-safe:fade-in"
            onClick={onClose}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="peers-return-title"
            className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-surface px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-6 shadow-[var(--shadow-popover)] motion-safe:animate-in motion-safe:slide-in-from-bottom-6 motion-safe:fade-in"
          >
            <p className="text-xs font-bold text-text-muted">
              プロトの仮画面（ここで課題のページが開きます）
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary">
              <Book1
                size={16}
                color="currentColor"
                variant="Bulk"
                aria-hidden
              />
              {COURSE_NAME}
            </p>
            <h2
              id="peers-return-title"
              className="mt-1.5 font-heading text-xl font-bold leading-snug text-text-primary"
            >
              課題{ME.assignmentNo}「{ASSIGNMENTS[ME.assignmentNo]}」に戻ります
            </h2>
            <p className="mt-3 rounded-[14px] bg-muted px-4 py-3 text-sm leading-relaxed text-text-secondary">
              前回は<b className="font-bold text-text-primary">{ME.stuckOn}</b>
              を考えているところで止まっています。今日は{ME.todayMinutes}
              分作業しました。
            </p>
            <Button
              ref={closeRef}
              variant="outline-ghost"
              size="large"
              className="mt-5 w-full"
              onClick={onClose}
            >
              <ArrowLeft aria-hidden />
              同期のページにもどる
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
