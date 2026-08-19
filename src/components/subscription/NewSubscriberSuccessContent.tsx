/**
 * 新規加入者の課金完了画面（Figma node 27-107 準拠）
 *
 * 「無駄を省き、オンボーディングへの単一導線にする」方針の本実装。
 * 新規加入 (?type=new) のときのみ表示する。プラン変更 (?type=updated) は
 * ChangeSubscriberSuccessContent を使う。
 *
 * フェーズ2: 完了時のセレブレーション演出（アイコン発光＋H1文字送り＋カスケード
 * ＋主CTA光沢＋残光ハロー＋アイコン位置からの紙吹雪）。reduced-motion は
 * celebration.module.css で無効化、紙吹雪は JS 側で prefersReducedMotion 抑止。
 *
 * Figma仕様・トークン対応表: rebono/issues「課金登録完了画面_新規_Figma仕様.md」
 */

"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";
import { getPlanDisplayName } from "@/lib/subscription-utils";
import { ONBOARDING_ENTRY_HREF } from "@/lib/onboarding";
import {
  AnimatedCheckIcon,
  AnimatedHeading,
  Reveal,
  CtaSheen,
  fireWelcomeConfetti,
  elementOrigin,
  prefersReducedMotion,
  CONFETTI_DELAY,
} from "./celebration";
import type { PlanType } from "@/types/subscription";

interface NewSubscriberSuccessContentProps {
  planType: PlanType | null;
  duration?: 1 | 3 | null;
  /** 次回更新日（整形済み文字列。例: "2026年9月7日"） */
  renewalDate: string | null;
  isLoading: boolean;
  error: string | null;
}

/** 7ステップ・オンボーディングのやること（文言は後日変更の可能性あり） */
const ONBOARDING_STEPS: { step: string; title: string }[] = [
  { step: "STEP 1-2", title: "コミュニティ（Slack）に参加する" },
  { step: "STEP 3-4", title: "トレーニング計画を立てる" },
  { step: "STEP 5-6", title: "質問・相談を1回やってみる" },
];

export const NewSubscriberSuccessContent: React.FC<
  NewSubscriberSuccessContentProps
> = ({ planType, duration, renewalDate, isLoading, error }) => {
  // ローディング表示（従来画面と同じトーン）
  if (isLoading) {
    return (
      <div className="container py-16 max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg text-muted-foreground font-noto-sans-jp">
                決済情報を確認しています...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="container py-16 max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-6 py-6">
              <p className="text-center text-muted-foreground font-noto-sans-jp">
                {error}
              </p>
              <Button asChild>
                <Link href="/account">アカウント設定を開く</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <NewSubscriberSuccessView
      planType={planType}
      duration={duration}
      renewalDate={renewalDate}
    />
  );
};

/**
 * 成功表示ビュー（データ確定後にマウント＝この瞬間に演出が走る）
 */
function NewSubscriberSuccessView({
  planType,
  duration,
  renewalDate,
}: {
  planType: PlanType | null;
  duration?: 1 | 3 | null;
  renewalDate: string | null;
}) {
  const iconRef = useRef<HTMLDivElement>(null);

  // 初回購入を祝う紙吹雪（アイコン位置から・reduced-motion時は抑止）
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = setTimeout(() => {
      fireWelcomeConfetti(elementOrigin(iconRef.current));
    }, CONFETTI_DELAY);
    return () => clearTimeout(t);
  }, []);

  const planName = planType ? getPlanDisplayName(planType) : "プラン";
  const durationText = duration ? (duration === 1 ? "1ヶ月" : "3ヶ月") : "";
  const fullPlanName = durationText
    ? `${planName}プラン（${durationText}）`
    : `${planName}プラン`;

  return (
    <div className="bg-base min-h-full">
      <div className="max-w-[600px] w-full mx-auto px-6 py-12">
        {/* 1. ヘッダー（左寄せ） */}
        <header className="flex flex-col items-start gap-3">
          <AnimatedCheckIcon ref={iconRef} />
          <AnimatedHeading
            text="BONOへようこそ！"
            className="font-rounded-mplus font-extrabold text-[28px] leading-tight text-text-primary tracking-[0.02em]"
          />
          <Reveal index={0}>
            <p className="text-sm text-text-primary/70 font-noto-sans-jp leading-relaxed">
              ご登録ありがとうございます。さっそくデザインを始めましょう。
            </p>
          </Reveal>
        </header>

        {/* 2. オンボーディング導線（白カード・CTAを主役に） */}
        <Reveal index={1} className="pt-10 block">
          <div className="bg-white rounded-[30px] p-6">
            <div className="flex flex-col gap-3 pb-6">
              <h2 className="font-rounded-mplus font-extrabold text-xl leading-9 text-text-secondary">
                最短で成長する進め方を設定する
              </h2>
              <p className="text-base leading-[27px] text-text-secondary/80 font-noto-sans-jp">
                7ステップでBONOをつかい倒す準備をしましょう
              </p>
            </div>

            {/* 主役CTA（光沢スイープ） */}
            <CtaSheen className="rounded-[16px]">
              <Button asChild variant="primary" size="large" className="w-full">
                <Link href={ONBOARDING_ENTRY_HREF}>
                  使い方をセットアップする
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CtaSheen>

            {/* STEPプレビュー（非リンク） */}
            <ul className="flex flex-col gap-3 pt-6">
              {ONBOARDING_STEPS.map((s) => (
                <li
                  key={s.step}
                  className="flex items-center gap-3 bg-white border border-gray-200/60 rounded-[16px] px-4 py-3"
                >
                  <span className="flex-shrink-0 self-start mt-0.5 text-[11px] font-bold text-[#102720] bg-[rgba(13,34,29,0.06)] rounded-md px-2 py-1 font-noto-sans-jp">
                    {s.step}
                  </span>
                  <p className="text-sm font-bold text-text-primary font-noto-sans-jp">
                    {s.title}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* 3. プラン情報 */}
        <Reveal index={2} className="pt-8 block">
          <p className="text-sm font-bold text-text-muted font-noto-sans-jp">
            プランの情報
          </p>
          <dl className="flex flex-col gap-2.5 pt-3">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-sm text-text-primary/60 font-noto-sans-jp">
                加入プラン
              </dt>
              <dd className="text-sm font-bold text-text-primary font-noto-sans-jp">
                {fullPlanName}
              </dd>
            </div>
            {renewalDate && (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-sm text-text-primary/60 font-noto-sans-jp">
                  次回更新日
                </dt>
                <dd className="text-sm font-bold text-text-primary font-noto-sans-jp">
                  {renewalDate}
                </dd>
              </div>
            )}
          </dl>
        </Reveal>

        {/* 4. アカウント設定リンク（控えめ・中央） */}
        <Reveal index={3} className="py-5 text-center block">
          <Link
            href="/account"
            className="text-sm text-text-primary underline underline-offset-2 font-noto-sans-jp"
          >
            プランの確認・変更はアカウント設定から
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
