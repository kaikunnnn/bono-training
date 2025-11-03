import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { client, urlFor } from "@/lib/sanity";
import Layout from "@/components/layout/Layout";

interface Lesson {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  coverImage?: any;
  category?: string;
  isPremium: boolean;
}

export default function Lessons() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = `*[_type == "lesson"] {
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

  const handleLessonClick = (slug: string) => {
    navigate(`/lessons/${slug}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">レッスン一覧</h1>
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">レッスン一覧</h1>
          <p className="text-red-600">エラー: {error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">レッスン一覧</h1>

        {lessons.length === 0 ? (
          <p>レッスンがありません。Sanity Studioでデータを追加してください。</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <div
                key={lesson._id}
                onClick={() => handleLessonClick(lesson.slug.current)}
                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer"
              >
                {lesson.coverImage && (
                  <img
                    src={urlFor(lesson.coverImage).width(400).height(300).url()}
                    alt={lesson.title}
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                )}
                {lesson.category && (
                  <p className="text-sm text-gray-600 mb-2">{lesson.category}</p>
                )}
                <h2 className="text-xl font-bold mb-2">
                  {lesson.title}
                  {lesson.isPremium && <span className="ml-2">🔒</span>}
                </h2>
                {lesson.description && (
                  <p className="text-gray-700">{lesson.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
