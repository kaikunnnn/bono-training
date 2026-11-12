import { afterEach, describe, expect, it, vi } from "vitest";
import type { SanityRoadmapListItem } from "@/types/sanity-roadmap";
import {
  CAREER_ROADMAP_SLUG,
  PROMO_PRICE_LINE,
  getGuideRoadmapSlug,
  guidePromoHeading,
  resolvePromo,
  storyPromoHeading,
} from "@/lib/guide-roadmap-map";
import { findInsertIndexAfterKey } from "@/lib/guide-inline-position";
import { GUIDE_INLINE_BLOCKS, GUIDE_ROADMAP_OVERRIDES } from "@/lib/guide-roadmap-map";

function roadmap(slug: string, overrides: Partial<SanityRoadmapListItem> = {}): SanityRoadmapListItem {
  return {
    _id: slug,
    title: `${slug} title`,
    slug: { current: slug },
    description: "desc",
    estimatedDuration: "約1年",
    stepCount: 6,
    isPublished: true,
    ...overrides,
  };
}

const ROADMAPS = [
  roadmap(CAREER_ROADMAP_SLUG),
  roadmap("ux-design-basic", { stepCount: 4 }),
  roadmap("ui-visual", { stepCount: 4 }),
];

afterEach(() => vi.restoreAllMocks());

describe("getGuideRoadmapSlug", () => {
  it("defaults to the career roadmap", () => {
    expect(getGuideRoadmapSlug("uiux-interview-tips-and-checkpoints")).toBe(CAREER_ROADMAP_SLUG);
    expect(getGuideRoadmapSlug("uiuxdesigner-skillmap")).toBe(CAREER_ROADMAP_SLUG);
  });
  it("uses overrides", () => {
    expect(getGuideRoadmapSlug("uxresearch_and_uidesign")).toBe("ux-design-basic");
    expect(getGuideRoadmapSlug("designer-proposal-after-mvp-marketing")).toBe("ux-design-basic");
    expect(getGuideRoadmapSlug("design-reference-eagle")).toBe("ui-visual");
    expect(getGuideRoadmapSlug("renewal-2026")).toBeNull();
  });
});

describe("resolvePromo", () => {
  it("renders nothing for members (hasMemberAccess=true)", () => {
    expect(
      resolvePromo({ roadmapSlug: CAREER_ROADMAP_SLUG, hasMemberAccess: true, roadmaps: ROADMAPS })
    ).toBeNull();
  });

  it("renders nothing for guides mapped to null", () => {
    expect(
      resolvePromo({ roadmapSlug: getGuideRoadmapSlug("renewal-2026"), hasMemberAccess: false, roadmaps: ROADMAPS })
    ).toBeNull();
  });

  it("builds the career copy from Sanity step count", () => {
    const promo = resolvePromo({ roadmapSlug: CAREER_ROADMAP_SLUG, hasMemberAccess: false, roadmaps: ROADMAPS });
    expect(promo?.name).toBe("転職ロードマップ");
    expect(promo?.stepCount).toBe(6);
    expect(promo?.estimatedDuration).toBe("約1年");
    expect(promo?.lead).toBe(
      "転職ロードマップは、UIの基礎から情報設計・UXデザイン・ポートフォリオづくりまでを、6つのステップで順番に進める学びの道筋です。"
    );
    expect(guidePromoHeading(promo!)).toBe("転職に必要なことを、順番に学ぶなら");
  });

  it("logs and returns null when the roadmap cannot be resolved", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(resolvePromo({ roadmapSlug: "ui-visual", hasMemberAccess: false, roadmaps: [] })).toBeNull();
    expect(
      resolvePromo({
        roadmapSlug: "ui-visual",
        hasMemberAccess: false,
        roadmaps: [roadmap("ui-visual", { isPublished: false })],
      })
    ).toBeNull();
    expect(spy).toHaveBeenCalledTimes(2);
  });
});

describe("headings and price", () => {
  it("adds さん only when no honorific", () => {
    expect(storyPromoHeading("Daiさん")).toBe("Daiさんも、この順番で学びました");
    expect(storyPromoHeading("和家くん")).toBe("和家くんも、この順番で学びました");
    expect(storyPromoHeading("リンネル")).toBe("リンネルさんも、この順番で学びました");
  });
  it("derives the lowest monthly price from AVAILABLE_PLANS", () => {
    expect(PROMO_PRICE_LINE).toBe("月5,800円から");
  });
});

describe("findInsertIndexAfterKey", () => {
  const blocks = [{ _key: "a" }, { _key: "b" }, { _key: "c" }];
  it("returns the position right after the keyed block", () => {
    expect(findInsertIndexAfterKey(blocks, "a")).toBe(1);
    expect(findInsertIndexAfterKey(blocks, "b")).toBe(2);
  });
  it("returns null when the key is missing or is the last block", () => {
    expect(findInsertIndexAfterKey(blocks, "x")).toBeNull();
    expect(findInsertIndexAfterKey(blocks, "c")).toBeNull();
    expect(findInsertIndexAfterKey(null, "a")).toBeNull();
  });
});

describe("GUIDE_INLINE_BLOCKS", () => {
  it("never targets an article that has the promo turned off", () => {
    for (const slug of Object.keys(GUIDE_INLINE_BLOCKS)) {
      expect(GUIDE_ROADMAP_OVERRIDES[slug]).not.toBeNull();
    }
  });
});
