/**
 * Resend メール送信モジュール
 * https://resend.com/docs/api-reference/emails/send-email
 */

const RESEND_API_URL = 'https://api.resend.com/emails';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  /** プレーンテキスト版（任意）。HTMLを表示しないメーラー向け */
  text?: string;
  /** 返信先（任意）。Resend API の `reply_to`。未指定なら送信元（noreply）に返る */
  replyTo?: string;
}

interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Resendを使ってメールを送信
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = Deno.env.get('RESEND_API_KEY');

  if (!apiKey) {
    console.error('❌ RESEND_API_KEY が設定されていません');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'BONO <noreply@mail.bo-no.design>';

  try {
    console.log(`📧 メール送信開始: ${params.to}`);
    console.log(`   件名: ${params.subject}`);

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        ...(params.text ? { text: params.text } : {}),
        ...(params.replyTo ? { reply_to: params.replyTo } : {}),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ メール送信エラー:', data);
      return { success: false, error: data.message || 'Unknown error' };
    }

    console.log(`✅ メール送信成功: ${data.id}`);
    return { success: true, id: data.id };

  } catch (error) {
    console.error('❌ メール送信例外:', error);
    return { success: false, error: error.message };
  }
}

/**
 * メール送信（エラーがあってもWebhook処理を止めない）
 * Webhook処理の中で使用する
 */
export async function sendEmailSafe(params: SendEmailParams): Promise<void> {
  try {
    const result = await sendEmail(params);
    if (!result.success) {
      console.warn(`⚠️ メール送信失敗（続行）: ${result.error}`);
    }
  } catch (error) {
    console.warn(`⚠️ メール送信例外（続行）: ${error.message}`);
  }
}
