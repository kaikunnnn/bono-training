import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'articleSubmission',
  title: '思考シェア記事',
  type: 'document',
  groups: [
    { name: 'content', title: '投稿内容', default: true },
    { name: 'admin', title: '管理情報' },
  ],
  fields: [
    // === 投稿内容 ===
    defineField({
      name: 'authorName',
      title: '投稿者名',
      type: 'string',
      group: 'content',
      description: 'Slack表示名と同じもの',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'articleUrl',
      title: '記事URL',
      type: 'url',
      group: 'content',
      description: 'note等の記事URL',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'articleTitle',
      title: '記事タイトル',
      type: 'string',
      group: 'content',
      description: 'OGPから自動取得 or 手動入力',
    }),
    defineField({
      name: 'articleImage',
      title: '記事サムネイル',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      description: 'OGPから自動取得 or 手動アップロード',
    }),
    defineField({
      name: 'mainPoint',
      title: 'この記事で一番伝えたいこと',
      type: 'text',
      group: 'content',
      rows: 3,
      description: '140文字以内で記載',
      validation: (Rule) => Rule.required().max(140),
    }),
    defineField({
      name: 'categories',
      title: '該当する項目',
      type: 'array',
      group: 'content',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Notice（気づき・変化）', value: 'notice' },
          { title: 'Before/After（修正過程）', value: 'before-after' },
          { title: 'Why（なぜそうしたか）', value: 'why' },
        ],
      },
      description: 'どの項目に該当すると思いますか？（複数選択可）',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'bonoContent',
      title: '主に使ったBONOコンテンツ',
      type: 'string',
      group: 'content',
      description: 'どのコンテンツを実践したか（任意）',
    }),

    // === 管理情報 ===
    defineField({
      name: 'status',
      title: 'ステータス',
      type: 'string',
      group: 'admin',
      options: {
        list: [
          { title: '審査中', value: 'pending' },
          { title: '承認済み', value: 'approved' },
          { title: '要改善', value: 'needs-improvement' },
          { title: '却下', value: 'rejected' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isPublic',
      title: '一覧に表示',
      type: 'boolean',
      group: 'admin',
      description: '承認済みの記事を一覧ページに表示するか',
      initialValue: false,
    }),
    defineField({
      name: 'submittedAt',
      title: '提出日時',
      type: 'datetime',
      group: 'admin',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'approvedAt',
      title: '承認日時',
      type: 'datetime',
      group: 'admin',
    }),
    defineField({
      name: 'adminComment',
      title: '運営コメント',
      type: 'text',
      group: 'admin',
      rows: 4,
      description: 'フィードバックや改善点（ユーザーに表示可能）',
    }),
    defineField({
      name: 'internalNote',
      title: '内部メモ',
      type: 'text',
      group: 'admin',
      rows: 2,
      description: '内部用メモ（ユーザーには非公開）',
    }),
  ],
  preview: {
    select: {
      title: 'articleTitle',
      authorName: 'authorName',
      status: 'status',
      submittedAt: 'submittedAt',
      media: 'articleImage',
    },
    prepare({ title, authorName, status, submittedAt, media }) {
      const statusLabels: Record<string, string> = {
        pending: '🟡 審査中',
        approved: '✅ 承認済み',
        'needs-improvement': '🟠 要改善',
        rejected: '❌ 却下',
      };
      const date = submittedAt
        ? new Date(submittedAt).toLocaleDateString('ja-JP')
        : '未設定';
      return {
        title: title || '（タイトル未取得）',
        subtitle: `${authorName || '名前なし'} | ${statusLabels[status] || status} | ${date}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: '提出日（新しい順）',
      name: 'submittedAtDesc',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
    {
      title: 'ステータス順',
      name: 'statusAsc',
      by: [{ field: 'status', direction: 'asc' }],
    },
  ],
});
