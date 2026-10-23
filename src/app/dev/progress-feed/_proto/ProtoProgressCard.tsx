"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Timer1 } from "iconsax-react";
import { Button } from "@/components/ui/button";
import {
  articleHref,
  firstIncompleteArticle,
  lessonPercentage,
  type ProtoLesson,
} from "./data";
import { useProto } from "./ProtoProvider";

/** 「今日はこれをやる」を押してから記事ページへ移るまで（帯に自分が出るのを見せる間） */
const START_NAVIGATE_DELAY_MS = 700;

/**
 * 進行中カード（src/app/mypage/sections/ProgressSectionClient.tsx の ProgressLessonCard を複製）。
 * inline style は本番からそのまま。変えたのは次の2点だけ:
 * - 「次👉」の帯を2つに分け、右に「今日はこれをやる」（＝始める）を足した
 * - 計測（trackHomeClick）を外し、遷移先を /dev/progress-feed 配下にした
 */
export function ProtoProgressCard({ lesson }: { lesson: ProtoLesson }) {
  const router = useRouter();
  const { state, dispatch } = useProto();
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isNextHovered, setIsNextHovered] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const progress = lessonPercentage(lesson, state.completedArticleIds);
  const next = firstIncompleteArticle(lesson, state.completedArticleIds);
  const currentStep = next?.title || "次のステップ";
  const nextArticleUrl = next ? articleHref(next.slug) : undefined;
  const isLearningThis = state.learning?.lessonId === lesson.id;

  const handleNextArticleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (nextArticleUrl) router.push(nextArticleUrl);
  };

  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!next || !nextArticleUrl || isStarting) return;
    dispatch({ type: "start", lessonId: lesson.id, articleSlug: next.slug });
    setIsStarting(true);
    setTimeout(() => router.push(nextArticleUrl), START_NAVIGATE_DELAY_MS);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", position: "relative", width: "100%", height: "100%" }}>
      {/* メインカード（本番はレッスン詳細へ遷移。プロトでは続きの記事へ） */}
      <div
        role="article"
        aria-label={`${lesson.title}の進捗状況`}
        onClick={() => nextArticleUrl && router.push(nextArticleUrl)}
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={() => setIsCardHovered(false)}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          paddingLeft: "24px",
          paddingRight: "24px",
          paddingTop: "19px",
          paddingBottom: "19px",
          marginBottom: "-18px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
          flexShrink: 0,
          boxShadow: isCardHovered ? "0px 4px 16px rgba(0, 0, 0, 0.12)" : "0px 2px 8px rgba(0, 0, 0, 0.08)",
          cursor: "pointer",
          transition: "box-shadow 0.2s ease",
          zIndex: 2,
          overflow: "clip",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flex: "1 1 0", minWidth: 0 }}>
            <div style={{ width: 48, height: 73, borderTopRightRadius: 8, borderBottomRightRadius: 8, position: "relative", flexShrink: 0, overflow: "hidden", backgroundColor: "#F5F5F5" }}>
              <Image src={lesson.iconImageUrl} alt="" fill sizes="48px" style={{ objectFit: "cover", pointerEvents: "none" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, alignItems: "flex-start", minWidth: 0, flex: "1 1 0" }}>
              <div style={{ fontFamily: "'Rounded Mplus 1c', sans-serif", fontWeight: 600, fontSize: 16, color: "#000000", width: "100%", maxWidth: 320 }}>
                <p style={{ margin: 0, lineHeight: "normal" }}>{lesson.title}</p>
              </div>
              <div
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{ backgroundColor: "#EAEAEA", height: 6, width: "100%", borderRadius: 1000, overflow: "clip", position: "relative" }}
              >
                <div style={{ backgroundColor: "#000000", width: `${progress}%`, height: 6, minWidth: 1, borderRadius: 40, transition: "width 0.3s ease" }} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", fontFamily: "'Rounded Mplus 1c', sans-serif", fontWeight: 700, color: "#000000", whiteSpace: "nowrap", flexShrink: 0, lineHeight: 0 }}>
            <div style={{ fontSize: 24, letterSpacing: "-0.48px" }}>
              <p style={{ lineHeight: "normal", margin: 0 }}>{progress}</p>
            </div>
            <div style={{ fontSize: 10 }}>
              <p style={{ lineHeight: "normal", margin: 0 }}>%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 下部: 次の記事 ＋ 今日はこれをやる（押せる要素は入れ子にせず横に並べる） */}
      <div
        style={{
          backgroundColor: isNextHovered ? "#E5E5E5" : "#EFEFEF",
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          paddingTop: 18,
          display: "flex",
          alignItems: "center",
          width: "100%",
          zIndex: 1,
          transition: "background-color 0.2s ease",
        }}
      >
        <div
          role="link"
          tabIndex={0}
          onClick={handleNextArticleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleNextArticleClick(e);
          }}
          onMouseEnter={() => setIsNextHovered(true)}
          onMouseLeave={() => setIsNextHovered(false)}
          style={{ display: "flex", gap: 8, alignItems: "center", paddingLeft: 24, paddingRight: 8, paddingTop: 8, paddingBottom: 8, flex: "1 1 0", minWidth: 0, cursor: "pointer" }}
        >
          <span style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 400, fontSize: 10, color: "#4B5563", flexShrink: 0, whiteSpace: "nowrap" }}>
            <span style={{ fontWeight: 700 }}>次</span>👉️
          </span>
          <span style={{ fontFamily: "'Inter', 'Noto Sans JP', sans-serif", fontWeight: 700, fontSize: 12, lineHeight: "20px", color: "#000000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
            {currentStep}
          </span>
        </div>
        {next && (
          <div className="shrink-0 pr-3">
            {isLearningThis || isStarting ? (
              <Button
                size="sm"
                variant="secondary"
                className="h-8 px-3 text-xs text-text-success disabled:opacity-100"
                disabled
              >
                <Check strokeWidth={2.5} />
                学習中
              </Button>
            ) : (
              <Button size="sm" className="h-8 px-3 text-xs" onClick={handleStart}>
                <Timer1 size={14} color="currentColor" />
                今日はこれをやる
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
