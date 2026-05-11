import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

type SanityWebhookBody = {
  _type?: string;
  _id?: string;
};

/**
 * Sanity webhook endpoint
 *
 * Sanity Studio でコンテンツを編集 → publish/update/delete されると
 * このエンドポイントが叩かれる。`_type` をもとに `revalidateTag` で
 * 該当キャッシュを無効化し、次のアクセスで即時反映される。
 *
 * 環境変数: SANITY_WEBHOOK_SECRET（Sanity webhook 設定と同じ値）
 *
 * Sanity 側 webhook 設定:
 *   URL:        https://<domain>/api/revalidate
 *   Trigger:    Create, Update, Delete
 *   Filter:     _type in [...対象の document type...]
 *   Projection: { _type, _id }
 *   Method:     POST
 *   Secret:     SANITY_WEBHOOK_SECRET と同じ値
 */
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.SANITY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("[revalidate] SANITY_WEBHOOK_SECRET is not set");
      return new Response("Server misconfigured: missing secret", {
        status: 500,
      });
    }

    const signature = req.headers.get(SIGNATURE_HEADER_NAME);
    if (!signature) {
      return new Response("Missing signature header", { status: 401 });
    }

    const bodyText = await req.text();
    const valid = await isValidSignature(bodyText, signature, secret);
    if (!valid) {
      return new Response("Invalid signature", { status: 401 });
    }

    const body = JSON.parse(bodyText) as SanityWebhookBody;
    if (!body?._type) {
      return new Response("Missing _type in body", { status: 400 });
    }

    revalidateTag(body._type, "max");

    return NextResponse.json({
      revalidated: true,
      type: body._type,
      id: body._id,
      now: Date.now(),
    });
  } catch (error) {
    console.error("[revalidate] error:", error);
    return new Response("Server error", { status: 500 });
  }
}
