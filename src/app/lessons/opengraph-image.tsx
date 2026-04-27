import { generateOgImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "レッスン一覧 | BONO";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOgImage({
    label: "Lesson",
    title: "テーマ別に鍛えよう",
    description: "UIUXデザインを体系的に学べるレッスン一覧",
  });
}
