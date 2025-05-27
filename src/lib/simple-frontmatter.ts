
/**
 * 軽量なフロントマターパーサー
 * ---
 * key: value
 * foo: "bar baz"
 * tags: [a, b, c]
 * ---
 * 本文…
 */
export function parseFrontmatter(raw: string): {
  data: Record<string, any>;
  content: string;
} {
  console.log('parseFrontmatter called with content length:', raw.length);
  
  const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!fmMatch) {
    console.log('No frontmatter found in content');
    return { data: {}, content: raw };
  }

  const [, fmBlock, body] = fmMatch;
  console.log('Frontmatter block found:', fmBlock);
  
  const data: Record<string, any> = {};

  for (const line of fmBlock.split('\n')) {
    const m = line.match(/^([^:]+):\s*(.+)$/);
    if (!m) continue;

    const key = m[1].trim();
    let val: any = m[2].trim();

    // クォートを取る
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }

    // 配列 [a, b] → ["a", "b"]
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''));
    }

    // 数値変換（純粋な数値のみ）
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    else if (/^\d+$/.test(val)) { // 純粋な数値のみを変換
      val = Number(val);
    }

    data[key] = val;
    console.log(`Parsed field: ${key} = ${JSON.stringify(val)} (type: ${typeof val})`);
  }

  console.log('Final parsed data:', data);
  return { data, content: body };
}
