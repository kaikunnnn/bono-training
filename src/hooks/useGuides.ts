import { useQuery } from '@tanstack/react-query';
import { loadGuides, loadGuide, loadGuidesByCategory } from '@/lib/guideLoader';
import type { GuideCategory } from '@/types/guide';

/**
 * すべてのガイド記事を取得
 */
export const useGuides = () => {
  return useQuery({
    queryKey: ['guides'],
    queryFn: loadGuides,
    staleTime: 30 * 60 * 1000, // 30分
    gcTime: 60 * 60 * 1000, // 60分
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

/**
 * 特定のガイド記事を取得
 */
export const useGuide = (slug: string) => {
  return useQuery({
    queryKey: ['guide', slug],
    queryFn: () => loadGuide(slug),
    staleTime: 5 * 60 * 1000, // 5分
    gcTime: 10 * 60 * 1000, // 10分
    retry: 2,
    enabled: !!slug,
    refetchOnWindowFocus: false,
  });
};

/**
 * カテゴリで絞り込んだガイド記事を取得
 */
export const useGuidesByCategory = (category: GuideCategory) => {
  return useQuery({
    queryKey: ['guides', 'category', category],
    queryFn: () => loadGuidesByCategory(category),
    staleTime: 30 * 60 * 1000, // 30分
    gcTime: 60 * 60 * 1000, // 60分
    retry: 2,
    enabled: !!category,
    refetchOnWindowFocus: false,
  });
};
