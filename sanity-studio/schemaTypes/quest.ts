import { defineType, defineField } from "sanity";

export default defineType({
  name: "quest",
  title: "クエスト",
  type: "document",
  fields: [
    defineField({
      name: "questNumber",
      title: "🔢 クエスト番号",
      type: "number",
      description: "クエストの順序番号（例: 1, 2, 3）",
      validation: (Rule) => Rule.required().min(1),
      initialValue: 1,
    }),
    defineField({
      name: "title",
      title: "📝 タイトル",
      type: "string",
      description: "例: クエスト1: 情報設計の基本原則",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "🔗 スラッグ",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "📄 説明",
      type: "text",
      description: "クエストの概要説明",
      rows: 3,
    }),
    defineField({
      name: "goal",
      title: "🎯 ゴール",
      type: "text",
      description: "このクエストで達成する目標（任意）",
      rows: 2,
    }),
    defineField({
      name: "estTimeMins",
      title: "⏱️ 所要時間（分）",
      type: "number",
      description: "クエスト全体の所要時間",
      validation: (Rule) => Rule.min(1).max(300),
    }),
    defineField({
      name: "lesson",
      title: "📚 所属レッスン（必須）",
      type: "reference",
      to: [{ type: "lesson" }],
      description: "⚠️ 必須：このクエストが所属するレッスンを選択してください",
      readOnly: false,
      validation: (Rule) => Rule.required().error("所属レッスンは必須です"),
    }),
    defineField({
      name: "articles",
      title: "📰 記事",
      type: "array",
      of: [{ type: "reference", to: [{ type: "article" }] }],
      description: "このクエストに含まれる記事（ドラッグ&ドロップで並べ替え可能）",
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: "title",
      goal: "goal",
      estTimeMins: "estTimeMins",
      articles: "articles",
      lessonTitle: "lesson.title",
    },
    prepare({ title, goal, estTimeMins, articles, lessonTitle }) {
      const articleCount = articles ? articles.length : 0;
      return {
        title,
        subtitle: `📚 ${lessonTitle || "未設定"} | ${goal || "目標未設定"} | ${articleCount}記事 | ${estTimeMins || "?"}分`,
      };
    },
  },
});
