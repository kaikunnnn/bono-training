/**
 * 花の成長通知モーダル
 * 記事完了時に花が成長したことを視覚的に通知
 */

import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { RinaFlower3D } from './RinaFlower3D';
import { GrowthStage, GROWTH_STAGE_NAMES, GROWTH_STAGE_DESCRIPTIONS } from '@/types/flower';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface FlowerGrowthNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  previousStage: GrowthStage;
  currentStage: GrowthStage;
  completionRate: number;
}

export function FlowerGrowthNotification({
  isOpen,
  onClose,
  lessonTitle,
  previousStage,
  currentStage,
  completionRate,
}: FlowerGrowthNotificationProps) {
  const hasGrown = currentStage > previousStage;

  useEffect(() => {
    if (isOpen && hasGrown) {
      // 成長時に効果音を鳴らす（オプション）
      // playGrowthSound();
    }
  }, [isOpen, hasGrown]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            {hasGrown ? (
              <>
                <Sparkles className="h-6 w-6 text-yellow-500" />
                璃奈フラワーが成長しました！
              </>
            ) : (
              <>記事完了！</>
            )}
          </DialogTitle>
          <DialogDescription>
            {lessonTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 3D花の表示 */}
          <div className="h-64 w-full rounded-lg bg-gradient-to-b from-sky-100 to-green-50 overflow-hidden">
            <Canvas>
              <PerspectiveCamera makeDefault position={[0, 0.5, 2.5]} />
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={3}
              />

              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={0.8} />
              <pointLight position={[-5, 5, -5]} intensity={0.4} />

              <RinaFlower3D growthStage={currentStage} animate />
            </Canvas>
          </div>

          {/* 成長情報 */}
          <div className="space-y-3">
            {hasGrown && (
              <div className="flex items-center justify-center gap-3 p-4 bg-green-50 rounded-lg">
                <div className="text-center">
                  <Badge variant="outline" className="mb-2">
                    {GROWTH_STAGE_NAMES[previousStage]}
                  </Badge>
                  <div className="text-3xl">→</div>
                </div>
                <div className="text-center">
                  <Badge className="mb-2 bg-green-600">
                    {GROWTH_STAGE_NAMES[currentStage]}
                  </Badge>
                  <div className="text-2xl">🌸</div>
                </div>
              </div>
            )}

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {GROWTH_STAGE_DESCRIPTIONS[currentStage]}
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg font-bold text-primary">
                  {Math.round(completionRate)}%
                </span>
                <span className="text-sm text-muted-foreground">完了</span>
              </div>
            </div>

            {currentStage === 5 && (
              <div className="p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg text-center">
                <p className="text-lg font-bold text-purple-900">
                  🎉 おめでとうございます！ 🎉
                </p>
                <p className="text-sm text-purple-700 mt-1">
                  レッスンをすべて完了しました！
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              閉じる
            </Button>
            <Button
              onClick={() => {
                window.location.href = '/profile';
              }}
              className="flex-1"
            >
              マイページで確認
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
