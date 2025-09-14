import React from "react";

// firebase auth account
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../firebase";

// stripe firebase account auth
import usePremiumStatus from "../../../stripe/usePremiumStatus";

const MemberContent = ({ article }) => {
  // 現在ログインしているユーザーの情報を取得
  const [user] = useAuthState(auth);
  // ユーザーのサブスクリプションプランを取得
  const userSubscriptionPlan = usePremiumStatus(user);

  // ユーザーがフリーメンバーかどうかを判定（サブスクリプションプランがない場合はフリーメンバー）
  const isFreeMember = userSubscriptionPlan === null;
  // ユーザーがコミュニティメンバーかどうかを判定
  const isCommunityMember = userSubscriptionPlan === "premium_community";
  // ユーザーがスタンダードまたはグロースメンバーかどうかを判定
  const isStandardOrGrowthMember = [
    "premium_standard",
    "premium_growth",
  ].includes(userSubscriptionPlan);

  // 記事がコミュニティ専用コンテンツの場合、コミュニティメンバーまたはそれ以上のメンバーが閲覧可能
  // 記事がコミュニティ専用でない場合、スタンダードまたはグロースメンバーのみ閲覧可能
  const canSeeContentB =
    (article.contentIsCommunity &&
      (isCommunityMember || isStandardOrGrowthMember)) ||
    (!article.contentIsCommunity && isStandardOrGrowthMember);

  return (
    <>
      {article.contentIsFree ? null : canSeeContentB ? (
        <div className="m-auto w-10/12">
          <div
            className="Article Body
                    prose 
                    prose-h1:text-3xl
                    prose-lg 
                    prose-p:leading-loose
                    md:prose-xl 
                    m-auto "
            dangerouslySetInnerHTML={{ __html: article.bodyIsPremium }}
          />
        </div>
      ) : (
        <div className="m-auto w-10/12 pt-12 pb-12">
          {/* ここに非メンバー向けのメッセージやUIを配置できます */}
        </div>
      )}
    </>
  );
};

export default MemberContent;
