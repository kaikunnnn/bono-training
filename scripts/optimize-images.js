import sharp from 'sharp';
import { readdir, stat, rename, unlink } from 'fs/promises';
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

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        const subImages = await findImages(fullPath);
        images.push(...subImages);
      } else if (entry.isFile()) {
        const ext = entry.name.split('.').pop().toLowerCase();
        if (CONFIG.formats.includes(ext)) {
          images.push(fullPath);
        }
      }
    }
  } catch (error) {
    // ディレクトリが存在しない場合は空配列を返す
    if (error.code !== 'ENOENT') {
      throw error;
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
