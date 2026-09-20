// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTrainingDetail } from "./training-detail";
import { getTrainingTaskDetail } from "./task-detail";

const mocks = vi.hoisted(() => ({
  createAnonClient: vi.fn(),
  createServerClient: vi.fn(),
  anonInvoke: vi.fn(),
  serverInvoke: vi.fn(),
  getTrainingDetailFromSanity: vi.fn(),
  getTrainingTaskDetailFromSanity: vi.fn(),
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
vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createServerClient,
}));
vi.mock("@/lib/sanity", () => ({
  getTrainingDetailFromSanity: mocks.getTrainingDetailFromSanity,
  getTrainingTaskDetailFromSanity: mocks.getTrainingTaskDetailFromSanity,
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

const sanityTask = {
  _id: "task-1",
  slug: "introduction",
  title: "テーマ：習慣化の困りごと",
  description: "タスク説明",
  orderIndex: 1,
  isPremium: false,
  category: "お題説明",
  tags: ["ポートフォリオ"],
  videoFull: "",
  videoPreview: "",
  previewSec: 0,
  sections: [{ _key: "section-1", sectionTitle: "説明", content: [] }],
  training: {
    _id: "training-1",
    title: "習慣化",
    slug: "habit-continuation",
    type: "portfolio",
  },
  allTasks: [
    { _id: "task-1", slug: "introduction", title: "導入", orderIndex: 1 },
    { _id: "task-2", slug: "practice", title: "実践", orderIndex: 2 },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  mocks.createAnonClient.mockReturnValue({
    functions: { invoke: mocks.anonInvoke },
  });
  mocks.createServerClient.mockResolvedValue({
    functions: { invoke: mocks.serverInvoke },
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

  it("serves a complete free task from Sanity without reading cookies or invoking Edge", async () => {
    mocks.getTrainingTaskDetailFromSanity.mockResolvedValue(sanityTask);

    await expect(
      getTrainingTaskDetail("habit-continuation", "introduction")
    ).resolves.toMatchObject({
      id: "task-1",
      slug: "introduction",
      trainingSlug: "habit-continuation",
      next_task: "practice",
      prev_task: null,
      hasAccess: true,
      sanitySections: sanityTask.sections,
    });
    expect(mocks.createServerClient).not.toHaveBeenCalled();
    expect(mocks.serverInvoke).not.toHaveBeenCalled();
  });

  it("keeps premium tasks on the authenticated Edge path", async () => {
    mocks.getTrainingTaskDetailFromSanity.mockResolvedValue({
      ...sanityTask,
      isPremium: true,
    });
    mocks.serverInvoke.mockResolvedValue({
      data: {
        success: true,
        data: {
          content: "会員向け本文",
          isPremium: true,
          hasAccess: true,
          meta: {
            title: "プレミアム課題",
            order_index: 1,
          },
        },
      },
      error: null,
    });

    await expect(
      getTrainingTaskDetail("habit-continuation", "introduction")
    ).resolves.toMatchObject({
      title: "プレミアム課題",
      content: "会員向け本文",
      is_premium: true,
      hasAccess: true,
    });
    expect(mocks.createServerClient).toHaveBeenCalledOnce();
    expect(mocks.serverInvoke).toHaveBeenCalledWith("get-training-content", {
      body: {
        trainingSlug: "habit-continuation",
        taskSlug: "introduction",
      },
    });
  });

  it("does not expose premium Sanity sections when the access check fails", async () => {
    mocks.getTrainingTaskDetailFromSanity.mockResolvedValue({
      ...sanityTask,
      isPremium: true,
    });
    mocks.serverInvoke.mockResolvedValue({
      data: null,
      error: new Error("Access check unavailable"),
    });

    await expect(
      getTrainingTaskDetail("habit-continuation", "introduction")
    ).rejects.toMatchObject({ code: "FETCH_ERROR" });
  });
});
