/**
 * BONO 診断ユーティリティ
 * コンソールで問題の原因を素早く特定するためのチェック関数
 *
 * ブラウザコンソールから手動実行:
 *   window.__bonoDiag?.()
 */

const LOG_PREFIX = '[BONO Diag]';

function log(label: string, status: 'ok' | 'warn' | 'error', message: string, detail?: unknown) {
  const icon = status === 'ok' ? '✅' : status === 'warn' ? '⚠️' : '❌';
  const style = status === 'ok' ? 'color: green' : status === 'warn' ? 'color: orange' : 'color: red; font-weight: bold';
  console.log(`%c${LOG_PREFIX} ${icon} [${label}] ${message}`, style);
  if (detail) console.log(`   └─`, detail);
}

// ============================================
// 環境変数チェック
// ============================================
function checkEnvVars() {
  console.groupCollapsed(`${LOG_PREFIX} 環境変数チェック`);

  const vars = [
    { key: 'VITE_SANITY_PROJECT_ID', val: import.meta.env.VITE_SANITY_PROJECT_ID },
    { key: 'VITE_SANITY_DATASET',    val: import.meta.env.VITE_SANITY_DATASET },
    { key: 'VITE_SANITY_API_VERSION',val: import.meta.env.VITE_SANITY_API_VERSION },
  ];

  let allOk = true;
  for (const { key, val } of vars) {
    if (val) {
      log(key, 'ok', val);
    } else {
      log(key, 'error', '未設定 — Vercel の Environment Variables を確認してください');
      allOk = false;
    }
  }

  if (allOk) log('ENV', 'ok', '全環境変数 OK');
  console.groupEnd();
}

// ============================================
// Sanity 接続チェック
// ============================================
async function checkSanityConnection() {
  console.groupCollapsed(`${LOG_PREFIX} Sanity 接続チェック`);

  const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
  const dataset   = import.meta.env.VITE_SANITY_DATASET || 'production';

  if (!projectId) {
    log('Sanity', 'error', 'VITE_SANITY_PROJECT_ID が未設定のためスキップ');
    console.groupEnd();
    return;
  }

  const url = `https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?query=*[_type%3D%3D"lesson"][0...1]{_id}`;

  try {
    const res = await fetch(url);

    if (res.ok) {
      const data = await res.json();
      log('Sanity CDN', 'ok', `接続成功 (${data.result?.length ?? 0}件取得)`);
    } else if (res.status === 403) {
      log('Sanity CDN', 'error',
        `403 Forbidden — このドメインが Sanity の CORS 許可リストにありません`,
        {
          現在のドメイン: window.location.origin,
          修正方法: 'manage.sanity.io → API → CORS Origins → Add → ' + window.location.origin,
        }
      );
    } else {
      log('Sanity CDN', 'warn', `予期しないステータス: ${res.status}`, await res.text());
    }
  } catch (err: any) {
    if (err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) {
      log('Sanity CDN', 'error',
        'ネットワークエラー（CORS ブロックの可能性大）',
        {
          現在のドメイン: window.location.origin,
          修正方法: 'manage.sanity.io → API → CORS Origins に追加してください',
          エラー詳細: err.message,
        }
      );
    } else {
      log('Sanity CDN', 'error', `不明なエラー: ${err?.message}`, err);
    }
  }

  console.groupEnd();
}

// ============================================
// AI (api/ai-chat) 接続チェック
// ============================================
async function checkAIEndpoint() {
  console.groupCollapsed(`${LOG_PREFIX} AI エンドポイント チェック`);

  try {
    const res = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'テスト' }] }),
    });

    if (res.ok || res.headers.get('content-type')?.includes('text/event-stream')) {
      log('AI endpoint', 'ok', '/api/ai-chat は応答しています');
      res.body?.cancel(); // ストリームを閉じる
    } else if (res.status === 500) {
      const body = await res.text();
      log('AI endpoint', 'error',
        `500 Internal Server Error — サーバー側のエラー（GROQ_API_KEY が Vercel に設定されているか確認）`,
        { レスポンス: body }
      );
    } else if (res.status === 405) {
      log('AI endpoint', 'warn', `405 — GET リクエストは不可（正常: POST のみ受け付ける）`);
    } else {
      log('AI endpoint', 'warn', `ステータス: ${res.status}`, await res.text());
    }
  } catch (err: any) {
    log('AI endpoint', 'error',
      '/api/ai-chat に到達できません。Vercel にデプロイされていない可能性があります',
      err?.message
    );
  }

  console.groupEnd();
}

// ============================================
// 全診断を実行
// ============================================
export async function runDiagnostics() {
  console.group(`${LOG_PREFIX} ===== BONO 診断開始 =====`);
  console.log(`ページ: ${window.location.href}`);
  console.log(`時刻: ${new Date().toLocaleString('ja-JP')}`);
  console.groupEnd();

  checkEnvVars();
  await checkSanityConnection();
  await checkAIEndpoint();

  console.log(`${LOG_PREFIX} ===== 診断完了 =====`);
  console.log(`${LOG_PREFIX} 問題が見つかった場合は上記の「修正方法」を参照してください`);
}

// ブラウザコンソールから window.__bonoDiag() で手動実行できるようにする
if (typeof window !== 'undefined') {
  (window as any).__bonoDiag = runDiagnostics;
  console.log(`${LOG_PREFIX} 💡 コンソールで window.__bonoDiag() を実行すると詳細診断ができます`);
}
