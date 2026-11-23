import { describe, expect, it } from "vitest";
import { addGuideLinkFrom, guidePromoFrom, withFromParam } from "./guide-link-from";

const h2 = (text: string) => ({ _type: "block", style: "h2", _key: text, children: [{ text }] });
const linkBlock = (key: string, href: string) => ({
  _type: "block",
  style: "normal",
  _key: key,
  children: [{ text: "x", marks: ["m"] }],
  markDefs: [{ _type: "link", _key: "m", href }],
});
const card = (key: string, url: string) => ({ _type: "linkCard", _key: key, url, title: "t" });

describe("withFromParam", () => {
  it("adds from to site links and keeps the hash", () => {
    expect(withFromParam("https://www.bo-no.design/roadmap/uiux-career-change#curriculum-step-6", "a")).toBe(
      "https://www.bo-no.design/roadmap/uiux-career-change?from=a#curriculum-step-6"
    );
    expect(withFromParam("/lessons/portfolio", "a")).toBe("/lessons/portfolio?from=a");
  });

  it("leaves external links and existing from untouched", () => {
    expect(withFromParam("https://example.com/x", "a")).toBe("https://example.com/x");
    expect(withFromParam("/subscription?from=nav", "a")).toBe("/subscription?from=nav");
  });
});

describe("addGuideLinkFrom", () => {
  const content = [
    card("c0", "https://www.bo-no.design/roadmap/uiux-career-change"),
    h2("AI時代に必要なスキル"),
    linkBlock("b1", "https://www.bo-no.design/guide/ai-uiuxdesign-future"),
    h2("ステップ1 デザインツールを習得しよう"),
    card("c1", "https://www.bo-no.design/roadmap/ui-design-beginner"),
    linkBlock("b2", "https://www.bo-no.design/lessons/figmabeginner"),
    h2("よくある質問"),
    linkBlock("b3", "https://www.bo-no.design/guide/x"),
  ];

  it("labels links by the h2 they sit under", () => {
    const out = addGuideLinkFrom(content, "rdm-howtostart-roadmap") as typeof content;
    expect((out[0] as { url: string }).url).toContain("from=guide-rdm-intro");
    expect((out[2] as ReturnType<typeof linkBlock>).markDefs[0].href).toContain("from=guide-rdm-s1");
    expect((out[4] as { url: string }).url).toContain("from=guide-rdm-step1");
    expect((out[5] as ReturnType<typeof linkBlock>).markDefs[0].href).toContain("from=guide-rdm-step1");
    expect((out[7] as ReturnType<typeof linkBlock>).markDefs[0].href).toContain("from=guide-rdm-s3");
  });

  it("keeps keys and does not mutate the original", () => {
    const out = addGuideLinkFrom(content, "rdm-howtostart-roadmap");
    expect(out.map((n) => (n as { _key: string })._key)).toEqual(content.map((n) => n._key));
    expect((content[0] as { url: string }).url).toBe("https://www.bo-no.design/roadmap/uiux-career-change");
  });

  it("does nothing for other guides", () => {
    expect(addGuideLinkFrom(content, "other-guide")).toBe(content);
  });
});

describe("guidePromoFrom", () => {
  it("uses the article prefix or falls back to the slug", () => {
    expect(guidePromoFrom("rdm-howtostart-roadmap", "end")).toBe("guide-rdm-promo-end");
    expect(guidePromoFrom("portfolio-01", "inline")).toBe("guide-portfolio-01-promo-inline");
  });
});
