/**
 * プラン変更者の課金完了画面（?type=updated）
 *
 * 新規加入画面（NewSubscriberSuccessContent / Figma node 27-107）と同じ骨組み・
 * トークンを流用しつつ、既存ユーザー向けにオンボーディングカードを外し、
 * 「変更が適用された確認」を主役にする。次の一歩は "学習に戻る"（/mypage）。
 *
 * フェーズ2演出: アイコン発光＋H1文字送り＋全体カスケード＋残光ハロー。
 * 既存ユーザーなので紙吹雪は出さない（初回購入ほど祝わず落ち着かせる）。
 * reduced-motion は celebration.module.css で無効化。
 *
 * スコープ（ユーザー確定）: 変更後プラン＋次回更新日＋確認文のシンプル版。
 * 「変更前→変更後」差分・適用日は DB に該当データが無いため出さない。
 */

"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";
import { getPlanDisplayName } from "@/lib/subscription-utils";
import {
  AnimatedCheckIcon,
  AnimatedHeading,
  Reveal,
  CtaSheen,
} from "./celebration";
import type { PlanType } from "@/types/subscription";

interface ChangeSubscriberSuccessContentProps {
  planType: PlanType | null;
  duration?: 1 | 3 | null;
  /** 次回更新日（整形済み文字列。例: "2026年9月7日"） */
  renewalDate: string | null;
  isLoading: boolean;
  error: string | null;
}

export const ChangeSubscriberSuccessContent: React.FC<
  ChangeSubscriberSuccessContentProps
> = ({ planType, duration, renewalDate, isLoading, error }) => {
  // ローディング表示（新規画面と同トーン）
  if (isLoading) {
    return (
      <div className="container py-16 max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg text-muted-foreground font-noto-sans-jp">
                プラン変更を確認しています...
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
          <AnimatedCheckIcon />
          <AnimatedHeading
            text="プラン変更が完了しました"
            className="font-rounded-mplus font-extrabold text-[28px] leading-tight text-text-primary tracking-[0.02em]"
          />
          <Reveal index={0}>
            <p className="text-sm text-text-primary/70 font-noto-sans-jp leading-relaxed">
              新しいプランが適用されました。引き続きBONOをお楽しみください。
            </p>
          </Reveal>
        </header>

        {/* 2. 変更後のプラン確認 + 主役CTA（白カード） */}
        <Reveal index={1} className="pt-10 block">
          <div className="bg-white rounded-[30px] p-6">
            <h2 className="font-rounded-mplus font-extrabold text-xl leading-9 text-text-secondary">
              変更後のプラン
            </h2>

            <dl className="flex flex-col gap-2.5 pt-4">
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

            {/* 主役CTA: 学習に戻る（光沢スイープ） */}
            <CtaSheen className="rounded-[16px] mt-6 block">
              <Button asChild variant="primary" size="large" className="w-full">
                <Link href="/mypage">
                  学習に戻る
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CtaSheen>
          </div>
        </Reveal>

        {/* 3. アカウント設定リンク（控えめ・中央） */}
        <Reveal index={2} className="py-5 text-center block">
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
};
