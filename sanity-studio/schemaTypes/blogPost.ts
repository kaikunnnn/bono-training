import {defineField, defineType} from 'sanity'
import { MarkdownImportInput } from "../components/MarkdownImportInput";

/**
 * blogPost
 * - フロントの `BlogPost` 型/表示仕様に合わせる（HTML本文、emoji、category slug など）
 * - フロント（/blog）を変えずにデータソースだけSanityへ差し替えできる設計
 */
export default defineType({
  name: 'blogPost',
  title: 'ブログ記事',
  type: 'document',
  options: {
    canvasApp: {
      exclude: false,
    },
    previewUrl: (doc: any) => {
      if (!doc?.slug?.current) return null
      return `/blog/${doc.slug.current}`
    },
  },
  fields: [
    defineField({
      name: 'title',
      title: 'タイトル',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'タイトル先頭に絵文字を入れると、UI側で自動抽出して表示されます。',
    }),
    defineField({
      name: 'slug',
      title: 'スラッグ',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: '公開日',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'author',
      title: '著者',
      type: 'string',
      initialValue: 'BONO',
    }),
    defineField({
      name: 'description',
      title: '説明（一覧/ヘッダー用）',
      type: 'text',
      rows: 3,
      description: 'BlogPostHeaderで表示される説明文（任意）',
    }),
    defineField({
      name: 'content',
      title: '本文（リッチテキスト）',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: '太字', value: 'strong' },
              { title: '斜体', value: 'em' },
              { title: 'コード', value: 'code' },
            ],
            annotations: [
              {
                title: 'リンク',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: '代替テキスト' },
            { name: 'caption', type: 'string', title: 'キャプション' },
          ],
        },
        { type: 'tableBlock' },
        { type: 'customContainer' },
        { type: 'linkCard' },
        { type: 'tableOfContents' },
      ],
      components: {
        input: MarkdownImportInput,
      },
      validation: (Rule) => Rule.required(),
      description:
        '本文はリッチテキスト（Portable Text）で管理します。「Import from Markdown」でMarkdown貼り付け→一括変換も可能です。',
    }),
    // 移行用: 旧HTML本文（フロント互換のため残すが、Studioでは表示しない）
    defineField({
      name: 'contentHtml',
      title: '本文（HTML・移行用）',
      type: 'text',
      rows: 20,
      hidden: true,
      description: '旧データ移行用フィールド（非表示）。',
    }),
    defineField({
      name: 'emoji',
      title: '絵文字（任意）',
      type: 'string',
      description:
        '未入力の場合は、タイトル先頭の絵文字からUI側が自動抽出します（またはデフォルト絵文字）。',
    }),
    defineField({
      name: 'category',
      title: 'カテゴリ',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: {
        list: [
          {title: 'テクノロジー', value: 'tech'},
          {title: 'デザイン', value: 'design'},
          {title: 'ビジネス', value: 'business'},
          {title: 'ライフスタイル', value: 'lifestyle'},
        ],
        layout: 'radio',
      },
      description:
        '現行フロントは category slug（tech/design/...）で色やルーティング（/blog/tag/:slug）を決めます。',
    }),
    defineField({
      name: 'tags',
      title: 'タグ（任意）',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'featured',
      title: '注目記事',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'thumbnail',
      title: 'サムネイル画像（アップロード）',
      type: 'image',
      options: {hotspot: true},
      description:
        'Sanityのアセットとして画像をアップロードできます（推奨）。未設定の場合はURL/デフォルトへフォールバックします。',
    }),
    defineField({
      name: 'thumbnailUrl',
      title: 'サムネイルURL（任意）',
      type: 'url',
      description:
        '外部URLを使いたい場合のフォールバック。アップロード画像（thumbnail）がある場合はそちらが優先されます。',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      publishedAt: 'publishedAt',
      category: 'category',
      featured: 'featured',
      media: 'thumbnail',
    },
    prepare({title, slug, publishedAt, category, featured, media}) {
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString('ja-JP') : '日付未設定'
      return {
        title,
        media,
        subtitle: `${category || 'カテゴリ未設定'} | ${date}${featured ? ' ⭐️' : ''} | /blog/${slug ?? ''}`,
      }
    },
  },
})

