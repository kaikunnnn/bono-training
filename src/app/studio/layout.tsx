import { notFound } from "next/navigation";

/**
 * /studio/* — 社内クリエイティブツールの恒久置き場（/dev とは別枠）。
 * /dev が「検証中のUI/デザイン検討」を並べる場所なのに対し、
 * /studio は「使い続ける社内ツール」を置く場所として区別する。
 *
 * 現状は /dev と同じく本番デプロイでは 404 にしている。
 * 一般公開する場合は、DSに沿ったUIへの作り込みを別途行ってからこのゲートを外すこと。
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  if (process.env.VERCEL_ENV === "production") {
    notFound();
  }
  return <>{children}</>;
}

export const metadata = {
  robots: { index: false, follow: false },
};
