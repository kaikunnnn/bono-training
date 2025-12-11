import { defineType, defineField } from "sanity";

/**
 * テーブルブロック（VitePress風）
 *
 * スタイル:
 * - ヘッダー行: 背景グレー、太字
 * - 偶数行: 薄いグレー背景（ゼブラストライプ）
 * - ボーダー: 1px solid
 * - レスポンシブ: 横スクロール対応
 */
export default defineType({
  name: "tableBlock",
  title: "テーブル",
  type: "object",
  fields: [
    defineField({
      name: "caption",
      title: "キャプション（任意）",
      type: "string",
      description: "テーブルの説明文",
    }),
    defineField({
      name: "rows",
      title: "行データ",
      type: "array",
      of: [
        {
          type: "object",
          name: "tableRow",
          title: "行",
          fields: [
            defineField({
              name: "isHeader",
              title: "ヘッダー行",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "cells",
              title: "セル",
              type: "array",
              of: [{ type: "string" }],
            }),
          ],
          preview: {
            select: {
              cells: "cells",
              isHeader: "isHeader",
            },
            prepare({ cells, isHeader }) {
              const cellText = cells?.slice(0, 3).join(" | ") || "";
              const prefix = isHeader ? "📋 ヘッダー: " : "  ";
              return {
                title: `${prefix}${cellText}${cells?.length > 3 ? "..." : ""}`,
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
      caption: "caption",
      rows: "rows",
    },
    prepare({ caption, rows }) {
      const rowCount = rows?.length || 0;
      return {
        title: caption || "テーブル",
        subtitle: `${rowCount}行`,
      };
    },
  },
});
