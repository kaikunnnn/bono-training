/**
 * Slack とつなぐページ（/slack/link・#263）のカードの枠。マイページの外に置く独立したページ。
 */
export function SlackLinkFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[60vh] px-4 py-16">
      <div className="mx-auto max-w-[480px] rounded-2xl border border-border-light bg-surface p-6 sm:p-8">{children}</div>
    </div>
  );
}
