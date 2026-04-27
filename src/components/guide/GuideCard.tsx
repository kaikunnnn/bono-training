import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Clock, Briefcase, BookOpen, TrendingUp, Wrench } from "lucide-react";
import type { Guide } from "@/types/guide";

const categoryIcons: Record<string, typeof Briefcase> = {
  career: Briefcase,
  learning: BookOpen,
  industry: TrendingUp,
  tools: Wrench,
};

const categoryColors: Record<string, string> = {
  career: "bg-blue-100 text-blue-700",
  learning: "bg-green-100 text-green-700",
  industry: "bg-purple-100 text-purple-700",
  tools: "bg-orange-100 text-orange-700",
};

interface GuideCardProps {
  guide: Guide;
}

export function GuideCard({ guide }: GuideCardProps) {
  const Icon = categoryIcons[guide.category] || BookOpen;
  const colorClass = categoryColors[guide.category] || "bg-gray-100 text-gray-700";

  return (
    <Link href={`/guide/${guide.slug}`}>
      <Card className="group h-full hover:shadow-lg transition-all duration-300 border-gray-100">
        <CardContent className="p-5">
          {/* カテゴリとプレミアムバッジ */}
          <div className="flex items-center justify-between mb-3">
            <Badge variant="secondary" className={colorClass}>
              <Icon className="w-3 h-3 mr-1" />
              {guide.category}
            </Badge>
            {guide.isPremium && (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                <Lock className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>

          {/* タイトル */}
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {guide.title}
          </h3>

          {/* 説明 */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {guide.description}
          </p>

          {/* メタ情報 */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {guide.readingTime}
            </span>
            {guide.tags.length > 0 && (
              <span className="truncate">{guide.tags[0]}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default GuideCard;
