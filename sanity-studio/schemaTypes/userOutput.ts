import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'userOutput',
  title: 'ユーザーアウトプット',
  type: 'document',
  groups: [
    { name: 'content', title: '記事情報', default: true },
    { name: 'relation', title: '紐付け' },
    { name: 'feedback', title: '15分FB応募情報' },
    { name: 'admin', title: '管理情報' },
  ],
  fields: [
    // === 記事情報 ===
    defineField({
      name: 'articleUrl',
      title: '記事URL',
      type: 'url',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'articleTitle',
      title: '記事タイトル',
      type: 'string',
      group: 'content',
      description: 'OGPから自動取得、または手動入力',
    }),
    defineField({
      name: 'articleImage',
      title: '記事画像URL',
      type: 'url',
      group: 'content',
      description: 'OGP画像URLから自動取得、または手動入力',
    }),
    defineField({
      name: 'articleDescription',
      title: '記事概要',
      type: 'text',
      group: 'content',
      rows: 3,
      description: 'OG descriptionから自動取得、または手動入力',
    }),

    // === 紐付け ===
    defineField({
      name: 'relatedLesson',
      title: '関連レッスン',
      type: 'reference',
      to: [{ type: 'lesson' }],
      group: 'relation',
      description: 'このアウトプットが関連するレッスン（Phase 2で必須化予定）',
    }),

    // === 投稿者情報 ===
    defineField({
      name: 'author',
      title: '投稿者',
      type: 'object',
      group: 'content',
      fields: [
        defineField({
          name: 'userId',
          title: 'ユーザーID',
          type: 'string',
          description: 'Supabase User ID（ユーザー投稿時のみ）',
        }),
        defineField({
          name: 'displayName',
          title: '表示名',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'slackAccountName',
          title: 'Slackアカウント名',
          type: 'string',
        }),
        defineField({
          name: 'email',
          title: 'メールアドレス',
          type: 'string',
        }),
      ],
    }),

    // === 15分FB応募情報 ===
    defineField({
      name: 'bonoContent',
      title: '学んだBONOコンテンツ',
      type: 'string',
      group: 'feedback',
      description: 'ユーザーが入力した学習コンテンツ名',
    }),
    defineField({
      name: 'checkedItems',
      title: '該当項目',
      type: 'array',
      group: 'feedback',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Notice（気づき・変化）', value: 'notice' },
          { title: 'Before/After（修正過程）', value: 'before-after' },
          { title: 'Why（なぜそうしたか）', value: 'why' },
        ],
      },
    }),

    // === 管理情報 ===
    defineField({
      name: 'source',
      title: '登録元',
      type: 'string',
      group: 'admin',
      options: {
        list: [
          { title: 'ユーザー投稿', value: 'user_submission' },
          { title: '管理者追加', value: 'admin_curated' },
        ],
        layout: 'radio',
      },
      initialValue: 'user_submission',
    }),
    defineField({
      name: 'submittedAt',
      title: '投稿日時',
      type: 'datetime',
      group: 'admin',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'isPublished',
      title: '公開',
      type: 'boolean',
      group: 'admin',
      initialValue: false,
      description: 'ONにすると一覧・レッスンページに表示されます',
    }),
    defineField({
      name: 'displayOrder',
      title: '表示順序',
      type: 'number',
      group: 'admin',
      initialValue: 0,
      description: '数字が小さいほど上に表示（0が最優先）',
    }),
    defineField({
      name: 'internalNote',
      title: '内部メモ',
      type: 'text',
      group: 'admin',
      rows: 2,
      description: '管理用メモ（ユーザーには非公開）',
    }),
  ],

  preview: {
    select: {
      title: 'articleTitle',
      authorName: 'author.displayName',
      lessonTitle: 'relatedLesson.title',
      isPublished: 'isPublished',
      submittedAt: 'submittedAt',
      source: 'source',
    },
    prepare({ title, authorName, lessonTitle, isPublished, submittedAt, source }) {
      const status = isPublished ? '✅ 公開' : '🔒 非公開';
      const sourceLabel = source === 'admin_curated' ? '👤管理者' : '📝ユーザー';
      const date = submittedAt
        ? new Date(submittedAt).toLocaleDateString('ja-JP')
        : '';
      return {
        title: title || '（タイトル未取得）',
        subtitle: `${authorName || '名前なし'} | ${lessonTitle || 'レッスン未設定'} | ${status} | ${sourceLabel} | ${date}`,
      };
    },
  },

  orderings: [
    {
      title: '表示順序',
      name: 'displayOrderAsc',
      by: [{ field: 'displayOrder', direction: 'asc' }],
    },
    {
      title: '投稿日時（新しい順）',
      name: 'submittedAtDesc',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
    {
      title: '公開状態',
      name: 'isPublishedDesc',
      by: [{ field: 'isPublished', direction: 'desc' }],
    },
  ],
});
