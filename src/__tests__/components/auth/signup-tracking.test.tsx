import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const trackEvent = vi.fn();
vi.mock("@/lib/analytics", () => ({ trackEvent: (...a: unknown[]) => trackEvent(...a) }));

const signUp = vi.fn();
vi.mock("@/app/(auth)/actions", () => ({ signUp: (...a: unknown[]) => signUp(...a) }));

let search = "redirectTo=%2Fsubscription%3Fintent_plan%3Dstandard%26intent_duration%3D3";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(search),
}));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { getUser: async () => ({ data: { user: null } }) } }),
}));
vi.mock("@/components/common/IntentPrefetchLink", () => ({
  IntentPrefetchLink: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock("@/components/auth/RegistrationFlowGuide", () => ({ RegistrationFlowGuide: () => null }));

import SignupPage from "@/app/(auth)/signup/page";

const events = () => trackEvent.mock.calls.map(([name, p]) => `${name}${p?.reason ? `:${p.reason}` : ""}`);

function fill(email: string, pw: string, confirm: string) {
  fireEvent.change(screen.getByLabelText("メールアドレス"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("パスワード"), { target: { value: pw } });
  fireEvent.change(screen.getByLabelText("パスワード（確認）"), { target: { value: confirm } });
}
const button = () => screen.getByRole("button", { name: /アカウントを作成/ });
const form = () => button().closest("form") as HTMLFormElement;

describe("登録画面の GA4 計測（#320）", () => {
  beforeEach(() => {
    trackEvent.mockClear();
    signUp.mockReset();
    search = "redirectTo=%2Fsubscription%3Fintent_plan%3Dstandard%26intent_duration%3D3";
  });

  it("ボタンを押すと signup_click（プラン付き）", () => {
    render(<SignupPage />);
    fireEvent.click(button());
    expect(trackEvent).toHaveBeenCalledWith("signup_click", { has_plan: true });
  });

  it("プランなしで来た人は has_plan=false", () => {
    search = "";
    render(<SignupPage />);
    fireEvent.click(button());
    expect(trackEvent).toHaveBeenCalledWith("signup_click", { has_plan: false });
  });

  it("ブラウザの入力チェックで止まった欄を数える", () => {
    render(<SignupPage />);
    fireEvent.invalid(screen.getByLabelText("メールアドレス"));
    fireEvent.invalid(screen.getByLabelText("パスワード"));
    expect(events()).toEqual(["signup_error:invalid_email", "signup_error:invalid_password"]);
  });

  it("文字数不足・不一致は送信前に止まり、理由つきで数える", () => {
    render(<SignupPage />);
    fill("a@example.com", "short", "short");
    fireEvent.submit(form());
    fill("a@example.com", "abcdefghijkl1", "abcdefghijkl2");
    fireEvent.submit(form());
    expect(events()).toEqual([
      "signup_submit",
      "signup_error:password_too_short",
      "signup_submit",
      "signup_error:password_mismatch",
    ]);
    expect(signUp).not.toHaveBeenCalled();
  });

  it("サーバーがエラーを返したら server", async () => {
    signUp.mockResolvedValue({ error: "このメールアドレスは登録済みです" });
    render(<SignupPage />);
    fill("a@example.com", "abcdefghijkl1", "abcdefghijkl1");
    fireEvent.submit(form());
    await waitFor(() => expect(events()).toEqual(["signup_submit", "signup_error:server"]));
  });

  it("通信が失敗したら request_failed", async () => {
    signUp.mockRejectedValue(new TypeError("Failed to fetch"));
    Object.assign(navigator, { sendBeacon: vi.fn(() => true) });
    render(<SignupPage />);
    fill("a@example.com", "abcdefghijkl1", "abcdefghijkl1");
    fireEvent.submit(form());
    await waitFor(() => expect(events()).toEqual(["signup_submit", "signup_error:request_failed"]));
  });

  it("メールアドレスは GA4 に送らない", async () => {
    signUp.mockResolvedValue({ error: "x" });
    render(<SignupPage />);
    fill("secret@example.com", "abcdefghijkl1", "abcdefghijkl1");
    const f = form();
    fireEvent.click(button());
    fireEvent.submit(f);
    await waitFor(() => expect(signUp).toHaveBeenCalled());
    expect(JSON.stringify(trackEvent.mock.calls)).not.toContain("secret@example.com");
  });
});
