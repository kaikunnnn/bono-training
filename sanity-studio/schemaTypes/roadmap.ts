import { defineType, defineField, defineArrayMember } from "sanity";

export default defineType({
  name: "roadmap",
  title: "ロードマップ",
  type: "document",
  groups: [
    { name: "basic", title: "基本情報", default: true },
    { name: "hero", title: "ヒーロー" },
    { name: "curriculum", title: "カリキュラム" },
    { name: "settings", title: "設定" },
  ],
  fields: [
    // ============================================
    // 基本情報
    // ============================================
    defineField({
      name: "title",
      title: "タイトル",
      type: "string",
      group: "basic",
      description: "例: UIUXデザイナー転職ロードマップ",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "shortTitle",
      title: "短縮タイトル",
      type: "string",
      group: "basic",
      description: "レッスンカード等で表示する短い名称（例: 転職、Figma入門、UIビジュアル）",
    }),
    defineField({
      name: "slug",
      title: "スラッグ",
      type: "slug",
      group: "basic",
      options: {
        source: "title",
        maxLength: 96,
      },
      description: "URLに使用される識別子（例: career-change）",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "説明文",
      type: "text",
      group: "basic",
      rows: 3,
      description: "SEO・メタ情報・カード表示用の説明文（50〜160文字推奨）",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "キャッチコピー",
      type: "string",
      group: "basic",
      description: "詳細ページのタイトル下に表示される短いコピー（1行推奨）",
    }),

    // ============================================
    // ビジュアル
    // ============================================
    defineField({
      name: "thumbnail",
      title: "サムネイル画像",
      type: "image",
      group: "basic",
      options: {
        hotspot: true,
      },
      description: "カード・詳細ページのアイキャッチに使用",
    }),
    defineField({
      name: "gradientPreset",
      title: "グラデーションプリセット",
      type: "string",
      group: "basic",
      options: {
        list: [
          { title: "転職ロードマップ", value: "career-change" },
          { title: "UIデザイン入門", value: "ui-beginner" },
          { title: "UIビジュアル入門", value: "ui-visual" },
          { title: "情報設計基礎", value: "info-arch" },
          { title: "UXデザイン基礎", value: "ux-design" },
        ],
        layout: "radio",
      },
      initialValue: "career-change",
      description: "カード背景のグラデーション色（プリセットはコンポーネントで管理）",
    }),

    // ============================================
    // 期間
    // ============================================
    defineField({
      name: "estimatedDuration",
      title: "目安期間",
      type: "string",
      group: "basic",
      description: "数字のみ入力（例: 1-2 → 表示時「1-2ヶ月」、6~ → 「6ヶ月〜」）",
      validation: (Rule) => Rule.required(),
    }),

    // ============================================
    // ヒーロー: 歩き方
    // ============================================
    defineField({
      name: "howToNavigate",
      title: "歩き方",
      type: "array",
      group: "hero",
      of: [{ type: "string" }],
      description: "ロードマップの進め方を箇条書きで（01, 02, 03...と表示）。空の場合はセクションごと非表示。",
    }),

    // ============================================
    // ヒーロー: ロードマップで変わる景色
    // ============================================
    defineField({
      name: "changingLandscape",
      title: "ロードマップで変わる景色",
      type: "object",
      group: "hero",
      description: "セクションタイトル・タグは共通。説明文と項目はロードマップごとに設定。",
      fields: [
        defineField({
          name: "description",
          title: "セクション説明文",
          type: "text",
          rows: 2,
          description: "このセクションの概要説明",
        }),
        defineField({
          name: "items",
          title: "項目",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({
                  name: "title",
                  title: "タイトル（悩み・課題）",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "description",
                  title: "説明（解決後の姿）",
                  type: "text",
                  rows: 2,
                }),
              ],
              preview: {
                select: { title: "title", subtitle: "description" },
              },
            },
          ],
          description: "変わる景色の項目（タイトル + 説明）",
        }),
      ],
    }),

    // ============================================
    // ヒーロー: デザインが面白くなる視点
    // ============================================
    defineField({
      name: "interestingPerspectives",
      title: "デザインが面白くなる視点",
      type: "object",
      group: "hero",
      description: "セクションタイトル・タグは共通。説明文と項目はロードマップごとに設定。",
      fields: [
        defineField({
          name: "description",
          title: "セクション説明文",
          type: "text",
          rows: 2,
          description: "このセクションの概要説明",
        }),
        defineField({
          name: "items",
          title: "項目",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({
                  name: "title",
                  title: "タイトル（身につくスキル）",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "description",
                  title: "説明（得られる状態）",
                  type: "text",
                  rows: 2,
                }),
              ],
              preview: {
                select: { title: "title", subtitle: "description" },
              },
            },
          ],
          description: "面白くなる視点の項目（タイトル + 説明）",
        }),
      ],
    }),

    // ============================================
    // カリキュラム: ステップ構造
    // ============================================
    defineField({
      name: "steps",
      title: "ステップ",
      type: "array",
      group: "curriculum",
      of: [
        defineArrayMember({
          type: "object",
          name: "step",
          title: "ステップ",
          fields: [
            defineField({
              name: "title",
              title: "ステップタイトル",
              type: "string",
              description: "例: UIづくりの感覚を真似して覚える",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "goals",
              title: "ゴール",
              type: "array",
              of: [{ type: "string" }],
              description: "このステップで達成する目標（箇条書き）",
            }),
            defineField({
              name: "sections",
              title: "セクション",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "section",
                  title: "セクション",
                  fields: [
                    defineField({
                      name: "title",
                      title: "セクションタイトル",
                      type: "string",
                      description: "例: デザインツールの使い方を習得しよう",
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: "description",
                      title: "セクション説明",
                      type: "text",
                      rows: 2,
                      description: "セクションの補足説明（任意）",
                    }),
                    defineField({
                      name: "contents",
                      title: "コンテンツ",
                      type: "array",
                      of: [
                        {
                          type: "reference",
                          to: [{ type: "lesson" }, { type: "roadmap" }],
                        },
                        {
                          type: "object",
                          name: "externalLink",
                          title: "外部リンク",
                          icon: () => "🔗",
                          fields: [
                            defineField({
                              name: "url",
                              title: "URL",
                              type: "url",
                              description: "リンク先URL（外部サイト・内部ページ両方可）",
                              validation: (Rule) => Rule.required(),
                            }),
                            defineField({
                              name: "title",
                              title: "タイトル",
                              type: "string",
                              description: "表示するタイトル",
                              validation: (Rule) => Rule.required(),
                            }),
                            defineField({
                              name: "description",
                              title: "説明文",
                              type: "text",
                              rows: 2,
                              description: "リンクの説明（任意）",
                            }),
                            defineField({
                              name: "thumbnailUrl",
                              title: "サムネイルURL",
                              type: "url",
                              description: "サムネイル画像のURL（任意）",
                            }),
                          ],
                          preview: {
                            select: {
                              title: "title",
                              url: "url",
                            },
                            prepare({ title, url }) {
                              return {
                                title: title || "リンク未設定",
                                subtitle: url || "",
                              };
                            },
                          },
                        },
                      ],
                      description:
                        "レッスン・ロードマップの参照、または外部リンクを追加",
                    }),
                  ],
                  preview: {
                    select: {
                      title: "title",
                      contents: "contents",
                    },
                    prepare({ title, contents }) {
                      const contentCount = contents ? contents.length : 0;
                      return {
                        title: title || "セクション未設定",
                        subtitle: `${contentCount} コンテンツ`,
                      };
                    },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: "title",
              goals: "goals",
              sections: "sections",
            },
            prepare({ title, goals, sections }) {
              const sectionCount = sections ? sections.length : 0;
              const goalCount = goals ? goals.length : 0;
              return {
                title: title || "ステップ未設定",
                subtitle: `${sectionCount} セクション | ${goalCount} ゴール`,
              };
            },
          },
        }),
      ],
      description: "ロードマップのステップ構造（ドラッグ&ドロップで並べ替え可能）",
    }),

    // ============================================
    // 表示設定
    // ============================================
    defineField({
      name: "order",
      title: "表示順序",
      type: "number",
      group: "settings",
      description: "小さい数字ほど先に表示される",
      initialValue: 0,
    }),
    defineField({
      name: "isPublished",
      title: "公開する",
      type: "boolean",
      group: "settings",
      initialValue: false,
      description: "チェックを入れるとサイトに表示されます",
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "thumbnail",
      gradientPreset: "gradientPreset",
      isPublished: "isPublished",
      estimatedDuration: "estimatedDuration",
      steps: "steps",
    },
    prepare({ title, media, gradientPreset, isPublished, estimatedDuration, steps }) {
      const statusIcon = isPublished ? "✅" : "📝";
      const stepCount = steps ? steps.length : 0;
      return {
        title,
        media,
        subtitle: `${statusIcon} ${stepCount}ステップ | ${gradientPreset || "未設定"} | 目安 ${estimatedDuration || "?"}ヶ月`,
      };
    },
  },
  orderings: [
    {
      title: "表示順序",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
    {
      title: "タイトル順",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
});
