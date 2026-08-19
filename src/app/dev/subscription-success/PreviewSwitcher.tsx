/**
 * 課金完了ページの検討ビュー切替（/dev）
 *
 * タブを「新規加入者」「プラン変更者」「参考（旧デザイン）」の3グループに分けて、
 * どのフローの画面かを一目で分かるようにする。
 * - 新規加入者: 本番実装（Figma準拠）＋ 検討パターン A/A2/B/B2
 * - プラン変更者: 本番実装（変更確認を主役にした版）
 * - 参考: 旧デザイン（現状の SubscriptionSuccessContent、新規/変更トグルつき）
 */

"use client";

import { useState } from "react";
import { SuccessPreview } from "./SuccessPreview";
import { PatternA } from "./patterns/PatternA";
import { PatternB } from "./patterns/PatternB";
import { PatternA2 } from "./patterns/PatternA2";
import { PatternB2 } from "./patterns/PatternB2";
import { NewSubscriberSuccessContent } from "@/components/subscription/NewSubscriberSuccessContent";
import { ChangeSubscriberSuccessContent } from "@/components/subscription/ChangeSubscriberSuccessContent";
import { CelebrationPreview } from "./motion/CelebrationPreview";

type View = "final" | "change" | "motion" | "current" | "a" | "a2" | "b" | "b2";

interface TabDef {
  value: View;
  label: string;
}

interface TabGroup {
  key: string;
  title: string;
  hint: string;
  tabs: TabDef[];
}

const GROUPS: TabGroup[] = [
  {
    key: "new",
    title: "新規加入者",
    hint: "初回課金の完了画面。本番はオンボーディングへの単一導線（Figma準拠）。A/A2/B/B2 は検討パターン。",
    tabs: [
      { value: "final", label: "★本番実装（Figma準拠）" },
      { value: "a", label: "検討A（普通）" },
      { value: "a2", label: "検討A2（アイキャッチ）" },
      { value: "b", label: "検討B（感情）" },
      { value: "b2", label: "検討B2（アイキャッチ）" },
    ],
  },
  {
    key: "change",
    title: "プラン変更者",
    hint: "既存ユーザーの変更完了画面。オンボは出さず「変更確認＋学習に戻る」を主役に。",
    tabs: [{ value: "change", label: "★本番実装（変更確認）" }],
  },
  {
    key: "motion",
    title: "演出（フェーズ2）",
    hint: "完了時のセレブレーション演出。アイコン発光＋H1文字送り＋カスケード、新規は紙吹雪＋CTA光沢＋残光ハロー。リプレイ・reduced-motion確認つき。",
    tabs: [{ value: "motion", label: "▶ 演出プレビュー" }],
  },
  {
    key: "ref",
    title: "参考（旧デザイン）",
    hint: "改修前の現状画面。新規/変更を切り替えて比較用。",
    tabs: [{ value: "current", label: "現状（改修前）" }],
  },
];

const frame =
  "bg-base rounded-[20px] border border-dashed border-gray-300 overflow-hidden";

export function PreviewSwitcher() {
  const [view, setView] = useState<View>("motion");

  return (
    <div>
      {/* グループ別タブ */}
      <div className="flex flex-col gap-5 mb-8">
        {GROUPS.map((group) => (
          <div key={group.key}>
            <p className="text-xs font-bold text-text-primary/50 font-noto-sans-jp tracking-wider mb-1">
              {group.title}
            </p>
            <p className="text-xs text-text-primary/45 font-noto-sans-jp leading-relaxed mb-2.5">
              {group.hint}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.tabs.map((tab) => {
                const active = tab.value === view;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setView(tab.value)}
                    className={`text-sm px-4 py-2 rounded-full font-noto-sans-jp border transition-colors ${
                      active
                        ? "bg-text-primary text-white border-text-primary"
                        : "bg-surface text-text-primary/70 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 本体 */}
      {view === "final" && (
        <div className={frame}>
          <NewSubscriberSuccessContent
            planType="standard"
            duration={1}
            renewalDate="2026年9月7日"
            isLoading={false}
            error={null}
          />
        </div>
      )}
      {view === "change" && (
        <div className={frame}>
          <ChangeSubscriberSuccessContent
            planType="feedback"
            duration={1}
            renewalDate="2026年9月7日"
            isLoading={false}
            error={null}
          />
        </div>
      )}
      {view === "motion" && <CelebrationPreview />}
      {view === "current" && <SuccessPreview />}
      {view === "a" && <div className={frame}><PatternA /></div>}
      {view === "a2" && <div className={frame}><PatternA2 /></div>}
      {view === "b" && <div className={frame}><PatternB /></div>}
      {view === "b2" && <div className={frame}><PatternB2 /></div>}
    </div>
  );
}
