import { User } from "iconsax-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PARTICIPANT_AVATAR_MAX,
  PARTICIPANT_COUNT_THRESHOLD,
  type EventParticipantSummary,
} from "@/lib/events/onsite-registration";

/**
 * イベント参加者のアイコン列（#218 スライスD）。誰にでも（非会員・未ログインにも）見せる。
 *
 * - 0人: 何も出さない
 * - 1〜4人: アイコンだけ（数字なし）
 * - 5人以上: アイコン最大4個（重ねる）＋「N人が参加中」
 *
 * 受け取るのはアイコンURLと人数だけ（名前・コメントは非会員に渡さない）。
 * そのためアイコン未設定の人の代替表示は、掲示板と同じ AvatarFallback に頭文字ではなく人型アイコンを出す。
 */
export default function EventParticipantAvatars({
  totalCount,
  avatarUrls,
}: EventParticipantSummary) {
  if (totalCount <= 0) return null;

  const visible = avatarUrls.slice(0, PARTICIPANT_AVATAR_MAX);

  return (
    <div
      role="group"
      aria-label={`${totalCount}人が参加`}
      className="flex items-center gap-2"
    >
      <div className="flex -space-x-2" aria-hidden="true">
        {visible.map((url, index) => (
          <Avatar key={index} className="size-8 ring-2 ring-background">
            {url && <AvatarImage src={url} alt="" />}
            <AvatarFallback className="text-muted-foreground">
              <User size={16} color="currentColor" />
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      {totalCount >= PARTICIPANT_COUNT_THRESHOLD && (
        <span className="text-sm text-gray-600" aria-hidden="true">
          {totalCount}人が参加中
        </span>
      )}
    </div>
  );
}
