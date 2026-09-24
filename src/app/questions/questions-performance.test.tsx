import { Children, isValidElement, Suspense, type ReactElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import QuestionsPage from "./page";
import { RelatedThreadsSection } from "@/components/questions/RelatedThreadsSection";
import {
  getQuestionList,
  getRecentQuestions,
  getRelatedQuestions,
} from "@/lib/services/questions";
import { getCurrentUser, getSubscriptionStatus } from "@/lib/subscription";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/services/questions", () => ({
  getQuestionList: vi.fn(),
  getRecentQuestions: vi.fn(),
  getRelatedQuestions: vi.fn(),
}));
vi.mock("@/lib/subscription", () => ({
  getCurrentUser: vi.fn(),
  getSubscriptionStatus: vi.fn(),
}));

type Element = ReactElement<{ children?: ReactNode; fallback?: ReactNode }>;

function descendants(node: ReactNode): Element[] {
  return Children.toArray(node).flatMap((child) => {
    if (!isValidElement(child)) return [];
    const element = child as Element;
    return [element, ...descendants(element.props.children)];
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("questions performance contracts", () => {
  it("returns the public header shell without awaiting list or member data", () => {
    const shell = QuestionsPage();
    const elements = descendants(shell);

    expect(elements.filter((element) => element.type === Suspense)).toHaveLength(3);
    expect(elements.some(
      (element) => element.type === "h1" && element.props.children === "みんなの掲示板"
    )).toBe(true);
    expect(getQuestionList).not.toHaveBeenCalled();
  });

  it("renders populated list data without waiting for subscription access", async () => {
    vi.mocked(getQuestionList).mockResolvedValue([
      {
        question: {
          _id: "question-1",
          title: "表示を待たせない質問",
          slug: { _type: "slug", current: "question-1" },
        },
        commentCount: 0,
        reactionCounts: { cheer: 0, thanks: 0, insight: 0 },
        lastActivityAt: "2026-09-24T00:00:00.000Z",
        recentCommenters: [],
      } as Awaited<ReturnType<typeof getQuestionList>>[number],
    ]);

    const list = descendants(QuestionsPage()).find(
      element => typeof element.type === "function" && element.type.name === "QuestionListContent"
    );
    expect(list).toBeDefined();
    await (list!.type as () => Promise<ReactNode>)();

    expect(getQuestionList).toHaveBeenCalledWith({ limit: 6 });
    expect(getSubscriptionStatus).not.toHaveBeenCalled();
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it("starts related and recent thread requests together", async () => {
    const related = deferred<Awaited<ReturnType<typeof getRelatedQuestions>>>();
    const recent = deferred<Awaited<ReturnType<typeof getRecentQuestions>>>();
    vi.mocked(getRelatedQuestions).mockReturnValue(related.promise);
    vi.mocked(getRecentQuestions).mockReturnValue(recent.promise);

    const pending = RelatedThreadsSection({
      currentQuestionId: "current",
      categorySlug: "ui",
      showEngagement: true,
    });

    expect(getRelatedQuestions).toHaveBeenCalledWith({
      categorySlug: "ui",
      excludeIds: ["current"],
      limit: 2,
    });
    expect(getRecentQuestions).toHaveBeenCalledWith({
      excludeIds: ["current"],
      limit: 4,
    });

    related.resolve([]);
    recent.resolve([]);
    await expect(pending).resolves.toBeNull();
  });
});
