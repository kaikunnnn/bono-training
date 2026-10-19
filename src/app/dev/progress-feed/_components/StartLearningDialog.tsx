"use client";

import { useState } from "react";
import { Book } from "iconsax-react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CONTENTS } from "../_data";

interface StartLearningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (contentId: string) => void;
}

/** 「学習を始める」: 何をやるか選んで開始する（Studyplus の「始めるときに宣言」） */
export function StartLearningDialog({ open, onOpenChange, onStart }: StartLearningDialogProps) {
  const [selected, setSelected] = useState(CONTENTS[0].id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">今日は何を進めますか？</DialogTitle>
          <DialogDescription>
            開始すると「今やっている人」にあなたが表示されます。終えたら「終える」を押してください。
          </DialogDescription>
        </DialogHeader>

        <div role="radiogroup" aria-label="進めるコンテンツ" className="flex flex-col gap-2">
          {CONTENTS.map((c) => {
            const active = selected === c.id;
            return (
              <Button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={active}
                variant="unstyled"
                size="unstyled"
                onClick={() => setSelected(c.id)}
                className={cn(
                  "flex w-full items-center justify-start gap-3 whitespace-normal rounded-[16px] border p-3 text-left font-normal",
                  active
                    ? "border-[var(--reaction-active-border)] bg-[var(--reaction-active-bg)] hover:bg-[var(--reaction-active-bg)]"
                    : "border-[var(--card-border-subtle)] bg-surface hover:bg-[var(--bg-hover)]",
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-muted text-text-secondary">
                  <Book size={18} color="currentColor" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-text-primary">{c.title}</span>
                  <span className="block text-xs text-text-secondary">
                    次のレッスン:「{c.lesson}」・目安{c.minutes}分
                  </span>
                </span>
                {active && <Check className="text-text-link" strokeWidth={2.5} />}
              </Button>
            );
          })}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            やめておく
          </Button>
          <Button
            onClick={() => {
              onStart(selected);
              onOpenChange(false);
            }}
          >
            開始する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
