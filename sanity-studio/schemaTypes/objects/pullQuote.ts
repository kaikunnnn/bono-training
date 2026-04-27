import { defineType, defineField } from "sanity";

/**
 * プルクオート
 *
 * 大きな強調テキスト / 引用ブロック
 * バリアント:
 * - default: 左ボーダー付き引用
 * - highlight: 背景色付き強調
 */
export default defineType({
  name: "pullQuote",
  title: "プルクオート",
  type: "object",
  icon: () => "💬",
  fields: [
    defineField({
      name: "text",
      title: "引用テキスト",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "attribution",
      title: "出典（任意）",
      type: "string",
      description: "引用元の人物名や役職（例: Product Lead）",
    }),
    defineField({
      name: "variant",
      title: "スタイル",
      type: "string",
      options: {
        list: [
          { title: "デフォルト（左ボーダー）", value: "default" },
          { title: "ハイライト（背景色）", value: "highlight" },
        ],
        layout: "radio",
      },
      initialValue: "default",
    }),
  ],
  preview: {
    select: {
      text: "text",
      attribution: "attribution",
    },
    prepare({ text, attribution }) {
      const truncated = text?.length > 60 ? `${text.slice(0, 60)}...` : text;
      return {
        title: `"${truncated}"`,
        subtitle: attribution ? `— ${attribution}` : "",
      };
    },
  },
});
