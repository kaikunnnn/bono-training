/**
 * data ＝ v2「修了したら次は」で使うロードマップの行き先（モック）— #242
 * 区切りの名前は分析（242-B 問3）の「コースを束ねた道」のイメージ。（ ）付きはコースの外のやること。
 */

export interface RoadmapPath {
  name: string;
  href: string;
  stops: string[];
}

/** 未経験から転職: はじめて → 基礎 → 体験 → （ポートフォリオ）→ 転職活動 */
export const careerChangeRoadmap: RoadmapPath = {
  name: "未経験から転職",
  href: "/roadmap/uiux-career-change",
  stops: ["はじめて", "基礎", "体験", "ポートフォリオ", "転職活動"],
};

/** AIを使いデザイン力を上げたい: AI → 基礎 → （AIで実装の発展） */
export const aiDesignRoadmap: RoadmapPath = {
  name: "AIを使いデザイン力を上げたい",
  href: "/roadmap",
  stops: ["AI×UI入門", "基礎", "AIで実装の発展"],
};
