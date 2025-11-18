/**
 * 花カードコンポーネント
 * 3D花と進捗情報を表示するカード
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { RinaFlower3D } from './RinaFlower3D';
import { LessonProgress, GROWTH_STAGE_NAMES, GROWTH_STAGE_DESCRIPTIONS } from '@/types/flower';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface FlowerCardProps {
  progress: LessonProgress;
  onClick?: () => void;
}

export function FlowerCard({ progress, onClick }: FlowerCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (progress.lessonSlug) {
      navigate(`/lessons/${progress.lessonSlug}`);
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'UI': return 'bg-blue-500';
      case 'UX': return 'bg-purple-500';
      case '情報設計': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {progress.lessonTitle}
          </CardTitle>
          {progress.category && (
            <Badge className={`${getCategoryColor(progress.category)} text-white ml-2 shrink-0`}>
              {progress.category}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 3D花の表示エリア */}
        <div className="h-64 w-full rounded-lg bg-gradient-to-b from-sky-100 to-green-50 overflow-hidden">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0.5, 2.5]} />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 2}
              autoRotate={progress.growthStage === 5}
              autoRotateSpeed={2}
            />

            {/* ライティング */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
            <pointLight position={[-5, 5, -5]} intensity={0.4} />

            {/* 璃奈フラワー */}
            <RinaFlower3D growthStage={progress.growthStage} animate />
          </Canvas>
        </div>

        {/* 進捗情報 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">
              {GROWTH_STAGE_NAMES[progress.growthStage]}
            </span>
            <span className="font-bold text-primary">
              {Math.round(progress.completionRate)}%
            </span>
          </div>

          <Progress value={progress.completionRate} className="h-2" />

          <p className="text-xs text-muted-foreground">
            {GROWTH_STAGE_DESCRIPTIONS[progress.growthStage]}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span>
              {progress.completedArticles} / {progress.totalArticles} 記事完了
            </span>
            {progress.completionRate === 100 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                ✨ 完了
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
