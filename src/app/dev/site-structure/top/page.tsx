/**
 * #267 新しいトップの試作（267-M 試作計画 / 中身は 267-L 6章・7章）
 *
 * S1: ルート・左ナビ（SiteStructureSidebar）・未ログイン／会員の切り替え（?state=member）
 * S2: ヒーローと4つの入口（ファーストビュー）
 * S3 以降（悩みの帯・コース・転職の道のり など）は次のスライスで足す。
 * 本番は proxy の DEV_ONLY_PATH_PREFIXES（/dev）で 404。
 */

import type { Metadata } from "next";
import { ProtoBar } from "../_parts/shared";
import { EntryTiles, TOP_BASE, TopHero } from "./_parts/top-parts";

export const metadata: Metadata = {
  title: "新しいトップの試作（#267）",
  robots: { index: false, follow: false },
};

export default async function SiteStructureTopPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;
  const member = state === "member";

  return (
    <div className="pb-24">
      <ProtoBar
        title="新しいトップ（ヒーローと4つの入口）"
        note="267-L の並びを今のBONOの部品で組んだ試作。左のナビも新しい並び。推測の文言には「仮」を付けています。"
        options={[
          { label: "未ログイン", href: TOP_BASE, active: !member },
          { label: "会員", href: `${TOP_BASE}?state=member`, active: member },
        ]}
      />

      <div className="mx-auto w-full max-w-[1440px]">
        <TopHero member={member} />
        <EntryTiles member={member} />

        <p className="mx-6 mt-16 rounded-[20px] border border-dashed border-border-light px-5 py-4 font-noto-sans-jp text-xs leading-[1.8] text-text-muted lg:mx-12">
          ここから下は次のスライスで足します（悩みの帯 → コース → 転職の道のり →一人で抱えない → 勉強法・キャリア → みんなの実績 → メンバーの案内）。
          {member ? "会員の見え方では、いちばん上に「続きから」の帯も足します。" : null}
        </p>
      </div>
    </div>
  );
}
