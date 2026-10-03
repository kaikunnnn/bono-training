import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CLS_VALUE_MULTIPLIER,
  WEB_VITALS_EVENT_NAME,
  buildWebVitalsEventParams,
  reportWebVitalsMetric,
  resetWebVitalsDedupe,
  toRouteGroup,
  type WebVitalMetric,
} from "@/lib/analytics/web-vitals";

const PRODUCTION_HOST = "www.bo-no.design";

function metric(overrides: Partial<WebVitalMetric> = {}): WebVitalMetric {
  return {
    name: "LCP",
    value: 2100.4,
    delta: 2100.4,
    id: "v4-1-1",
    rating: "good",
    navigationType: "navigate",
    ...overrides,
  };
}

/** 本番hostのwindowを立てる。`setTimeout` はgtag未初期化時の再試行に使われる。 */
function stubWindow(options: { hostname?: string; pathname?: string; gtag?: unknown }) {
  const gtag = options.gtag;
  const win: Record<string, unknown> = {
    location: {
      hostname: options.hostname ?? PRODUCTION_HOST,
      pathname: options.pathname ?? "/top",
    },
    setTimeout: vi.fn(),
  };
  if (gtag !== undefined) win.gtag = gtag;
  vi.stubGlobal("window", win);
  return win;
}

beforeEach(() => resetWebVitalsDedupe());
afterEach(() => vi.unstubAllGlobals());

describe("route_group", () => {
  it.each([
    ["/", "top"],
    ["/top", "top"],
    ["/lessons", "lesson"],
    ["/lessons/ui-visual-basic", "lesson"],
    ["/contents/how-to-design-list", "article"],
    ["/training", "training"],
    ["/training/todo-app/challenge", "training"],
    ["/questions", "questions"],
    ["/questions/abc123", "questions"],
    ["/mypage", "mypage"],
    ["/mypage/bookmarks", "mypage"],
    // 公開ブログは学習記事とレイアウトが別なので意図的に other。
    ["/articles/some-blog-post", "other"],
    ["/blog/some-blog-post", "other"],
    ["/roadmap/ui-visual", "other"],
    ["/subscription", "other"],
    ["/search", "other"],
    ["/settings", "other"],
    ["/guide", "other"],
    ["/achievements", "other"],
    ["/outputs", "other"],
    ["/how-to", "other"],
    ["/account", "other"],
    ["/profile/xyz", "other"],
    ["/community/feedback", "other"],
    ["/events", "other"],
    ["/notes", "other"],
    ["/updates", "other"],
    ["/feedbacks", "other"],
    ["/terms", "other"],
    ["/privacy", "other"],
    ["/tokushoho", "other"],
    ["/studio", "other"],
    ["/auth/callback", "other"],
    ["/login", "other"],
  ])("maps %s to %s", (pathname, expected) => {
    expect(toRouteGroup(pathname)).toBe(expected);
  });

  it("never leaks a slug or query into the group", () => {
    expect(toRouteGroup("/contents/secret-slug?utm_source=x#hash")).toBe("article");
    expect(toRouteGroup("/LESSONS/Mixed-Case")).toBe("lesson");
  });

  it("does not match a prefix on a different segment", () => {
    expect(toRouteGroup("/topics")).toBe("other");
    expect(toRouteGroup("/trainings-old")).toBe("other");
  });
});

describe("event parameters", () => {
  it("rounds millisecond metrics without a multiplier", () => {
    expect(buildWebVitalsEventParams(metric({ name: "TTFB", value: 412.63, delta: 412.63 }), "/top"))
      .toEqual({
        metric_name: "TTFB",
        metric_value: 413,
        metric_id: "v4-1-1",
        metric_rating: "good",
        metric_delta: 413,
        navigation_type: "navigate",
        route_group: "top",
      });
  });

  it("scales CLS by 1000 for both value and delta", () => {
    expect(CLS_VALUE_MULTIPLIER).toBe(1000);
    const params = buildWebVitalsEventParams(
      metric({ name: "CLS", value: 0.0834, delta: 0.0212, rating: "good" }),
      "/lessons/ui-visual-basic"
    );
    expect(params).toMatchObject({ metric_name: "CLS", metric_value: 83, metric_delta: 21 });
  });

  it.each(["TTFB", "FCP", "LCP", "CLS", "INP"])("accepts %s", (name) => {
    expect(buildWebVitalsEventParams(metric({ name }), "/top")).not.toBeNull();
  });

  it.each(["FID", "Next.js-hydration", "Next.js-render", "INP2"])("drops %s", (name) => {
    expect(buildWebVitalsEventParams(metric({ name }), "/top")).toBeNull();
  });

  it("falls back to unknown instead of sending undefined", () => {
    expect(
      buildWebVitalsEventParams(
        metric({ rating: undefined, navigationType: undefined }),
        "/mypage"
      )
    ).toMatchObject({ metric_rating: "unknown", navigation_type: "unknown" });
  });

  it("carries only the agreed low-cardinality keys", () => {
    const params = buildWebVitalsEventParams(metric(), "/contents/slug-should-not-appear");
    expect(Object.keys(params!).sort()).toEqual([
      "metric_delta",
      "metric_id",
      "metric_name",
      "metric_rating",
      "metric_value",
      "navigation_type",
      "route_group",
    ]);
    expect(JSON.stringify(params)).not.toContain("slug-should-not-appear");
  });
});

