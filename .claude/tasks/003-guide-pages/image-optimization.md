# 画像最適化の仕組み

ガイド記事で使用する画像を自動的に圧縮・最適化するスクリプトの設計と使い方。

---

## 🎯 目的

- 画像ファイルサイズを削減
- ページ読み込み速度を改善
- 手動圧縮の手間を削減
- 自動化された最適化フロー

---

## 📦 必要なパッケージ

```bash
npm install --save-dev sharp
```

**Sharp** - Node.jsの高速画像処理ライブラリ

---

## 🛠️ スクリプト設計

### 1. scripts/optimize-images.js

```javascript
import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

// 設定
const CONFIG = {
  quality: {
    jpeg: 80,
    png: 80,
    webp: 80,
  },
  sizes: {
    thumbnail: 800,    // サムネイル最大幅
    content: 1200,     // 記事内画像最大幅
    hero: 1920,        // ヒーロー画像最大幅
  },
  formats: ['jpg', 'jpeg', 'png', 'webp'],
};

/**
 * ガイド記事の画像を最適化
 */
async function optimizeGuideImages() {
  console.log('🖼️  画像最適化を開始...\n');

  const guideDir = 'content/guide';
  const images = await findImages(guideDir);

  console.log(`📁 ${images.length} 個の画像を発見\n`);

  let optimizedCount = 0;
  let totalSaved = 0;

  for (const imagePath of images) {
    const result = await optimizeImage(imagePath);
    if (result.optimized) {
      optimizedCount++;
      totalSaved += result.savedBytes;
      console.log(`✅ ${imagePath}`);
      console.log(`   ${formatBytes(result.originalSize)} → ${formatBytes(result.newSize)} (${result.savedPercent}% 削減)\n`);
    }
  }

  console.log(`\n🎉 完了！`);
  console.log(`   最適化: ${optimizedCount} / ${images.length} 個`);
  console.log(`   削減: ${formatBytes(totalSaved)}`);
}

/**
 * 画像ファイルを再帰的に検索
 */
async function findImages(dir) {
  const images = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      // assetsフォルダのみ対象
      if (entry.name === 'assets') {
        const subImages = await findImages(fullPath);
        images.push(...subImages);
      } else {
        const subImages = await findImages(fullPath);
        images.push(...subImages);
      }
    } else if (entry.isFile()) {
      const ext = entry.name.split('.').pop().toLowerCase();
      if (CONFIG.formats.includes(ext)) {
        images.push(fullPath);
      }
    }
  }

  return images;
}

/**
 * 個別画像の最適化
 */
async function optimizeImage(imagePath) {
  try {
    const stats = await stat(imagePath);
    const originalSize = stats.size;

    // ファイル名から種類を判定
    const fileName = imagePath.split('/').pop().toLowerCase();
    const imageType = detectImageType(fileName);
    const maxWidth = CONFIG.sizes[imageType];

    // 画像メタデータ取得
    const metadata = await sharp(imagePath).metadata();

    // 最適化が必要か判定
    const needsOptimization =
      metadata.width > maxWidth ||
      originalSize > 100 * 1024; // 100KB以上

    if (!needsOptimization) {
      return { optimized: false };
    }

    // 最適化処理
    const ext = imagePath.split('.').pop().toLowerCase();
    let sharpInstance = sharp(imagePath);

    // リサイズ（幅が最大幅を超える場合）
    if (metadata.width > maxWidth) {
      sharpInstance = sharpInstance.resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside',
      });
    }

    // フォーマット別圧縮
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ quality: CONFIG.quality.jpeg });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ quality: CONFIG.quality.png });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality: CONFIG.quality.webp });
        break;
    }

    // 一時ファイルに出力
    const tempPath = `${imagePath}.tmp`;
    await sharpInstance.toFile(tempPath);

    // サイズ確認
    const newStats = await stat(tempPath);
    const newSize = newStats.size;

    // 削減率が5%以上なら置き換え
    const savedBytes = originalSize - newSize;
    const savedPercent = Math.round((savedBytes / originalSize) * 100);

    if (savedPercent >= 5) {
      await rename(tempPath, imagePath);
      return {
        optimized: true,
        originalSize,
        newSize,
        savedBytes,
        savedPercent,
      };
    } else {
      // 削減効果が小さいので元のまま
      await unlink(tempPath);
      return { optimized: false };
    }
  } catch (error) {
    console.error(`❌ エラー: ${imagePath}`);
    console.error(`   ${error.message}\n`);
    return { optimized: false };
  }
}

/**
 * ファイル名から画像種類を判定
 */
function detectImageType(fileName) {
  if (fileName.includes('hero')) return 'hero';
  if (fileName.includes('thumbnail')) return 'thumbnail';
  return 'content';
}

/**
 * バイト数を人間が読みやすい形式に
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// 実行
optimizeGuideImages().catch(console.error);
```

---

## 📝 package.json に追加

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "optimize-images": "node scripts/optimize-images.js"
  },
  "devDependencies": {
    "sharp": "^0.33.0"
  }
}
```

---

## 🚀 使い方

### 基本的な使い方

```bash
# すべての画像を最適化
npm run optimize-images
```

**出力例:**
```
🖼️  画像最適化を開始...

📁 12 個の画像を発見

