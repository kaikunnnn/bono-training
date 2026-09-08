import { type Page, type BrowserContext } from "@playwright/test";

/**
 * ログインヘルパー（storageState 方式の雛形）。
 *
 * ⚠️ 次段（認証フロー E2E）用のスケルトン。第1スイートでは未使用。
 *
 * 想定する使い方:
 *   1. グローバルセットアップ（or 個別 spec の beforeAll）でテスト会員を
 *      UI ログインさせ、context.storageState() を e2e/.auth/member.json に保存する。
 *   2. authenticated.spec.ts では
 *        test.use({ storageState: "e2e/.auth/member.json" })
 *      でログイン済みセッションを再利用する（毎テストでログインしない）。
 *
 * 必要な前提（env）:
 *   - E2E_MEMBER_EMAIL     … 課金アクティブなテスト会員のメール
 *   - E2E_MEMBER_PASSWORD  … そのパスワード
 *   （本番betaに対して回す場合、live 環境で is_active な実在会員が必要。
 *     ダミー会員では ai-chat が 403 になるため成立しない。）
 *
 * e2e/.auth/ は .gitignore 済み（認証情報をコミットしない）。
 */

export const MEMBER_STORAGE_STATE = "e2e/.auth/member.json";

/**
 * UI 経由でログインし、セッションを storageState に保存する。
 *
 * TODO(次段): /login のフォーム構造（入力 name / ボタン / 成功後の遷移先）を
 * 実 DOM に合わせて実装する。ここではシグネチャと手順のみ定義する。
 */
export async function loginAsMember(
  page: Page,
  context: BrowserContext,
  opts?: { email?: string; password?: string; storagePath?: string }
): Promise<void> {
  const email = opts?.email ?? process.env.E2E_MEMBER_EMAIL;
  const password = opts?.password ?? process.env.E2E_MEMBER_PASSWORD;
  const storagePath = opts?.storagePath ?? MEMBER_STORAGE_STATE;

  if (!email || !password) {
    throw new Error(
      "loginAsMember: E2E_MEMBER_EMAIL / E2E_MEMBER_PASSWORD が未設定です"
    );
  }

  // TODO(次段): 実装
  // await page.goto("/login");
  // await page.getByLabel("メールアドレス").fill(email);
  // await page.getByLabel("パスワード").fill(password);
  // await page.getByRole("button", { name: /ログイン/ }).click();
  // await page.waitForURL((url) => !url.pathname.startsWith("/login"));
  // await context.storageState({ path: storagePath });

  throw new Error(
    "loginAsMember はまだ実装されていません（次段で /login の DOM に合わせて実装）"
  );
}
