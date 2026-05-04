"use client";

import { useState, type ReactNode, type CSSProperties } from "react";

interface HoverCardProps {
  children: ReactNode;
  className?: string;
  /** ホバー時のtransform（例: "translateY(-4px) scale(1.01)"） */
  hoverTransform?: string;
  /** ホバー時のbox-shadow */
  hoverShadow?: string;
  /** 通常時のbox-shadow */
  baseShadow?: string;
  /** トランジションの時間と関数（例: "0.2s ease"） */
  transitionTiming?: string;
  /** 追加のstyle */
  style?: CSSProperties;
  /** HTML要素（デフォルト: div） */
  as?: "div" | "article";
  onClick?: () => void;
}

/**
 * ホバーアニメーション付きカードラッパー
 * Tailwind v4のhover:クラスが正しくアニメーションしない問題を回避するため、
 * onMouseEnter/onMouseLeaveで直接styleを切り替える。
 */
export function HoverCard({
  children,
  className = "",
  hoverTransform = "translateY(-4px) scale(1.01)",
  hoverShadow = "0px 4px 18px 0px rgba(0,0,0,0.16)",
  baseShadow = "0px 1px 8px 0px rgba(0,0,0,0.08)",
  transitionTiming = "0.2s ease",
  style,
  as: Tag = "div",
  onClick,
}: HoverCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Tag
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        ...style,
        transform: isHovered ? hoverTransform : "none",
        boxShadow: isHovered ? hoverShadow : baseShadow,
        transition: `transform ${transitionTiming}, box-shadow ${transitionTiming}`,
        willChange: "transform",
      }}
    >
      {children}
    </Tag>
  );
}
