// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTrainingDetail } from "./training-detail";

const mocks = vi.hoisted(() => ({
  createAnonClient: vi.fn(),
  anonInvoke: vi.fn(),
  getTrainingDetailFromSanity: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
}));
vi.mock("react", () => ({
  cache: (fn: unknown) => fn,
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: mocks.createAnonClient,
}));
vi.mock("@/lib/sanity", () => ({
  getTrainingDetailFromSanity: mocks.getTrainingDetailFromSanity,
}));

const sanityTraining = {
  _id: "training-1",
  slug: "habit-continuation",
  title: "習慣化する人の困りごとを解決しよう",
  description: "説明",
  type: "portfolio",
  difficulty: "normal",
  category: "情報設計",
  tags: ["UI"],
  isPremium: false,
  iconImageUrl: "/assets/emoji/check.svg",
  thumbnailUrl: "/thumbnail.webp",
  backgroundSvg: "/background.svg",
  tasks: [
    {
      _id: "task-1",
      slug: "introduction",
      title: "テーマ：習慣化の困りごと",
      orderIndex: 1,
      isPremium: false,
      description: "タスク説明",
      category: "お題説明",
      tags: ["ポートフォリオ"],
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  mocks.createAnonClient.mockReturnValue({
    functions: { invoke: mocks.anonInvoke },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("training detail data", () => {
  it("uses Sanity first and keeps task card fields without invoking the legacy Edge Function", async () => {
    mocks.getTrainingDetailFromSanity.mockResolvedValue(sanityTraining);

    const result = await getTrainingDetail(" habit-continuation ");

    expect(result.tasks[0]).toMatchObject({
      slug: "introduction",
      description: "タスク説明",
      category: "お題説明",
      tags: ["ポートフォリオ"],
    });
    expect(mocks.createAnonClient).not.toHaveBeenCalled();
    expect(mocks.anonInvoke).not.toHaveBeenCalled();
  });

  it("falls back to the legacy detail function for content not present in Sanity", async () => {
    mocks.getTrainingDetailFromSanity.mockResolvedValue(null);
    mocks.anonInvoke.mockResolvedValue({
      data: {
        success: true,
        data: {
          id: "storage-training",
          slug: "storage-only",
          title: "Storage only",
          description: "説明",
          type: "challenge",
          difficulty: "normal",
          tags: [],
          tasks: [],
        },
      },
      error: null,
    });

    await expect(getTrainingDetail("storage-only")).resolves.toMatchObject({
      id: "storage-training",
      slug: "storage-only",
    });
    expect(mocks.anonInvoke).toHaveBeenCalledWith("get-training-detail", {
      body: { slug: "storage-only" },
    });
  });
});
