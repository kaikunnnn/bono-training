// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTrainings } from "./training-list";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getTrainingListFromSanity: vi.fn(),
  invoke: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/sanity", () => ({
  getTrainingListFromSanity: mocks.getTrainingListFromSanity,
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  mocks.createClient.mockResolvedValue({
    functions: { invoke: mocks.invoke },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getTrainings", () => {
  it("uses the cached Sanity list without initializing the authenticated Supabase client", async () => {
    mocks.getTrainingListFromSanity.mockResolvedValue([
      {
        _id: "training-1",
        slug: " portfolio-training ",
        title: "ポートフォリオトレーニング",
        description: "作品を作る",
        type: "portfolio",
        difficulty: "normal",
        category: "情報設計",
        tags: ["UI"],
        isPremium: true,
        iconImageUrl: "/icon.svg",
        thumbnailUrl: "/thumbnail.webp",
        backgroundSvg: "/background.svg",
        estimatedTotalTime: "120分",
        task_count: 4,
      },
    ]);

    await expect(getTrainings()).resolves.toEqual([
      {
        id: "training-1",
        slug: "portfolio-training",
        title: "ポートフォリオトレーニング",
        description: "作品を作る",
        type: "portfolio",
        difficulty: "normal",
        category: "情報設計",
        tags: ["UI"],
        isFree: false,
        icon: "/icon.svg",
        thumbnailImage: "/thumbnail.webp",
        backgroundImage: "/background.svg",
        estimated_total_time: "120分",
        task_count: 4,
      },
    ]);
    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(mocks.invoke).not.toHaveBeenCalled();
  });

  it.each([
    ["Sanity error", new Error("Sanity unavailable")],
    ["empty Sanity response", []],
  ])("falls back to the Edge Function after %s", async (_label, sanityResult) => {
    if (sanityResult instanceof Error) {
      mocks.getTrainingListFromSanity.mockRejectedValue(sanityResult);
    } else {
      mocks.getTrainingListFromSanity.mockResolvedValue(sanityResult);
    }
    mocks.invoke.mockResolvedValue({
      data: {
        success: true,
        data: [{ id: "edge-1", slug: " edge-training ", title: "Edge" }],
      },
      error: null,
    });

    await expect(getTrainings()).resolves.toEqual([
      { id: "edge-1", slug: "edge-training", title: "Edge" },
    ]);
    expect(mocks.createClient).toHaveBeenCalledOnce();
    expect(mocks.invoke).toHaveBeenCalledWith("get-training-list", { body: {} });
  });

  it("returns an empty list only when both sources fail", async () => {
    mocks.getTrainingListFromSanity.mockRejectedValue(new Error("Sanity unavailable"));
    mocks.invoke.mockResolvedValue({ data: null, error: new Error("Edge unavailable") });

    await expect(getTrainings()).resolves.toEqual([]);
  });
});
