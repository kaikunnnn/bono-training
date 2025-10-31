import React from "react";

/**
 * ガイドページのヒーローセクション
 */
const GuideHero = () => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            学習ガイド
          </h1>
          <p className="text-lg text-gray-600">
            デザイナーとして成長するための実践的なガイド記事。
            転職、学習方法、業界動向など、キャリアに役立つ情報をお届けします。
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuideHero;