describe("production boundary", () => {
  it("sends one web_vitals event pinned to the existing stream", () => {
    const gtag = vi.fn();
    stubWindow({ gtag, pathname: "/questions/thread-id" });
    reportWebVitalsMetric(metric({ name: "INP", value: 184.2, delta: 184.2 }));
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith("event", WEB_VITALS_EVENT_NAME, {
      metric_name: "INP",
      metric_value: 184,
      metric_id: "v4-1-1",
      metric_rating: "good",
      metric_delta: 184,
      navigation_type: "navigate",
      route_group: "questions",
      send_to: "G-T8RTCENVBF",
    });
  });

  it.each(["localhost", "127.0.0.1", "bono-training.vercel.app", "preview.vercel.app", "www.bo-no.design.attacker.example"])(
    "sends nothing and schedules no retry on %s",
    (hostname) => {
      const gtag = vi.fn();
      const win = stubWindow({ hostname, gtag });
      reportWebVitalsMetric(metric());
      expect(gtag).not.toHaveBeenCalled();
      expect(win.setTimeout).not.toHaveBeenCalled();
    }
  );

  it("does not send while GA is not initialised on the production host", () => {
    const win = stubWindow({ gtag: undefined });
    reportWebVitalsMetric(metric());
    expect(win.setTimeout).toHaveBeenCalledTimes(1);
  });

  it("does not send page_view or content events", () => {
    const gtag = vi.fn();
    stubWindow({ gtag });
    reportWebVitalsMetric(metric());
    for (const call of gtag.mock.calls) {
      expect(call[0]).toBe("event");
      expect(call[1]).toBe(WEB_VITALS_EVENT_NAME);
    }
    expect(gtag.mock.calls.some((call) => call[0] === "config")).toBe(false);
  });
});

describe("duplicate policy for the same metric id", () => {
  it("skips a repeat report that carries the same rounded value", () => {
    const gtag = vi.fn();
    stubWindow({ gtag });
    const same = metric({ name: "CLS", value: 0.0834, delta: 0.0834, id: "v4-cls-1" });
    reportWebVitalsMetric(same);
    reportWebVitalsMetric({ ...same, delta: 0 });
    expect(gtag).toHaveBeenCalledTimes(1);
  });

  it("sends a growing cumulative value under the same id so MAX() stays correct", () => {
    const gtag = vi.fn();
    stubWindow({ gtag });
    reportWebVitalsMetric(metric({ name: "CLS", value: 0.05, delta: 0.05, id: "v4-cls-1" }));
    reportWebVitalsMetric(metric({ name: "CLS", value: 0.12, delta: 0.07, id: "v4-cls-1" }));
    expect(gtag).toHaveBeenCalledTimes(2);
    expect(gtag.mock.calls.map((call) => call[2].metric_value)).toEqual([50, 120]);
  });

  it("keeps ids independent, including a new id after a bfcache restore", () => {
    const gtag = vi.fn();
    stubWindow({ gtag });
    reportWebVitalsMetric(metric({ id: "v4-lcp-1", value: 1200, delta: 1200 }));
    reportWebVitalsMetric(
      metric({ id: "v4-lcp-2", value: 1200, delta: 1200, navigationType: "back-forward-cache" })
    );
    expect(gtag).toHaveBeenCalledTimes(2);
  });
});

describe("client boundary stays minimal", () => {
  const root = path.resolve(__dirname, "../../..");
  const read = (relative: string) => readFileSync(path.join(root, relative), "utf8");

  it("keeps RootLayout a Server Component that renders WebVitals", () => {
    const layout = read("app/layout.tsx");
    expect(layout).not.toMatch(/["']use client["']/);
    expect(layout).toContain("<WebVitals />");
  });

  it("confines the client directive to the WebVitals component", () => {
    const component = read("components/common/WebVitals.tsx");
    expect(component).toContain('"use client"');
    // 安定した参照を渡す（インライン関数だと再レンダリングごとに再登録される）。
    expect(component).toContain("useReportWebVitals(reportWebVitalsMetric)");
    expect(component).not.toMatch(/useReportWebVitals\(\s*\(/);
  });
});
