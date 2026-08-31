/**
 * パターンB2: 感情 × アイキャッチ強調
 *
 * B のチェックリスト動機付けは残しつつ、ダークな祝福ヒーロー(bg-training-dark)を
 * アイキャッチとして最上部に据え、その中に主役CTAを白ボタンで最も目立たせる。
 * 「お金を払ってよかった」というプレミアム感 + 次の一歩の明確さを両立するねらい。
 * 7日間チェックリスト(0/3)はヒーローの下に従える supporting 要素。
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

export function PatternB2({ mock = MOCK }: { mock?: PreviewMock }) {
  return (
    <div className="bg-base min-h-full">
      <div className="max-w-[600px] w-full mx-auto px-4 sm:px-6 py-12">
        {/* ダークな祝福ヒーロー = アイキャッチ（CTAを最も目立たせる）
            背景は本番実績のある bg-dark-section(#050423)。
            ※ bg-training-dark は globals.css で HSL数値のみ(hsl()ラップ無し)にマップされ
              色として無効→背景が描画されない既知の落とし穴のため使わない。 */}
        <section className="rounded-[28px] bg-dark-section px-6 py-11 text-center mb-6">
          <div className="flex justify-center mb-4">
            <span className="flex items-center justify-center h-16 w-16 rounded-full bg-white/10 border border-white/15">
              <CheckCircle2 className="h-9 w-9 text-text-inverse" strokeWidth={2} />
            </span>
          </div>

          <p className="text-xs font-bold tracking-[1.6px] text-text-inverse/60 font-rounded-mplus mb-2">
            WELCOME TO BONO
          </p>
          <h1 className="font-rounded-mplus font-extrabold text-[26px] sm:text-[32px] leading-tight text-text-inverse">
            ようこそ、BONOへ！
          </h1>
          <p className="text-sm text-text-inverse/75 font-noto-sans-jp leading-relaxed mt-3 max-w-[400px] mx-auto">
            ご登録ありがとうございます。デザインを「やってみる」から「できる」へ。
            まずは7日間、一緒にスタートを切りましょう。
          </p>

          {/* 主役CTA（白ボタンでダーク背景に映えさせる） */}
          <div className="mt-7 flex flex-col items-center gap-3">
            <Button asChild variant="outline" size="large" className="w-full sm:w-auto sm:px-12">
              <Link href={ONBOARDING_ENTRY_HREF}>
                1日目からはじめる
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            {/* プラン確認（compact chip・ダーク上） */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-bold text-text-inverse bg-white/10 border border-white/15 rounded-full px-3 py-1.5 font-noto-sans-jp">
                {mock.planLabel}（{mock.durationLabel}）
              </span>
              <span className="text-xs text-text-inverse/70 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 font-noto-sans-jp">
                次回更新 {mock.renewalDate}
              </span>
            </div>
          </div>
        </section>

        {/* 7日間チェックリスト（supporting） */}
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

          <div className="h-2 w-full rounded-full bg-[rgba(13,34,29,0.08)] mb-5 overflow-hidden">
            <div className="h-full w-0 rounded-full bg-[#102720]" />
          </div>

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
        </section>

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
