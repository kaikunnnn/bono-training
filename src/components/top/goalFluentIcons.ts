/**
 * トップ「ゴール」系 UI 用 Fluent Emoji 3D（Three Dimensional）アセット
 *
 * `public/images/goal-buttons/` に、Microsoft fluentui-emoji 由来の PNG を配置してください。
 * 例: `assets/Flying Saucer/3D/flying_saucer_3d.png` をコピー → `flying_saucer_3d.png`
 *
 * @see https://github.com/microsoft/fluentui-emoji
 */
export const GOAL_FLUENT_ICONS = {
  career: {
    /** UIUXデザイナーに転職 */
    src: "/images/goal-buttons/flying_saucer_3d.png",
    emoji: "🛸",
    alt: "",
  },
  ux: {
    /** ユーザー課題を解決 */
    src: "/images/goal-buttons/magic_wand_3d.png",
    emoji: "🪄",
    alt: "",
  },
  ui: {
    /** 使いやすいUI */
    src: "/images/goal-buttons/joystick_3d.png",
    emoji: "🕹️",
    alt: "",
  },
} as const;

export type GoalFluentIconKey = keyof typeof GOAL_FLUENT_ICONS;
