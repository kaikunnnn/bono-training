/**
 * 花コレクションコンポーネント
 * ユーザーの全レッスン進捗を花として一覧表示
 */

import { useState, useMemo } from 'react';
import { FlowerCard } from './FlowerCard';
import { LessonProgress } from '@/types/flower';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FlowerCollectionProps {
  flowers: LessonProgress[];
  isLoading?: boolean;
}

type FilterType = 'all' | 'in-progress' | 'completed';
type SortType = 'latest' | 'completion' | 'name';

export function FlowerCollection({ flowers, isLoading }: FlowerCollectionProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('latest');

  // フィルタリングとソート
  const filteredAndSortedFlowers = useMemo(() => {
    let result = [...flowers];

    // フィルター適用
    switch (filter) {
      case 'in-progress':
        result = result.filter((f) => f.completionRate > 0 && f.completionRate < 100);
        break;
      case 'completed':
        result = result.filter((f) => f.completionRate === 100);
        break;
      default:
        break;
    }

    // ソート適用
    switch (sortBy) {
      case 'latest':
        result.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
      case 'completion':
        result.sort((a, b) => b.completionRate - a.completionRate);
        break;
      case 'name':
        result.sort((a, b) => a.lessonTitle.localeCompare(b.lessonTitle, 'ja'));
        break;
      default:
        break;
    }

    return result;
  }, [flowers, filter, sortBy]);

  // 統計情報
  const stats = useMemo(() => {
    const completed = flowers.filter((f) => f.completionRate === 100).length;
    const inProgress = flowers.filter((f) => f.completionRate > 0 && f.completionRate < 100).length;
    const notStarted = flowers.filter((f) => f.completionRate === 0).length;

    return { completed, inProgress, notStarted, total: flowers.length };
  }, [flowers]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (flowers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🌱</div>
        <h3 className="text-xl font-semibold mb-2">まだ花がありません</h3>
        <p className="text-muted-foreground">
          レッスンを始めると、璃奈フラワーが育ち始めます
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 統計情報 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-sm text-muted-foreground">全レッスン</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-muted-foreground">完了</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-sm text-muted-foreground">進行中</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-600">{stats.notStarted}</div>
          <div className="text-sm text-muted-foreground">未開始</div>
        </div>
      </div>

      {/* フィルターとソート */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <TabsList>
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="in-progress">進行中</TabsTrigger>
            <TabsTrigger value="completed">完了</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">並び替え:</span>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortType)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">最新</SelectItem>
              <SelectItem value="completion">完了率順</SelectItem>
              <SelectItem value="name">名前順</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 花の一覧 */}
      <TabsContent value={filter} className="mt-6">
        {filteredAndSortedFlowers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-muted-foreground">
              該当する花が見つかりませんでした
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedFlowers.map((flower) => (
              <FlowerCard key={flower.lessonId} progress={flower} />
            ))}
          </div>
        )}
      </TabsContent>
    </div>
  );
}
