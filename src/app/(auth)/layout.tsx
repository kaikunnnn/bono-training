import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン・新規登録",
  description:
    "BONOにログインまたは新規登録して、UIUXデザインの学習を始めましょう。",
  openGraph: {
    title: "ログイン・新規登録 | BONO",
    description:
      "BONOにログインまたは新規登録して、UIUXデザインの学習を始めましょう。",
  },
  twitter: {
    title: "ログイン・新規登録 | BONO",
    description:
      "BONOにログインまたは新規登録して、UIUXデザインの学習を始めましょう。",
  },
  alternates: { canonical: "/login" },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
