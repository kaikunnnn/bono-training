import type { Metadata } from "next";
import { OG_DEFAULTS } from "@/lib/seo-metadata";
import { redirect } from "next/navigation";
import { UserProvider } from "@/components/layout/UserProvider";
import { NewTopContent } from "@/components/top-next/NewTopContent";

// #236 キーワードSEO: オーナー決定の文言（一字一句変更しない）。
// root layout の title.template（"%s | BONO"）を避けるため absolute を使う。
const HOME_TITLE = "UI/UXデザインを実践で学ぶ｜動画とお題で手を動かすBONO";
const HOME_DESCRIPTION =
  "現役UIデザイナーがつくるUI/UXデザインの学習サービス。これから始める人も、現場のデザイナーやエンジニアも、動画とお題で手を動かしながらUI/UXデザインとAIの使い方を身につけられます。月額制。";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  openGraph: {
    ...OG_DEFAULTS,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
  alternates: { canonical: "/" },
};

/**
 * トップページ（Server Component / 本番 `/`）
 *
 * 挙動:
 * - ログイン済み → /mypage にリダイレクト（従来どおり）
 * - 未ログイン → 新トップ（NewTopContent）を表示
 *
 * 新トップの中身は `/top` と共通の NewTopContent（1ソース）。ここでは認証と
 * メタデータのみ担当する。到達するのは未ログインユーザーのみ（ログイン済みは上で
 * リダイレクト）なので Hero の入会CTAは常に表示（isMember=false 固定）。
 */
export default async function IndexPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  // UserProvider は React cache() でメモ化されており、LayoutWrapper と getUser を共有する
  const { user } = await UserProvider();

  if (user) {
    // 通常signup直後の welcome フラグは /mypage まで引き継ぐ（着地ページで歓迎トースト）
    const { welcome } = await searchParams;
    redirect(welcome === "1" ? "/mypage?welcome=1" : "/mypage");
  }

  return <NewTopContent isMember={false} surface="root" />;
}
