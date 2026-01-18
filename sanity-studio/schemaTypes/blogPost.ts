import {defineField, defineType} from 'sanity'

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
      name: 'contentHtml',
      title: '本文（HTML）',
      type: 'text',
      rows: 20,
      validation: (Rule) => Rule.required(),
      description:
        '現行フロントはHTML文字列をそのままレンダリングします（BookmarkカードもHTMLから抽出）。',
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
      name: 'thumbnailUrl',
      title: 'サムネイルURL（任意）',
      type: 'url',
      description:
        'BlogCardの画像に使用。未設定の場合は既定の画像/emoji表示にフォールバックします。',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      publishedAt: 'publishedAt',
      category: 'category',
      featured: 'featured',
    },
    prepare({title, slug, publishedAt, category, featured}) {
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString('ja-JP') : '日付未設定'
      return {
        title,
        subtitle: `${category || 'カテゴリ未設定'} | ${date}${featured ? ' ⭐️' : ''} | /blog/${slug ?? ''}`,
      }
    },
  },
})

