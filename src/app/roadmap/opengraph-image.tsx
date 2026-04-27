import { generateOgImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "ロードマップ | BONO";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOgImage({
    label: "Roadmap",
    title: "ロードマップ",
    description: "目標から逆算して学ぶ、体系的なUIUXデザイン学習ルート",
  });
}
