import { defineType, defineField } from "sanity";

/**
 * リンクカード（OGPプレビュー風）
 *
 * 外部リンクをカード形式で表示
 * - タイトル
 * - 説明文
 * - サムネイル画像
 * - URL
 */
export default defineType({
  name: "linkCard",
  title: "リンクカード",
  type: "object",
  fields: [
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (Rule) => Rule.required(),
      description: "リンク先のURL",
    }),
    defineField({
      name: "title",
      title: "タイトル",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "リンクのタイトル（OGPタイトルを手動入力）",
    }),
    defineField({
      name: "description",
      title: "説明文（任意）",
      type: "text",
      rows: 2,
      description: "リンク先の説明（OGP descriptionを手動入力）",
    }),
    defineField({
      name: "image",
      title: "サムネイル画像（任意）",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "カードに表示する画像",
    }),
    defineField({
      name: "imageUrl",
      title: "画像URL（任意）",
      type: "url",
      description: "外部画像URLを使用する場合（imageが優先されます）",
    }),
  ],
  preview: {
    select: {
      title: "title",
      url: "url",
      media: "image",
    },
    prepare({ title, url, media }) {
      return {
        title: title || "リンクカード",
        subtitle: url,
        media,
      };
    },
  },
});
