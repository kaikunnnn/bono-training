/**
 * /dev/course-pages/prototyping/roadmap/vs-course — コースとロードマップの違い（#243）
 *
 * issue 243「コースとの違い（整理）」の7点をそのまま並べる（決定済みの整理なので仮タグなし）。
 * 1点ごとに「見出し → コース／ロードマップの2つ」。md 未満は縦に積む。
 * 最後に実物（v2 の AI×UI 入門コース／未経験から転職ロードマップ）を並べて見比べる。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Map1, Teacher } from "iconsax-react";
import { getCourse } from "../../../data";
import { getRoadmap } from "../../../data/roadmaps";
import { KariProvider } from "../../../template/kari";
import { SectionHead, splitTitle } from "../../../template/shared";
import { ROADMAP_BASE } from "../parts";

export const metadata: Metadata = {
  title: "コースとロードマップの違い（プロト）",
  robots: { index: false, follow: false },
};

const POINTS: { title: string; course: string; roadmap: string }[] = [
  {
    title: "何の単位か",
    course: "スキルを1つ身につける単位。お金を払って進める中身",
    roadmap: "転職などの長いゴールまでの道。コースを束ねた地図",
  },
  {
    title: "中に並ぶもの",
    course: "ステップとレッスン（やること）",
    roadmap: "コース＋コースの外でやること（ポートフォリオ、フィードバック、応募）。レッスンは並べない",
  },
  {
    title: "「終わり」",
    course: "全レッスンを終えたら修了",
    roadmap: "行き先にたどり着いたか（応募できる状態か）で判断。区切りごとのチェックポイントで見る",
  },
  {
    title: "進み具合",
    course: "レッスン・記事単位の完了",
    roadmap: "どのコースまで終えたか（いまここ 2/5）",
  },
  {
    title: "答える問い",
    course: "「何をやれば、何ができるようになるか」",
    roadmap: "「自分はどこへ向かい、どの順で、今どこにいて、次に何をするか」",
  },
  {
    title: "期間",
    course: "数週間〜1、2ヶ月",
    roadmap: "数ヶ月〜1年",
  },
  {
    title: "無料で見られる範囲",
    course: "概要・カリキュラムまで。中身は会員",
    roadmap: "全部読める（迷っている人の入口）。進捗の記録は会員",
  },
];

function Side({ kind, text }: { kind: "course" | "roadmap"; text: string }) {
  const isCourse = kind === "course";
  const Icon = isCourse ? Teacher : Map1;
  return (
    <div className={isCourse ? "border-l-2 border-border-default pl-4" : "border-l-2 border-text-primary pl-4"}>
      <p className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
        <Icon size={14} color="currentColor" variant="Linear" />
        {isCourse ? "コース" : "ロードマップ"}
      </p>
      <p
        className={
          isCourse
            ? "mt-1 text-sm leading-[1.8] text-text-secondary"
            : "mt-1 text-sm font-bold leading-[1.8] text-text-primary"
        }
      >
        {text}
      </p>
    </div>
  );
}

const CARD =
  "group flex h-full flex-col rounded-[20px] border border-border-light bg-surface p-5 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)]";

export default function VsCoursePage() {
  const course = getCourse("ai-ui-design");
  const roadmap = getRoadmap("career-change");
  const courseTitle = course ? splitTitle(course.title.text) : null;

  return (
    <KariProvider>
      <div className="min-h-screen w-full bg-[var(--bg-base)] font-noto-sans-jp text-text-primary">
        <div className="mx-auto w-full max-w-[880px] px-4 pb-28 pt-8 md:px-10 md:pt-12">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
            <Link href={ROADMAP_BASE} className="hover:text-text-primary">
              ← ロードマップのプロト
            </Link>
          </div>

          <header className="pb-12 pt-8">
            <h1 className="font-heading text-[30px] font-bold leading-[1.4] tracking-[-0.05em] [word-break:keep-all] md:text-[40px]">
              コースと
              <wbr />
              ロードマップの
              <wbr />
              違い
            </h1>
            <p className="mt-4 max-w-[640px] text-[15px] leading-[1.9] text-text-secondary">
              コースは中身、ロードマップは地図です。レッスンを並べるのはコースだけで、ロードマップはどのコースをどの順で進め、コースの外で何をするかを示します。
            </p>
            <div className="mt-6 grid max-w-[560px] grid-cols-2 gap-4">
              <div className="border-t-2 border-border-default pt-3">
                <p className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                  <Teacher size={14} color="currentColor" variant="Linear" />
                  コース
                </p>
                <p className="mt-1 font-heading text-[22px] font-bold">中身</p>
              </div>
              <div className="border-t-2 border-text-primary pt-3">
                <p className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                  <Map1 size={14} color="currentColor" variant="Linear" />
                  ロードマップ
                </p>
                <p className="mt-1 font-heading text-[22px] font-bold">地図</p>
              </div>
            </div>
          </header>

          <section aria-labelledby="vs-points" className="border-t border-border-light py-14">
            <SectionHead id="vs-points" kicker="Difference" title="7つの違い" />
            <ul className="mt-6">
              {POINTS.map((p) => (
                <li key={p.title} className="border-b border-border-light py-6 last:border-b-0">
                  <h3 className="font-heading text-[17px] font-bold leading-[1.5]">{p.title}</h3>
                  <div className="mt-3 grid gap-4 md:grid-cols-2 md:gap-8">
                    <Side kind="course" text={p.course} />
                    <Side kind="roadmap" text={p.roadmap} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="vs-examples" className="border-t border-border-light pt-14">
            <SectionHead id="vs-examples" kicker="Examples" title="実物で見比べる" lead="同じサイトの中で、ページの役割がどう違うかを開いて確かめられます。" />
            <ul className="mt-8 grid gap-4 md:grid-cols-2">
              {course && courseTitle ? (
                <li>
                  <Link href={`/dev/course-pages/v2/${course.slug}`} className={CARD}>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                      <Teacher size={16} color="currentColor" variant="Linear" />
                      コースの例
                    </span>
                    <h3 className="mt-3 font-heading text-[17px] font-bold leading-[1.5]">{courseTitle.main}</h3>
                    {courseTitle.sub ? <p className="text-xs font-bold text-text-secondary">{courseTitle.sub}</p> : null}
                    <p className="mt-3 text-[13px] leading-[1.8] text-text-secondary">
                      ステップとレッスンが並び、全部終えたら修了。
                    </p>
                    <span className="mt-auto flex items-center gap-1 pt-4 text-xs font-bold">
                      コースのページを見る
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ) : null}
              {roadmap ? (
                <li>
                  <Link href={`${ROADMAP_BASE}/${roadmap.slug}`} className={CARD}>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                      <Map1 size={16} color="currentColor" variant="Linear" />
                      ロードマップの例
                    </span>
                    <h3 className="mt-3 font-heading text-[17px] font-bold leading-[1.5]">{roadmap.name}</h3>
                    <p className="mt-3 text-[13px] leading-[1.8] text-text-secondary">
                      コースとコースの外でやることが並び、行き先にたどり着いたら完了。
                    </p>
                    <span className="mt-auto flex items-center gap-1 pt-4 text-xs font-bold">
                      ロードマップのページを見る
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ) : null}
            </ul>
          </section>
        </div>
      </div>
    </KariProvider>
  );
}
