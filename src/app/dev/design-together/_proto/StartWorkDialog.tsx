"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DECLARATION_MAX, DECLARATION_PLACEHOLDER } from "./data";
import { useDesignTogether } from "./ProtoProvider";
import { ProtoDialogContent } from "./ProtoDialogContent";

/**
 * 「これからデザインやります」の宣言ダイアログ（機能A）。
 * 今日やることを一言（任意・60文字まで）。空でも始められる。
 */
export function StartWorkDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { startWork } = useDesignTogether();
  const [text, setText] = useState("");
  const remaining = DECLARATION_MAX - text.length;

  const handleOpenChange = (next: boolean) => {
    if (!next) setText("");
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <ProtoDialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">これからデザインやります</DialogTitle>
          <DialogDescription>
            今日やることを一言だけ決めておくと、迷わず始められます。書かなくても始められます。
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            startWork(text);
            setText("");
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dt-declaration" className="text-sm font-bold text-text-primary">
              今日やること<span className="ml-1 text-xs font-normal text-text-muted">（任意）</span>
            </label>
            <Textarea
              id="dt-declaration"
              value={text}
              maxLength={DECLARATION_MAX}
              onChange={(e) => setText(e.target.value.slice(0, DECLARATION_MAX))}
              placeholder={`例: ${DECLARATION_PLACEHOLDER}`}
              rows={2}
              className="min-h-[72px] resize-none rounded-[12px] text-base sm:text-sm"
              aria-describedby="dt-declaration-count"
            />
            <p
              id="dt-declaration-count"
              className={cn("self-end text-xs", remaining <= 10 ? "text-text-primary font-bold" : "text-text-muted")}
            >
              あと{remaining}文字
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>
              やめておく
            </Button>
            <Button type="submit">作業を始める</Button>
          </DialogFooter>
        </form>
      </ProtoDialogContent>
    </Dialog>
  );
}
