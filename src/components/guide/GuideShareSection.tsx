"use client";

import Image from "next/image";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface ShareButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function ShareButton({ icon, label, onClick }: ShareButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-light rounded-xl shadow-xs hover:bg-hover transition"
      aria-label={label}
    >
      <span className="text-text-primary">{icon}</span>
      <span className="font-noto-sans-jp font-semibold text-sm text-text-primary">
        {label}
      </span>
    </button>
  );
}

interface GuideShareSectionProps {
  title: string;
}

export default function GuideShareSection({ title }: GuideShareSectionProps) {
  const { toast } = useToast();

  const handleCopyUrl = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "リンクをコピーしました",
        description: "URLをクリップボードにコピーしました",
      });
    } catch {
      toast({
        title: "コピーに失敗しました",
        variant: "destructive",
      });
    }
  };

  const handleShareToX = () => {
    const url = window.location.href;
    const tweetText = encodeURIComponent(title);
    const tweetUrl = encodeURIComponent(url);
    window.open(
      `https://x.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`,
      "_blank",
      "width=600,height=400"
    );
  };

  return (
    <div className="flex flex-col items-center gap-3 px-6 py-8 w-full mx-auto max-w-[648px] bg-surface rounded-[36px]">
      <Image
        src="/images/authors/kaikun.jpg"
        alt="カイクン"
        width={40}
        height={40}
        className="rounded-full object-cover"
      />
      <p className="text-text-secondary text-sm font-noto-sans-jp font-semibold">
        よかったらシェアしてね
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <ShareButton
          icon={<Copy size={16} />}
          label="URLをコピー"
          onClick={handleCopyUrl}
        />
        <ShareButton
          icon={<XIcon className="h-4 w-4" />}
          label="シェアする"
          onClick={handleShareToX}
        />
      </div>
    </div>
  );
}
