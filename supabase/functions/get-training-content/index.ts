
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('get-training-content Edge Function starting...')

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

/**
 * Front-matterを解析（軽量版）
 */
function parseFrontmatter(content: string): { data: Record<string, any>, content: string } {
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!fmMatch) return { data: {}, content };

  const [, fmBlock, body] = fmMatch;
  const data: Record<string, any> = {};

  for (const line of fmBlock.split('\n')) {
    const m = line.match(/^([^:]+):\s*(.+)$/);
    if (!m) continue;

    const key = m[1].trim();
    let val: any = m[2].trim();

    // クォートを取る
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    // 配列 [a, b] → ["a", "b"]
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map((s: string) => s.trim().replace(/^["']|["']$/g, ''));
    }

    // 数値 / 真偽値変換
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    else if (!isNaN(Number(val))) val = Number(val);

    data[key] = val;
  }

  return { data, content: body };
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

    // メンバーアクセス権の判定（standard, growth, community プランがアクセス可能）
    const hasPremiumAccess = subscriptions && subscriptions.length > 0 && 
      ['standard', 'growth', 'community'].includes(subscriptions[0].plan_type);

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
    const { data: frontmatter, content: body } = parseFrontmatter(content);
    
    console.log('Parsed frontmatter:', frontmatter);

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

    const response = {
      success: true,
      data: {
        meta: frontmatter,
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
      contentLength: displayContent.length 
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
