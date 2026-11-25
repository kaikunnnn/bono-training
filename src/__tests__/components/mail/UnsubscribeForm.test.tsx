// 配信停止の画面は「BONOからのお知らせメール」1行だけを見せる（#327-C）
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/app/mail/unsubscribe/actions", () => ({
  stopMemberMail: vi.fn(async () => null),
  restartMemberMail: vi.fn(async () => null),
}));

import { UnsubscribeForm } from "@/app/mail/unsubscribe/UnsubscribeForm";

const HIDDEN_LABELS = [
  "しばらく来ていない",
  "相談のご案内",
  "以前の会員",
  "登録した方へのご案内",
  "メールの種類",
];

describe("配信停止の画面（UnsubscribeForm）", () => {
  it("止めているときは1行だけで「止めています」と再開ボタンを出す", () => {
    const { container } = render(<UnsubscribeForm token="tok" initiallyStopped />);
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("BONOからのお知らせメール")).toBeInTheDocument();
    expect(screen.getByText("止めています")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "受け取りを再開する" })).toHaveLength(1);
    // 内部のカテゴリを送らない（隠し項目はトークンだけ）
    const hidden = Array.from(container.querySelectorAll('input[type="hidden"]')).map((el) => el.getAttribute("name"));
    expect(hidden).toEqual(["t"]);
    for (const label of HIDDEN_LABELS) expect(container.textContent).not.toContain(label);
  });

  it("まだ止めていない・一部だけ止まっているとき（initiallyStopped=false）は「受け取りをやめる」だけ", () => {
    const { container } = render(<UnsubscribeForm token="tok" initiallyStopped={false} />);
    expect(screen.getByRole("button", { name: "受け取りをやめる" })).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).toBeNull();
    for (const label of HIDDEN_LABELS) expect(container.textContent).not.toContain(label);
  });
});
