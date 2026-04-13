import { defineType, defineField } from "sanity";
import { MarkdownImportInput } from "../components/MarkdownImportInput";

export default defineType({
  name: "trainingTask",
  title: "トレーニングタスク",
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
      name: "description",
      title: "説明",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "orderIndex",
      title: "表示順序",
      type: "number",
      description: "タスクの順序番号（1, 2, 3...）",
      validation: (Rule) => Rule.required().min(1),
      initialValue: 1,
    }),
    defineField({
      name: "isPremium",
      title: "有料タスク",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "category",
      title: "カテゴリ",
      type: "string",
      description: "タスクのカテゴリ（例: 情報設計、UIデザイン）",
    }),
    defineField({
      name: "tags",
      title: "タグ",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "videoFull",
      title: "動画URL（会員用）",
      type: "url",
      description: "会員向けフル動画のURL（Vimeo等）",
    }),
    defineField({
      name: "videoPreview",
      title: "動画URL（プレビュー）",
      type: "url",
      description: "無料プレビュー動画のURL",
    }),
    defineField({
      name: "previewSec",
      title: "プレビュー秒数",
      type: "number",
      description: "プレビューとして表示する秒数",
    }),
    defineField({
      name: "training",
      title: "所属トレーニング",
      type: "reference",
      to: [{ type: "training" }],
      description: "このタスクが所属するトレーニング",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sections",
      title: "コンテンツセクション",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "sectionTitle",
              title: "セクションタイトル",
              type: "string",
            },
            {
              name: "sectionType",
              title: "セクションタイプ",
              type: "string",
              options: {
                list: [
                  { title: "通常", value: "regular" },
                  { title: "デザイン解答例", value: "design-solution" },
                  { title: "有料限定", value: "premium-only" },
                ],
              },
              initialValue: "regular",
            },
            {
              name: "content",
              title: "コンテンツ",
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
                          { title: "URL", name: "href", type: "url" },
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
              ],
              components: {
                input: MarkdownImportInput,
              },
              description: "リッチテキストで記述。Markdownインポートも可能。",
            },
          ],
          preview: {
            select: {
              title: "sectionTitle",
              sectionType: "sectionType",
            },
            prepare({ title, sectionType }) {
              const typeLabel = {
                regular: "",
                "design-solution": "🎨 ",
                "premium-only": "🔒 ",
              }[sectionType] || "";
              return {
                title: `${typeLabel}${title || "無題のセクション"}`,
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      orderIndex: "orderIndex",
      isPremium: "isPremium",
      trainingTitle: "training.title",
    },
    prepare({ title, orderIndex, isPremium, trainingTitle }) {
      return {
        title: `${orderIndex || "?"} . ${title}`,
        subtitle: `📋 ${trainingTitle || "未設定"}${isPremium ? " 🔒" : ""}`,
      };
    },
  },
});
