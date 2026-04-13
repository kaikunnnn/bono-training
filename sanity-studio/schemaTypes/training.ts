import { defineType, defineField } from "sanity";

export default defineType({
  name: "training",
  title: "トレーニング",
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
      rows: 5,
    }),
    defineField({
      name: "trainingType",
      title: "トレーニングタイプ",
      type: "string",
      options: {
        list: [
          { title: "チャレンジ", value: "challenge" },
          { title: "スキル", value: "skill" },
          { title: "ポートフォリオ", value: "portfolio" },
        ],
        layout: "radio",
      },
      initialValue: "challenge",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "difficulty",
      title: "難易度",
      type: "string",
      options: {
        list: [
          { title: "かんたん", value: "easy" },
          { title: "ふつう", value: "normal" },
          { title: "むずかしい", value: "hard" },
        ],
      },
      initialValue: "normal",
    }),
    defineField({
      name: "category",
      title: "カテゴリ",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "tags",
      title: "タグ",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "isPremium",
      title: "有料トレーニング",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "orderIndex",
      title: "表示順序",
      type: "number",
      description: "小さい数字ほど先に表示",
      initialValue: 0,
    }),
    defineField({
      name: "iconImage",
      title: "アイコン画像",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "iconImageUrl",
      title: "アイコン画像URL",
      type: "url",
    }),
    defineField({
      name: "thumbnail",
      title: "サムネイル画像",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "thumbnailUrl",
      title: "サムネイル画像URL",
      type: "url",
    }),
    defineField({
      name: "backgroundSvg",
      title: "背景SVG URL",
      type: "url",
      description: "カード背景に使用するSVG画像のURL",
    }),
    defineField({
      name: "fallbackGradient",
      title: "フォールバックグラデーション",
      type: "object",
      fields: [
        { name: "from", title: "From", type: "string" },
        { name: "via", title: "Via", type: "string" },
        { name: "to", title: "To", type: "string" },
      ],
      description: "背景画像がない場合のグラデーション色（Hex）",
    }),
    defineField({
      name: "estimatedTotalTime",
      title: "想定所要時間",
      type: "string",
      description: "例: 4-5時間",
    }),
    defineField({
      name: "skills",
      title: "身につくスキル",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "タイトル", type: "string" },
            { name: "description", title: "説明", type: "text", rows: 3 },
            { name: "referenceLink", title: "参考リンク", type: "url" },
          ],
          preview: {
            select: { title: "title" },
          },
        },
      ],
    }),
    defineField({
      name: "guide",
      title: "進め方ガイド",
      type: "object",
      fields: [
        { name: "title", title: "ガイドタイトル", type: "string" },
        { name: "description", title: "ガイド説明", type: "text" },
        {
          name: "lesson",
          title: "関連レッスン",
          type: "object",
          fields: [
            { name: "title", title: "タイトル", type: "string" },
            { name: "image", title: "画像URL", type: "url" },
            { name: "description", title: "説明", type: "text" },
            { name: "link", title: "リンク", type: "url" },
          ],
        },
        {
          name: "steps",
          title: "ステップ",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                { name: "title", title: "タイトル", type: "string" },
                { name: "description", title: "説明", type: "text", rows: 3 },
              ],
              preview: {
                select: { title: "title" },
              },
            },
          ],
        },
      ],
    }),
    defineField({
      name: "tasks",
      title: "タスク",
      type: "array",
      of: [{ type: "reference", to: [{ type: "trainingTask" }] }],
      description: "このトレーニングに含まれるタスク（ドラッグ&ドロップで並べ替え可能）",
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "thumbnail",
      trainingType: "trainingType",
      isPremium: "isPremium",
    },
    prepare({ title, media, trainingType, isPremium }) {
      const typeLabel = { challenge: "チャレンジ", skill: "スキル", portfolio: "ポートフォリオ" }[trainingType] || trainingType;
      return {
        title,
        media,
        subtitle: `${typeLabel}${isPremium ? " 🔒" : ""}`,
      };
    },
  },
});
