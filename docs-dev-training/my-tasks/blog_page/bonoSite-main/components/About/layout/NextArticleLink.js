import Link from 'next/link';
import ListStance from '../ui/stance/listStance';

function NextArticleLink({ currentArticle, allArticles }) {
  // 次の記事を見つける関数
  function findNextArticle(currentArticle, allArticles) {
    console.log('現在の記事:', currentArticle);

    if (!currentArticle || !currentArticle.series) {
      console.log('現在の記事またはシリーズが無効です。');
      return null;
    }

    const currentOrder = currentArticle.seriesorder;
    const currentSeriesSlug = currentArticle.series.slug;
    console.log('現在のシリーズ順序:', currentOrder, '現在のシリーズスラッグ:', currentSeriesSlug);

    // 現在の記事のseries.slugが同一の記事一覧を取得
    const articlesInSameSeries = allArticles.filter(article => 
      article.series && article.series.slug === currentSeriesSlug);
    console.log('同一シリーズの記事一覧:', articlesInSameSeries);

    // 取得した記事一覧の中で、現在の記事のseriesorderの次に大きい値を持つ記事を探す
    const nextArticle = articlesInSameSeries
      .filter(article => article.seriesorder > currentOrder)
      .sort((a, b) => a.seriesorder - b.seriesorder)[0]; // seriesOrderが小さい順にソートして最初の要素を取得
    console.log('次の記事:', nextArticle);

    return nextArticle;
  }

  const nextArticle = findNextArticle(currentArticle, allArticles);

  if (!nextArticle) {
    console.log('次の記事はありません。');
    return null;
  }

  return (
    <div className="next-article-link py-8">
      <h2 className='text-base'>次のスタンス👉</h2>
      <ListStance
        className="m-auto w-full text-center text-lg"
        title={nextArticle.title} 
        description={nextArticle.explain} 
        url={`/about/${nextArticle.slug}`}
      />
    </div>
  );
}

export default NextArticleLink;