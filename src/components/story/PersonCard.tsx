/**
 * PersonCard — ストーリー詳細ページの人物プロフィールカード
 *
 * BON-327 パターン4ベース（Figma Blog風タイポ）。
 * 名前 + 職種 + bio + SNSリンク。
 */

import Image from "next/image";
import type { StoryPerson } from "@/types/sanity";

interface PersonCardProps {
  person: StoryPerson;
}

export default function PersonCard({ person }: PersonCardProps) {
  return (
    <div className="bg-white rounded-[12px] border border-[#e8e9e2] p-8">
      <div className="flex items-start gap-5">
        {person.profileImageUrl && (
          <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-[#e8e9e2]">
            <Image
              src={person.profileImageUrl}
              alt={person.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] tracking-[1.2px] uppercase text-[#677470] font-noto-sans-jp mb-1">
            Interviewee
          </p>
          <h2 className="text-[22px] font-bold text-text-primary leading-[1.3] font-noto-sans-jp">
            {person.name}
          </h2>
          {person.currentRole && (
            <p className="text-[13px] text-[#677470] mt-1 font-noto-sans-jp">
              {person.currentRole}
            </p>
          )}

          {person.bio && (
            <p className="text-[18px] leading-[33.3px] text-text-primary mt-4 font-noto-sans-jp">
              {person.bio}
            </p>
          )}

          {person.socialLinks && person.socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-5 text-[12px] font-noto-sans-jp">
              {person.socialLinks.map((sns, i) => (
                <span key={`${sns.label}-${i}`} className="flex items-center gap-3">
                  {i > 0 && <span className="text-[#d4d6cc]">/</span>}
                  <a
                    href={sns.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-primary underline-offset-4 hover:underline"
                  >
                    {sns.label} ↗
                  </a>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
