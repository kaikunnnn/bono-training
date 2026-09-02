import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
} from "vitest";
import { createClient } from "@supabase/supabase-js";
import type { CreateNotificationInput } from "@/lib/services/notifications-create";

// server-only はテスト環境（非サーバー条件）だと import 時に throw するため空モックにする
vi.mock("server-only", () => ({}));
// service_role クライアント生成をモック（実DBには触れない）
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));

type MaybeSingleResult = { data: unknown; error: unknown };

interface ClientOpts {
  pref?: MaybeSingleResult;
  dedup?: MaybeSingleResult;
  insertError?: unknown;
}

/** notifications-create.ts が期待する最小限のクエリビルダ形状を持つモッククライアント */
function makeClient(opts: ClientOpts = {}) {
  const insertCalls: unknown[] = [];
  const client = {
    from(table: string) {
      const builder: Record<string, unknown> = {};
      const chain = () => builder;
      builder.select = chain;
      builder.eq = chain;
      builder.is = chain;
      builder.limit = chain;
      builder.maybeSingle = () =>
        Promise.resolve(
          table === "notification_type_preferences"
            ? (opts.pref ?? { data: null, error: null })
            : (opts.dedup ?? { data: null, error: null }),
        );
      builder.insert = (row: unknown) => {
        insertCalls.push(row);
        return Promise.resolve(
          opts.insertError ? { error: opts.insertError } : { error: null },
        );
      };
      return builder;
    },
  };
  return { client, insertCalls };
}

function baseInput(
  over: Partial<CreateNotificationInput> = {},
): CreateNotificationInput {
  return {
    recipientId: "recipient-1",
    actorId: "actor-1",
    actorName: "Actor",
    actorAvatarUrl: null,
    type: "question_comment",
    entityType: "comment",
    entityId: "comment-1",
    linkUrl: "/questions/slug#comment-comment-1",
    payload: null,
    ...over,
  };
}

// createNotification は module scope で env を1度だけ読むため、import 前に設定する
let createNotification: typeof import("@/lib/services/notifications-create").createNotification;

beforeAll(async () => {
  vi.stubEnv("SUPABASE_URL", "https://project.supabase.co");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-key");
  ({ createNotification } = await import(
    "@/lib/services/notifications-create"
  ));
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
  // OPS/WEBHOOK env は各テストで stub するため戻す（SUPABASE_* は beforeAll で再 stub 不要）
  vi.stubEnv("SLACK_OPS_WEBHOOK_URL", "");
  vi.stubEnv("SLACK_WEBHOOK_URL", "");
});

describe("createNotification", () => {
  it("自己通知（recipient === actor）は作成されない", async () => {
    const { client, insertCalls } = makeClient();
    vi.mocked(createClient).mockReturnValue(client as never);

    await createNotification(
      baseInput({ recipientId: "same", actorId: "same" }),
    );

    // service client すら生成されない（早期 return）
    expect(createClient).not.toHaveBeenCalled();
    expect(insertCalls).toHaveLength(0);
  });

  it("未読重複（dedup ヒット）では作成されない", async () => {
    const { client, insertCalls } = makeClient({
      dedup: { data: { id: "existing" }, error: null },
    });
    vi.mocked(createClient).mockReturnValue(client as never);

    await createNotification(baseInput());

    expect(insertCalls).toHaveLength(0);
  });

  it("オプトアウト（preference enabled=false）では作成されない", async () => {
    const { client, insertCalls } = makeClient({
      pref: { data: { enabled: false }, error: null },
    });
    vi.mocked(createClient).mockReturnValue(client as never);

    await createNotification(baseInput());

    expect(insertCalls).toHaveLength(0);
  });

  it("通常ケースでは1件 insert される", async () => {
    const { client, insertCalls } = makeClient();
    vi.mocked(createClient).mockReturnValue(client as never);

    await createNotification(baseInput());

    expect(insertCalls).toHaveLength(1);
  });

  it("insert 失敗でも例外を上へ投げない（fire-and-forget）", async () => {
    const { client } = makeClient({
      insertError: { message: "insert boom", code: "23505" },
    });
    vi.mocked(createClient).mockReturnValue(client as never);
    // OPS 未設定・WEBHOOK 未設定なら Slack 送信もスキップされ、静かに resolve する
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await expect(createNotification(baseInput())).resolves.toBeUndefined();
  });
});

describe("運用Slackへのアラート宛先（reportNotificationError 経路）", () => {
  it("insert 失敗（重大）は SLACK_OPS_WEBHOOK_URL へ通知する", async () => {
    vi.stubEnv("SLACK_OPS_WEBHOOK_URL", "https://example.com/ops-webhook");
    vi.stubEnv("SLACK_WEBHOOK_URL", "https://example.com/member-webhook");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const { client } = makeClient({
      insertError: { message: "insert boom" },
    });
    vi.mocked(createClient).mockReturnValue(client as never);

    await createNotification(baseInput());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://example.com/ops-webhook");
  });

  it("OPS 未設定時は SLACK_WEBHOOK_URL にフォールバックする", async () => {
    vi.stubEnv("SLACK_OPS_WEBHOOK_URL", "");
    vi.stubEnv("SLACK_WEBHOOK_URL", "https://example.com/member-webhook");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const { client } = makeClient({
      insertError: { message: "insert boom" },
    });
    vi.mocked(createClient).mockReturnValue(client as never);

    await createNotification(baseInput());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://example.com/member-webhook",
    );
  });

  it("非重大な失敗（preference 取得失敗）では Slack を送らない", async () => {
    vi.stubEnv("SLACK_OPS_WEBHOOK_URL", "https://example.com/ops-webhook");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    // preference select がエラー → フェイルオープンで insert は成功する
    const { client, insertCalls } = makeClient({
      pref: { data: null, error: { message: "pref boom" } },
    });
    vi.mocked(createClient).mockReturnValue(client as never);

    await createNotification(baseInput());

    expect(insertCalls).toHaveLength(1); // フェイルオープンで作成される
    expect(fetchMock).not.toHaveBeenCalled(); // 非重大なので Slack は無し
  });
});
