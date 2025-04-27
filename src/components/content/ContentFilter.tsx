
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { ContentFilter as FilterType } from '@/types/content';

interface ContentFilterProps {
  initialFilter?: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

/**
 * コンテンツフィルターコンポーネント
 * カテゴリ、タイプ、検索による絞り込み機能を提供
 */
const ContentFilter: React.FC<ContentFilterProps> = ({ 
  initialFilter = {}, 
  onFilterChange 
}) => {
  const [filter, setFilter] = useState<FilterType>(initialFilter);
  const [isOpen, setIsOpen] = useState(false);
  
  // フィルターの変更を処理する
  const handleFilterChange = (name: keyof FilterType, value: string | undefined) => {
    const newFilter = { ...filter, [name]: value };
    setFilter(newFilter);
  };
  
  // 検索クエリの変更を処理する
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange('searchQuery', e.target.value || undefined);
  };
  
  // フィルターをクリアする
  const handleClearFilter = () => {
    setFilter({});
    onFilterChange({});
  };
  
  // フィルターを適用する
  const handleApplyFilter = () => {
    onFilterChange(filter);
    setIsOpen(false);
  };
  
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="コンテンツを検索..."
              className="pl-9"
              value={filter.searchQuery || ''}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
            />
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Filter className="h-4 w-4" />
          <span>フィルター</span>
        </Button>
        
        {Object.values(filter).some(Boolean) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilter}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            <span>クリア</span>
          </Button>
        )}
      </div>
      
      {isOpen && (
        <div className="rounded-lg border p-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* カテゴリフィルター */}
            <div className="space-y-2">
              <Label htmlFor="category">カテゴリ</Label>
              <Select
                value={filter.category}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="figma">Figma</SelectItem>
                  <SelectItem value="ui-design">UIデザイン</SelectItem>
                  <SelectItem value="ux-design">UXデザイン</SelectItem>
                  <SelectItem value="learning">学習</SelectItem>
                  <SelectItem value="member">メンバー</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* タイプフィルター */}
            <div className="space-y-2">
              <Label htmlFor="type">種類</Label>
              <Select
                value={filter.type}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="種類を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">動画</SelectItem>
                  <SelectItem value="article">記事</SelectItem>
                  <SelectItem value="tutorial">チュートリアル</SelectItem>
                  <SelectItem value="course">コース</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={handleApplyFilter} className="w-full">
                適用
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentFilter;
