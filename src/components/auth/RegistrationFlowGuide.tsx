"use client";

/**
 * 会員登録フロー説明コンポーネント
 *
 * bo-no.designでの会員登録を案内するための共通コンポーネント
 * ペイウォールのモーダルと新規登録ページで使用
 *
 * デザイン: Amie風のクリーンなリストスタイル
 */

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowLeft } from "lucide-react";

// bo-no.designのプランページURL
const BO_NO_DESIGN_PLAN_URL = "https://www.bo-no.design/plan";

export type RegistrationFlowStep = "pre-register" | "post-register";

interface RegistrationStepItemProps {
  stepNumber: number;
  icon: string;
  title: string;
  description?: string;
}

const RegistrationStepItem: React.FC<RegistrationStepItemProps> = ({
  stepNumber,
  icon,
  title,
  description,
}) => {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-9 h-9 mt-0.5 rounded-full border border-zinc-300 flex items-center justify-center flex-shrink-0 text-sm font-bold text-foreground/70">
        {stepNumber}
      </div>
      <div className="flex-1">
        <p className="font-medium font-noto-sans-jp text-[15px] text-foreground/90 flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </p>
        {description && (
          <p className="text-sm text-muted-foreground font-noto-sans-jp mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

interface RegistrationFlowGuideProps {
  /** 表示バリエーション: modal=モーダル内、page=ページ内 */
  variant?: "modal" | "page";
  /** bo-no.designに遷移時のコールバック（トラッキング等） */
  onNavigate?: () => void;
  /** ログインリンクを表示するか（モーダルで使用） */
  showLoginLink?: boolean;
  /** モーダルのヘッダーなど外側に、ステップ状態を通知する */
  onStepChange?: (step: RegistrationFlowStep) => void;
}

/**
 * 会員登録フロー説明コンポーネント
 */
export const RegistrationFlowGuide: React.FC<RegistrationFlowGuideProps> = ({
  variant = "page",
  onNavigate,
  showLoginLink = false,
  onStepChange,
}) => {
  // モーダル内でのみ状態切り替えを有効にする
  const [showNextStep, setShowNextStep] = useState(false);

  const handleClick = () => {
    onNavigate?.();
    window.open(BO_NO_DESIGN_PLAN_URL, "_blank");
    // モーダル内の場合は次のステップを表示
    if (variant === "modal") {
      setShowNextStep(true);
      onStepChange?.("post-register");
    }
  };

  const handleBack = () => {
    setShowNextStep(false);
    onStepChange?.("pre-register");
  };

  // 次のステップ表示（登録後）
  if (showNextStep && variant === "modal") {
    return (
      <div className="flex flex-col justify-center items-start mt-0">
        {/* 説明文 */}
        <p className="text-sm text-muted-foreground mb-5 font-noto-sans-jp">
          ボタンを押して、パスワード設定へ進んでください
        </p>

        {/* ボタンセクション */}
        <div className="w-full space-y-3">
          <Button
            asChild
            size="large"
            className="w-full font-noto-sans-jp text-base"
          >
            <Link href="/login?tab=first-time">
              パスワード設定画面へ
            </Link>
          </Button>

          <Button
            onClick={handleBack}
            variant="ghost"
            size="large"
            className="w-full font-noto-sans-jp text-base text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
        </div>
      </div>
    );
  }

  // 初期表示
  const steps: RegistrationStepItemProps[] = [
    {
      stepNumber: 1,
      icon: "🌐",
      title: "BONO本サイトでメンバーシップ登録",
      description: "決済もこちらで完了します",
    },
    {
      stepNumber: 2,
      icon: "🔑",
      title: "パスワードを設定してログイン",
      description: "このサイトに戻り「はじめての方へ」から設定",
    },
    {
      stepNumber: 3,
      icon: "🎉",
      title: "すべてのコンテンツを楽しもう！",
    },
  ];

  return (
    <div
      className={
        variant === "modal"
          ? "flex flex-col justify-center items-start mt-0"
          : "p-6 border rounded-3xl bg-white"
      }
    >
      {/* 説明文 */}
      <p className="text-sm text-muted-foreground mb-5 font-noto-sans-jp">
        このサイトはアルファ版のため、BONO本サイトでの登録が必要です
      </p>

      {/* ステップリスト */}
      <div className="space-y-4">
        {steps.map((step) => (
          <RegistrationStepItem
            key={step.stepNumber}
            stepNumber={step.stepNumber}
            icon={step.icon}
            title={step.title}
            description={step.description}
          />
        ))}
      </div>

      {/* セパレーター */}
      <div className="border-t border-dashed border-gray-200 my-6" />

      {/* ボタンセクション */}
      <div>
        <Button
          onClick={handleClick}
          size="large"
          className="w-full font-noto-sans-jp text-base"
        >
          BONO本サイトで登録する
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>

        {/* ログインリンク（オプション） */}
        {showLoginLink && (
          <p className="text-center mt-4 text-sm text-muted-foreground font-noto-sans-jp">
            アカウントをお持ちの方は{" "}
            <Link href="/login" className="text-primary hover:underline">
              ログイン
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default RegistrationFlowGuide;
