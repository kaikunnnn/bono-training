import { defineType, defineField } from "sanity";
import { MarkdownImportInput } from "../components/MarkdownImportInput";

export default defineType({
  name: "lesson",
  title: "レッスン",
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
      description: "レッスンの説明（Webflow: description）",
    }),
    defineField({
      name: "iconImage",
      title: "アイコン画像",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "レッスン詳細ページのHeroセクションに表示されるアイコン画像（推奨サイズ: 200×200px）",
    }),
    defineField({
      name: "iconImageUrl",
      title: "アイコン画像URL",
      type: "url",
      description: "Webflowから自動取得されるアイコン画像URL（手動更新も可能）",
    }),
    defineField({
      name: "thumbnail",
      title: "サムネイル画像（OGP/一覧）",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "レッスン一覧のサムネイルやOGP画像として使用（推奨サイズ: 1200×630px）",
    }),
    defineField({
      name: "thumbnailUrl",
      title: "サムネイル画像URL",
      type: "url",
      description: "Webflowから自動取得されるサムネイル画像URL（手動更新も可能）",
    }),
    defineField({
      name: "category",
      title: "カテゴリ",
      type: "reference",
      to: [{ type: "category" }],
      description: "レッスンのカテゴリを選択してください",
    }),
    defineField({
      name: "isPremium",
      title: "有料レッスン",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "webflowSource",
      title: "Webflowソース",
      type: "string",
      description: "WebflowのSeries ID（例: 684a8fd0ff2a7184d2108210）。設定するとWebflow CMSからコンテンツを取得します。",
      validation: (Rule) => Rule.custom((value) => {
        if (!value) return true; // オプショナルフィールド
        // Webflow ID形式の簡易バリデーション（24文字の16進数）
        if (!/^[0-9a-f]{24}$/i.test(value)) {
          return "無効なWebflow Series ID形式です（24文字の16進数である必要があります）";
        }
        return true;
      }),
    }),
    defineField({
      name: "purposes",
      title: "レッスンの目的",
      type: "array",
      of: [{ type: "string" }],
      description: "箇条書きで表示される目的のリスト。1つずつ追加してください。",
    }),
    defineField({
      name: "overview",
      title: "概要",
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
          lists: [
            { title: "箇条書き", value: "bullet" },
            { title: "番号付き", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "太字", value: "strong" },
              { title: "斜体", value: "em" },
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
      ],
      description: "レッスンの詳細な概要をリッチテキストで記述（概要・目的タブに表示）。「Import from Markdown」ボタンでMarkdownから一括変換も可能。",
      components: {
        input: MarkdownImportInput,
      },
    }),
    defineField({
      name: "contentHeading",
      title: "コンテンツ見出し",
      type: "string",
      description: "クエスト一覧の上に表示される見出し（例: デザインの旅を進めよう）",
      validation: (Rule) => Rule.max(50),
    }),
    defineField({
      name: "quests",
      title: "クエスト",
      type: "array",
      of: [{ type: "reference", to: [{ type: "quest" }] }],
      description: "このレッスンに含まれるクエスト（ドラッグ&ドロップで並べ替え可能）。Webflowソースを設定した場合は不要（Webflowから自動取得）。",
      validation: (Rule) =>
        Rule.custom((quests, context) => {
          const webflowSource = (context.document as any)?.webflowSource;
          // Webflowソースがある場合は任意、ない場合は必須
          if (!webflowSource && (!quests || quests.length === 0)) {
            return "Webflowソースがない場合、クエストは必須です";
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "thumbnail",
      category: "category",
      isPremium: "isPremium",
      webflowSource: "webflowSource",
      slug: "slug",
    },
    prepare({ title, media, category, isPremium, webflowSource, slug }) {
      const source = webflowSource ? " 🌐 Webflow" : "";
      return {
        title,
        media,
        subtitle: `${category || "未分類"}${isPremium ? " 🔒" : ""}${source}`,
      };
    },
  },
  options: {
    // Presentation (Canvas) 用のプレビューURL設定
    previewUrl: (doc: any) => {
      if (!doc?.slug?.current) return null;
      return `/lessons/${doc.slug.current}`;
    },
  },
});
