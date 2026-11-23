/** 紹介ブロック（#280）のクリック計測の内容。Server Component から props で渡すのでプレーンな値だけ */
export interface PromoTracking {
  /** inline=記事本文中のブロック / end=記事の最後のブロック / band=/achievements の帯 */
  placement: "inline" | "end" | "band";
  pageType: "guide" | "story" | "achievements";
  /** 記事の slug（/achievements は無し） */
  pageSlug?: string;
  roadmapSlug: string;
}
