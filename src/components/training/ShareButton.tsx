
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
}

/**
 * SNSシェアボタンコンポーネント
 * Web Share APIを使用して共有機能を提供します
 */
const ShareButton: React.FC<ShareButtonProps> = ({
  title,
  text,
  url = window.location.href,
  className
}) => {
  const { toast } = useToast();

  const handleShare = async () => {
    // Web Share APIが利用可能かチェック
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        });
        toast({
          title: "共有しました",
          description: "SNSで共有しました！",
        });
      } catch (error) {
        // ユーザーがキャンセルした場合はエラーをスローしないため、処理しない
        if ((error as Error).name !== 'AbortError') {
          console.error('共有に失敗しました:', error);
          toast({
            title: "共有に失敗しました",
            description: "もう一度お試しください",
            variant: "destructive"
          });
        }
      }
    } else {
      // Web Share APIが利用できない場合はURLをクリップボードにコピー
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "URLをコピーしました",
          description: "クリップボードにコピーしました。SNSで共有してください！",
        });
      } catch (error) {
        console.error('クリップボードへのコピーに失敗しました:', error);
        toast({
          title: "URLのコピーに失敗しました",
          description: "手動でURLをコピーしてください",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      className={className}
      size="sm"
    >
      <Share className="h-4 w-4 mr-2" />
      共有する
    </Button>
  );
};

export default ShareButton;
