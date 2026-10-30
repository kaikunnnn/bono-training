/**
 * #267 勉強法のまとめ記事（267-R スライス R1）
 *
 * 親子は 267-O 1章のまま: トップ > 勉強法（URL・パンくず・左ナビの点灯は変えない）。
 * 形は 267-R 4章（パンくず → h1 → 前置き → 目的から選ぶ → 節 01〜04 → 次に整えたいこと → 書いた人と確認日）、節は 5章。
 * 名前は 267-P 7章（検索の言葉）。文言は _data/hierarchy.ts の studyItems と studyArticle（二重に持たない）。
 * 7テーマはすべて節（h2）か小見出し（h3）に入るので、カードの一覧は置かない。
 * 未ログイン／会員は ?state=member（右下の確認用の切り替え）。本番は proxy の /dev 遮断で 404。
 * 次に整えたいことの直前に「コースで進める」（R1b）: 未ログインは料金ボタン、会員は続きから。
 */

import type { Metadata } from "next";
import { courses } from "../../../course-pages/data";
import { courseHref, lessonInfo, studyArticle } from "../_data/hierarchy";
import { DevStateToggle } from "../_parts/DevStateToggle";
import {
  ARTICLE,
  ArticleByline,
  ArticleCourseCta,
  ArticleHeader,
  ArticleSectionView,
  buildArticle,
  PurposeChooser,
} from "../_parts/article-parts";
import { NextSteps, PAGE } from "../_parts/hub-parts";
import { CAREER_BASE, CAREER_GUIDE_BASE, ROADMAP_HUB_BASE, STUDY_BASE, TOP_BASE, TROUBLES_HUB_BASE, withState } from "../_parts/top-parts";
import { Kari } from "../../_parts/shared";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "UIデザインの勉強法｜何から始めて、どう続けるか（#267 試作）",
  robots: { index: false, follow: false },
};

/** コースで進める（R1b）。コースの名前と期間は course-pages のデータから読む */
const FIRST_COURSE = courses["ui-design-first"];
// 無料で試せる範囲は、01 で紹介したレッスン（コースの中には入っていないので、コースとは分けて書く）
const FIRST_LESSON = lessonInfo("uidesignbeginner");

export default async function StudyArticlePage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams;
  const member = state === "member";
  const sections = await buildArticle("study", studyArticle);

  return (
    <div className="pb-24">
      <ArticleHeader crumbs={[{ label: "トップ", href: withState(TOP_BASE, member) }, { label: "勉強法" }]} article={studyArticle} />

      <div className={PAGE}>
        <PurposeChooser sections={sections} />

        <div className={cn(ARTICLE, "mt-16 flex flex-col gap-20 lg:mt-20 lg:gap-24")}>
          {sections.map((s) => (
            <ArticleSectionView key={s.item.id} section={s} />
          ))}
        </div>

        <div className={cn(ARTICLE, "mt-24 flex flex-col gap-16 border-t border-border-light pt-14")}>
          <ArticleCourseCta
            title={
              <>
                このページの順番で、コースを進める
                <Kari />
              </>
            }
            lead={
              member ? (
                <>
                  進めているコースがあれば、続きからどうぞ。まだ決めていなければ、{FIRST_COURSE.title.text.split("：")[0]}から始めると、このページの順番どおりに進められます。
                  <Kari />
                </>
              ) : (
                <>
                  ここまでの流れは、コースで順番どおりに進められます。
                  {FIRST_LESSON ? (
                    <>
                      登録の前に試すなら、01で紹介した「{FIRST_LESSON.title}」は
                      {FIRST_LESSON.freeCount === FIRST_LESSON.totalCount
                        ? `${FIRST_LESSON.totalCount}本の記事をすべて`
                        : `${FIRST_LESSON.totalCount}本の記事のうち${FIRST_LESSON.freeCount}本を`}
                      無料で読めます。
                    </>
                  ) : null}
                  <Kari />
                </>
              )
            }
            items={[
              {
                tag: "コース",
                label: FIRST_COURSE.title.text.split("：")[0],
                href: courseHref(FIRST_COURSE.slug),
                reason: `Todoアプリの画面をまねて作るところから、画面を部品と並びに分けて組み立てるまで（目安${FIRST_COURSE.period.text}）`,
              },
              {
                tag: "ロードマップ",
                label: "未経験からUI/UXデザイナーへの転職ロードマップ",
                href: withState(CAREER_BASE, member),
                reason: "転職までに学ぶことと準備を、順番どおりに進める",
              },
            ]}
            action={
              member
                ? { label: "続きから", href: "/mypage" }
                : {
                    label: "料金を見る",
                    href: "/subscription",
                    note: (
                      <>
                        メンバーになると、すべてのコースとレッスンを順番どおりに進められます。
                        <Kari />
                      </>
                    ),
                  }
            }
          />
          <NextSteps
            lead={
              <>
                学び方が決まったら、進む道と、そのあとのことも見ておきましょう。
                <Kari />
              </>
            }
            items={[
              { label: "キャリア", href: withState(CAREER_GUIDE_BASE, member), reason: "転職やポートフォリオの準備を知っておく" },
              { label: "悩みの一覧", href: withState(TROUBLES_HUB_BASE, member), reason: "作っていて手が止まったところから探す" },
              { label: "ロードマップ", href: withState(ROADMAP_HUB_BASE, member), reason: "何を、どの順で学ぶかを道のりで決める" },
            ]}
          />
          <ArticleByline author={studyArticle.author} checkedAt={studyArticle.checkedAt} />
        </div>
      </div>

      <DevStateToggle base={STUDY_BASE} member={member} />
    </div>
  );
}
