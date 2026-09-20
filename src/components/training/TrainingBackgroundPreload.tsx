import { TRAINING_CARD_BACKGROUND_IMAGE } from "@/lib/training-images";

/**
 * 最初のカードが非同期データを待つ間に、共通のLCP背景を先読みする。
 */
export default function TrainingBackgroundPreload() {
  return (
    <link
      rel="preload"
      href={TRAINING_CARD_BACKGROUND_IMAGE}
      as="image"
      type="image/svg+xml"
      fetchPriority="high"
    />
  );
}
