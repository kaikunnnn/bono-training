/**
 * ロードマップデータのエクスポート
 */

export { careerChangeRoadmap, default } from "./career-change";

// 将来の拡張用: 複数のロードマップを管理する場合
import { careerChangeRoadmap } from "./career-change";
import type { Roadmap } from "../../types/roadmap";

/** 全ロードマップ */
export const roadmaps: Roadmap[] = [careerChangeRoadmap];

/** スラッグでロードマップを取得 */
export const getRoadmapBySlug = (slug: string): Roadmap | undefined => {
  return roadmaps.find((roadmap) => roadmap.slug === slug);
};

/** IDでロードマップを取得 */
export const getRoadmapById = (id: string): Roadmap | undefined => {
  return roadmaps.find((roadmap) => roadmap.id === id);
};
