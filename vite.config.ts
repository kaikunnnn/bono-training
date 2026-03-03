
import { defineConfig, loadEnv, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { config as dotenvConfig } from "dotenv";

// Load .env.local for API handlers
dotenvConfig({ path: '.env.local' });

// 開発用ローカルAPIプラグイン
// 本番では api/feedback-apply/submit.ts が Vercel Serverless Functions として動作
function localApiPlugin(): Plugin {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // /api/feedback-apply/submit への POST リクエストを処理
        if (req.url === '/api/feedback-apply/submit' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body);
              console.log('📝 [DEV API] feedback-apply/submit received:', payload);

              // バリデーション
              if (!payload.articleUrl || !/^https?:\/\/.+/.test(payload.articleUrl)) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: '有効な記事URLを入力してください' }));
                return;
              }
              if (!payload.slackAccountName?.trim()) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Slackアカウント名を入力してください' }));
                return;
              }
              if (!payload.lessonId?.trim()) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: '学んだBONOコンテンツを選択してください' }));
                return;
              }
              if (!payload.checkedItems?.length) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: '該当する項目を1つ以上選択してください' }));
                return;
              }

              console.log('✅ [DEV API] Validation passed');

              // 環境変数から設定を取得（process.envから直接読み込み）
              const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID;
              const SANITY_DATASET = process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || 'production';
              const SANITY_WRITE_TOKEN = process.env.SANITY_WRITE_TOKEN;
              const SLACK_WEBHOOK_URL = process.env.SLACK_FEEDBACK_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;

              console.log('📦 [DEV API] Env config:', {
                projectId: SANITY_PROJECT_ID,
                dataset: SANITY_DATASET,
                hasToken: !!SANITY_WRITE_TOKEN,
                hasSlack: !!SLACK_WEBHOOK_URL
              });

              let sanityDocId: string | null = null;

              // Sanityに保存
              if (SANITY_WRITE_TOKEN && SANITY_PROJECT_ID) {
                try {
                  // OG情報を取得
                  let ogData = { title: null as string | null, image: null as string | null, description: null as string | null };
                  try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000);
                    const ogResponse = await fetch(payload.articleUrl, {
                      signal: controller.signal,
                      headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; BONOBot/1.0)',
                        'Accept': 'text/html,application/xhtml+xml',
                      },
                    });
                    clearTimeout(timeoutId);
                    if (ogResponse.ok) {
                      const html = await ogResponse.text();
                      // Simple OG extraction
                      const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                                        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i) ||
                                        html.match(/<title[^>]*>([^<]+)<\/title>/i);
                      const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                                        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
                      const descMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                                       html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i) ||
                                       html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
                      if (titleMatch) ogData.title = titleMatch[1];
                      if (imageMatch) ogData.image = imageMatch[1];
                      if (descMatch) ogData.description = descMatch[1];
                    }
                    console.log('🔗 [DEV API] OG data:', ogData);
                  } catch (ogError) {
                    console.warn('⚠️ [DEV API] OG fetch failed:', ogError);
                  }

                  // Sanityにドキュメントを作成
                  const sanityMutation = {
                    mutations: [{
                      create: {
                        _type: 'userOutput',
                        articleUrl: payload.articleUrl,
                        articleTitle: ogData.title || null,
                        articleImage: ogData.image || null,
                        articleDescription: ogData.description || null,
                        ...(payload.lessonId && {
                          relatedLesson: { _type: 'reference', _ref: payload.lessonId },
                        }),
                        author: {
                          userId: payload.userId || null,
                          displayName: payload.slackAccountName,
                          slackAccountName: payload.slackAccountName,
                          email: payload.userEmail || null,
                        },
                        bonoContent: payload.lessonTitle || null,
                        checkedItems: payload.checkedItems,
                        source: 'user_submission',
                        submittedAt: new Date().toISOString(),
                        isPublished: false,
                        displayOrder: 0,
                      }
                    }]
                  };

                  const sanityResponse = await fetch(
                    `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${SANITY_DATASET}?returnIds=true&returnDocuments=true`,
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${SANITY_WRITE_TOKEN}`,
                      },
                      body: JSON.stringify(sanityMutation),
                    }
                  );

                  if (sanityResponse.ok) {
                    const result = await sanityResponse.json();
                    // Sanity API returns document ID in different formats depending on the operation
                    sanityDocId = result.results?.[0]?.id || result.results?.[0]?.document?._id || result.documentId || null;
                    console.log('✅ [DEV API] Saved to Sanity, full response:', JSON.stringify(result));
                    console.log('✅ [DEV API] Document ID:', sanityDocId);
                  } else {
                    const errorText = await sanityResponse.text();
                    console.error('❌ [DEV API] Sanity save failed:', sanityResponse.status, errorText);
                  }
                } catch (sanityError) {
                  console.error('❌ [DEV API] Sanity error:', sanityError);
                }
              } else {
                console.warn('⚠️ [DEV API] Sanity credentials not configured, skipping save');
              }

              // Slack通知を送信
              if (SLACK_WEBHOOK_URL) {
                try {
                  const sanityLink = sanityDocId
                    ? `\n<https://bono-training.sanity.studio/structure/userOutput;${sanityDocId}|📋 Sanity Studioで確認>`
                    : '';

                  const slackMessage = {
                    blocks: [
                      {
                        type: 'section',
                        text: {
                          type: 'mrkdwn',
                          text: '*【🔸15分フィードバック新規応募がきたよ】*',
                        },
                      },
                      {
                        type: 'section',
                        text: {
                          type: 'mrkdwn',
                          text: `👩‍💻Slackアカウント名:\n${payload.slackAccountName}`,
                        },
                      },
                      {
                        type: 'section',
                        text: {
                          type: 'mrkdwn',
                          text: `🗺️学んだBONOコンテンツ:\n${payload.lessonTitle || '未選択'}`,
                        },
                      },
                      {
                        type: 'section',
                        text: {
                          type: 'mrkdwn',
                          text: `🔗アウトプットURL:\n<${payload.articleUrl}|${payload.articleUrl}>`,
                        },
                      },
                      {
                        type: 'divider',
                      },
                      {
                        type: 'context',
                        elements: [
                          {
                            type: 'mrkdwn',
                            text: `応募日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}${sanityLink}`,
                          },
                        ],
                      },
                    ],
                  };

                  const slackResponse = await fetch(SLACK_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(slackMessage),
                  });

                  if (slackResponse.ok) {
                    console.log('✅ [DEV API] Slack notification sent');
                  } else {
                    console.error('❌ [DEV API] Slack notification failed:', slackResponse.status);
                  }
                } catch (slackError) {
                  console.error('❌ [DEV API] Slack error:', slackError);
                }
              } else {
                console.warn('⚠️ [DEV API] Slack webhook not configured, skipping notification');
              }

              // 成功レスポンス
              console.log('✅ [DEV API] Returning success response');
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                message: '応募を受け付けました',
                outputId: sanityDocId
              }));
            } catch (e) {
              console.error('❌ [DEV API] Error:', e);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'サーバーエラーが発生しました' }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 環境変数を明示的にロード
  const env = loadEnv(mode, process.cwd(), '');

  console.log('========== Vite Config Debug ==========');
  console.log('🔧 Mode:', mode);
  console.log('🔧 VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL || '(not set - will use Vercel env vars)');
  console.log('========================================');

  // ENV-001 恒久対策: 本番ビルド時の環境変数チェック
  // Vercel環境でのみチェック（ローカルビルドはスキップ）
  const isVercel = process.env.VERCEL === '1';

  if (mode === 'production' && isVercel) {
    const supabaseUrl = env.VITE_SUPABASE_URL;

    // ローカルURLが本番ビルドに含まれることを防止
    if (supabaseUrl && (supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost:54321'))) {
      console.error('');
      console.error('🚨 ========== BUILD ERROR ==========');
      console.error('🚨 VITE_SUPABASE_URL contains local URL!');
      console.error('🚨 Value:', supabaseUrl);
      console.error('🚨');
      console.error('🚨 This will cause production to point to localhost.');
      console.error('🚨 Please check your environment variables.');
      console.error('🚨 ====================================');
      console.error('');
      throw new Error('ENV-001: Local URL detected in production build. See: .claude/docs/subscription/redesign/investigations/2025-12-02-environment-issues.md');
    }
  } else if (mode === 'production') {
    console.log('ℹ️ Local production build - skipping ENV-001 check (only enforced on Vercel)');
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      // 開発モード時のみローカルAPIプラグインを有効化
      mode === 'development' && localApiPlugin(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      // React重複バンドル問題を解決
      dedupe: ['react', 'react-dom'],
    }
  };
});
