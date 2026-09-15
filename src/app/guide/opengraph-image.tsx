import { generateOgImage, OG_SIZE } from "@/lib/og-image";

export const alt = "読みもの | BONO";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOgImage({
    label: "Guide",
    title: "読みもの",
    description: "キャリア・学習・業界動向・ツールに関するガイド記事",
  });
}
