import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

/**
 * 質問回答通知API
 * Sanity WebhookからコールされてユーザーにEmail通知を送る
 */

const resend = new Resend(process.env.RESEND_API_KEY);

interface SanityWebhookPayload {
  _id: string;
  _type: string;
  title: string;
  slug: { current: string };
  status: string;
  isPublic: boolean;
  author?: {
    userId: string;
    displayName: string;
    avatarUrl?: string;
  };
}

// メールHTML生成
function generateEmailHtml(data: {
  displayName: string;
  questionTitle: string;
  questionUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>質問への回答が届きました</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                🎉 回答が届きました！
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.6;">
                ${data.displayName}さん、こんにちは！
              </p>
              <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">
                あなたの質問にカイくんが回答しました。
              </p>

              <!-- Question Card -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px; color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                      あなたの質問
                    </p>
                    <p style="margin: 0; color: #1a1a1a; font-size: 18px; font-weight: 600; line-height: 1.4;">
                      ${data.questionTitle}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <a href="${data.questionUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 16px 32px; border-radius: 8px;">
                      回答を見る →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                このメールは <a href="https://training.bo-no.design" style="color: #667eea; text-decoration: none;">BONO</a> から送信されています。
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// Webhook Secret検証（オプション）
function verifyWebhookSecret(req: VercelRequest): boolean {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) {
    // Secretが設定されていない場合はスキップ
    return true;
  }

  const signature = req.headers['sanity-webhook-signature'];
  // 簡易的な検証（本番ではより厳密な検証が必要）
  return signature === secret;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORSヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, sanity-webhook-signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Webhook Secret検証
  if (!verifyWebhookSecret(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const payload: SanityWebhookPayload = req.body;

  // 質問ドキュメントのみ処理
  if (payload._type !== 'question') {
    return res.status(200).json({ message: 'Ignored: not a question document' });
  }

  // 回答済み＆公開の場合のみ通知
  if (payload.status !== 'answered' || !payload.isPublic) {
    return res.status(200).json({ message: 'Ignored: not answered or not public' });
  }

  // 投稿者情報がない場合はスキップ（手動作成の質問）
  if (!payload.author?.userId) {
    return res.status(200).json({ message: 'Ignored: no author information' });
  }

  // Supabaseからユーザーのメールアドレスを取得
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase configuration missing');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Supabase Admin APIでユーザー情報を取得
    const userResponse = await fetch(
      `${supabaseUrl}/auth/v1/admin/users/${payload.author.userId}`,
      {
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          apikey: supabaseServiceKey,
        },
      }
    );

    if (!userResponse.ok) {
      console.error('Failed to fetch user:', await userResponse.text());
      return res.status(500).json({ error: 'Failed to fetch user information' });
    }

    const userData = await userResponse.json();
    const userEmail = userData.email;

    if (!userEmail) {
      return res.status(400).json({ error: 'User email not found' });
    }

    // 質問ページのURL
    const questionUrl = `https://training.bo-no.design/questions/${payload.slug.current}`;

    // メール送信
    const emailResult = await resend.emails.send({
      from: 'BONO <noreply@bo-no.design>',
      to: userEmail,
      subject: `【BONO】質問への回答が届きました：${payload.title}`,
      html: generateEmailHtml({
        displayName: payload.author.displayName || 'ユーザー',
        questionTitle: payload.title,
        questionUrl,
      }),
    });

    console.log('Email sent successfully:', emailResult);

    return res.status(200).json({
      success: true,
      message: 'Notification email sent',
      emailId: emailResult.data?.id,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
}
