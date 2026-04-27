import { defineType, defineField } from "sanity";

/**
 * ステップフロー
 *
 * 番号付きの手順/プロセスフロー
 * 縦に並ぶステップを接続線で繋いで表示
 */
export default defineType({
  name: "stepFlow",
  title: "ステップフロー",
  type: "object",
  icon: () => "🔢",
  fields: [
    defineField({
      name: "title",
      title: "フロータイトル（任意）",
      type: "string",
      description: "フロー全体のタイトル",
    }),
    defineField({
      name: "steps",
      title: "ステップ",
      type: "array",
      of: [
        {
          type: "object",
          name: "stepItem",
          title: "ステップ",
          fields: [
            defineField({
              name: "title",
              title: "タイトル",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "説明",
              type: "text",
              rows: 2,
            }),
          ],
          preview: {
            select: {
              title: "title",
              description: "description",
            },
            prepare({ title, description }) {
              return {
                title: title || "ステップ",
                subtitle: description || "",
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(2),
    }),
  ],
  preview: {
    select: {
      title: "title",
      steps: "steps",
    },
    prepare({ title, steps }) {
      const stepCount = steps?.length || 0;
      return {
        title: title || "ステップフロー",
        subtitle: `${stepCount}ステップ`,
      };
    },
  },
});
