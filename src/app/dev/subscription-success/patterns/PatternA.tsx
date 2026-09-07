/**
 * パターンA: 普通（単一フォーカス）
 *
 * 外部ベストプラクティス「次の一歩を1つに絞る」に忠実。上から
 *  1. 完了+祝福ヘッダー
 *  2. 登録内容の確認グループ（控えめ）
 *  3. 【主役】オンボーディング導線（大CTA + 7日間チラ見せ・非リンク）
 *  4. 控えめなアカウント管理導線
 * を素直に縦積みする。スタイルは /top 系トークン（font-rounded-mplus / 角丸カード）
 * を控えめに採り入れ、CTA は共通 Button（variant="primary"）を使用。
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import SectionHeading from "@/components/common/SectionHeading";
import { CheckCircle2, ArrowRight } from "lucide-react";
import {
  ACCOUNT_HREF,
  MOCK,
  ONBOARDING_ENTRY_HREF,
  ONBOARDING_PEEKS,
  type PreviewMock,
} from "./shared";

export function PatternA({ mock = MOCK }: { mock?: PreviewMock }) {
  return (
    <div className="bg-base min-h-full">
      <div className="max-w-[600px] w-full mx-auto px-4 sm:px-6 py-12">
        {/* 1. 完了 + 祝福ヘッダー */}
        <header className="flex flex-col items-center text-center gap-3 mb-8">
          <CheckCircle2 className="h-14 w-14 text-[#102720]" strokeWidth={1.75} />
          <h1 className="font-rounded-mplus font-extrabold text-2xl sm:text-3xl text-text-primary">
            BONOへようこそ！
          </h1>
          <p className="text-sm text-text-primary/70 font-noto-sans-jp leading-relaxed max-w-[420px]">
            ご登録ありがとうございます。ここから7日間で、
            デザインを始める準備を一緒に整えていきましょう。
          </p>
        </header>

        {/* 2. 登録内容の確認グループ（控えめ） */}
        <div className="bg-surface rounded-[20px] border border-gray-200/70 p-5 mb-10">
          <p className="text-xs font-bold text-text-primary/45 font-noto-sans-jp mb-3 tracking-wider">
            登録内容
          </p>
          <dl className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-sm text-text-primary/60 font-noto-sans-jp">プラン</dt>
              <dd className="text-sm font-bold text-text-primary font-noto-sans-jp">
                {mock.planLabel}（{mock.durationLabel}）
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-sm text-text-primary/60 font-noto-sans-jp">次回更新日</dt>
              <dd className="text-sm font-bold text-text-primary font-noto-sans-jp">
                {mock.renewalDate}
              </dd>
            </div>
          </dl>
        </div>

        {/* 3. 【主役】オンボーディング導線 */}
        <section className="mb-10">
          <SectionHeading
            label="はじめの一歩"
            title="まずは7日間、これをやってみよう"
            description="BONOの使い方から、デザインを始める最初の一歩まで。順番どおり進めれば迷いません。"
            className="mb-6"
          />

          {/* 大CTA */}
          <Button asChild variant="primary" size="large" className="w-full">
            <Link href={ONBOARDING_ENTRY_HREF}>
              オンボーディングを始める
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          {/* 7日間の中身（非リンク・チラ見せ） */}
          <ul className="mt-6 flex flex-col gap-3">
            {ONBOARDING_PEEKS.map((peek) => (
              <li
                key={peek.day}
                className="flex items-start gap-3 rounded-[16px] bg-surface border border-gray-200/60 px-4 py-3"
              >
                <span className="flex-shrink-0 mt-0.5 text-[11px] font-bold text-[#102720] bg-[rgba(13,34,29,0.06)] rounded-md px-2 py-1 font-noto-sans-jp">
                  {peek.day}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary font-noto-sans-jp">
                    {peek.title}
                  </p>
                  <p className="text-xs text-text-primary/60 font-noto-sans-jp leading-relaxed mt-0.5">
                    {peek.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 4. 控えめなアカウント管理導線 */}
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
