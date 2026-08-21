"use client";

/**
 * 相談導線の共通部品（無料相談＝お問い合わせ Google フォームへのセカンダリー導線）。
 *
 * 大原則: 課金CV（主CTA＝PlanCtaButton）を落とさないこと。相談導線は「主CTAより弱い見た目」で
 * 統一する。primary の塗り（bg-primary / variant="primary"）は絶対に使わない。
 * outline / link のみ。迷って離脱しそうな層をフォームに拾うためのセーフティネット。
 *
 * バリアント:
 *  - block   : 見出し＋短文＋ボタン（outline）。読了・未購入層を末尾で拾う（C1）。
 *  - link    : テキストリンクのみ（Button variant="link"）。迷いのピークに控えめ設置（C2/C3）。
 *  - floating: 画面右下の小さな固定ボタン（outline・sm）。本文を邪魔しないセーフティネット（C4）。
 *
 * 遷移先はお問い合わせ Google フォーム。別タブで開く（target="_blank" + rel="noopener noreferrer"）。
 * rule 03: 押せる見た目の要素は必ず共通 Button（asChild で <a> をラップ）を使う。
 */

import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/** 相談の受け皿（お問い合わせ Google フォーム）。 */
export const CONSULT_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfUE-AYkZsepc8NfDGO5FtPnHJI77-iMIMnx6KxSfgWVaUgOA/viewform?usp=header";

type ConsultCtaVariant = "block" | "link" | "floating";

interface ConsultCtaProps {
  variant: ConsultCtaVariant;
  /** link バリアントのラベル差し替え（C3 など文脈別に訴求を変えるため。未指定なら既定文言）。 */
  label?: string;
}

export function ConsultCta({ variant, label }: ConsultCtaProps) {
  // 全バリアント共通の外部リンク属性（別タブ＋安全な rel）。
  const linkProps = {
    href: CONSULT_FORM_URL,
    target: "_blank",
    rel: "noopener noreferrer",
  } as const;

  if (variant === "block") {
    return (
      <section className="rounded-2xl border border-border bg-surface px-6 py-8">
        {/* 見出し（主CTAより弱く見せるため font サイズは控えめ・左揃え） */}
        <h2 className="font-heading text-xl font-bold text-foreground">
          プラン選びに迷っていませんか？
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          どちらが合うか・続けられるか、無料で相談できます。
        </p>
        {/* outline（塗り無し）で主CTAより弱い見た目に統一 */}
        <Button asChild variant="outline" className="mt-5">
          <a {...linkProps}>無料で相談する</a>
        </Button>
      </section>
    );
  }

  if (variant === "floating") {
    // 右下に常設する最小ボタン。z はヘッダ（z-50）未満にして本文・ヘッダを邪魔しない。
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="shadow-lg"
        >
          <a {...linkProps}>
            <MessageCircle aria-hidden="true" />
            相談する
          </a>
        </Button>
      </div>
    );
  }

  // variant === "link": テキストリンクのみ（最も弱い導線）。
  return (
    <Button
      asChild
      variant="link"
      className="h-auto justify-start p-0 text-sm text-muted-foreground hover:text-foreground"
    >
      <a {...linkProps}>
        {label ?? "どっちが自分に合うか相談する"}
        <ArrowRight aria-hidden="true" />
      </a>
    </Button>
  );
}
