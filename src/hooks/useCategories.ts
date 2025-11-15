import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/sanity/client";

export interface Category {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  order: number;
  color?: string;
  description?: string;
}

const CATEGORIES_QUERY = `*[_type == "category"] | order(order asc) {
  _id,
  title,
  slug,
  order,
  color,
  description
}`;

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const categories = await client.fetch<Category[]>(CATEGORIES_QUERY);
      return categories;
    },
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });
}
