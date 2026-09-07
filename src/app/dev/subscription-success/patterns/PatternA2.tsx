/**
 * パターンA2: 普通 × アイキャッチ強調
 *
 * A の単一フォーカスは保ちつつ、オンボーディング導線を「アイキャッチ（ヒーロー）」に
 * 引き上げる。暖色バンド(bg-warm)のヒーロー内に、祝福見出し + 主役CTA を同居させ、
 * 画面を開いた瞬間に「次の一歩＝オンボーディング」が最も目立つようにする。
 * 登録内容の確認・7日間チラ見せ・アカウント導線はヒーローの下に従える。
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import {
  ACCOUNT_HREF,
  MOCK,
  ONBOARDING_ENTRY_HREF,
  ONBOARDING_PEEKS,
  type PreviewMock,
} from "./shared";

export function PatternA2({ mock = MOCK }: { mock?: PreviewMock }) {
  return (
    <div className="bg-base min-h-full">
      <div className="max-w-[600px] w-full mx-auto px-4 sm:px-6 py-12">
        {/* アイキャッチ = オンボーディング導線 */}
        <section className="rounded-[28px] bg-warm px-6 py-10 sm:py-12 text-center mb-8">
          <div className="inline-flex items-center gap-1.5 mb-4">
            <CheckCircle2 className="h-4 w-4 text-[#102720]" strokeWidth={2.25} />
            <span className="text-xs font-bold tracking-[1.2px] text-[#102720] font-rounded-mplus">
              登録完了・はじめよう
            </span>
          </div>

          <h1 className="font-rounded-mplus font-extrabold text-[26px] sm:text-[32px] leading-tight text-text-primary">
            BONOへようこそ！
          </h1>
          <p className="text-sm text-text-primary/70 font-noto-sans-jp leading-relaxed mt-3 max-w-[400px] mx-auto">
            7日間で、デザインを始める準備を一緒に整えます。
            まずはここから、迷わず進めましょう。
          </p>

          {/* 主役CTA（ヒーロー内に置いて最も目立たせる） */}
          <div className="mt-7 flex flex-col items-center gap-2">
            <Button asChild variant="primary" size="large" className="w-full sm:w-auto sm:px-12">
              <Link href={ONBOARDING_ENTRY_HREF}>
                オンボーディングを始める
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-text-primary/50 font-noto-sans-jp">
              所要7日間・ガイド付きなので迷いません
            </p>
          </div>
        </section>

        {/* 7日間の中身（非リンク・チラ見せ） */}
        <div className="mb-8">
          <p className="text-xs font-bold text-text-primary/45 font-noto-sans-jp mb-3 tracking-wider">
            7日間でやること
          </p>
          <ul className="flex flex-col gap-3">
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
        </div>

        {/* 登録内容の確認（控えめ） */}
        <div className="bg-surface rounded-[20px] border border-gray-200/70 p-5 mb-6">
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

        {/* アカウント管理導線（控えめ） */}
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
