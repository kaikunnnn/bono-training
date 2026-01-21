import { IconButton } from "@/components/ui/button/IconButton";
import { IconCheck } from "@/components/ui/icon-check";

interface ArticleCompleteButtonProps {
  isCompleted: boolean;
  onClick?: () => void;
  /** false→true になった瞬間に増えるキー（burst発火用） */
  burstKey: number;
}

/**
 * 記事詳細の「完了にする」専用ボタン。
 * Devで決めたインタラクション設定をここに固定する。
 */
export function ArticleCompleteButton({ isCompleted, onClick, burstKey }: ArticleCompleteButtonProps) {
  return (
    <IconButton
      icon={
        <IconCheck
          isCompleted={isCompleted}
          tone="strong"
          animateOnComplete
          popMs={120}
          drawMs={360}
        />
      }
      label={isCompleted ? "完了済み" : "完了にする"}
      onClick={onClick}
      burstKey={burstKey}
      burstSync="press-release-start"
      burstVariant="candy"
      burstDistanceScale={1.25}
      pressBounce
      pressBounceConfig={{
        downMs: 520,
        upMs: 700,
        downScale: 0.92,
        upScale: 1.08,
      }}
    />
  );
}

