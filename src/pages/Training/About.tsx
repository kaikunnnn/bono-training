
import React from 'react';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const TrainingAbout: React.FC = () => {
  return (
    <TrainingLayout>
      <TrainingHeader />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">BONOトレーニングの遊び方</h1>
          <p className="text-lg text-gray-600">
            UI/UXデザイン力を実践的に伸ばすBONOトレーニングの活用方法をご紹介します
          </p>
        </div>
        
        <div className="space-y-10">
          {/* セクション1: トレーニングとは */}
          <section>
            <h2 className="text-2xl font-bold mb-4">BONOトレーニングとは</h2>
            <Card>
              <CardContent className="p-6">
                <p className="mb-4">
                  BONOトレーニングは、UI/UXデザインのスキルを「筋トレ」のように反復練習で身につけるための実践型学習プラットフォームです。
                </p>
                <p className="mb-4">
                  短時間で取り組める「お題」に挑戦することで、効率的にスキルを向上させることができます。
                </p>
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mt-4">
                  <h4 className="font-medium mb-2">BONOトレーニングの特徴</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>短時間で完結する実践的なお題</li>
                    <li>スキル別のトレーニングカリキュラム</li>
                    <li>レベル別の課題でステップアップ</li>
                    <li>SNSで共有して成長を実感</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>
          
          {/* セクション2: 始め方 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">始め方</h2>
            <Card>
              <CardContent className="p-6">
                <ol className="space-y-6">
                  <li className="flex items-start">
                    <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                      <span className="font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">アカウント登録</h3>
                      <p className="text-gray-600 mt-1">
                        メールアドレスとパスワードで無料アカウントを作成します。
                        <Link to="/signup" className="text-primary ml-2 inline-flex items-center">
                          登録する <ChevronRight className="h-4 w-4" />
                        </Link>
                      </p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                      <span className="font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">トレーニングを選ぶ</h3>
                      <p className="text-gray-600 mt-1">
                        トレーニング一覧から、興味のあるトレーニングを選択します。
                        <Link to="/training" className="text-primary ml-2 inline-flex items-center">
                          トレーニング一覧 <ChevronRight className="h-4 w-4" />
                        </Link>
                      </p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                      <span className="font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">お題に取り組む</h3>
                      <p className="text-gray-600 mt-1">
                        トレーニングに含まれるお題に順番に取り組みます。無料版では一部のお題のみ利用可能です。
                      </p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                      <span className="font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">メンバーシップへの登録</h3>
                      <p className="text-gray-600 mt-1">
                        すべてのお題にアクセスするには、メンバーシッププランへの登録が必要です。
                        <Link to="/training/plan" className="text-primary ml-2 inline-flex items-center">
                          プランを見る <ChevronRight className="h-4 w-4" />
                        </Link>
                      </p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </section>
          
          {/* セクション3: 効果的な利用方法 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">効果的な利用方法</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">1. 定期的なトレーニング</h3>
                    <p className="text-gray-600 mt-1">
                      デザインスキルは継続的な練習が大切です。毎日30分でも継続することで効果を実感できます。
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg">2. 成果物を作成する</h3>
                    <p className="text-gray-600 mt-1">
                      お題に対して実際に制作物を作り、ポートフォリオとして蓄積していくことが重要です。
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg">3. SNSで共有する</h3>
                    <p className="text-gray-600 mt-1">
                      作成した成果物をSNSで共有することで、フィードバックを得られ、モチベーション維持にもつながります。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
        
        <div className="text-center mt-12">
          <Link 
            to="/training" 
            className="inline-flex h-10 items-center justify-center px-6 py-2 rounded-full border-2 border-primary bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <span className="font-medium">
              トレーニングを始める
            </span>
          </Link>
        </div>
      </div>
    </TrainingLayout>
  );
};

export default TrainingAbout;
