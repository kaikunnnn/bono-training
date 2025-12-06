// src/components/blog/ShareButtons.tsx
import { Button } from "@/components/ui/button";
import { Twitter, Facebook, Link2, Linkedin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({
  url,
  title,
  description,
  className = ""
}) => {
  const { toast } = useToast();

  const shareUrl = typeof window !== 'undefined' ? window.location.origin + url : '';

  const handleShare = (platform: string) => {
    let shareLink = '';

    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      default:
        break;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "リンクをコピーしました",
        description: "記事のURLがクリップボードにコピーされました。",
      });
    } catch (err) {
      toast({
        title: "コピーに失敗しました",
        description: "リンクのコピーに失敗しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700 mr-2">シェア:</span>

      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare('twitter')}
        className="hover:bg-blue-50 hover:text-blue-600"
        aria-label="Twitterでシェア"
      >
        <Twitter className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare('facebook')}
        className="hover:bg-blue-50 hover:text-blue-700"
        aria-label="Facebookでシェア"
      >
        <Facebook className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare('linkedin')}
        className="hover:bg-blue-50 hover:text-blue-800"
        aria-label="LinkedInでシェア"
      >
        <Linkedin className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={handleCopyLink}
        className="hover:bg-gray-50"
        aria-label="リンクをコピー"
      >
        <Link2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ShareButtons;