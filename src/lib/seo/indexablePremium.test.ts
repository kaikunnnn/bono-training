import { describe, expect, it } from "vitest";
import {
  computeFreeBlockCount,
  freeBlockCountForIndexablePremium,
  freeBlockCountForIndexablePremiumStory,
  INDEXABLE_PREMIUM_ARTICLES,
  INDEXABLE_PREMIUM_STORIES,
  isIndexablePremiumSlug,
  isIndexablePremiumStorySlug,
  storyCanonicalForContent,
} from "./indexablePremium";

// 本文の中身は使わず、ブロックの種類だけで組み立てる（公開リポジトリのため実記事の文は置かない）
const p = { _type: "block", style: "normal" };
const li = { _type: "block", style: "normal", listItem: "bullet" };
const img = { _type: "image" };
const h = (level: 1 | 2 | 3 | 4) => ({ _type: "block", style: `h${level}` });

describe("indexablePremium allowlist", () => {
  it("has the 10 pilot articles without duplicates", () => {
    const slugs = INDEXABLE_PREMIUM_ARTICLES.map((a) => a.slug);
    expect(slugs).toHaveLength(10);
    expect(new Set(slugs).size).toBe(10);
    expect(isIndexablePremiumSlug("portfolio-02")).toBe(true);
    expect(isIndexablePremiumSlug("material-design-tabui-01")).toBe(true);
  });

  it("does not match other slugs", () => {
    expect(isIndexablePremiumSlug("some-other-premium")).toBe(false);
    expect(isIndexablePremiumSlug("")).toBe(false);
    expect(freeBlockCountForIndexablePremium("some-other-premium", [p, p, p, p])).toBeUndefined();
  });
});

describe("indexablePremium stories allowlist (rebono#18)", () => {
  it("has the 5 interview stories without duplicates", () => {
    const slugs = INDEXABLE_PREMIUM_STORIES.map((a) => a.slug);
    expect(slugs).toHaveLength(5);
    expect(new Set(slugs).size).toBe(5);
    // genta は本文が未編集のため対象外（従来どおり noindex・ロック）
    expect(isIndexablePremiumStorySlug("howareyoubecomethedesigner-genta")).toBe(false);
    expect(storyCanonicalForContent("howareyoubecomethedesigner-genta")).toBeNull();
    expect(isIndexablePremiumStorySlug("howtobedesigner-mone")).toBe(true);
    expect(isIndexablePremiumStorySlug("youhadouyatedesigner-yifan-01")).toBe(true);
  });

  it("is separate from the /contents pilot list (not indexed under /contents)", () => {
    for (const { slug } of INDEXABLE_PREMIUM_STORIES) {
      expect(isIndexablePremiumSlug(slug)).toBe(false);
    }
  });

  it("points the /contents canonical at /stories only for the 5 stories", () => {
    expect(storyCanonicalForContent("howtobedesigner-mone")).toBe(
      "https://www.bo-no.design/stories/howtobedesigner-mone",
    );
    expect(storyCanonicalForContent("portfolio-02")).toBeNull();
    expect(storyCanonicalForContent("some-other-premium")).toBeNull();
  });

  it("computes the free range the same way as articles", () => {
    const content = [h(3), p, p, p, h(2), ...Array(20).fill(p)];
    expect(freeBlockCountForIndexablePremiumStory("howtobedesigner-mone", content)).toBe(4);
    expect(freeBlockCountForIndexablePremiumStory("some-other-story", content)).toBeUndefined();
    expect(freeBlockCountForIndexablePremiumStory("portfolio-02", content)).toBeUndefined();
  });
});

describe("computeFreeBlockCount", () => {
  it("cuts right before the first heading after the intro (intro paragraphs then h2)", () => {
    // 段落8つ → h2 → 以降の本文（全61ブロック）: 上限 18 以内なので最初の h2 の手前まで
    const content = [...Array(8).fill(p), h(2), ...Array(52).fill(li)];
    expect(content).toHaveLength(61);
    expect(computeFreeBlockCount(content)).toBe(8);
  });

  it("treats any heading level as the first break (articles that use h3 for sections)", () => {
    const content = [h(3), p, p, h(3), ...Array(7).fill(li), h(3), p, img, h(2), p, p];
    expect(computeFreeBlockCount(content)).toBe(3);
  });

  it("keeps at least 3 blocks even when headings come early", () => {
    // h2 → 段落 → h2 → … : 3ブロック目以降の見出し（index 6）まで進む。上限 floor(27*0.3)=8
    const content = [h(2), p, h(2), li, li, li, h(2), li, li, li, li, li, h(2), ...Array(14).fill(p)];
    expect(content).toHaveLength(27);
    expect(computeFreeBlockCount(content)).toBe(6);
  });

  it("caps at 30% of the blocks when the first break is far", () => {
    // h1 → 13ブロック → h1（index 14）。全41ブロックなら上限 floor(12.3)=12
    const content = [h(1), ...Array(13).fill(li), h(1), ...Array(26).fill(p)];
    expect(content).toHaveLength(41);
    expect(computeFreeBlockCount(content)).toBe(12);
  });

  it("never goes below 3 blocks for short articles", () => {
    expect(computeFreeBlockCount([h(2), p, p, h(2), p, p, p, h(2), p, p])).toBe(3);
    expect(computeFreeBlockCount([h(2), p, p, p, h(2), p, p, h(2), p, p, p, p])).toBe(3);
  });

  it("uses the cap when there is no heading", () => {
    expect(computeFreeBlockCount(Array(20).fill(p))).toBe(6);
  });

  it("stops at a deeper heading too (h4 counts as a break)", () => {
    const content = [p, p, p, p, p, h(4), ...Array(14).fill(p)];
    expect(computeFreeBlockCount(content)).toBe(5);
  });

  it("returns everything for very short content and 0 for empty", () => {
    expect(computeFreeBlockCount([p, p])).toBe(2);
    expect(computeFreeBlockCount([])).toBe(0);
    expect(computeFreeBlockCount(undefined)).toBe(0);
  });

  it("respects a per-article override", () => {
    const content = Array(30).fill(p);
    expect(computeFreeBlockCount(content, 4)).toBe(4);
    expect(computeFreeBlockCount(content, 100)).toBe(30);
  });
});
