
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, File, Video, Bookmark } from 'lucide-react';
import { ContentItem } from '@/types/content';

interface ContentCardProps {
  content: ContentItem;
  isAccessible?: boolean;
}

/**
 * コンテンツカードコンポーネント
 * コンテンツのサムネイルとメタデータを表示します
 */
const ContentCard: React.FC<ContentCardProps> = ({ content, isAccessible = true }) => {
  // コンテンツタイプに応じたアイコンを取得
  const getTypeIcon = (): React.ReactNode => {
    switch (content.type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'article':
        return <File className="h-4 w-4" />;
      case 'tutorial':
        return <Bookmark className="h-4 w-4" />;
      case 'course':
        return <Bookmark className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  // コンテンツの種類に応じたラベルを取得
  const getTypeLabel = (): string => {
    switch (content.type) {
      case 'video':
        return '動画';
      case 'article':
        return '記事';
      case 'tutorial':
        return 'チュートリアル';
      case 'course':
        return 'コース';
      default:
        return 'コンテンツ';
    }
  };

  // 動画の長さを表示用にフォーマット
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // アクセスレベルを表示用にフォーマット
  const getAccessLevelLabel = (accessLevel: string): string => {
    switch (accessLevel) {
      case 'free':
        return '';
      case 'learning':
        return '学習コンテンツ';
      case 'member':
        return 'メンバー限定';
      default:
        return accessLevel;
    }
  };

  return (
    <Card className={`overflow-hidden ${!isAccessible ? 'opacity-70' : ''}`}>
      <div className="relative aspect-video overflow-hidden bg-muted">
        {content.thumbnailUrl ? (
          <img 
            src={content.thumbnailUrl} 
            alt={content.title} 
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            {getTypeIcon()}
          </div>
        )}
        
        {/* アクセス制限マーク */}
        {!isAccessible && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Lock className="h-10 w-10 text-white" />
          </div>
        )}
        
        {/* 動画の長さ */}
        {content.type === 'video' && content.videoDuration && (
          <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
            {formatDuration(content.videoDuration)}
          </div>
        )}
      </div>
      
      <CardHeader className="p-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            {getTypeIcon()}
            <span>{getTypeLabel()}</span>
          </Badge>
          
          {content.accessLevel !== 'free' && (
            <Badge variant="secondary">
              {getAccessLevelLabel(content.accessLevel)}
            </Badge>
          )}
        </div>
        <CardTitle className="line-clamp-2 text-lg">{content.title}</CardTitle>
        <CardDescription className="line-clamp-2">{content.description}</CardDescription>
      </CardHeader>
      
      <CardFooter className="p-4 pt-0">
        <div className="flex w-full justify-between text-sm text-muted-foreground">
          <div className="flex flex-wrap gap-2">
            {content.categories.map((category) => (
              <Badge key={category} variant="outline">
                {category === 'figma' ? 'Figma' :
                category === 'ui-design' ? 'UIデザイン' :
                category === 'ux-design' ? 'UXデザイン' :
                category === 'learning' ? '学習' :
                category === 'member' ? 'メンバー' : category}
              </Badge>
            ))}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ContentCard;
