import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'questionCategory',
  title: '質問カテゴリ',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'カテゴリ名',
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
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
});
