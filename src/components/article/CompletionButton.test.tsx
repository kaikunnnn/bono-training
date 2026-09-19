import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CompletionButton } from "./CompletionButton";
import {
  getLessonStatus,
  removeLessonCompletion,
  setArticleCompletion,
} from "@/lib/services/progress";

vi.mock("@/lib/services/progress", () => ({
  getLessonStatus: vi.fn(),
  removeLessonCompletion: vi.fn(),
  setArticleCompletion: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe("CompletionButton deferred lesson status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(setArticleCompletion).mockResolvedValue({
      success: true,
      isCompleted: true,
      message: "更新しました",
    });
    vi.mocked(removeLessonCompletion).mockResolvedValue({
      success: true,
    });
  });

  it("does not read lesson status when completing an article", async () => {
    render(
      <CompletionButton
        articleId="article-1"
        lessonId="lesson-1"
        initialIsCompleted={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "完了にする" }));

    await waitFor(() => {
      expect(setArticleCompletion).toHaveBeenCalledWith(
        "article-1",
        "lesson-1",
        true,
      );
    });
    expect(getLessonStatus).not.toHaveBeenCalled();
  });

  it("checks the latest lesson status and keeps the undo confirmation", async () => {
    vi.mocked(getLessonStatus).mockResolvedValue("completed");

    render(
      <CompletionButton
        articleId="article-1"
        lessonId="lesson-1"
        initialIsCompleted
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "完了済み" }));

    expect(
      await screen.findByText("レッスン完了を解除しますか？"),
    ).not.toBeNull();
    expect(getLessonStatus).toHaveBeenCalledWith("lesson-1");
    expect(setArticleCompletion).not.toHaveBeenCalled();
  });

  it("uncompletes directly when the lesson itself is not completed", async () => {
    vi.mocked(getLessonStatus).mockResolvedValue("in_progress");
    vi.mocked(setArticleCompletion).mockResolvedValue({
      success: true,
      isCompleted: false,
      message: "未完了に戻しました",
    });

    render(
      <CompletionButton
        articleId="article-1"
        lessonId="lesson-1"
        initialIsCompleted
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "完了済み" }));

    await waitFor(() => {
      expect(setArticleCompletion).toHaveBeenCalledWith(
        "article-1",
        "lesson-1",
        false,
      );
    });
    expect(
      screen.queryByText("レッスン完了を解除しますか？"),
    ).toBeNull();
  });
});
