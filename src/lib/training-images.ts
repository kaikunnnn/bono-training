const OPTIMIZED_EMOJI_NAMES = new Set([
  "book",
  "building",
  "check",
  "circus",
  "coffee",
  "dancer",
  "home",
  "muscle",
  "parent",
  "watch",
  "wolf",
]);

const LOCAL_EMOJI_PATTERN = /^\/assets\/emoji\/([^/?]+)\.svg(?:\?.*)?$/;

export const TRAINING_CARD_BACKGROUND_IMAGE =
  "/assets/backgrounds/gradation/bg-gradation/bg-gradation-training-list.svg";

/**
 * トレーニング一覧で使う既存の巨大SVG（内部に1024px PNGを埋め込んだもの）を、
 * 同じ絵柄の軽量WebPへ差し替える。未登録の画像やCMS画像は変更しない。
 */
export function getOptimizedTrainingImage(source?: string): string {
  if (!source) {
    return "/assets/emoji/optimized/book.webp";
  }

  const match = source.match(LOCAL_EMOJI_PATTERN);
  const imageName = match?.[1];

  if (!imageName || !OPTIMIZED_EMOJI_NAMES.has(imageName)) {
    return source;
  }

  return `/assets/emoji/optimized/${imageName}.webp`;
}
