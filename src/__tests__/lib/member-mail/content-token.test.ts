// @vitest-environment node
import { describe, it, expect } from "vitest";
import { getCampaignBlockReason, renderMail, withFromParam } from "@/lib/member-mail/content";
import { jstWeekStart, isWithinSendWindow } from "@/lib/member-mail/dates";
import { createUnsubscribeToken, verifyUnsubscribeToken } from "@/lib/member-mail/unsubscribe-token";
import { approvedCampaign, SECRET, SITE, uid } from "./helpers";

describe("配信停止トークン（署名つき）", () => {
  it("作ったトークンは検証でき、誰の・どのカテゴリかが分かる", () => {
    const t = createUnsubscribeToken(SECRET, uid(1), "notice");
    expect(verifyUnsubscribeToken(SECRET, t)).toEqual({ userId: uid(1), category: "notice" });
    expect(t).not.toContain("@");
  });

  it("書き換え・別の鍵・壊れた形は通らない", () => {
    const t = createUnsubscribeToken(SECRET, uid(1), "notice");
    const swapped = t.replace(uid(1), uid(2));
    expect(verifyUnsubscribeToken(SECRET, swapped)).toBeNull();
    expect(verifyUnsubscribeToken(SECRET, t.replace(".notice.", ".comeback."))).toBeNull();
    expect(verifyUnsubscribeToken(`${SECRET}x`, t)).toBeNull();
    expect(verifyUnsubscribeToken(SECRET, "v1.x.y.z")).toBeNull();
    expect(verifyUnsubscribeToken(SECRET, null)).toBeNull();
    expect(verifyUnsubscribeToken("short", t)).toBeNull();
  });
});

describe("文面の検査と組み立て", () => {
  it("承認の版と今の版が違えば送れない", () => {
    expect(getCampaignBlockReason(approvedCampaign())).toBeNull();
    expect(getCampaignBlockReason(approvedCampaign({ approvedVersion: null }))).toBe("message_not_approved");
    expect(getCampaignBlockReason(approvedCampaign({ contentVersion: 2, approvedVersion: 1 }))).toBe(
      "message_not_approved",
    );
    expect(getCampaignBlockReason(approvedCampaign({ subject: " " }))).toBe("subject_empty");
    expect(getCampaignBlockReason(approvedCampaign({ body: "{{name}}さん" }))).toBe("message_placeholder");
    expect(getCampaignBlockReason(approvedCampaign({ body: "http://example.invalid/" }))).toBe("message_non_https_url");
  });

  it("サイトへのリンクにだけ from=email_xxx を付ける", () => {
    expect(withFromParam("https://www.bo-no.design/lessons/a?x=1", "email_weekly", SITE)).toBe(
      "https://www.bo-no.design/lessons/a?x=1&from=email_weekly",
    );
    expect(withFromParam("https://bo-no.design/a", "email_weekly", SITE)).toContain("from=email_weekly");
    expect(withFromParam("https://example.invalid/a", "email_weekly", SITE)).toBe("https://example.invalid/a");
  });

  it("HTML はエスケープされ、末尾に法定表示（送り主・配信停止・特商法ページ）が入る。テキスト版もある", () => {
    const r = renderMail(approvedCampaign({ body: "<script>x</script>\n\n- [一つ目](https://www.bo-no.design/a)" }), {
      siteUrl: SITE,
      unsubscribeUrl: `${SITE}/mail/unsubscribe?t=abc`,
    });
    expect(r.html).not.toContain("<script>");
    expect(r.html).toContain("&lt;script&gt;");
    expect(r.html).toContain("<li");
    for (const out of [r.html, r.text]) {
      expect(out).toContain("カイクン（BONO）");
      expect(out).toContain(`${SITE}/mail/unsubscribe?t=abc`);
      expect(out).toContain(`${SITE}/tokushoho`);
      expect(out).toContain("受け取りをやめる");
    }
    expect(r.text).toContain("一つ目（https://www.bo-no.design/a?from=email_weekly）");
  });

  it("登録だけの人向けには「会員の方」と書かない", () => {
    const r = renderMail(approvedCampaign({ kind: "signup" }), { siteUrl: SITE, unsubscribeUrl: `${SITE}/u` });
    expect(r.text).toContain("ご登録いただいた方");
    expect(r.text).not.toContain("会員の方");
  });
});

describe("日本時間の区切り", () => {
  it("週は月曜0時（JST）から", () => {
    // 2026-11-11（水）12:00 JST
    expect(jstWeekStart(new Date("2026-11-11T03:00:00Z")).toISOString()).toBe("2026-11-08T15:00:00.000Z");
    // 2026-11-09（月）0:30 JST
    expect(jstWeekStart(new Date("2026-11-08T15:30:00Z")).toISOString()).toBe("2026-11-08T15:00:00.000Z");
  });
  it("8〜21時だけ送る", () => {
    expect(isWithinSendWindow(new Date("2026-11-08T23:00:00Z"), 8, 21)).toBe(true); // 8:00 JST
    expect(isWithinSendWindow(new Date("2026-11-08T22:59:00Z"), 8, 21)).toBe(false); // 7:59 JST
    expect(isWithinSendWindow(new Date("2026-11-09T12:00:00Z"), 8, 21)).toBe(false); // 21:00 JST
  });
});
