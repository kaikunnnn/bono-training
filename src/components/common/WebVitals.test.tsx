import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";

const registrations: unknown[] = [];

vi.mock("next/web-vitals", () => ({
  useReportWebVitals: (callback: unknown) => {
    registrations.push(callback);
  },
}));

import { WebVitals } from "./WebVitals";
import { reportWebVitalsMetric } from "@/lib/analytics/web-vitals";

afterEach(() => {
  cleanup();
  registrations.length = 0;
});

describe("WebVitals client boundary", () => {
  it("registers the module-scope callback so re-renders do not add listeners", () => {
    const view = render(<WebVitals />);
    view.rerender(<WebVitals />);
    view.rerender(<WebVitals />);
    expect(registrations.length).toBeGreaterThan(0);
    for (const callback of registrations) {
      expect(callback).toBe(reportWebVitalsMetric);
    }
  });

  it("renders nothing into the tree", () => {
    const { container } = render(<WebVitals />);
    expect(container.innerHTML).toBe("");
  });
});
