import Image from "next/image";
import React, { useState } from "react";
// Component
import LoginButtonMemberstackModal from "@/components/common/ui/buttons/auth/LoginButtonMemeberstack";
// Memeberstack
import useMemberStatus from "@/libs/memberstack/useMemberStatus";
import { PLANID } from "@/stripe/planId";

const HeaderPodcastPage = () => {
  // ログイン状況で出し分ける
  const member = useMemberStatus();
  const [isLoading, setIsLoading] = useState(true);

  // 特定のプランIDを持つユーザーのみにコンテンツを表示する例
  // standard と growth のプランIDを取得
  const allowedPlanIds = [
    PLANID.standard.onemonth,
    PLANID.standard.threemonth,
    PLANID.growth.onemonth,
    PLANID.growth.threemonth,
  ];
  const hasAccess =
    member &&
    member.planConnections &&
    member.planConnections.some((plan) =>
      allowedPlanIds.includes(plan.payment.priceId)
    );

  React.useEffect(() => {
    // 判定が終わったらローディングを非表示にする
    setIsLoading(false);
  }, [member]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div class="Header w-10/12 flex-col justify-start items-center gap-4 inline-flex py-24 md:pb-16 pb-10">
      <div class="flex-col justify-start items-center gap-4 flex">
        <div class="self-stretch justify-center items-center gap-[529px] inline-flex relative">
          <div class="flex-col justify-center items-center gap-2 inline-flex">
            <h1 class="text-center text-slate-900 md:text-[120px] text-[64px] font-normal font-dela leading-[140%] md:tracking-[20px] tracking-[8px]">
              RADIO
            </h1>
            <h3 class="text-center text-neutral-900 text-base font-black font-['Noto Sans JP'] leading-none tracking-[6.40px]">
              ボノラジ
            </h3>
          </div>
          <div class="absolute md:-top-6 -top-6 md:right-[-164px] right-[-64px] transform -translate-x-1/2 -translate-y-1/2 md:w-[96px] md:h-[96px]  w-[80px] h-[80px]">
            <Image
              className="w-full relative h-[80%] left-[56px] top-[-60px]"
              src="/podcast/bakuhatsu-kikukohasodatu.svg"
              alt="Podcast Image"
              layout="fill"
            />
          </div>
        </div>
        <div class="w-full md:text-center text-center text-black text-opacity-50 md:text-base text-sm font-bold leading-relaxed tracking-wide">
          カイクンが動画作るのは大変なんだけど
          <br />
          なんとなくいい感じのデザイン話をするメンバー限定ポッドキャストです。
          <br />
          作業中にエモーションを注入してクリエイションしてください
        </div>
      </div>
      <div className="LoginOrNot">
        {hasAccess ? (
          // ユーザーがアクセス権を持っている場合、コンテンツを表示
          <div>
            <p>BONOのメンバーなんだね！最高だね！</p>
          </div>
        ) : (
          // ユーザーがアクセス権を持っていない場合、ログインボタンを表示
          <LoginButtonMemberstackModal />
        )}
      </div>
    </div>
  );
};

export default HeaderPodcastPage;
