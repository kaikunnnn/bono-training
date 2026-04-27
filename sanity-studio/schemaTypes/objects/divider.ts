import { defineType, defineField } from "sanity";

/**
 * 区切り線
 *
 * セクション間のビジュアル区切り
 * ラベル付き（任意）で中央にテキスト表示
 */
export default defineType({
  name: "divider",
  title: "区切り線",
  type: "object",
  icon: () => "➖",
  fields: [
    defineField({
      name: "label",
      title: "ラベル（任意）",
      type: "string",
      description: "区切り線の中央に表示するテキスト",
    }),
  ],
  preview: {
    select: {
      label: "label",
    },
    prepare({ label }) {
      return {
        title: label ? `── ${label} ──` : "────────",
        subtitle: "区切り線",
      };
    },
  },
});
