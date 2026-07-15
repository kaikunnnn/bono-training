// src/lib/image-utils.ts
// クライアント用の画像処理ユーティリティ（純関数）。
// Supabase Free プラン運用のため、アップロード前に必ずここで縮小・WebP 化する。
// canvas / Image / URL.createObjectURL に依存するのでブラウザでのみ動作する。

/** 受け付ける入力 MIME タイプ */
export const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** 入力ファイルの上限（元ファイル。クロップ後は自動的に小さくなる） */
export const MAX_INPUT_FILE_BYTES = 10 * 1024 * 1024; // 10MB

/** react-easy-crop の onCropComplete が返す croppedAreaPixels と同型 */
export interface CropAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageFileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 入力ファイルの MIME タイプ・サイズを検証する。
 * UI 上のガード用（バケット側・Server Action 側でも別途検証する）。
 */
export function validateImageFile(file: File): ImageFileValidationResult {
  if (
    !(ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)
  ) {
    return {
      valid: false,
      error: "JPEG / PNG / WebP 形式の画像を選択してください",
    };
  }
  if (file.size > MAX_INPUT_FILE_BYTES) {
    return {
      valid: false,
      error: "ファイルサイズが大きすぎます（10MB まで）",
    };
  }
  return { valid: true };
}

/** File を HTMLImageElement に読み込む */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("画像の読み込みに失敗しました"));
    };
    image.src = objectUrl;
  });
}

/**
 * 画像を指定領域でクロップし、outputSize × outputSize の正方形 WebP Blob に変換する。
 * アバター用途（デフォルト 512×512・quality 0.85）。
 *
 * @param file            元画像ファイル
 * @param cropAreaPixels  react-easy-crop の croppedAreaPixels（元画像ピクセル基準）
 * @param outputSize      出力の一辺（px）
 * @param quality         WebP 品質（0〜1）
 */
export async function cropImageToWebP(
  file: File,
  cropAreaPixels: CropAreaPixels,
  outputSize = 512,
  quality = 0.85
): Promise<Blob> {
  const image = await loadImageFromFile(file);

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("画像の変換に失敗しました");
  }

  // クロップ領域を outputSize の正方形に描画（リサイズも同時に行う）
  ctx.drawImage(
    image,
    cropAreaPixels.x,
    cropAreaPixels.y,
    cropAreaPixels.width,
    cropAreaPixels.height,
    0,
    0,
    outputSize,
    outputSize
  );

  return canvasToWebPBlob(canvas, quality);
}

/**
 * canvas を WebP Blob に変換する（cropImageToWebP / resizeImageToWebP 共通処理）。
 */
function canvasToWebPBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("画像の変換に失敗しました"));
        }
      },
      "image/webp",
      quality
    );
  });
}

/**
 * 画像をクロップせずアスペクト比を保ったまま長辺 maxEdge px 以内に縮小し、
 * WebP Blob に変換する。投稿添付用途（デフォルト 長辺 1200px・quality 0.75）。
 * 元画像が maxEdge 以下の場合は拡大せず等倍で描画する（再エンコードのみ）。
 *
 * @param file     元画像ファイル
 * @param maxEdge  出力の長辺の上限（px）
 * @param quality  WebP 品質（0〜1）
 */
export async function resizeImageToWebP(
  file: File,
  maxEdge = 1200,
  quality = 0.75
): Promise<Blob> {
  const image = await loadImageFromFile(file);

  // アスペクト比を保ちつつ長辺を maxEdge に収める（拡大はしない）
  const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
  const targetWidth = Math.round(image.width * scale);
  const targetHeight = Math.round(image.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("画像の変換に失敗しました");
  }

  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  return canvasToWebPBlob(canvas, quality);
}
