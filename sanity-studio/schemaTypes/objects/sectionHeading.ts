import { defineType, defineField } from "sanity";

/**
 * セクション見出し
 *
 * 番号付きのセクション区切り
 * 例: "01 — PROBLEM", "02 — GOAL/KPI"
 */
export default defineType({
  name: "sectionHeading",
  title: "セクション見出し",
  type: "object",
  icon: () => "📌",
  fields: [
    defineField({
      name: "number",
      title: "番号",
      type: "string",
      description: "セクション番号（例: 01, 02）",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "label",
      title: "ラベル",
      type: "string",
      description: "セクションラベル（例: PROBLEM, GOAL/KPI）",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "サブタイトル（任意）",
      type: "string",
      description: "ラベルの下に表示する補足テキスト",
    }),
  ],
  preview: {
    select: {
      number: "number",
      label: "label",
      title: "title",
    },
    prepare({ number, label, title }) {
      return {
        title: `${number} — ${label}`,
        subtitle: title || "",
      };
    },
  },
});
