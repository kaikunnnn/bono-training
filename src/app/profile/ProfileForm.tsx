// src/app/profile/ProfileForm.tsx — shadcn/ui コンポーネント使用
"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Check, ImagePlus } from "lucide-react";
import { SettingsCard } from "@/components/common/SettingsPageLayout";
import { updateProfile, uploadAvatar, type ProfileData } from "./actions";
import { cropImageToWebP, validateImageFile } from "@/lib/image-utils";

interface ProfileFormProps {
  defaultValues: ProfileData;
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(defaultValues.avatarUrl);

  // アバターアップロード（クロップ）用の状態
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cropError, setCropError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data: ProfileData = {
      displayName: formData.get("displayName") as string,
      avatarUrl,
      bio: formData.get("bio") as string,
    };

    const result = await updateProfile(data);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    }

    setIsSubmitting(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // 同じファイルを再選択できるように input をリセット
    e.target.value = "";
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setCropError(validation.error ?? "画像を選択できませんでした");
      return;
    }

    setCropError(null);
    setSelectedFile(file);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setImageSrc(URL.createObjectURL(file));
  };

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const closeCropDialog = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(null);
    setSelectedFile(null);
    setCroppedAreaPixels(null);
  };

  const handleConfirmCrop = async () => {
    if (!selectedFile || !croppedAreaPixels) return;
    setIsUploading(true);
    setCropError(null);

    try {
      const blob = await cropImageToWebP(selectedFile, croppedAreaPixels);
      const formData = new FormData();
      formData.append("file", blob, "avatar.webp");

      const result = await uploadAvatar(formData);
      if (result.error) {
        setCropError(result.error);
        return;
      }
      if (result.avatarUrl) {
        setAvatarUrl(result.avatarUrl);
        closeCropDialog();
        router.refresh();
      }
    } catch {
      setCropError("画像の処理に失敗しました。別の画像でお試しください");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <SettingsCard title="プロフィール設定">
        <div className="space-y-6">
          {/* アバター */}
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={avatarUrl} alt="アバター" />
              <AvatarFallback className="text-2xl">
                {defaultValues.displayName?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Label>プロフィール画像</Label>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="w-4 h-4 mr-2" />
                  画像を選択
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                選択した画像は自動で保存されます（下の「保存する」とは別）。
                JPEG / PNG / WebP 形式に対応しています
              </p>
              {cropError && !imageSrc && (
                <p className="text-xs text-red-600">{cropError}</p>
              )}
            </div>
          </div>

          {/* プロフィール名 */}
          <div className="space-y-2">
            <Label htmlFor="displayName">プロフィール名</Label>
            <Input
              id="displayName"
              name="displayName"
              placeholder="プロフィール名を入力"
              defaultValue={defaultValues.displayName}
            />
          </div>

          {/* 自己紹介 */}
          <div className="space-y-2">
            <Label htmlFor="bio">自己紹介</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="自己紹介を入力（任意）"
              rows={4}
              defaultValue={defaultValues.bio}
            />
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          {/* 成功メッセージ */}
          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md flex items-center gap-2">
              <Check className="w-4 h-4" />
              プロフィールを更新しました
            </div>
          )}
        </div>

        {/* 保存ボタン */}
        <div className="mt-6 pt-6 border-t">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              "保存する"
            )}
          </Button>
        </div>
      </SettingsCard>

      {/* クロップダイアログ */}
      <Dialog
        open={!!imageSrc}
        onOpenChange={(open) => {
          if (!open && !isUploading) closeCropDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>画像を調整</DialogTitle>
            <DialogDescription>
              ドラッグとズームで表示範囲を調整してください
            </DialogDescription>
          </DialogHeader>

          {imageSrc && (
            <div className="relative w-full h-64 bg-muted rounded-md overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="avatar-zoom">ズーム</Label>
            <Slider
              id="avatar-zoom"
              min={1}
              max={3}
              step={0.01}
              value={[zoom]}
              onValueChange={(v) => setZoom(v[0])}
            />
          </div>

          {cropError && (
            <p className="text-sm text-red-600">{cropError}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeCropDialog}
              disabled={isUploading}
            >
              キャンセル
            </Button>
            <Button
              type="button"
              onClick={handleConfirmCrop}
              disabled={isUploading || !croppedAreaPixels}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  適用中...
                </>
              ) : (
                "この画像にする"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
