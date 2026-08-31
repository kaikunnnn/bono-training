/**
 * パターンB: 感情に訴える（ようこそヒーロー + 7日間チェックリスト）
 *
 * 「購入直後の祝福が解約の芽を減らす」「3 of 5 型チェックリストは強い動機付け」
 * の定石に寄せる。構造の違い:
 *  1. ようこそヒーロー（祝福を主張・プラン確認は compact な chip 行に畳む）
 *  2. 【主役】7日間チェックリスト（0/3 完了 + プログレスバー）で「進めたくなる」動機付け
 *  3. 大CTA「1日目からはじめる」
 *  4. 控えめなアカウント導線
 * スタイルはまだ最小。構造差を見てから詰める。
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import {
  ACCOUNT_HREF,
  MOCK,
  ONBOARDING_ENTRY_HREF,
  ONBOARDING_PEEKS,
  type PreviewMock,
} from "./shared";

export function PatternB({ mock = MOCK }: { mock?: PreviewMock }) {
  return (
    <div className="bg-base min-h-full">
      <div className="max-w-[600px] w-full mx-auto px-4 sm:px-6 py-12">
        {/* 1. ようこそヒーロー */}
        <section className="rounded-[24px] bg-[rgba(13,34,29,0.04)] border border-[rgba(13,34,29,0.08)] px-6 py-9 text-center mb-6">
          <div className="flex justify-center mb-4">
            <span className="flex items-center justify-center h-16 w-16 rounded-full bg-white shadow-[0px_0px_24px_rgba(13,34,29,0.12)]">
              <CheckCircle2 className="h-9 w-9 text-[#102720]" strokeWidth={2} />
            </span>
          </div>
          <h1 className="font-rounded-mplus font-extrabold text-2xl sm:text-[28px] text-text-primary leading-tight">
            ようこそ、BONOへ！
          </h1>
          <p className="text-sm text-text-primary/70 font-noto-sans-jp leading-relaxed mt-3 max-w-[420px] mx-auto">
            ご登録ありがとうございます。デザインを「やってみる」から「できる」へ。
            まずは7日間、一緒にスタートを切りましょう。
          </p>

          {/* プラン確認（compact な chip 行に畳む） */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            <span className="text-xs font-bold text-[#102720] bg-white border border-[rgba(13,34,29,0.1)] rounded-full px-3 py-1.5 font-noto-sans-jp">
              {mock.planLabel}（{mock.durationLabel}）
            </span>
            <span className="text-xs text-text-primary/60 bg-white border border-[rgba(13,34,29,0.1)] rounded-full px-3 py-1.5 font-noto-sans-jp">
              次回更新 {mock.renewalDate}
            </span>
          </div>
        </section>

        {/* 2. 【主役】7日間チェックリスト */}
        <section className="bg-surface rounded-[24px] border border-gray-200/70 p-6 mb-6">
          <div className="flex items-end justify-between gap-3 mb-4">
            <div>
              <p className="text-xs font-bold text-text-primary/45 font-noto-sans-jp tracking-wider mb-1">
                7日間のはじめかた
              </p>
              <h2 className="font-rounded-mplus font-extrabold text-lg text-text-primary">
                これを順にクリアしよう
              </h2>
            </div>
            <span className="flex-shrink-0 text-sm font-bold text-[#102720] font-noto-sans-jp">
              0/{ONBOARDING_PEEKS.length} 完了
            </span>
          </div>

          {/* プログレスバー（0%） */}
          <div className="h-2 w-full rounded-full bg-[rgba(13,34,29,0.08)] mb-5 overflow-hidden">
            <div className="h-full w-0 rounded-full bg-[#102720]" />
          </div>

          {/* チェックリスト */}
          <ul className="flex flex-col gap-2.5">
            {ONBOARDING_PEEKS.map((peek, i) => (
              <li
                key={peek.day}
                className={`flex items-start gap-3 rounded-[16px] px-4 py-3 border ${
                  i === 0
                    ? "bg-[rgba(13,34,29,0.03)] border-[rgba(13,34,29,0.12)]"
                    : "bg-white border-gray-200/60"
                }`}
              >
                <Circle
                  className="h-5 w-5 flex-shrink-0 mt-0.5 text-text-primary/25"
                  strokeWidth={2}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#102720] bg-[rgba(13,34,29,0.06)] rounded-md px-2 py-0.5 font-noto-sans-jp">
                      {peek.day}
                    </span>
                    {i === 0 && (
                      <span className="text-[11px] font-bold text-white bg-[#102720] rounded-md px-2 py-0.5 font-noto-sans-jp">
                        まずここから
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-text-primary font-noto-sans-jp mt-1">
                    {peek.title}
                  </p>
                  <p className="text-xs text-text-primary/60 font-noto-sans-jp leading-relaxed mt-0.5">
                    {peek.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* 大CTA */}
          <Button asChild variant="primary" size="large" className="w-full mt-6">
            <Link href={ONBOARDING_ENTRY_HREF}>
              1日目からはじめる
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>

        {/* 3. 控えめなアカウント管理導線 */}
        <div className="text-center">
          <Link
            href={ACCOUNT_HREF}
            className="text-sm text-text-primary/50 hover:text-text-primary underline underline-offset-4 font-noto-sans-jp"
          >
            プランの確認・変更はアカウント設定から
          </Link>
        </div>
      </div>
    </div>
  );
}
