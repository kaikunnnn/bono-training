import { defineType, defineField } from "sanity";

export default defineType({
  name: "guide",
  title: "ガイド",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "タイトル",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "スラッグ",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "カテゴリ",
      type: "string",
      options: {
        list: [
          { title: "キャリア", value: "career" },
          { title: "学習方法", value: "learning" },
          { title: "業界動向", value: "industry" },
          { title: "ツール・技術", value: "tools" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "説明",
      type: "text",
      rows: 3,
      description: "一覧ページで表示される説明文",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "isPremium",
      title: "有料記事",
      type: "boolean",
      initialValue: false,
      description: "有料会員限定にする場合はオン",
    }),
    defineField({
      name: "thumbnail",
      title: "サムネイル画像",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "linkUrl",
      title: "リンクURL",
      type: "url",
      description: "設定すると記事詳細ではなくこのURLへ遷移するリンク型ガイドになります",
      validation: (Rule) =>
        Rule.uri({ scheme: ["https", "http"] }).optional(),
    }),
    defineField({
      name: "videoUrl",
      title: "動画URL",
      type: "url",
      description: "YouTube または Vimeo のURL（任意）",
      validation: (Rule) =>
        Rule.uri({ scheme: ["https"] }).optional(),
    }),
    defineField({
      name: "content",
      title: "本文",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "Quote", value: "blockquote" },
          ],
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
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "alt", type: "string", title: "代替テキスト" },
            { name: "caption", type: "string", title: "キャプション" },
          ],
        },
        { type: "customContainer" },
        { type: "tableBlock" },
        { type: "linkCard" },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tags",
      title: "タグ",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "author",
      title: "著者",
      type: "string",
      initialValue: "BONO",
    }),
    defineField({
      name: "readingTime",
      title: "読了時間",
      type: "string",
      description: "例: 5 min",
    }),
    defineField({
      name: "publishedAt",
      title: "公開日",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "updatedAt",
      title: "更新日",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "title",
      category: "category",
      media: "thumbnail",
      isPremium: "isPremium",
    },
    prepare({ title, category, media, isPremium }) {
      const categoryLabel: Record<string, string> = {
        career: "キャリア",
        learning: "学習方法",
        industry: "業界動向",
        tools: "ツール・技術",
      };
      return {
        title,
        media,
        subtitle: `${categoryLabel[category] ?? category}${isPremium ? " 🔒" : ""}`,
      };
    },
  },
});
