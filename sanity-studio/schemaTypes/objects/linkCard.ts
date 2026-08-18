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
      // 相対URL（例: /how-to/community, /roadmap）も許可する。
      // 内部リンクはドメイン移行に強い相対パスで貼るため、絶対URL(http/https)に加えて相対も通す。
      validation: (Rule) =>
        Rule.required().uri({
          scheme: ["http", "https"],
          allowRelative: true,
        }),
      description: "リンク先のURL（絶対URL または /how-to/community のような相対パス）",
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
