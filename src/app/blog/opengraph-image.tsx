import { generateOgImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "ブログ | BONO";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOgImage({
    label: "Blog",
    title: "ブログ",
    description: "UIUXデザインに関するノウハウ・考え方を発信",
  });
}
