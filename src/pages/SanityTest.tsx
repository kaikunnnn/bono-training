import React, { useState, useEffect } from "react";
import { client, urlFor } from "@/lib/sanity";
import Layout from "@/components/layout/Layout";

interface TestLesson {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  coverImage?: any;
  category?: string;
  isPremium: boolean;
}

const SanityTest: React.FC = () => {
  const [lessons, setLessons] = useState<TestLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = `*[_type == "testLesson"] {
      _id,
      title,
      slug,
      description,
      coverImage,
      category,
      isPremium
    }`;

    client
      .fetch(query)
      .then((data) => {
        setLessons(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Sanityテスト</h1>
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Sanityテスト</h1>
          <p className="text-red-600">エラー: {error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Sanityテスト</h1>

        {lessons.length === 0 ? (
          <p>レッスンがありません。Sanity Studioでデータを追加してください。</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <div
                key={lesson._id}
                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                {lesson.coverImage && (
                  <img
                    src={urlFor(lesson.coverImage).width(400).height(300).url()}
                    alt={lesson.title}
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                )}
                <h2 className="text-xl font-bold mb-2">
                  {lesson.title}
                  {lesson.isPremium && <span className="ml-2">🔒</span>}
                </h2>
                <p className="text-sm text-gray-600 mb-2">{lesson.category}</p>
                <p className="text-gray-700">{lesson.description}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded">
          <h2 className="font-bold mb-2">次のステップ:</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Sanity Studioでデータを追加・編集してみる</li>
            <li>このページをリロードして反映を確認</li>
            <li>画像アップロード、カテゴリ変更などを試す</li>
            <li>使い勝手が良ければ本実装に進む</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
};

export default SanityTest;
