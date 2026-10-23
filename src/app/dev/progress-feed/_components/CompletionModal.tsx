"use client";

import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { MILESTONE_LABEL, contentLabel, findContent } from "../_data";

interface CompletionModalProps {
  contentId: string | null;
  onPublish: () => void;
  onSkip: () => void;
}

/**
 * 終えたときの完了モーダル（パターンAの「自動投稿の確認」）。
 * 見た目は QuestCompletionModal（緑の丸＋チェック・中央寄せ）を参考にしている。
 * 自分で文章は書かない。流すか流さないかだけ選ぶ。
 */
export function CompletionModal({ contentId, onPublish, onSkip }: CompletionModalProps) {
  const content = contentId ? findContent(contentId) : null;

  return (
    <Dialog
      open={contentId !== null}
      onOpenChange={(open) => {
        // 閉じる操作は「流す」にする（Aは何もしなくても流れる型のため）
        if (!open) onPublish();
      }}
    >
      <DialogContent className="max-w-md text-center">
        {content && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-background motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-300">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <div className="flex flex-col gap-2">
              <DialogTitle className="font-heading text-xl text-text-primary">
                おつかれさまでした！
              </DialogTitle>
              <DialogDescription className="text-sm text-text-secondary">
                {contentLabel(content)}を終えました
              </DialogDescription>
            </div>

            {/* フィードに流れる内容のプレビュー */}
            <div className="w-full rounded-[16px] border border-[var(--card-border-subtle)] bg-[var(--bg-base)] p-4 text-left">
              <p className="text-xs font-bold text-text-muted">フィードにこう流れます</p>
              <p className="mt-2 text-sm font-bold text-text-primary">
                あなたが{contentLabel(content)}を終えました
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center rounded-full bg-[var(--tag-category-bg)] px-2 py-0.5 text-xs font-medium text-foreground">
                  {MILESTONE_LABEL.first}
                </span>
                <span className="inline-flex items-center rounded-full bg-accent-orange px-2 py-0.5 text-xs font-bold text-text-inverse">
                  はじめて
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-text-muted">
                流れるのは「はじめての完了」「3日続いた」のような節目のときだけです。文章を書く必要はありません。
              </p>
            </div>

            <div className="flex w-full flex-col gap-2">
              <Button size="large" className="w-full" onClick={onPublish}>
                フィードに流す
              </Button>
              <Button variant="ghost" className="w-full text-text-muted" onClick={onSkip}>
                今回は流さない
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
