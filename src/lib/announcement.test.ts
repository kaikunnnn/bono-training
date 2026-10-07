import { describe, expect, it } from "vitest";
import {
  announcementDismissKey,
  buildAnnouncementPrePaintScript,
  isAnnouncementActive,
  type Announcement,
} from "./announcement";

const a: Announcement = {
  id: "event-2026-10",
  label: "募集中",
  text: "テスト",
  href: "/events/x",
  endsAt: "2026-10-21T15:00:00.000Z",
};

describe("announcement", () => {
  it("締切（10/21 23:59:59 JST）までは表示し、締切以降は表示しない", () => {
    const end = Date.parse(a.endsAt);
    expect(isAnnouncementActive(a, end - 1)).toBe(true);
    expect(isAnnouncementActive(a, end)).toBe(false);
    expect(isAnnouncementActive({ ...a, endsAt: "invalid" }, 0)).toBe(false);
  });

  it("閉じた記録のキーは告知 id を含む", () => {
    expect(announcementDismissKey(a.id)).toBe(
      "bono:announcement-dismissed:event-2026-10"
    );
  });

  it("描画前スクリプトは期限と閉じた記録のキーを埋め込み、</script> を含まない", () => {
    const s = buildAnnouncementPrePaintScript(a);
    expect(s).toContain(String(Date.parse(a.endsAt)));
    expect(s).toContain(JSON.stringify(announcementDismissKey(a.id)));
    expect(s).not.toContain("</");
  });
});
