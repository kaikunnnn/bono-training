import * as React from "react"
import { Link } from "react-router-dom"
import { BookOpen, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { urlFor } from "@/lib/sanity"
import type { LessonWithArticles } from "@/services/lessons"
import type { LessonProgress } from "@/services/progress"

interface LessonProgressCardProps extends React.HTMLAttributes<HTMLDivElement> {
  lesson: LessonWithArticles
  progress: LessonProgress
  isCompleted?: boolean
}

const LessonProgressCard = React.forwardRef<HTMLDivElement, LessonProgressCardProps>(
  ({ className, lesson, progress, isCompleted = false, ...props }, ref) => {
    const thumbnailUrl = lesson.thumbnailUrl
      || (lesson.thumbnail ? urlFor(lesson.thumbnail).width(120).height(120).url() : null)
      || "/placeholder-lesson.png"

    return (
      <Link to={`/lessons/${lesson.slug.current}`}>
        <div
          ref={ref}
          className={cn(
            "flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all",
            isCompleted && "bg-green-50 border-green-200",
            className
          )}
          {...props}
        >
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-[120px] h-[120px] bg-gray-200 rounded overflow-hidden">
            <img
              src={thumbnailUrl}
              alt={lesson.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
              {lesson.title}
            </h3>

            {/* Description */}
            {lesson.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {lesson.description}
              </p>
            )}

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">進捗</span>
                <span className="font-bold text-gray-900">
                  {progress.completedArticles}/{progress.totalArticles} 記事完了
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{lesson.questCount} クエスト</span>
              </div>
              {isCompleted && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>完了</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }
)
LessonProgressCard.displayName = "LessonProgressCard"

export { LessonProgressCard }
