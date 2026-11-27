// @vitest-environment node
// オーナーだけに Slack の確認用 DM を送る受け口（/api/member-mail/slack-owner-preview・#327-H）。
import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("server-only", () => ({}));
import { NextRequest } from "next/server";
import { ONBOARDING_DAY2_COPY } from "@/lib/member-mail/standing-copy";
import { approvedCampaign, FakeMail, makeDeps, MemStore, uid } from "./helpers";
import { FakeSlack, MemSlackDmStore, TEAM } from "./slack-dm-helpers";

const CAMPAIGN = "11111111-1111-4111-8111-111111111111";
let store: MemStore;
let slackStore: MemSlackDmStore;
let slack: FakeSlack;
vi.mock("@/lib/member-mail/runtime", () => ({
  createMailDeps: () => makeDeps(store, new FakeMail(), [], { slackDm: { store: slackStore, slack, teamId: TEAM } }),
}));

function request(query: string, auth = "Bearer cron-test-secret") {
  return new NextRequest(`https://www.bo-no.design/api/member-mail/slack-owner-preview${query}`, {
    method: "POST",
    headers: { authorization: auth },
  });
}

beforeEach(() => {
  process.env.CRON_SECRET = "cron-test-secret";
  vi.spyOn(console, "log").mockImplementation(() => {});
  store = new MemStore();
  store.settings.ownerUserIds = [uid(9)];
  store.campaigns.set(
    CAMPAIGN,
    approvedCampaign({ id: CAMPAIGN, kind: "signup", ...ONBOARDING_DAY2_COPY, standingKey: "onboarding_day2" }),
  );
  slackStore = new MemSlackDmStore(store);
  slackStore.links.set(uid(9), { teamId: TEAM, slackUserId: "U-9" });
  slack = new FakeSlack();
});

describe("POST /api/member-mail/slack-owner-preview", () => {
  it("CRON_SECRET が違えば 401 で何もしない", async () => {
    const { POST } = await import("@/app/api/member-mail/slack-owner-preview/route");
    expect((await POST(request(`?campaign=${CAMPAIGN}`, "Bearer wrong"))).status).toBe(401);
    expect(slack.infoCalls).toHaveLength(0);
  });

  it("campaign が UUID でなければ 400", async () => {
    const { POST } = await import("@/app/api/member-mail/slack-owner-preview/route");
    expect((await POST(request("?campaign=x"))).status).toBe(400);
  });

  it("オーナーにだけ送り、件数だけ返す", async () => {
    const { POST } = await import("@/app/api/member-mail/slack-owner-preview/route");
    const res = await POST(request(`?campaign=${CAMPAIGN}`));
    expect(await res.json()).toEqual({ outcome: "done", counts: { sent: 1 } });
    expect(slack.opened).toEqual(["U-9"]);
    expect(slackStore.dms).toHaveLength(0);
  });
});
