import { generateOgImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "ものづくりノート | BONO";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOgImage({
    label: "Notes",
    title: "ものづくりノート",
    description: "デザイン・サービス開発・クラフトについての気軽な読みもの",
  });
}
