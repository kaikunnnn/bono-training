
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('get-training-content Edge Function starting...')

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

/**
 * 強化されたFront-matterを解析（より柔軟な正規表現とYAML解析）
 */
function parseFrontmatter(content: string): { data: Record<string, any>, content: string } {
  console.log('Parsing frontmatter for content length:', content.length);
  
  // より柔軟な正規表現パターン（空行の有無に関係なく動作）
  const fmMatch = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
  if (!fmMatch) {
    console.log('No frontmatter found in content');
    return { data: {}, content };
  }

  const [, fmBlock, body] = fmMatch;
  console.log('Frontmatter block found:', fmBlock);
  
  const data: Record<string, any> = {};

  // 改行で分割してYAMLライクな解析
  const lines = fmBlock.split(/\r?\n/);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue; // 空行やコメントをスキップ
    
    const colonIndex = line.indexOf(':');
    if (colonIndex <= 0) continue;

    const key = line.substring(0, colonIndex).trim();
    let rawValue = line.substring(colonIndex + 1).trim();
    
    console.log(`Processing key: ${key}, raw value: ${rawValue}`);

    // マルチライン値の処理（次の行がインデントされている場合）
    while (i + 1 < lines.length && lines[i + 1].startsWith('  ')) {
      i++;
      rawValue += ' ' + lines[i].trim();
    }

    let val: any = rawValue;

    // クォートを取る（シングル・ダブル両対応）
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    // 配列の処理 [item1, item2, item3]
    if (val.startsWith('[') && val.endsWith(']')) {
      const arrayContent = val.slice(1, -1).trim();
      if (arrayContent) {
        val = arrayContent.split(',').map((item: string) => {
          const trimmed = item.trim();
          // 各要素のクォートも除去
          return trimmed.replace(/^["']|["']$/g, '');
        });
      } else {
        val = [];
      }
    }
    // 真偽値の変換
    else if (val === 'true') {
      val = true;
    } else if (val === 'false') {
      val = false;
    }
    // 数値の変換（整数・小数点）
    else if (!isNaN(Number(val)) && val !== '' && !/^0[0-9]/.test(val)) {
      val = Number(val);
    }

    data[key] = val;
    console.log(`Parsed ${key}:`, val, `(type: ${typeof val})`);
  }

  console.log('Final parsed frontmatter data:', data);
  return { data, content: body };
}

/**
 * 有料限定のメタフィールド denylist（F-4 対策）。
 * 非会員には frontmatter からこれらのキーを除去して返す。フィールド名は実データで
 * 揺れるため "full/premium な動画/アセットURL" と判断できるキーを広めに列挙する。
 * title / thumbnail / is_premium など公開して問題ないキーは残す。
 */
const PREMIUM_META_DENYLIST = [
  'video_full',
  'videoFull',
  'video_url',
  'videoUrl',
  'full_video',
  'fullVideo',
  'premium_video',
  'premiumVideo',
  'premium_video_url',
  'premiumVideoUrl',
  'video_premium',
  'full_video_url',
  'fullVideoUrl',
]

/**
 * 非会員向けに frontmatter から有料限定フィールドを除去する。
 */
function stripPremiumMeta(meta: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {}
  for (const [key, value] of Object.entries(meta)) {
    if (PREMIUM_META_DENYLIST.includes(key)) continue
    cleaned[key] = value
  }
  return cleaned
}

/**
 * コンテンツを分割（プレミアムマーカーで）
 */
function splitContent(content: string, marker = '<!-- PREMIUM_ONLY -->'): { free: string, premium: string, hasPremium: boolean } {
  if (!content.includes(marker)) {
    return { free: content, premium: '', hasPremium: false };
  }

  const parts = content.split(marker);
  return {
    free: parts[0].trim(),
    premium: parts[1]?.trim() || '',
    hasPremium: true
  };
}

/**
 * ユーザーの認証とプレミアムアクセス権を確認
 */
async function checkUserAccess(authHeader: string | null): Promise<{ isAuthenticated: boolean, hasPremiumAccess: boolean, userId?: string }> {
  if (!authHeader) {
    return { isAuthenticated: false, hasPremiumAccess: false };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // JWTトークンからユーザー情報を取得
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.log('Authentication failed:', error?.message);
      return { isAuthenticated: false, hasPremiumAccess: false };
    }

    // サブスクリプション状態を確認
    const { data: subscriptions, error: subError } = await supabase
      .from('user_subscriptions')
      .select('is_active, plan_type')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1);

    if (subError) {
      console.error('Subscription check error:', subError);
      return { isAuthenticated: true, hasPremiumAccess: false, userId: user.id };
    }

    // メンバーアクセス権の判定。実プランは standard / feedback（src/lib/subscription-utils.ts）。
    // 旧プラン名(growth/community)は残置＝既存契約者の権限を奪わない安全側。feedback を追加し
    // 「有料(feedback)なのにトレーニング有料枠が見れない」バグを解消（監査M-1）。
    const hasPremiumAccess = subscriptions && subscriptions.length > 0 &&
      ['standard', 'feedback', 'growth', 'community'].includes(subscriptions[0].plan_type);

    console.log('User access check:', { 
      userId: user.id, 
      isAuthenticated: true, 
      hasPremiumAccess,
      planType: subscriptions?.[0]?.plan_type 
    });

    return { isAuthenticated: true, hasPremiumAccess, userId: user.id };
  } catch (error) {
    console.error('Access check error:', error);
    return { isAuthenticated: false, hasPremiumAccess: false };
  }
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trainingSlug, taskSlug } = await req.json();
    
    console.log('Request received:', { trainingSlug, taskSlug });

    if (!trainingSlug) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: { code: 'INVALID_REQUEST', message: 'trainingSlug is required' }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Storage パスを構築
    const storagePath = taskSlug 
      ? `${trainingSlug}/tasks/${taskSlug}/content.md`
      : `${trainingSlug}/index.md`;

    console.log('Fetching from storage path:', storagePath);

    // Supabase Storage からファイルを取得
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase.storage
      .from('training-content')
      .download(storagePath);

    if (error) {
      console.error('Storage download error:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: { code: 'NOT_FOUND', message: `Content not found: ${storagePath}` }
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const content = await data.text();
    console.log('Raw content length:', content.length, 'first 200 chars:', content.substring(0, 200));
    
    const { data: frontmatter, content: body } = parseFrontmatter(content);
    
    console.log('Parsed frontmatter keys:', Object.keys(frontmatter));

    // ユーザーのアクセス権を確認
    const authHeader = req.headers.get('Authorization');
    const { isAuthenticated, hasPremiumAccess, userId } = await checkUserAccess(authHeader);

    // コンテンツのアクセス制御
    const isPremiumContent = frontmatter.is_premium === true;
    const shouldShowFullContent = !isPremiumContent || hasPremiumAccess;

    let displayContent = body;
    let showPremiumBanner = false;

    if (isPremiumContent && !hasPremiumAccess) {
      const split = splitContent(body);
      displayContent = split.free;
      showPremiumBanner = split.hasPremium;
    }

    // F-4対策: プレミアムコンテンツを非会員が取得する場合のみ、有料限定メタ
    // （video_full 等）を除去して返す。フロント（training/[taskSlug]/page.tsx）は
    // meta.video_full を無条件で iframe 描画するため、ここで漏らすと本文gate（splitContent）
    // を回避して有料動画URLが渡ってしまう。無料コンテンツの動画は残す（会員でない閲覧者にも
    // 表示すべきなので stripしない）。会員には従来通り全メタを返す。
    const responseMeta =
      isPremiumContent && !hasPremiumAccess ? stripPremiumMeta(frontmatter) : frontmatter

    const response = {
      success: true,
      data: {
        meta: responseMeta,
        content: displayContent,
        showPremiumBanner,
        isPremium: isPremiumContent,
        hasAccess: shouldShowFullContent,
        isAuthenticated,
        hasPremiumAccess
      }
    };

    console.log('Response prepared:', { 
      storagePath, 
      isPremiumContent, 
      hasPremiumAccess, 
      showPremiumBanner,
      contentLength: displayContent.length,
      frontmatterKeys: Object.keys(frontmatter)
    });

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
