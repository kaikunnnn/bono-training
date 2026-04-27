import { defineType, defineField } from "sanity";

/**
 * カードグリッド
 *
 * バリアント:
 * - info: 情報カード（アイコン + タイトル + 説明）
 * - stat: 統計カード（大きな数値 + タイトル + 単位）
 * - feature: 機能カード（アイコン + タイトル + 説明）
 * - persona: ペルソナカード（画像 + 名前 + 説明 + タグ）
 */
export default defineType({
  name: "cardGrid",
  title: "カードグリッド",
  type: "object",
  icon: () => "🃏",
  fields: [
    defineField({
      name: "variant",
      title: "バリアント",
      type: "string",
      options: {
        list: [
          { title: "📋 情報カード", value: "info" },
          { title: "📊 統計カード", value: "stat" },
          { title: "⚡ 機能カード", value: "feature" },
          { title: "👤 ペルソナカード", value: "persona" },
        ],
        layout: "radio",
      },
      initialValue: "info",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "columns",
      title: "カラム数",
      type: "number",
      options: {
        list: [
          { title: "1列", value: 1 },
          { title: "2列", value: 2 },
          { title: "3列", value: 3 },
        ],
      },
      initialValue: 3,
    }),
    defineField({
      name: "cards",
      title: "カード",
      type: "array",
      of: [
        {
          type: "object",
          name: "cardItem",
          title: "カード",
          fields: [
            defineField({
              name: "icon",
              title: "アイコン（任意）",
              type: "string",
              description: "絵文字またはアイコン名（例: 🎯, 📊）",
            }),
            defineField({
              name: "image",
              title: "画像（任意）",
              type: "image",
              options: { hotspot: true },
              description: "ペルソナカードのアバター等",
            }),
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
              rows: 3,
            }),
            defineField({
              name: "value",
              title: "値（任意）",
              type: "string",
              description: "統計カード用の数値（例: 40%, 3.2M）",
            }),
            defineField({
              name: "unit",
              title: "単位（任意）",
              type: "string",
              description: "統計カード用の単位ラベル",
            }),
            defineField({
              name: "tags",
              title: "タグ（任意）",
              type: "array",
              of: [{ type: "string" }],
              options: { layout: "tags" },
              description: "ペルソナカード用のスキルタグ等",
            }),
          ],
          preview: {
            select: {
              title: "title",
              icon: "icon",
              value: "value",
              media: "image",
            },
            prepare({ title, icon, value, media }) {
              const prefix = icon ? `${icon} ` : "";
              const suffix = value ? ` (${value})` : "";
              return {
                title: `${prefix}${title}${suffix}`,
                media,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      variant: "variant",
      cards: "cards",
      columns: "columns",
    },
    prepare({ variant, cards, columns }) {
      const variantLabels: Record<string, string> = {
        info: "📋 情報",
        stat: "📊 統計",
        feature: "⚡ 機能",
        persona: "👤 ペルソナ",
      };
      const cardCount = cards?.length || 0;
      return {
        title: `${variantLabels[variant] || variant}カード`,
        subtitle: `${cardCount}枚 × ${columns || 3}列`,
      };
    },
  },
});
