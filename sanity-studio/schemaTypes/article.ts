import { defineType, defineField } from "sanity";
import { MarkdownImportInput } from "../components/MarkdownImportInput";

export default defineType({
  name: "article",
  title: "記事",
  type: "document",
  options: {
    canvasApp: {
      exclude: false, // Canvasで使用可能に
    },
    // Presentation (Canvas) 用のプレビューURL設定
    previewUrl: (doc: any) => {
      if (!doc?.slug?.current) return null;
      return `/articles/${doc.slug.current}`;
    },
  },
  fields: [
    defineField({
      name: "articleNumber",
      title: "記事番号",
      type: "number",
      description: "記事の順序番号（例: 1, 2, 3）",
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "articleType",
      title: "記事タイプ",
      type: "string",
      options: {
        list: [
          { title: "知識", value: "explain" },
          { title: "イントロ", value: "intro" },
          { title: "実践", value: "practice" },
          { title: "チャレンジ", value: "challenge" },
          { title: "実演解説", value: "demo" },
        ],
      },
      description: "この記事の種類を選択してください",
    }),
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
      name: "excerpt",
      title: "要約",
      type: "text",
      description: "記事の短い要約（一覧ページで表示）",
      rows: 3,
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: "coverImage",
      title: "カバー画像",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "thumbnail",
      title: "サムネイル画像",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "クエスト一覧で表示される小さなサムネイル（57×32px推奨）",
    }),
    defineField({
      name: "videoUrl",
      title: "動画URL",
      type: "url",
      description: "Vimeo動画のURL（任意）",
      validation: (Rule) =>
        Rule.uri({
          scheme: ["https"],
        }),
    }),
    defineField({
      name: "videoDuration",
      title: "動画の長さ",
      type: "string",
      description: "動画の長さ（例: 36:21 または text）",
    }),
    defineField({
      name: "thumbnailUrl",
      title: "サムネイル画像URL",
      type: "url",
      description: "Webflowから自動取得されるサムネイル画像URL（手動更新も可能）",
    }),
    defineField({
      name: "content",
      title: "記事本文",
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
      ],
      options: {
        canvasApp: {
          purpose: "記事のメインコンテンツ。見出し、段落、画像、リンクを含む長文記事",
        },
      },
      components: {
        input: MarkdownImportInput,
      },
      description: "記事本文をリッチテキストで記述。「Import from Markdown」ボタンでMarkdownから一括変換も可能。",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "learningObjectives",
      title: "身につけること",
      type: "array",
      of: [{ type: "string" }],
      description: "この記事で学べる内容のリスト（任意。未入力の場合は表示されません）",
      options: {
        layout: "list",
      },
    }),
    defineField({
      name: "quest",
      title: "所属クエスト",
      type: "reference",
      to: [{ type: "quest" }],
      description: "この記事が所属するクエストを選択してください",
    }),
    defineField({
      name: "publishedAt",
      title: "公開日",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "author",
      title: "著者",
      type: "string",
    }),
    defineField({
      name: "tags",
      title: "タグ",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
    defineField({
      name: "isPremium",
      title: "有料記事",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "coverImage",
      author: "author",
      isPremium: "isPremium",
      lessonTitle: "quest.lesson.title",
    },
    prepare({ title, media, author, isPremium, lessonTitle }) {
      const lessonInfo = lessonTitle ? `📚 ${lessonTitle}` : "レッスン未設定";
      return {
        title,
        media,
        subtitle: `${lessonInfo} | ${author || "著者未設定"}${isPremium ? " 🔒" : ""}`,
      };
    },
  },
});
