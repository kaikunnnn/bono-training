import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'feedback',
  title: 'フィードバック',
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
      to: [{ type: 'feedbackCategory' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'targetOutput',
      title: '対象アウトプット',
      type: 'string',
      description: 'フィードバック対象の成果物名（任意）',
    }),
    defineField({
      name: 'publishedAt',
      title: '公開日',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'vimeoUrl',
      title: 'Vimeo動画URL',
      type: 'url',
      description: 'フィードバック動画のVimeo URL（有料ユーザーのみ閲覧可能）',
    }),
    defineField({
      name: 'figmaUrl',
      title: 'Figma URL',
      type: 'url',
      description: '依頼者のFigmaファイルURL（公開）',
    }),
    defineField({
      name: 'reviewPoints',
      title: '観点・ポイント',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H3', value: 'h3' },
          ],
          marks: {
            decorators: [
              { title: '太字', value: 'strong' },
              { title: '斜体', value: 'em' },
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
      ],
      description: 'フィードバックの観点やポイント（公開）',
    }),
    defineField({
      name: 'requestContent',
      title: '依頼内容',
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
      ],
      description: '依頼者からの依頼内容（公開）',
    }),
    defineField({
      name: 'feedbackContent',
      title: 'フィードバック本文',
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
      description: 'フィードバック本文（有料ユーザーのみ閲覧可能）',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category.title',
      targetOutput: 'targetOutput',
      publishedAt: 'publishedAt',
    },
    prepare({ title, category, targetOutput, publishedAt }) {
      const date = publishedAt
        ? new Date(publishedAt).toLocaleDateString('ja-JP')
        : '未設定';
      const output = targetOutput ? ` - ${targetOutput}` : '';
      return {
        title,
        subtitle: `${category || 'カテゴリ未設定'}${output} | ${date}`,
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
