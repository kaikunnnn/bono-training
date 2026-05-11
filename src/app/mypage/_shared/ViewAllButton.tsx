"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function ViewAllButton({ tab }: { tab: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "all") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.push(`/mypage${query ? `?${query}` : ""}`, { scroll: false });
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="text-xs font-medium cursor-pointer"
      style={{
        color: isHovered ? "#2563EB" : "rgba(2, 8, 23, 0.64)",
        transition: "color 0.15s ease",
      }}
    >
      すべてみる
    </button>
  );
}
