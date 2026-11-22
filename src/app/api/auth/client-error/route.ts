import { NextRequest, NextResponse } from "next/server";
import { reportAuthError } from "@/lib/monitoring";

/**
 * ブラウザ側で検知した認証まわりの失敗を Vercel のログに残す（#321 S5）。
 * 例: 登録ボタンを押したが、サーバーとの通信そのものが失敗した。
 *
 * ログに書くだけで、DB や外部サービスには何もしない。
 * 受け付ける種類は固定し、文字数も切り詰める（ログを荒らされないように）。
 */
const ALLOWED_TYPES = new Set(["signup_request_failed"]);

export async function POST(req: NextRequest) {
  let body: { type?: unknown; email?: unknown; message?: unknown };
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const type = typeof body.type === "string" ? body.type : "";
  if (!ALLOWED_TYPES.has(type)) {
    return new NextResponse(null, { status: 400 });
  }

  await reportAuthError({
    type: "signup_request_failed",
    email: typeof body.email === "string" ? body.email.slice(0, 254) : undefined,
    message: typeof body.message === "string" ? body.message.slice(0, 300) : "",
    path: "/signup",
  });

  return new NextResponse(null, { status: 204 });
}
