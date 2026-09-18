import localFont from "next/font/local";

const lineSeedJP = localFont({
  src: [
    {
      path: "../../../../.claude/design-system/fonts/LINESeedJP_OTF_Th.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../../../.claude/design-system/fonts/LINESeedJP_OTF_Rg.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../../.claude/design-system/fonts/LINESeedJP_OTF_Bd.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../../../.claude/design-system/fonts/LINESeedJP_OTF_Eb.otf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-line-seed-jp",
  display: "swap",
  preload: false,
});

export default function WorkshopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={lineSeedJP.variable}>{children}</div>;
}
