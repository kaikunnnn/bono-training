import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { recordActivity } from "@/lib/services/activity";
import type { RecordActivityInput } from "@/lib/activity-utils";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

function makeClient(opts: {
  user?: { id: string } | null;
  insertError?: { code?: string; message?: string } | null;
  getUserThrows?: boolean;
}) {
  const insert = vi.fn().mockResolvedValue({ error: opts.insertError ?? null });
  const from = vi.fn(() => ({ insert }));
  const getUser = opts.getUserThrows
    ? vi.fn().mockRejectedValue(new Error("network"))
    : vi.fn().mockResolvedValue({ data: { user: opts.user ?? null }, error: null });
  vi.mocked(createClient).mockResolvedValue({
    auth: { getUser },
    from,
  } as unknown as Awaited<ReturnType<typeof createClient>>);
  return { insert, from, getUser };
}

describe("recordActivity (Server Action)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("未ログインは何もしない", async () => {
    const { insert } = makeClient({ user: null });
    await recordActivity({ eventType: "site_visit" });
    expect(insert).not.toHaveBeenCalled();
  });

  it("不正な event_type は DB に触れない", async () => {
    const { insert, getUser } = makeClient({ user: { id: "u1" } });
    await recordActivity({ eventType: "bogus" } as unknown as RecordActivityInput);
    expect(getUser).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it("ログイン中は本人の user_id で1行 insert する", async () => {
    const { insert, from } = makeClient({ user: { id: "u1" } });
    await recordActivity({
      eventType: "pricing_cta_click",
      path: "/lessons/x",
      meta: { source_group: "lesson_lock" },
    });
    expect(from).toHaveBeenCalledWith("member_activity_events");
    expect(insert).toHaveBeenCalledWith({
      event_type: "pricing_cta_click",
      article_id: null,
      lesson_id: null,
      path: "/lessons/x",
      meta: { source_group: "lesson_lock" },
      user_id: "u1",
    });
  });

  it("site_visit の一意制約違反（同日2回目）は成功扱いでログも出さない", async () => {
    makeClient({ user: { id: "u1" }, insertError: { code: "23505" } });
    await expect(recordActivity({ eventType: "site_visit" })).resolves.toBeUndefined();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("その他の insert 失敗はログのみで throw しない", async () => {
    makeClient({ user: { id: "u1" }, insertError: { code: "42501", message: "rls" } });
    await expect(
      recordActivity({ eventType: "article_view", articleId: "a1" })
    ).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it("認証取得の例外でも throw しない", async () => {
    makeClient({ getUserThrows: true });
    await expect(recordActivity({ eventType: "lesson_view" })).resolves.toBeUndefined();
  });
});
