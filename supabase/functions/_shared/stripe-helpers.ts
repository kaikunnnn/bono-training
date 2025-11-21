/**
 * Stripe環境判定とクライアント作成のヘルパー関数
 */

import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

/**
 * 環境タイプ
 */
export type StripeEnvironment = 'test' | 'live';

/**
 * 適切なStripe Secret Keyを取得する
 * @param environment - 'test' または 'live'
 * @returns Stripe Secret Key
 * @throws 環境変数が設定されていない場合
 */
export function getStripeSecretKey(environment: StripeEnvironment): string {
  const envVarName = environment === 'test'
    ? 'STRIPE_TEST_SECRET_KEY'
    : 'STRIPE_LIVE_SECRET_KEY';

  const key = Deno.env.get(envVarName);

  if (!key) {
    throw new Error(`${envVarName} is not set in environment variables`);
  }

  return key;
}

/**
 * Stripeクライアントを作成する
 * @param environment - 'test' または 'live'
 * @returns Stripe client instance
 */
export function createStripeClient(environment: StripeEnvironment): Stripe {
  const apiKey = getStripeSecretKey(environment);

  return new Stripe(apiKey, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  });
}

/**
 * Webhook署名シークレットを取得する
 * @param environment - 'test' または 'live'
 * @returns Webhook signing secret
 * @throws 環境変数が設定されていない場合
 */
export function getWebhookSecret(environment: StripeEnvironment): string {
  const envVarName = environment === 'test'
    ? 'STRIPE_WEBHOOK_SECRET_TEST'
    : 'STRIPE_WEBHOOK_SECRET_LIVE';

  const secret = Deno.env.get(envVarName);

  if (!secret) {
    throw new Error(`${envVarName} is not set in environment variables`);
  }

  return secret;
}

/**
 * Stripe顧客IDまたはサブスクリプションIDから環境を判定する
 * 注: StripeのテストモードとライブモードではIDの形式が同じため、
 * IDだけでは確実な判定ができません。データベースのenvironmentカラムを使用してください。
 *
 * @param stripeId - Stripe customer ID or subscription ID
 * @returns 'test' if test mode ID detected, 'live' otherwise
 */
export function detectEnvironmentFromStripeId(stripeId: string): StripeEnvironment {
  // Stripeのテストモードとライブモードで顧客IDの形式は同じ（cus_xxxxx）
  // サブスクリプションIDも同じ形式（sub_xxxxx）
  // したがって、IDだけでは判定できない
  // この関数は参考実装として残すが、実際にはデータベースのenvironmentカラムを使用すること

  console.warn('⚠️ detectEnvironmentFromStripeId: Cannot reliably detect environment from Stripe ID alone. Use database environment column instead.');

  // デフォルトはliveを返す（安全のため）
  return 'live';
}
