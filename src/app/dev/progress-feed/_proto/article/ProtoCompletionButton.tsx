"use client";

import { useState } from "react";
import { IconButton } from "@/components/ui/button/IconButton";
import { IconCheck } from "@/components/ui/icon-check";

/**
 * 「完了にする」ボタン（src/components/article/CompletionButton.tsx と同じ見た目・同じ演出設定）。
 * 本番は Server Action で保存するため、プロトでは見た目だけ同じにして状態は呼び出し側で持つ。
 */
export function ProtoCompletionButton({ isCompleted, onToggle }: { isCompleted: boolean; onToggle: () => void }) {
  const [burstKey, setBurstKey] = useState(0);

  // 未完了→完了にするときだけ burst を発火（本番は effect で検知している。結果は同じ）
  const handleClick = () => {
    if (!isCompleted) setBurstKey((k) => k + 1);
    onToggle();
  };

  return (
    <IconButton
      icon={<IconCheck isCompleted={isCompleted} tone="strong" animateOnComplete popMs={120} drawMs={360} />}
      label={isCompleted ? "完了済み" : "完了にする"}
      onClick={handleClick}
      burstKey={burstKey}
      burstSync="press-release-start"
      burstVariant="candy"
      burstDistanceScale={1.25}
      pressBounce
      pressBounceConfig={{ downMs: 520, upMs: 700, downScale: 0.92, upScale: 1.08 }}
    />
  );
}
