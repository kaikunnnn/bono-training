/**
 * ロードマップデータのエクスポート
 */

import { careerChangeRoadmap } from "./career-change";
import { uiDesignBeginnerRoadmap } from "./ui-design-beginner";
import { uiVisualRoadmap } from "./ui-visual";
import { informationArchitectureRoadmap } from "./information-architecture";
import { uxDesignRoadmap } from "./ux-design";
import type { Roadmap } from "../../types/roadmap";

// 個別エクスポート
export { careerChangeRoadmap } from "./career-change";
export { uiDesignBeginnerRoadmap } from "./ui-design-beginner";
export { uiVisualRoadmap } from "./ui-visual";
export { informationArchitectureRoadmap } from "./information-architecture";
export { uxDesignRoadmap } from "./ux-design";

// デフォルトエクスポート
export default careerChangeRoadmap;

/** 全ロードマップ */
export const roadmaps: Roadmap[] = [
  careerChangeRoadmap,
  uiDesignBeginnerRoadmap,
  uiVisualRoadmap,
  informationArchitectureRoadmap,
  uxDesignRoadmap,
];

/** スラッグでロードマップを取得 */
export const getRoadmapBySlug = (slug: string): Roadmap | undefined => {
  return roadmaps.find((roadmap) => roadmap.slug === slug);
};

/** IDでロードマップを取得 */
export const getRoadmapById = (id: string): Roadmap | undefined => {
  return roadmaps.find((roadmap) => roadmap.id === id);
};
