import React, { useState } from "react";
import Image from "next/image";

import useMemberStatus from "@/libs/memberstack/useMemberStatus";
import { PLANID } from "@/stripe/planId";

// Import Player
import "react-h5-audio-player/lib/styles.css";
import CustomAudioUi from "./CustomAudioUi";
import { Player } from "@lottiefiles/react-lottie-player";
import Loading from "@/public/loading.json";

const AudioPlayer = ({ src }) => {
  const member = useMemberStatus();
  const [isLoading, setIsLoading] = useState(true);

  // 特定のプランIDを持つユーザーのみにコンテンツを表示する例
  // standard と growth のプランIDを取得
  const allowedPlanIds = [
    PLANID.standard.onemonth,
    PLANID.standard.threemonth,
    PLANID.growth.onemonth,
    PLANID.growth.threemonth,
    PLANID.community.all,
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
    return (
      <div className="flex justify-center items-center">
        <Player
          autoplay
          loop
          src={Loading}
          style={{
            left: "0",
            height: "64px",
            width: "64px",
          }}
        />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div>このコンテンツを聴くには、適切なサブスクリプションが必要です。</div>
    );
  }

  return (
    <div className="AudioPlayer w-full">
      <CustomAudioUi src={src} />
    </div>
  );
};

export default AudioPlayer;
