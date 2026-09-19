import { describe, expect, it } from "vitest";
import { mergeCompletedArticleIds } from "./article-progress-state";

describe("mergeCompletedArticleIds", () => {
  it("preserves optimistic completions made before the server snapshot arrives", () => {
    const overrides = new Map([
      ["newly-completed", true],
      ["newly-uncompleted", false],
    ]);

    expect(
      mergeCompletedArticleIds(
        ["already-completed", "newly-uncompleted"],
        overrides,
      ),
    ).toEqual(["already-completed", "newly-completed"]);
  });

  it("returns the server snapshot unchanged when there are no overrides", () => {
    expect(mergeCompletedArticleIds(["one", "two"], new Map())).toEqual([
      "one",
      "two",
    ]);
  });
});
