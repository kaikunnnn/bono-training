
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import ContentList from '@/components/content/ContentList';
import ContentFilter from '@/components/content/ContentFilter';
import { ContentFilter as FilterType } from '@/types/content';
import { useContent } from '@/hooks/useContent';

/**
 * コンテンツ一覧ページ
 */
const Content: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>({});
  const { contents, loading, error } = useContent(filter);
  
  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">コンテンツライブラリ</h1>
          <p className="mt-2 text-muted-foreground">
            UIUXデザインに関する様々なコンテンツを探索しましょう
          </p>
        </div>
        
        <ContentFilter
          initialFilter={filter}
          onFilterChange={setFilter}
        />
        
        <ContentList
          contents={contents}
          loading={loading}
          error={error}
        />
      </div>
    </Layout>
  );
};

export default Content;
