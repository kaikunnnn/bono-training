import { defineType, defineField } from 'sanity';
import { MarkdownImportInput } from "../components/MarkdownImportInput";

export default defineType({
  name: 'question',
  title: '質問',
  type: 'document',
  groups: [
    { name: 'main', title: '基本情報', default: true },
    { name: 'content', title: 'コンテンツ' },
    { name: 'meta', title: '管理情報' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'タイトル',
      type: 'string',
      group: 'main',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'スラッグ',
      type: 'slug',
      group: 'main',
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
      group: 'main',
      validation: (Rule) => Rule.required(),
    }),
    // ユーザー投稿者情報
    defineField({
      name: 'author',
      title: '投稿者',
      type: 'object',
      group: 'meta',
      fields: [
        { name: 'userId', type: 'string', title: 'ユーザーID (Supabase)' },
        { name: 'displayName', type: 'string', title: '表示名' },
        { name: 'avatarUrl', type: 'url', title: 'アバターURL' },
      ],
      description: 'ユーザー投稿の場合に設定',
    }),
    // Figmaリンク
    defineField({
      name: 'figmaUrl',
      title: 'Figmaリンク',
      type: 'url',
      group: 'main',
      description: 'Figmaファイルへのリンク（任意）',
      validation: (Rule) => Rule.uri({
        scheme: ['https'],
        allowRelative: false,
      }).custom((url) => {
        if (!url) return true;
        if (url.includes('figma.com')) return true;
        return 'Figma のURLを入力してください';
      }),
    }),
    // 参考URL
    defineField({
      name: 'referenceUrls',
      title: '参考URL',
      type: 'array',
      group: 'main',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string', title: 'タイトル' },
            { name: 'url', type: 'url', title: 'URL' },
          ],
          preview: {
            select: { title: 'title', url: 'url' },
            prepare({ title, url }) {
              return { title: title || url || '未設定' };
            },
          },
        },
      ],
      description: '参考にしているサイトやデザインのURL（任意）',
    }),
    // ステータス
    defineField({
      name: 'status',
      title: 'ステータス',
      type: 'string',
      group: 'meta',
      options: {
        list: [
          { title: '回答待ち', value: 'pending' },
          { title: '回答済み', value: 'answered' },
          { title: '非公開', value: 'hidden' },
        ],
        layout: 'radio',
      },
      initialValue: 'answered',
    }),
    // 公開状態
    defineField({
      name: 'isPublic',
      title: '公開状態',
      type: 'boolean',
      group: 'meta',
      description: '公開する場合はON',
      initialValue: true,
    }),
    // ユーザー投稿日時
    defineField({
      name: 'submittedAt',
      title: 'ユーザー投稿日時',
      type: 'datetime',
      group: 'meta',
      description: 'ユーザーが投稿した日時',
    }),
    defineField({
      name: 'questionContent',
      title: '質問内容',
      type: 'array',
      group: 'content',
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
      group: 'content',
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
    }),
    defineField({
      name: 'publishedAt',
      title: '公開日',
      type: 'datetime',
      group: 'meta',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category.title',
      status: 'status',
      authorName: 'author.displayName',
      publishedAt: 'publishedAt',
    },
    prepare({ title, category, status, authorName, publishedAt }) {
      const date = publishedAt
        ? new Date(publishedAt).toLocaleDateString('ja-JP')
        : '未設定';
      const statusLabel = status === 'pending' ? '🟡回答待ち' : status === 'answered' ? '✅回答済み' : '🔒非公開';
      const authorLabel = authorName ? `👤${authorName}` : '';
      return {
        title,
        subtitle: `${statusLabel} | ${category || 'カテゴリ未設定'} | ${date}${authorLabel ? ` | ${authorLabel}` : ''}`,
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
