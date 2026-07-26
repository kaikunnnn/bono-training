import { notFound } from "next/navigation";

/**
 * /component/* — 実装済みUIコンポーネントの見た目を確認するための社内ページ置き場。
 * /dev・/studio と同じく本番デプロイでは 404 にする。
 */
export default function ComponentLayout({ children }: { children: React.ReactNode }) {
  if (process.env.VERCEL_ENV === "production") {
    notFound();
  }
  return <>{children}</>;
}

export const metadata = {
  robots: { index: false, follow: false },
};
