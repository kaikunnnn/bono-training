import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'category',
  title: 'カテゴリ',
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
      name: 'order',
      title: '表示順序',
      type: 'number',
      description: '小さい数字ほど先に表示されます',
      validation: (Rule) => Rule.required().min(0),
      initialValue: 0,
    }),
    defineField({
      name: 'color',
      title: 'カラー',
      type: 'string',
      description: 'カテゴリのテーマカラー（Hex形式: #3B82F6）',
      validation: (Rule) =>
        Rule.regex(/^#[0-9A-F]{6}$/i, {
          name: 'hex',
          invert: false,
        }).error('有効なHexカラーコードを入力してください（例: #3B82F6）'),
    }),
    defineField({
      name: 'description',
      title: '説明',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      order: 'order',
      color: 'color',
    },
    prepare({ title, order, color }) {
      const colorIndicator = color ? `●` : '○';
      return {
        title: `${order}. ${title}`,
        subtitle: color ? `${colorIndicator} ${color}` : '色未設定',
      };
    },
  },
});
