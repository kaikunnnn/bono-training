
import React from 'react';
import { Check, X } from 'lucide-react';

const PlanComparison: React.FC = () => {
  return (
    <div className="mt-12 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">プラン比較</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">機能</th>
              <th className="text-center py-3">スタンダード</th>
              <th className="text-center py-3">グロース</th>
              <th className="text-center py-3">コミュニティ</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-3">基本学習コンテンツ</td>
              <td className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
              <td className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
              <td className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
            </tr>
            <tr className="border-b">
              <td className="py-3">メンバー限定コンテンツ</td>
              <td className="text-center"><X className="h-5 w-5 text-gray-300 mx-auto" /></td>
              <td className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
              <td className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
            </tr>
            <tr className="border-b">
              <td className="py-3">トレーニングプログラム</td>
              <td className="text-center"><X className="h-5 w-5 text-gray-300 mx-auto" /></td>
              <td className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
              <td className="text-center"><X className="h-5 w-5 text-gray-300 mx-auto" /></td>
            </tr>
            <tr className="border-b">
              <td className="py-3">コミュニティアクセス</td>
              <td className="text-center"><X className="h-5 w-5 text-gray-300 mx-auto" /></td>
              <td className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
              <td className="text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanComparison;
