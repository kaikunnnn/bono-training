/**
 * ENV-004 対策: 開発開始時のMCP状態チェック
 *
 * npm run dev の前に実行され、MCPが有効な場合に警告を表示する。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const MCP_CONFIG_PATH = path.join(projectRoot, '.cursor', 'mcp.json');

const configExists = fs.existsSync(MCP_CONFIG_PATH);

if (configExists) {
  console.log('');
  console.log('⚠️  ========================================');
  console.log('⚠️  MCP が有効です（本番環境を参照）');
  console.log('⚠️  ========================================');
  console.log('');
  console.log('   開発中はフロントエンドとMCPで環境が不一致になります。');
  console.log('');
  console.log('   推奨: npm run mcp:disable でMCPを無効化');
  console.log('');
  console.log('   ※ この警告を無視して続行することもできます');
  console.log('');
}
