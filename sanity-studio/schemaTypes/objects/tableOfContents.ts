import { defineType } from "sanity";

export default defineType({
  name: "tableOfContents",
  title: "目次",
  type: "object",
  icon: () => "📑",
  fields: [
    {
      name: "title",
      title: "目次タイトル",
      type: "string",
      initialValue: "目次",
      description: "目次セクションのタイトル（デフォルト: 目次）",
    },
    {
      name: "maxDepth",
      title: "見出しの深さ",
      type: "number",
      initialValue: 2,
      options: {
        list: [
          { title: "H2のみ", value: 1 },
          { title: "H2 + H3", value: 2 },
          { title: "H2 + H3 + H4", value: 3 },
        ],
      },
      description: "目次に含める見出しの深さ",
    },
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title: title || "目次",
        subtitle: "本文の見出しから自動生成",
      };
    },
  },
});
