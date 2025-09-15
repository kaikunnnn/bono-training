// src/pages/blog/components-preview.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PreviewSection } from './components/PreviewSection';
import { StateToggle } from './components/StateToggle';
import { ResponsiveContainer } from './components/ResponsiveContainer';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogList } from '@/components/blog/BlogList';
import { CategoryFilter } from '@/components/blog/CategoryFilter';
import { Pagination } from '@/components/blog/Pagination';
import { mockPosts } from '@/data/blog/mockPosts';
import { categories } from '@/data/blog/categories';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  out: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
};

export const ComponentsPreview: React.FC = () => {
  const [cardState, setCardState] = useState('normal');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // サンプルのページネーションデータ
  const samplePagination = {
    currentPage: 2,
    totalPages: 5,
    totalPosts: 45,
    postsPerPage: 9,
    hasNextPage: true,
    hasPrevPage: true,
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      className="min-h-screen bg-gray-50"
    >
      {/* ヘッダー */}
      <div className="bg-white border-b">
        <div className="container py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Blog Components Preview
          </h1>
          <p className="text-lg text-gray-600">
            ブログ用コンポーネントの見た目とスタイルを確認
          </p>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="container py-12">
        {/* BlogCard セクション */}
        <PreviewSection
          title="BlogCard Component"
          description="ブログ記事カードの各種バリエーションとステートを確認"
        >
          <StateToggle
            states={['normal', 'featured', 'category-variations']}
            currentState={cardState}
            onStateChange={setCardState}
          />

          <ResponsiveContainer>
            <div className="p-6">
              {cardState === 'normal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockPosts.slice(0, 3).map((post, index) => (
                    <BlogCard key={post.id} post={post} index={index} />
                  ))}
                </div>
              )}

              {cardState === 'featured' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {mockPosts.filter(post => post.featured).map((post, index) => (
                    <BlogCard key={post.id} post={post} index={index} variant="featured" />
                  ))}
                </div>
              )}

              {cardState === 'category-variations' && (
                <div className="space-y-8">
                  {categories.map((category) => {
                    const categoryPost = mockPosts.find(p => p.category === category.slug);
                    return categoryPost ? (
                      <div key={category.id} className="space-y-4">
                        <h4 className="font-semibold text-lg text-gray-800">
                          {category.name} カテゴリ
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <BlogCard post={categoryPost} />
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </ResponsiveContainer>
        </PreviewSection>

        {/* CategoryFilter セクション */}
        <PreviewSection
          title="CategoryFilter Component"
          description="カテゴリフィルターの表示と選択状態"
        >
          <ResponsiveContainer>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold mb-4 text-gray-800">デフォルト状態（全て選択）</h4>
                <CategoryFilter
                  categories={categories}
                  selectedCategory={null}
                  onCategoryChange={() => {}}
                />
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-gray-800">カテゴリ選択状態</h4>
                <CategoryFilter
                  categories={categories}
                  selectedCategory="tech"
                  onCategoryChange={() => {}}
                />
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-gray-800">インタラクティブ版</h4>
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
                {selectedCategory && (
                  <p className="mt-2 text-sm text-gray-600">
                    選択中: {categories.find(c => c.slug === selectedCategory)?.name}
                  </p>
                )}
              </div>
            </div>
          </ResponsiveContainer>
        </PreviewSection>

        {/* Pagination セクション */}
        <PreviewSection
          title="Pagination Component"
          description="ページネーションの各種状態とパターン"
        >
          <ResponsiveContainer>
            <div className="p-6 space-y-8">
              <div>
                <h4 className="font-semibold mb-4 text-gray-800">最初のページ</h4>
                <Pagination
                  pagination={{
                    currentPage: 1,
                    totalPages: 5,
                    totalPosts: 45,
                    postsPerPage: 9,
                    hasNextPage: true,
                    hasPrevPage: false,
                  }}
                  onPageChange={() => {}}
                />
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-gray-800">中間のページ</h4>
                <Pagination
                  pagination={samplePagination}
                  onPageChange={() => {}}
                />
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-gray-800">最後のページ</h4>
                <Pagination
                  pagination={{
                    currentPage: 5,
                    totalPages: 5,
                    totalPosts: 45,
                    postsPerPage: 9,
                    hasNextPage: false,
                    hasPrevPage: true,
                  }}
                  onPageChange={() => {}}
                />
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-gray-800">インタラクティブ版</h4>
                <Pagination
                  pagination={{
                    currentPage: currentPage,
                    totalPages: 5,
                    totalPosts: 45,
                    postsPerPage: 9,
                    hasNextPage: currentPage < 5,
                    hasPrevPage: currentPage > 1,
                  }}
                  onPageChange={setCurrentPage}
                />
                <p className="mt-2 text-sm text-gray-600 text-center">
                  現在のページ: {currentPage}/5
                </p>
              </div>
            </div>
          </ResponsiveContainer>
        </PreviewSection>

        {/* BlogList セクション */}
        <PreviewSection
          title="BlogList Component"
          description="記事リストの表示パターン"
        >
          <ResponsiveContainer>
            <div className="p-6 space-y-8">
              <div>
                <h4 className="font-semibold mb-4 text-gray-800">3記事表示</h4>
                <BlogList posts={mockPosts.slice(0, 3)} />
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-gray-800">6記事表示</h4>
                <BlogList posts={mockPosts} />
              </div>
            </div>
          </ResponsiveContainer>
        </PreviewSection>

        {/* 統合デモセクション */}
        <PreviewSection
          title="Complete Blog Layout Demo"
          description="実際のブログページに近い統合デモ"
        >
          <ResponsiveContainer>
            <div className="p-6">
              {/* タイトル */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">ブログ記事一覧</h2>
                <p className="text-gray-600">最新の記事をお届けします</p>
              </div>

              {/* カテゴリフィルター */}
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />

              {/* 記事リスト */}
              <BlogList posts={mockPosts.slice(0, 6)} />

              {/* ページネーション */}
              <Pagination
                pagination={samplePagination}
                onPageChange={() => {}}
              />
            </div>
          </ResponsiveContainer>
        </PreviewSection>
      </main>
    </motion.div>
  );
};

export default ComponentsPreview;