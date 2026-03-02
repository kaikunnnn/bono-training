import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'knowledgeCategory',
  title: 'ナレッジカテゴリ',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'タイトル',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'スラッグ',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: '説明',
      type: 'text',
      rows: 2,
      description: 'カテゴリの簡単な説明',
    }),
    defineField({
      name: 'emoji',
      title: '絵文字',
      type: 'string',
      description: '一覧表示時に使用する絵文字（例: 🚀）',
    }),
    defineField({
      name: 'order',
      title: '表示順',
      type: 'number',
      description: '小さい数字ほど先に表示',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      emoji: 'emoji',
    },
    prepare({ title, emoji }) {
      return {
        title: `${emoji || '📁'} ${title}`,
      };
    },
  },
  orderings: [
    {
      title: '表示順',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
});
