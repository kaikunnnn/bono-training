/**
 * 空モチーフ系ツール(雲/星/山)の時間帯プリセット。
 * モチーフごとに色の意味が違うため、モチーフ単位でオブジェクトを分けている。
 */

export interface CloudTimePreset {
  label: string;
  skyTop: string;
  skyBottom: string;
  cloudColor: string;
}

export const CLOUD_TIME_PRESETS: Record<"morning" | "noon" | "night", CloudTimePreset> = {
  morning: { label: "朝", skyTop: "#ffb199", skyBottom: "#fff1e0", cloudColor: "#ffffff" },
  noon: { label: "昼", skyTop: "#6ec3f4", skyBottom: "#eaf6ff", cloudColor: "#ffffff" },
  night: { label: "夜", skyTop: "#0d1b3e", skyBottom: "#223561", cloudColor: "#b9c4e0" },
};

export interface StarTimePreset {
  label: string;
  skyTop: string;
  skyBottom: string;
  starColor: string;
}

export const STAR_TIME_PRESETS: Record<"dusk" | "night" | "deepNight", StarTimePreset> = {
  dusk: { label: "夕", skyTop: "#2b1f4a", skyBottom: "#e8926a", starColor: "#fff4d6" },
  night: { label: "夜", skyTop: "#0a1030", skyBottom: "#1a2550", starColor: "#eef2ff" },
  deepNight: { label: "深夜", skyTop: "#05070f", skyBottom: "#10142a", starColor: "#ffffff" },
};

export interface MountainTimePreset {
  label: string;
  skyTop: string;
  skyBottom: string;
  /** 奥から手前へ(手前ほど濃い) */
  layerColors: [string, string, string];
}

export const MOUNTAIN_TIME_PRESETS: Record<"morning" | "noon" | "evening", MountainTimePreset> = {
  morning: {
    label: "朝",
    skyTop: "#ffb199",
    skyBottom: "#ffe9d6",
    layerColors: ["#cdb7c9", "#9d84a3", "#5c4a63"],
  },
  noon: {
    label: "昼",
    skyTop: "#6ec3f4",
    skyBottom: "#dff1fb",
    layerColors: ["#9fb0a6", "#6d8577", "#3c4d43"],
  },
  evening: {
    label: "夕",
    skyTop: "#3a2a5c",
    skyBottom: "#e8926a",
    layerColors: ["#8a6a8f", "#5a4266", "#2c1f3d"],
  },
};
