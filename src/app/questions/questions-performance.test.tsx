import { Children, isValidElement, Suspense, type ReactElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import QuestionsPage from "./page";
import { RelatedThreadsSection } from "@/components/questions/RelatedThreadsSection";
import {
  getQuestionList,
  getRecentQuestions,
  getRelatedQuestions,
} from "@/lib/services/questions";

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
