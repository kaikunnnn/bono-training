// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { UserProvider } from "@/components/layout/UserProvider";
import { getCachedAuth, getCachedUser } from "./server";

vi.unmock("@/lib/supabase/server");
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ getUser: vi.fn(), createServerClient: vi.fn() }));
vi.mock("@supabase/ssr", () => ({ createServerClient: mocks.createServerClient }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ getAll: () => [], set: vi.fn() }),
}));

// Vitest does not run an RSC renderer. Model React's request-scoped memoization
// to test that our callers share ONE gateway and do not retain their own user.
// This verifies our wiring/error behavior, not the React cache implementation.
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof React>();
  const { AsyncLocalStorage } = await import("node:async_hooks");
  const scope = new AsyncLocalStorage<Map<() => unknown, unknown>>();
  return {
    ...actual,
    cache: (fn: () => unknown) => () => {
      const request = scope.getStore();
      if (!request) return fn();
      if (!request.has(fn)) request.set(fn, fn());
      return request.get(fn);
    },
    runTestRequest: <T,>(fn: () => T): T => scope.run(new Map(), fn),
  };
});

const { runTestRequest: request } = React as typeof React & {
  runTestRequest: <T>(fn: () => T) => T;
};

const user = (id: string, email?: string): User => ({
  id, email, aud: "authenticated", app_metadata: {}, user_metadata: {}, created_at: "2026-09-18",
});

beforeEach(() => {
  vi.resetAllMocks();
  mocks.createServerClient.mockReturnValue({ auth: { getUser: mocks.getUser } });
});

describe("shared request authentication", () => {
  it("shares the auth round trip across layout and page/service callers", async () => {
    const member = user("member-a", "test@example.invalid");
    mocks.getUser.mockResolvedValue({ data: { user: member }, error: null });
    const [layout, page, service] = await request(() => Promise.all([
      UserProvider(), getCachedUser(), getCachedUser(),
    ]));
    expect(mocks.getUser).toHaveBeenCalledTimes(1);
    expect(layout).toEqual({ user: { id: member.id, email: member.email }, invalidSession: false });
    expect(page).toBe(member);
    expect(service).toBe(member);
  });

  it("does not share users across concurrent requests", async () => {
    const first = user("member-a");
    const second = user("member-b");
    mocks.getUser.mockResolvedValueOnce({ data: { user: first }, error: null })
      .mockResolvedValueOnce({ data: { user: second }, error: null });
    const [a, b] = await Promise.all([
      request(() => Promise.all([UserProvider(), getCachedUser()])),
      request(() => Promise.all([UserProvider(), getCachedUser()])),
    ]);
    expect(a).toEqual([{ user: { id: "member-a", email: "" }, invalidSession: false }, first]);
    expect(b).toEqual([{ user: { id: "member-b", email: "" }, invalidSession: false }, second]);
    expect(mocks.getUser).toHaveBeenCalledTimes(2);
  });

  it.each([400, 401, 403])("preserves stale-session classification for status %i", async (status) => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: { status } });
    const [layout, page] = await request(() => Promise.all([UserProvider(), getCachedUser()]));
    expect(layout).toEqual({ user: null, invalidSession: true });
    expect(page).toBeNull();
    expect(mocks.getUser).toHaveBeenCalledTimes(1);
  });

  it.each([null, { status: 429 }, { status: 500 }, { name: "AuthRetryableFetchError" }])(
    "does not classify guests/transient errors as stale: %j", async (error) => {
      mocks.getUser.mockResolvedValue({ data: { user: null }, error });
      expect(await request(() => UserProvider())).toEqual({ user: null, invalidSession: false });
    },
  );

  it("does not clear the session when getUser throws", async () => {
    mocks.getUser.mockRejectedValue(new Error("network unavailable"));
    expect(await request(() => getCachedAuth())).toEqual({ user: null, invalidSession: false });
  });

  it("preserves client initialization failure behavior for both consumers", async () => {
    mocks.createServerClient.mockImplementation(() => { throw new Error("configuration error"); });
    await expect(request(() => getCachedUser())).rejects.toThrow("configuration error");
    expect(await request(() => UserProvider())).toEqual({ user: null, invalidSession: false });
  });

  it("retains a returned user even if the provider includes an error", async () => {
    const member = user("member-a");
    mocks.getUser.mockResolvedValue({ data: { user: member }, error: { status: 401 } });
    expect(await request(() => getCachedAuth())).toEqual({ user: member, invalidSession: false });
  });
});
