
export const filterContents = (filter: {
  category?: string; 
  type?: string;
  searchQuery?: string;
}): ContentItem[] => {
  return MOCK_CONTENTS.filter(content => {
    // カテゴリでフィルタリング
    if (filter.category && !content.categories.includes(filter.category as ContentCategory)) {
      return false;
    }
    
    // タイプでフィルタリング
    if (filter.type && content.type !== filter.type) {
      return false;
    }
    
    // 検索クエリでフィルタリング
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      return (
        content.title.toLowerCase().includes(query) ||
        content.description.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
};
