import { defineType, defineField } from "sanity";

/**
 * カスタムコンテナ（Notion風コールアウト）
 *
 * タイプ:
 * - info: 情報（青）
 * - tip: ヒント（緑）
 * - warning: 警告（黄）
 * - danger: 危険（赤）
 * - note: ノート（グレー）
 */
export default defineType({
  name: "customContainer",
  title: "カスタムコンテナ",
  type: "object",
  fields: [
    defineField({
      name: "containerType",
      title: "タイプ",
      type: "string",
      options: {
        list: [
          { title: "💡 ヒント (tip)", value: "tip" },
          { title: "ℹ️ 情報 (info)", value: "info" },
          { title: "⚠️ 警告 (warning)", value: "warning" },
          { title: "🚨 危険 (danger)", value: "danger" },
          { title: "📝 ノート (note)", value: "note" },
        ],
        layout: "radio",
      },
      initialValue: "info",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "タイトル（任意）",
      type: "string",
      description: "コンテナのタイトル（空の場合はタイプ名が表示されます）",
    }),
    defineField({
      name: "content",
      title: "内容",
      type: "array",
      of: [
        {
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          marks: {
            decorators: [
              { title: "太字", value: "strong" },
              { title: "斜体", value: "em" },
              { title: "コード", value: "code" },
            ],
            annotations: [
              {
                title: "リンク",
                name: "link",
                type: "object",
                fields: [
                  {
                    title: "URL",
                    name: "href",
                    type: "url",
                  },
                ],
              },
            ],
          },
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      containerType: "containerType",
      title: "title",
    },
    prepare({ containerType, title }) {
      const typeLabels: Record<string, string> = {
        tip: "💡 ヒント",
        info: "ℹ️ 情報",
        warning: "⚠️ 警告",
        danger: "🚨 危険",
        note: "📝 ノート",
      };
      return {
        title: title || typeLabels[containerType] || "カスタムコンテナ",
        subtitle: typeLabels[containerType] || containerType,
      };
    },
  },
});
