import { createRoot } from 'react-dom/client';
import { CustomVimeoPlayer } from '../../src/components/video/CustomVimeoPlayer';
import '../../src/app/globals.css';

const vimeoId = new URLSearchParams(window.location.search).get('video') || '1188492779';

createRoot(document.getElementById('root')!).render(
  <main className="min-h-screen bg-neutral-950 p-4 text-white sm:p-8">
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-3 text-xl font-bold">動画プレイヤー操作確認</h1>
      <p className="mb-4 text-sm text-white/70">
        記事と同じプレイヤー部品を、チャプター付きの公開テスト動画で表示しています。
      </p>
      <CustomVimeoPlayer vimeoId={vimeoId} />
      <p className="mt-4 text-sm text-white/70">
        一覧アイコンをタップ → チャプターを選んでください。区切られた再生バーもタップ・ドラッグできます。
      </p>
    </div>
  </main>,
);
