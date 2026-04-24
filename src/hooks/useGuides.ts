import { useQuery } from '@tanstack/react-query';
import { getAllGuides, getGuide, getGuidesByCategory } from '@/lib/sanity';
import type { Guide, GuideCategory } from '@/types/guide';

/**
 * すべてのガイド記事を取得
 */
export const useGuides = () => {
  return useQuery<Guide[]>({
    queryKey: ['guides'],
    queryFn: getAllGuides,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

/**
 * 特定のガイド記事を取得
 */
export const useGuide = (slug: string) => {
  return useQuery<Guide | null>({
    queryKey: ['guide', slug],
    queryFn: () => getGuide(slug),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    enabled: !!slug,
    refetchOnWindowFocus: false,
  });
};

/**
 * カテゴリで絞り込んだガイド記事を取得
 */
export const useGuidesByCategory = (category: GuideCategory) => {
  return useQuery<Guide[]>({
    queryKey: ['guides', 'category', category],
    queryFn: () => getGuidesByCategory(category),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 2,
    enabled: !!category,
    refetchOnWindowFocus: false,
  });
};
