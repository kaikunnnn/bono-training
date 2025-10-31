import React from "react";
import ContentWrapper from "@/components/training/ContentWrapper";

/**
 * ガイドページのヒーローセクション
 */
const GuideHero = () => {
  return (
    <div className="bg-white border-b border-gray-200">
      <ContentWrapper className="py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            学習ガイド
          </h1>
          <p className="text-lg text-gray-600">
            デザイナーとして成長するための実践的なガイド記事。
            転職、学習方法、業界動向など、キャリアに役立つ情報をお届けします。
          </p>
        </div>
      </ContentWrapper>
    </div>
  );
};

export default GuideHero;
