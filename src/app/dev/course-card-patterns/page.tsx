/**
 * /dev/course-card-patterns — コースカードのパターン比較（#235 コース再編）
 *
 * コース再編に向けて、コースカードの見せ方3案（A / B / C）を同じ2コースで並べて比べる。
 * 見るポイントは「このコースなら自分の悩み・不安が解決しそう」と思える情報量があるか、
 * 2枚並べたときにどう見えるか。データはモック（./mock.ts）。
 */

import { Metadata } from "next";
import Link from "next/link";
import { CourseCardPatterns } from "./patterns";

export const metadata: Metadata = {
  title: "コースカードのパターン比較 (/dev/course-card-patterns)",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-base">
      <div className="mx-auto w-full min-w-0 max-w-[1440px] px-4 py-12 sm:px-6">
        <header className="mb-6 border-b border-gray-200 pb-4">
          <p className="font-noto-sans-jp text-sm font-bold text-text-primary/50">
            <Link href="/dev" className="underline hover:text-text-primary">
              Dev Portal
            </Link>{" "}
            / #235 コース再編
          </p>
          <h1 className="mt-1 font-rounded-mplus text-2xl font-bold text-text-primary">
            コースカードのパターン比較
          </h1>
          <p className="mt-2 font-noto-sans-jp text-sm font-bold">
            <Link href="/dev/course-card-patterns/top" className="text-text-link underline hover:text-text-link-hover">
              トップに横3枚で並べた見え方を見る →
            </Link>
          </p>
          <p className="mt-2 font-noto-sans-jp text-sm leading-relaxed text-text-primary/60">
            コースカードの見せ方を3案で比べるページです。どの案も同じ2コース（AIコース／段階1のスタイリング）を2列で並べています。
            見るポイントは「このコースなら自分の悩みや不安が解決しそう」と思える情報があるかと、2枚並べたときの見え方です。
            A＝Figma案1（説明文＋得られる変化・期間・制作物）、B＝Figma案2（1行の変化＋期間・制作物＋制作者・価格）、C＝対象者を見せる案（タイトル→こんな人向け→このコースで得られる変化→期間・制作物）、C2＝Bベースで対象者を下に置く案（タイトル→できること→期間・制作物→こんな人向け）。
            文言は実際に出す想定に近い形で書いています。Figma に無く今回仮で作った文言は、「仮タグを表示」をオンにすると「仮」タグで見分けられます（AIコースの不安、段階1のタイトル・説明文・得られる変化・1行の変化・期間・制作物・制作者）。難易度は未決定のため出していません。
          </p>
        </header>

        <CourseCardPatterns />
      </div>
    </div>
  );
}
