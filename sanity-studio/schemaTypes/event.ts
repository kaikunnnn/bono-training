import { defineType, defineField } from "sanity";
import { MarkdownImportInput } from "../components/MarkdownImportInput";

export default defineType({
  name: "event",
  title: "イベント",
  type: "document",
  options: {
    canvasApp: {
      exclude: false,
    },
    previewUrl: (doc: any) => {
      if (!doc?.slug?.current) return null;
      return `/events/${doc.slug.current}`;
    },
  },
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
      name: "summary",
      title: "概要",
      type: "text",
      rows: 3,
      description: "イベントの概要文（ページ冒頭に表示）",
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
      name: "registrationUrl",
      title: "参加フォームURL",
      type: "url",
      description: "Googleフォームなどの参加申し込みURL",
      validation: (Rule) =>
        Rule.uri({
          scheme: ["https"],
        }),
    }),
    defineField({
      name: "thumbnail",
      title: "サムネイル画像",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "イベントのサムネイル画像（ボタンの下に表示）",
    }),
    defineField({
      name: "thumbnailUrl",
      title: "サムネイル画像URL",
      type: "url",
      description: "外部画像URLを使用する場合（thumbnail画像が優先）",
    }),
    defineField({
      name: "content",
      title: "詳細本文",
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
            {
              name: "alt",
              type: "string",
              title: "代替テキスト",
            },
            {
              name: "caption",
              type: "string",
              title: "キャプション",
            },
          ],
        },
        {
          type: "customContainer",
        },
        {
          type: "tableBlock",
        },
        {
          type: "linkCard",
        },
        {
          type: "tableOfContents",
        },
      ],
      components: {
        input: MarkdownImportInput,
      },
      description:
        "イベントの詳細本文。Markdownを貼り付けて変換もできます。",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "eventMonth",
      title: "開催月",
      type: "number",
      description: "開催予定月（1〜12）",
      validation: (Rule) => Rule.min(1).max(12),
      options: {
        list: [
          { title: "1月", value: 1 },
          { title: "2月", value: 2 },
          { title: "3月", value: 3 },
          { title: "4月", value: 4 },
          { title: "5月", value: 5 },
          { title: "6月", value: 6 },
          { title: "7月", value: 7 },
          { title: "8月", value: 8 },
          { title: "9月", value: 9 },
          { title: "10月", value: 10 },
          { title: "11月", value: 11 },
          { title: "12月", value: 12 },
        ],
      },
    }),
    defineField({
      name: "eventPeriod",
      title: "開催時期",
      type: "string",
      description: "上旬・中旬・下旬",
      options: {
        list: [
          { title: "上旬", value: "early" },
          { title: "中旬", value: "mid" },
          { title: "下旬", value: "late" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "publishedAt",
      title: "公開日（確定時）",
      type: "datetime",
      description: "日程が確定した場合に設定（月・時期より優先表示）",
    }),
  ],
  preview: {
    select: {
      title: "title",
      summary: "summary",
    },
    prepare({ title, summary }) {
      return {
        title,
        subtitle: summary || "概要未入力",
      };
    },
  },
});