✅ content/guide/career/job-change-roadmap/assets/hero.jpg
   2.3 MB → 456 KB (80% 削減)

✅ content/guide/career/job-change-roadmap/assets/step1.png
   1.1 MB → 234 KB (79% 削減)

✅ content/guide/learning/good-bad-study-methods/assets/diagram.png
   890 KB → 123 KB (86% 削減)

🎉 完了！
   最適化: 12 / 12 個
   削減: 15.2 MB
```

### Git commitの前に実行

```bash
# 画像追加後
git add content/guide/career/job-change-roadmap/assets/

# 最適化
npm run optimize-images

# 再度ステージング
git add content/guide/career/job-change-roadmap/assets/

# コミット
git commit -m "画像追加: 転職ロードマップ"
```

---

## ⚙️ 最適化設定

### 画像品質の調整

`scripts/optimize-images.js` の `CONFIG` を編集：

```javascript
const CONFIG = {
  quality: {
    jpeg: 80,    // 80 = 高品質、60 = 標準、40 = 低品質
    png: 80,
    webp: 80,
  },
  // ...
};
```

**推奨設定:**
- サムネイル: 70-80
- 記事内画像: 75-85
- ヒーロー画像: 80-90

### 最大幅の調整

```javascript
const CONFIG = {
  sizes: {
    thumbnail: 800,    // サムネイル
    content: 1200,     // 記事内画像
    hero: 1920,        # ヒーロー画像
  },
  // ...
};
```

### 対応フォーマット

```javascript
const CONFIG = {
  formats: ['jpg', 'jpeg', 'png', 'webp'],
  // 'gif', 'svg' は非対応（SVGはベクターなので圧縮不要）
};
```

---

## 🎨 画像ファイル命名規則

最適化スクリプトはファイル名から画像種類を判定します：

| ファイル名 | 種類 | 最大幅 |
|-----------|------|--------|
| `hero.jpg` | ヒーロー画像 | 1920px |
| `thumbnail.jpg` | サムネイル | 800px |
| その他（`step1.png` など） | 記事内画像 | 1200px |

**推奨命名:**
```
hero.jpg              # ヒーロー画像
thumbnail.jpg         # サムネイル（別途指定がある場合）
section-1.png         # セクション1の画像
diagram-workflow.svg  # ワークフロー図（最適化対象外）
screenshot-figma.png  # ツールのスクショ
```

---

## 📊 最適化の効果

### Before（最適化前）

```
content/guide/career/job-change-roadmap/assets/
  hero.jpg      2.3 MB  (3000x2000px)
  step1.png     1.1 MB  (2400x1600px)
  step2.png     980 KB  (2000x1500px)
```

**合計:** 4.38 MB

### After（最適化後）

```
content/guide/career/job-change-roadmap/assets/
  hero.jpg      456 KB  (1920x1280px)
  step1.png     234 KB  (1200x800px)
  step2.png     189 KB  (1200x900px)
```

**合計:** 879 KB

**削減率:** 80% 🎉

---

## 🛠️ 追加機能（将来の拡張）

### 1. WebP形式への変換

```javascript
// 自動的にWebP形式も生成
await sharp(imagePath)
  .webp({ quality: 80 })
  .toFile(imagePath.replace(/\.(jpg|png)$/, '.webp'));
```

### 2. レスポンシブ画像の生成

```javascript
// 複数サイズを自動生成
const sizes = [400, 800, 1200, 1920];
for (const size of sizes) {
  await sharp(imagePath)
    .resize(size)
    .toFile(imagePath.replace('.jpg', `-${size}w.jpg`));
}
```

### 3. 自動実行（Git hooks）

`.husky/pre-commit` に追加：

```bash
#!/bin/sh
npm run optimize-images
git add content/guide/**/assets/
```

コミット前に自動的に画像最適化。

---

## 🚨 トラブルシューティング

### Q1. Sharpのインストールエラー

**原因:** ネイティブモジュールのビルドエラー

**解決策:**
```bash
# Node.jsを最新版に更新
nvm install node
nvm use node

# 再インストール
npm install sharp
```

### Q2. 最適化後に画質が悪い

**原因:** 品質設定が低すぎる

**解決策:**
```javascript
const CONFIG = {
  quality: {
    jpeg: 85,  // 80 → 85 に上げる
    png: 85,
    webp: 85,
  },
};
```

### Q3. 画像が見つからない

**原因:** ディレクトリ構造が間違っている

**解決策:**
```
# 正しい構造
content/guide/career/job-change-roadmap/assets/hero.jpg
                                          ^^^^^^^ assetsフォルダが必要
```

### Q4. 大量の画像で時間がかかる

**解決策:**
- 特定フォルダのみ最適化するオプション追加
- 並列処理の実装

---

## 📈 パフォーマンス目標

| 指標 | 目標 |
|------|------|
| 画像1枚のサイズ | < 200KB |
| ページ全体の画像サイズ | < 1MB |
| 削減率 | > 70% |

---

## ✅ チェックリスト

画像追加時：

- [ ] 画像を `assets/` フォルダに配置
- [ ] わかりやすいファイル名をつける
- [ ] `npm run optimize-images` を実行
- [ ] プレビューで表示確認
- [ ] Git add & commit

---

これで画像最適化の仕組みが完成です！🎉
