/**
 * Ghost ダミー記事作成スクリプト
 *
 * 使用方法:
 * 1. Ghost管理画面で初期セットアップを完了
 * 2. Settings > Integrations > Add custom integration
 * 3. Admin API Keyをコピー
 * 4. .envにVITE_GHOST_ADMIN_KEY=<key>を追加
 * 5. npm run ghost:seed
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const GHOST_URL = process.env.VITE_GHOST_URL || 'http://localhost:2368';
const ADMIN_KEY = process.env.VITE_GHOST_ADMIN_KEY;

if (!ADMIN_KEY) {
  console.error('❌ VITE_GHOST_ADMIN_KEY が設定されていません');
  console.log('');
  console.log('設定方法:');
  console.log('1. http://localhost:2368/ghost にアクセス');
  console.log('2. Settings > Integrations > Add custom integration');
  console.log('3. Admin API Key をコピー');
  console.log('4. .env に VITE_GHOST_ADMIN_KEY=<key> を追加');
  process.exit(1);
}

// JWT トークン生成
function generateToken(key) {
  const [id, secret] = key.split(':');
  const token = jwt.sign({}, Buffer.from(secret, 'hex'), {
    keyid: id,
    algorithm: 'HS256',
    expiresIn: '5m',
    audience: '/admin/'
  });
  return token;
}

// ダミー記事データ
const dummyPosts = [
  {
    title: 'デザインの基本原則：初心者が押さえるべき5つのポイント',
    slug: 'design-basics-5-points',
    html: `
      <p>デザインを始めたばかりの方に向けて、押さえておくべき基本原則を紹介します。</p>
      <h2>1. コントラスト</h2>
      <p>要素間の違いを明確にすることで、視覚的な階層を作ります。色、サイズ、形状などでコントラストを付けましょう。</p>
      <h2>2. 整列</h2>
      <p>要素を整列させることで、すっきりとした印象を与えます。グリッドシステムを活用しましょう。</p>
      <h2>3. 反復</h2>
      <p>デザイン要素を繰り返し使うことで、統一感が生まれます。色、フォント、スタイルを一貫させましょう。</p>
      <h2>4. 近接</h2>
      <p>関連する要素は近くに配置し、関連しない要素は離して配置します。</p>
      <h2>5. 余白</h2>
      <p>余白（ホワイトスペース）を恐れないでください。適切な余白は読みやすさを向上させます。</p>
    `,
    excerpt: 'デザイン初心者が最初に学ぶべき5つの基本原則を分かりやすく解説します。',
    tags: [{ name: 'design' }, { name: 'beginner' }],
    feature_image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200',
    status: 'published'
  },
  {
    title: 'Figmaで効率的にデザインする10のショートカット',
    slug: 'figma-shortcuts-10',
    html: `
      <p>Figmaでの作業効率を大幅に上げるショートカットを紹介します。</p>
      <h2>基本操作</h2>
      <ul>
        <li><strong>V</strong> - 選択ツール</li>
        <li><strong>F</strong> - フレームツール</li>
        <li><strong>R</strong> - 長方形ツール</li>
        <li><strong>T</strong> - テキストツール</li>
      </ul>
      <h2>レイヤー操作</h2>
      <ul>
        <li><strong>Cmd/Ctrl + G</strong> - グループ化</li>
        <li><strong>Cmd/Ctrl + Shift + G</strong> - グループ解除</li>
        <li><strong>Cmd/Ctrl + ]</strong> - 前面へ</li>
        <li><strong>Cmd/Ctrl + [</strong> - 背面へ</li>
      </ul>
      <h2>便利なショートカット</h2>
      <ul>
        <li><strong>Cmd/Ctrl + D</strong> - 複製</li>
        <li><strong>Alt + ドラッグ</strong> - コピー移動</li>
      </ul>
    `,
    excerpt: 'Figmaの作業効率を上げる必須ショートカット10選を紹介。',
    tags: [{ name: 'figma' }, { name: 'tips' }],
    feature_image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=1200',
    status: 'published'
  },
  {
    title: 'UIデザインにおける色の選び方',
    slug: 'ui-color-selection',
    html: `
      <p>UIデザインで効果的な色を選ぶためのガイドラインを紹介します。</p>
      <h2>カラーパレットの基本</h2>
      <p>UIデザインでは通常、以下の色を定義します：</p>
      <ul>
        <li><strong>プライマリカラー</strong> - ブランドを表す主要色</li>
        <li><strong>セカンダリカラー</strong> - 補助的に使う色</li>
        <li><strong>アクセントカラー</strong> - CTAボタンなど注目を集める色</li>
        <li><strong>ニュートラルカラー</strong> - テキストや背景に使うグレー系</li>
      </ul>
      <h2>色の心理効果</h2>
      <p>色は感情や行動に影響を与えます。青は信頼感、緑は安心感、赤は緊急性を表します。</p>
      <h2>アクセシビリティ</h2>
      <p>コントラスト比4.5:1以上を確保し、色だけに依存しない情報伝達を心がけましょう。</p>
    `,
    excerpt: 'UIデザインで効果的な色を選ぶためのガイドライン。カラーパレットの作り方から心理効果まで。',
    tags: [{ name: 'uiux' }, { name: 'color' }],
    feature_image: 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=1200',
    status: 'published'
  },
  {
    title: 'レスポンシブデザインの実践テクニック',
    slug: 'responsive-design-techniques',
    html: `
      <p>様々なデバイスに対応するレスポンシブデザインの実践的なテクニックを紹介します。</p>
      <h2>モバイルファースト</h2>
      <p>まずモバイル向けにデザインし、徐々に大きな画面に拡張していくアプローチです。</p>
      <h2>ブレイクポイントの設定</h2>
      <p>一般的なブレイクポイント：</p>
      <ul>
        <li><strong>320px</strong> - 小型スマートフォン</li>
        <li><strong>768px</strong> - タブレット</li>
        <li><strong>1024px</strong> - ノートPC</li>
        <li><strong>1440px</strong> - デスクトップ</li>
      </ul>
      <h2>フレキシブルグリッド</h2>
      <p>固定幅ではなく、パーセンテージやfr単位を使用して柔軟なレイアウトを作成します。</p>
      <h2>画像の最適化</h2>
      <p>srcset属性を使用して、デバイスに応じた最適なサイズの画像を提供しましょう。</p>
    `,
    excerpt: 'モバイルファーストからブレイクポイント設定まで、レスポンシブデザインの実践テクニック。',
    tags: [{ name: 'development' }, { name: 'responsive' }],
    feature_image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200',
    status: 'published'
  }
];

async function createPost(post, token) {
  const response = await fetch(`${GHOST_URL}/ghost/api/admin/posts/?source=html`, {
    method: 'POST',
    headers: {
      'Authorization': `Ghost ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ posts: [post] })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create post: ${response.status} - ${error}`);
  }

  return response.json();
}

async function main() {
  console.log('=== Ghost ダミー記事作成 ===');
  console.log('');

  const token = generateToken(ADMIN_KEY);

  for (const post of dummyPosts) {
    try {
      await createPost(post, token);
      console.log(`✅ 作成: ${post.title}`);
    } catch (error) {
      console.error(`❌ 失敗: ${post.title}`);
      console.error(`   ${error.message}`);
    }
  }

  console.log('');
  console.log('=== 完了 ===');
  console.log('http://localhost:2368/ghost で確認してください');
}

main().catch(console.error);
