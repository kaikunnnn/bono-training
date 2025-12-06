// src/data/blog/categories.ts
import { BlogCategory } from '@/types/blog';

export const categories: BlogCategory[] = [
  {
    id: '1',
    name: 'テクノロジー',
    slug: 'tech',
    description: '最新の技術情報をお届け',
    color: 'bg-blue-500',
  },
  {
    id: '2',
    name: 'デザイン',
    slug: 'design',
    description: 'UI/UXデザインのトレンド',
    color: 'bg-purple-500',
  },
  {
    id: '3',
    name: 'ビジネス',
    slug: 'business',
    description: 'ビジネスに役立つ情報',
    color: 'bg-green-500',
  },
  {
    id: '4',
    name: 'ライフスタイル',
    slug: 'lifestyle',
    description: '豊かな生活のためのヒント',
    color: 'bg-pink-500',
  },
];

export const getCategoryBySlug = (slug: string) => {
  return categories.find(category => category.slug === slug) || null;
};

export const getCategoryById = (id: string) => {
  return categories.find(category => category.id === id) || null;
};