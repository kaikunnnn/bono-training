/**
 * フェーズ2 セレブレーション演出プレビュー（/dev・リプレイ可能）
 *
 * 本番コンポーネント（New/Change）をそのまま描画し、key の付け替えで再マウント＝
 * リプレイする薄いハーネス。演出ロジックは本番 components/subscription/celebration に一本化。
 * reduced-motion は OS 設定で自動フォールバック（このツールでは実物挙動を確認する）。
 */

"use client";

import { useState } from "react";
import { NewSubscriberSuccessContent } from "@/components/subscription/NewSubscriberSuccessContent";
import { ChangeSubscriberSuccessContent } from "@/components/subscription/ChangeSubscriberSuccessContent";

type Variant = "new" | "change";

export function CelebrationPreview() {
  const [variant, setVariant] = useState<Variant>("new");
  const [playId, setPlayId] = useState(0);

  return (
    <div>
      {/* コントロール */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <button
          type="button"
          onClick={() => setPlayId((n) => n + 1)}
          className="text-sm px-4 py-2 rounded-full font-noto-sans-jp bg-text-primary text-white hover:opacity-90"
        >
          ▶ リプレイ
        </button>

        <div className="flex gap-2">
          {(["new", "change"] as Variant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                setVariant(v);
                setPlayId((n) => n + 1);
              }}
              className={`text-sm px-4 py-2 rounded-full font-noto-sans-jp border transition-colors ${
                variant === v
                  ? "bg-text-primary text-white border-text-primary"
                  : "bg-surface text-text-primary/70 border-gray-300 hover:border-gray-400"
              }`}
            >
              {v === "new" ? "新規（紙吹雪あり）" : "変更（紙吹雪なし）"}
            </button>
          ))}
        </div>

        <span className="text-xs text-text-primary/45 font-noto-sans-jp">
          reduced-motion は OS 設定で自動フォールバック
        </span>
      </div>

      {/* プレビュー本体（playId で再マウント → リプレイ。本番コンポーネントを描画） */}
      <div className="bg-base rounded-[20px] border border-dashed border-gray-300 overflow-hidden">
        {variant === "new" ? (
          <NewSubscriberSuccessContent
            key={playId}
            planType="standard"
            duration={1}
            renewalDate="2026年9月7日"
            isLoading={false}
            error={null}
          />
        ) : (
          <ChangeSubscriberSuccessContent
            key={playId}
            planType="feedback"
            duration={1}
            renewalDate="2026年9月7日"
            isLoading={false}
            error={null}
          />
        )}
      </div>
    </div>
  );
}
