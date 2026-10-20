"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDesignTogether } from "./ProtoProvider";
import { ProtoDialogContent } from "./ProtoDialogContent";

/**
 * 「作業を終える」の確認（S1 の仮）。
 * 本来はここから日報の入力（S2）へ進む。S1 では終了だけを記録する。
 */
export function EndWorkDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { state, elapsedMinutes, endWork } = useDesignTogether();
  const declaration = state.mySession?.declaration;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ProtoDialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">おつかれさまでした</DialogTitle>
          <DialogDescription>
            {elapsedMinutes !== null ? `${elapsedMinutes}分、作業しました。` : "作業を終えます。"}
            {declaration && (
              <>
                <br />
                今日やること: {declaration}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <p className="rounded-[14px] bg-muted px-4 py-3 text-xs leading-relaxed text-text-secondary">
          ここで「ひとこと日報」を書く画面に進む予定です。日報は次のスライスで作ります。
        </p>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            作業を続ける
          </Button>
          <Button type="button" onClick={endWork}>
            作業を終える
          </Button>
        </DialogFooter>
      </ProtoDialogContent>
    </Dialog>
  );
}
