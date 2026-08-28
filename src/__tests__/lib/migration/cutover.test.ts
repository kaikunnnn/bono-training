import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isPreCutover } from "@/lib/migration/cutover";

/**
 * サイト移行 B-4: NEXT_PUBLIC_SITE_URL による止血の自己無効化判定。
 *
 * 注意: Vitest は process.env を実行時に読むためこのテストが成立するが、
 * 本番ビルドでは NEXT_PUBLIC_* がインライン展開される。挙動の最終確認は
 * env を変えた 2 通りの `npm run build` で行うこと（このテストは補助）。
 */
describe("isPreCutover", () => {
  const original = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterEach(() => {
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = original;
    }
  });

  it("env 未設定は切替前扱い（止血継続）", () => {
    expect(isPreCutover()).toBe(true);
  });

  it("beta ドメイン(bono-training.vercel.app)は切替前＝true", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://bono-training.vercel.app";
    expect(isPreCutover()).toBe(true);
  });

  it("既定の app.bo-no.design は切替前＝true", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://app.bo-no.design";
    expect(isPreCutover()).toBe(true);
  });

  it("本番 www.bo-no.design は切替後＝false（止血自己無効化）", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.bo-no.design";
    expect(isPreCutover()).toBe(false);
  });

  it("apex bo-no.design も本番扱い＝false", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://bo-no.design";
    expect(isPreCutover()).toBe(false);
  });

  it("ポート付き host でも正しく判定する", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.bo-no.design:443";
    expect(isPreCutover()).toBe(false);
  });

  it("URL パース失敗は切替前扱い（安全側）", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "not-a-valid-url";
    expect(isPreCutover()).toBe(true);
  });
});
