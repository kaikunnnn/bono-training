"use client";

import { ReactNode } from "react";
import { Link2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// X (Twitter) アイコン
const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface ShareDropdownProps {
  title: string;
  url?: string;
  children: ReactNode;
  align?: "start" | "center" | "end";
}

export function ShareDropdown({
  title,
  url,
  children,
  align = "start",
}: ShareDropdownProps) {
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("URLをクリップボードにコピーしました");
    } catch {
      toast.error("コピーに失敗しました");
    }
  };

  const handleShareToX = () => {
    const tweetText = encodeURIComponent(`${title}`);
    const tweetUrl = encodeURIComponent(shareUrl);
    const xShareUrl = `https://x.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`;
    window.open(xShareUrl, "_blank", "width=600,height=400");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        <DropdownMenuItem onClick={handleCopyUrl} className="cursor-pointer">
          <Link2 className="mr-2 h-4 w-4" />
          <span>URLをコピー</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareToX} className="cursor-pointer">
          <XIcon className="mr-2 h-4 w-4" />
          <span>Xでシェア</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ShareDropdown;
