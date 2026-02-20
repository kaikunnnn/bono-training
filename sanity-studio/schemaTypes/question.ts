import { defineType, defineField } from 'sanity';
import { MarkdownImportInput } from "../components/MarkdownImportInput";

export default defineType({
  name: 'question',
  title: '質問',
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
      name: 'category',
      title: 'カテゴリ',
      type: 'reference',
      to: [{ type: 'questionCategory' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'questionContent',
      title: '質問内容',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H3', value: 'h3' },
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
            {
              name: 'alt',
              type: 'string',
              title: '代替テキスト',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'キャプション',
            },
          ],
        },
      ],
      components: {
        input: MarkdownImportInput,
      },
      description: '質問の内容（Slackからコピペ）',
    }),
    defineField({
      name: 'answerContent',
      title: '回答内容',
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
            {
              name: 'alt',
              type: 'string',
              title: '代替テキスト',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'キャプション',
            },
          ],
        },
      ],
      components: {
        input: MarkdownImportInput,
      },
      description: 'Kaiくんの回答（マークダウンで記述）',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: '公開日',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category.title',
      publishedAt: 'publishedAt',
    },
    prepare({ title, category, publishedAt }) {
      const date = publishedAt
        ? new Date(publishedAt).toLocaleDateString('ja-JP')
        : '未設定';
      return {
        title,
        subtitle: `${category || 'カテゴリ未設定'} | ${date}`,
      };
    },
  },
  orderings: [
    {
      title: '公開日（新しい順）',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
});
