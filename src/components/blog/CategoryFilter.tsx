// src/components/blog/CategoryFilter.tsx
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BlogCategory } from "@/types/blog";

interface CategoryFilterProps {
  categories: BlogCategory[];
  selectedCategory?: string | null;
  onCategoryChange: (category: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <div className="flex flex-wrap gap-3 p-4 bg-white rounded-lg shadow-sm border mb-8">
      {/* すべてのカテゴリボタン */}
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => onCategoryChange(null)}
        className="rounded-full"
      >
        すべて
      </Button>

      {/* カテゴリボタン */}
      {categories.map((category) => (
        <Link
          key={category.slug}
          to={`/blog/category/${category.slug}`}
        >
          <Button
            variant={selectedCategory === category.slug ? "default" : "outline"}
            size="sm"
            className="rounded-full"
          >
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${category.color}`}
            />
            {category.name}
          </Button>
        </Link>
      ))}
    </div>
  );
};

export default CategoryFilter;