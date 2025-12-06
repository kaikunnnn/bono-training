/**
 * ENV-004 対策: MCP設定の有効/無効切り替えスクリプト
 *
 * 使用方法:
 *   npm run mcp:disable  - MCPを無効化（開発時）
 *   npm run mcp:enable   - MCPを有効化（本番確認時）
 *   npm run mcp:status   - 現在の状態を表示
 *
 * 仕組み:
 *   - disable: .cursor/mcp.json → .cursor/mcp.json.disabled にリネーム
 *   - enable: .cursor/mcp.json.disabled → .cursor/mcp.json に戻す
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const MCP_CONFIG_PATH = path.join(projectRoot, '.cursor', 'mcp.json');
const MCP_CONFIG_DISABLED_PATH = path.join(projectRoot, '.cursor', 'mcp.json.disabled');

const command = process.argv[2];

function getStatus() {
  const configExists = fs.existsSync(MCP_CONFIG_PATH);
  const disabledExists = fs.existsSync(MCP_CONFIG_DISABLED_PATH);

  if (configExists && !disabledExists) {
    return 'enabled';
  } else if (!configExists && disabledExists) {
    return 'disabled';
  } else if (configExists && disabledExists) {
    return 'conflict'; // 両方存在する異常状態
  } else {
    return 'not-found'; // どちらも存在しない
  }
}

function disable() {
  const status = getStatus();

  if (status === 'disabled') {
    console.log('');
    console.log('ℹ️  MCPは既に無効化されています');
    console.log('');
    return;
  }

  if (status === 'not-found') {
    console.error('');
    console.error('❌ .cursor/mcp.json が見つかりません');
    console.error('');
    process.exit(1);
  }

  if (status === 'conflict') {
    console.error('');
    console.error('❌ 異常状態: mcp.json と mcp.json.disabled の両方が存在します');
    console.error('   手動で確認してください');
    console.error('');
    process.exit(1);
  }

  // mcp.json → mcp.json.disabled にリネーム
  fs.renameSync(MCP_CONFIG_PATH, MCP_CONFIG_DISABLED_PATH);

  console.log('');
  console.log('✅ MCPを無効化しました');
  console.log('');
  console.log('   .cursor/mcp.json → .cursor/mcp.json.disabled');
  console.log('');
  console.log('📝 開発中はMCPが無効です。');
  console.log('   本番確認時は npm run mcp:enable で有効化してください。');
  console.log('');
}

function enable() {
  const status = getStatus();

  if (status === 'enabled') {
    console.log('');
    console.log('ℹ️  MCPは既に有効化されています');
    console.log('');
    return;
  }

  if (status === 'not-found') {
    console.error('');
    console.error('❌ .cursor/mcp.json.disabled が見つかりません');
    console.error('');
    process.exit(1);
  }

  if (status === 'conflict') {
    console.error('');
    console.error('❌ 異常状態: mcp.json と mcp.json.disabled の両方が存在します');
    console.error('   手動で確認してください');
    console.error('');
    process.exit(1);
  }

  // mcp.json.disabled → mcp.json にリネーム
  fs.renameSync(MCP_CONFIG_DISABLED_PATH, MCP_CONFIG_PATH);

  console.log('');
  console.log('✅ MCPを有効化しました');
  console.log('');
  console.log('   .cursor/mcp.json.disabled → .cursor/mcp.json');
  console.log('');
  console.log('⚠️  注意: MCPは本番環境（Supabase/Stripe）を参照します。');
  console.log('   開発時は npm run mcp:disable で無効化してください。');
  console.log('');
}

function showStatus() {
  const status = getStatus();

  console.log('');
  console.log('========== MCP Status ==========');
  console.log('');

  switch (status) {
    case 'enabled':
      console.log('🟢 MCP: 有効');
      console.log('');
      console.log('   Supabase: 本番環境を参照');
      console.log('   Stripe: Liveモードを参照');
      console.log('');
      console.log('⚠️  開発時は npm run mcp:disable を推奨');
      break;

    case 'disabled':
      console.log('🔴 MCP: 無効');
      console.log('');
      console.log('   Claude CodeはDB/Stripeにアクセスできません');
      console.log('');
      console.log('📝 本番確認時は npm run mcp:enable で有効化');
      break;

    case 'conflict':
      console.log('❌ 異常状態');
      console.log('');
      console.log('   mcp.json と mcp.json.disabled の両方が存在します');
      console.log('   手動で確認してください');
      break;

    case 'not-found':
      console.log('❓ MCP設定が見つかりません');
      console.log('');
      console.log('   .cursor/mcp.json が存在しません');
      break;
  }

  console.log('');
  console.log('================================');
  console.log('');
}

// メイン処理
switch (command) {
  case 'disable':
    disable();
    break;
  case 'enable':
    enable();
    break;
  case 'status':
    showStatus();
    break;
  default:
    console.log('');
    console.log('Usage: node scripts/mcp-toggle.js <command>');
    console.log('');
    console.log('Commands:');
    console.log('  disable  - MCPを無効化（開発時）');
    console.log('  enable   - MCPを有効化（本番確認時）');
    console.log('  status   - 現在の状態を表示');
    console.log('');
    process.exit(1);
}
