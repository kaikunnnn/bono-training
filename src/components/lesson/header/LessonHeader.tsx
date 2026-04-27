"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ShareDropdown } from "@/components/common/ShareDropdown";

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
        <button
          onClick={handleBack}
          className="bg-white border border-[#EBEBEB] flex gap-2 items-center px-3 py-[7px] rounded-xl shadow-[0px_1px_1px_0px_rgba(0,0,0,0.08),0px_0px_0px_0px_rgba(0,0,0,0),0px_0px_3px_0px_rgba(0,0,0,0.04)] hover:bg-gray-50 transition"
        >
          <ArrowLeft className="size-5 text-black" strokeWidth={2} />
          <span className="font-noto-sans-jp font-semibold text-sm text-black">
            {backLabel}
          </span>
        </button>
      </div>

      {showShare && (
        <div className="flex items-start">
          <ShareDropdown title={title} align="end">
            <button
              className="bg-white border border-[#EBEBEB] flex gap-1 items-center px-2.5 py-[7px] rounded-xl shadow-[0px_1px_1px_0px_rgba(0,0,0,0.08),0px_0px_0px_0px_rgba(0,0,0,0),0px_0px_3px_0px_rgba(0,0,0,0.04)] hover:bg-gray-50 transition"
            >
              <span className="font-noto-sans-jp font-semibold text-sm text-black">
                シェア
              </span>
            </button>
          </ShareDropdown>
        </div>
      )}
    </div>
  );
}

export default LessonHeader;
