"use client";

import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type FaqAccordionCategory = {
  title: string;
  items: { q: string; a: ReactNode }[];
};

/**
 * FAQ本体。カテゴリごとに見出し(h2)を置き、その配下の Q&A を
 * shadcn/ui の Accordion（type="multiple"：複数同時に開ける）で開閉表示する。
 *
 * UI: 各Q&Aを「白背景のタップしやすいカード」にする。
 *  - AccordionItem = 白カード（border + 角丸 + 影）。ui/accordion 既定の border-b は
 *    border（全辺）で上書きし、カード間は space-y で余白を取る。
 *  - AccordionTrigger は左右 padding をカードに持たせ、hover:underline は打ち消して
 *    「カード全体が押せる」体裁にする（hover / open で影を一段強く＝タップ affordance）。
 *  - 色・角丸・影は全てDSトークン参照（生値なし）。
 */
export function FaqAccordion({
  categories,
}: {
  categories: FaqAccordionCategory[];
}) {
  return (
    <div className="space-y-12">
      {categories.map((category) => (
        <section key={category.title}>
          <h2 className="mb-4 font-rounded-mplus text-xl font-bold text-foreground">
            {category.title}
          </h2>
          <Accordion type="multiple" className="w-full space-y-3">
            {category.items.map((item, index) => (
              <AccordionItem
                key={item.q}
                value={`${category.title}-${index}`}
                className="rounded-xl border border-border bg-white px-5 shadow-[0px_1px_1px_0px_rgba(0,0,0,0.08),0px_0px_3px_0px_rgba(0,0,0,0.04)] transition-shadow hover:border-border-strong data-[state=open]:shadow-md"
              >
                <AccordionTrigger className="gap-3 py-4 text-left text-base font-medium text-foreground hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ))}
    </div>
  );
}
