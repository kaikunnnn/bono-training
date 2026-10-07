import type { Metadata } from "next";
import { AnnouncementBarPreview } from "./AnnouncementBarPreview";

export const metadata: Metadata = {
  title: "お知らせバー確認 (/dev/announcement-bar)",
  robots: { index: false, follow: false },
};

/**
 * /dev/announcement-bar — お知らせバー（#220）の単体確認ページ。
 * 実際の表示位置は /top・/mypage（Layout の main 先頭）で確認する。
 */
export default function AnnouncementBarDevPage() {
  return <AnnouncementBarPreview />;
}
