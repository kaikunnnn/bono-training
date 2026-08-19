"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ShareDropdown } from "@/components/common/ShareDropdown";
import { Button } from "@/components/ui/button";

interface LessonHeaderProps {
  backLabel?: string;
  backHref?: string;
  showShare?: boolean;
  shareTitle?: string;
}

export function LessonHeader({
  backLabel = "レッスン一覧へ",
  backHref = "/lessons",
  showShare = true,
  shareTitle,
}: LessonHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push(backHref);
  };

  const title = shareTitle || (typeof document !== "undefined" ? document.title : "");

  return (
    <div className="flex items-start justify-between w-full mb-[24px]">
      <div className="flex items-start">
        <Button
          variant="outline"
          onClick={handleBack}
          className="h-auto gap-2 border-border-light px-3 py-[7px] rounded-xl shadow-[0px_1px_1px_0px_rgba(0,0,0,0.08),0px_0px_0px_0px_rgba(0,0,0,0),0px_0px_3px_0px_rgba(0,0,0,0.04)] [&_svg]:size-5"
        >
          <ArrowLeft className="text-black" strokeWidth={2} />
          <span className="font-noto-sans-jp font-semibold text-sm text-black">
            {backLabel}
          </span>
        </Button>
      </div>

      {showShare && (
        <div className="flex items-start">
          <ShareDropdown title={title} align="end">
            <Button
              variant="outline"
              className="h-auto gap-1 border-border-light px-2.5 py-[7px] rounded-xl shadow-[0px_1px_1px_0px_rgba(0,0,0,0.08),0px_0px_0px_0px_rgba(0,0,0,0),0px_0px_3px_0px_rgba(0,0,0,0.04)]"
            >
              <span className="font-noto-sans-jp font-semibold text-sm text-black">
                シェア
              </span>
            </Button>
          </ShareDropdown>
        </div>
      )}
    </div>
  );
}

export default LessonHeader;
