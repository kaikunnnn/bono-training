import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PROCESS_PHASES } from "./data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "プロダクトを作る",
  description: "プロダクトデザインのプロセスを体系的に学ぼう。発見→定義→設計→構築→成長の5フェーズ。",
  openGraph: { title: "プロダクトを作る | BONO" },
  alternates: { canonical: "/process" },
};

export default function ProcessPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8">
        {/* ヘッダー */}
        <section className="pt-8 pb-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold font-rounded-mplus text-text-primary mb-4">
            プロダクトを作る
          </h1>
          <p className="text-base text-text-muted font-noto-sans-jp leading-relaxed max-w-[560px] mx-auto">
            プロダクトデザインの5つのフェーズを体系的に学ぼう。各フェーズで何をすべきかがわかります。
          </p>
        </section>

        {/* フェーズカード（縦並び・接続線付き） */}
        <section className="pb-16">
          <div className="relative">
            {/* 接続線 */}
            <div className="absolute left-[39px] top-[60px] bottom-[60px] w-px bg-border-light hidden sm:block" />

            <div className="flex flex-col gap-4">
              {PROCESS_PHASES.map((phase, index) => (
                <Link
                  key={phase.slug}
                  href={`/process/${phase.slug}`}
                  className="group relative flex items-start gap-5 sm:gap-8 p-5 sm:p-6 rounded-[20px] hover:bg-white hover:shadow-[0px_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300"
                >
                  {/* フェーズ番号（円） */}
                  <div
                    className="w-[58px] h-[58px] rounded-full flex items-center justify-center shrink-0 relative z-10 text-white font-bold text-lg transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: phase.color }}
                  >
                    {phase.number}
                  </div>

                  {/* テキスト */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-baseline gap-3 mb-1.5">
                      <span className="text-[13px] font-bold tracking-wider uppercase" style={{ color: phase.color }}>
                        {phase.titleEn}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary font-rounded-mplus mb-2 flex items-center gap-2">
                      <span>{phase.emoji}</span>
                      {phase.titleJa}
                    </h2>
                    <p className="text-sm text-text-muted font-noto-sans-jp leading-relaxed">
                      {phase.description}
                    </p>
                  </div>

                  {/* 矢印 */}
                  <div className="flex items-center self-center shrink-0">
                    <ArrowRight className="w-5 h-5 text-text-disabled group-hover:text-text-link transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
