/**
 * 質問投稿完了画面
 * - 投稿完了メッセージ
 * - Slackチャンネルへのリンク
 * - 投稿した質問の表示
 */

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  PlusCircle,
  List,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { SubmitResult } from "./StepQuestionForm";

// Slackチャンネル情報
const SLACK_CHANNEL = {
  name: "#質問",
  url: "https://bonoco.slack.com/archives/C04JJHFDGTT",
};

interface QuestionSubmitSuccessProps {
  result: SubmitResult;
  onNewQuestion: () => void;
}

export function QuestionSubmitSuccess({
  result,
  onNewQuestion,
}: QuestionSubmitSuccessProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto space-y-6"
    >
      {/* 投稿完了メッセージ */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          >
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
          </motion.div>
          <h3 className="text-xl font-bold mb-2 text-green-900">
            質問を投稿しました！
          </h3>
          <div className="flex items-center justify-center gap-2 text-sm text-green-700 mb-2">
            <Clock className="h-4 w-4" />
            <span>通常1〜3日以内に回答</span>
          </div>
          <p className="text-sm text-green-600">
            カイくんが確認後、回答とともに公開されます
          </p>
        </CardContent>
      </Card>

      {/* Slackチャンネルリンク */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#4A154B] flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">Slackで確認する</h4>
              <p className="text-sm text-muted-foreground mb-3">
                投稿された質問は {SLACK_CHANNEL.name} チャンネルでも確認できます
              </p>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2"
              >
                <a
                  href={SLACK_CHANNEL.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Slackで開く</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 投稿した質問 */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <span className="text-lg">📝</span>
            あなたの質問
          </h4>
          <div className="p-4 border rounded-xl bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
                🟡 回答待ち
              </Badge>
              <Badge variant="outline" className="text-xs">
                {result.categoryEmoji} {result.categoryTitle}
              </Badge>
            </div>
            <h5 className="font-medium text-base mb-2">{result.title}</h5>
            <p className="text-xs text-muted-foreground">投稿: たった今</p>
          </div>
        </CardContent>
      </Card>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => navigate("/questions")}
        >
          <List className="h-4 w-4" />
          質問一覧を見る
        </Button>
        <Button
          className="flex-1 gap-2"
          onClick={onNewQuestion}
        >
          <PlusCircle className="h-4 w-4" />
          新しい質問を投稿
        </Button>
      </div>
    </motion.div>
  );
}
