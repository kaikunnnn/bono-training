import { parseEmailFrom } from "@/lib/activity-utils";

/**
 * ログイン済みでトップ（/）を開いたときに /mypage へ引き継ぐクエリを組み立てる。
 * proxy.ts と app/page.tsx の両方から使う（同じ挙動にするため1か所にまとめる）。
 *
 * 引き継ぐのは次の2つだけ（それ以外のクエリは捨てる）:
 * - welcome=1: signup直後の歓迎トースト用
 * - from=email_xxx: メールのリンクから来た印（EmailClickRecorder が email_click を記録する）
 *   これを捨てると、トップへのリンクを押した会員の email_click が残らない（#327-B のテストで判明）
 */
export function buildMypageSearch(params: {
  welcome?: string | null;
  from?: string | null;
}): string {
  const out = new URLSearchParams();
  if (params.welcome === "1") out.set("welcome", "1");
  const from = parseEmailFrom(params.from);
  if (from) out.set("from", from);
  const s = out.toString();
  return s ? `?${s}` : "";
}

/**
 * ログイン画面へ回すときの戻り先（redirectTo）に、メールの印だけを付け足す。
 * ログインが切れていた会員・未ログインの人がメールのリンクを押した場合でも、
 * ログイン後の着地ページで email_click が記録されるようにする（#327-B レビュー指摘）。
 * 印以外のクエリは付けない（戻り先の挙動を変えないため）。
 */
export function withEmailFrom(path: string, from: string | string[] | null | undefined): string {
  const valid = parseEmailFrom(typeof from === "string" ? from : null);
  if (!valid) return path;
  return `${path}${path.includes("?") ? "&" : "?"}from=${valid}`;
}
