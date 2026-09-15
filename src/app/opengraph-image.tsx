import { generateOgImage, OG_SIZE } from "@/lib/og-image";

export const alt = "BONO - UIUXデザインを学ぶ";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOgImage({
    title: "UIUXデザインを体系的に学ぶ",
    description: "ロードマップ・レッスン・記事で効率的にスキルアップ",
  });
}
