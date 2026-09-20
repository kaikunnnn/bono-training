import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BoardNewDot,
  markBoardSeenInCurrentDocument,
} from "./BoardNewDot";
import { BoardSeenRecorder } from "./BoardSeenRecorder";
import { recordBoardSeen } from "@/lib/services/board-views";

vi.mock("@/lib/services/board-views", () => ({
  recordBoardSeen: vi.fn(),
}));

afterEach(() => {
  delete document.documentElement.dataset.bonoBoardSeen;
  vi.clearAllMocks();
});

describe("board seen state", () => {
  it("hides only the streamed sidebar dot in the current document", () => {
    render(<BoardNewDot />);
    expect(screen.getByRole("status", { name: "新着あり" })).not.toBeNull();

    act(() => markBoardSeenInCurrentDocument());

    expect(screen.queryByRole("status", { name: "新着あり" })).toBeNull();
  });

  it("records the view once and marks the document without refreshing the route", async () => {
    vi.mocked(recordBoardSeen).mockResolvedValue(undefined);
    render(<BoardSeenRecorder />);

    await waitFor(() => expect(recordBoardSeen).toHaveBeenCalledTimes(1));
    await waitFor(() => {
      expect(document.documentElement.dataset.bonoBoardSeen).toBe("1");
    });
  });
});
