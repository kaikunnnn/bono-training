import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CustomVimeoPlayer } from './CustomVimeoPlayer';

// useVimeoPlayer が返す state をテストから動かす（timeupdate の代わり）
const mock = vi.hoisted(() => ({
  state: { isPlaying: false, currentTime: 0, duration: 100 },
  onEnded: undefined as (() => void) | undefined,
}));

vi.mock('./hooks/useVimeoPlayer', () => ({
  useVimeoPlayer: (_id: string, options: { onEnded?: () => void }) => {
    mock.onEnded = options.onEnded;
    return {
      containerRef: { current: null },
      state: {
        ...mock.state,
        pendingSeekTime: null,
        volume: 1,
        muted: false,
        playbackRate: 1,
        isLoading: false,
        isReady: true,
        textTracks: [],
        activeTextTrack: null,
        chapters: [],
        currentChapter: null,
      },
      togglePlay: vi.fn(),
      seek: vi.fn(),
      setVolume: vi.fn(),
      setPlaybackRate: vi.fn(),
      enableTextTrack: vi.fn(),
      disableTextTrack: vi.fn(),
    };
  },
}));

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    disconnect() {}
  });
  mock.state = { isPlaying: false, currentTime: 0, duration: 100 };
  mock.onEnded = undefined;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function setup() {
  const onPlay = vi.fn();
  const onProgress = vi.fn();
  const onComplete = vi.fn();
  const view = render(
    <CustomVimeoPlayer vimeoId="123" onPlay={onPlay} onProgress={onProgress} onComplete={onComplete} />,
  );
  const at = (next: Partial<typeof mock.state>) => {
    mock.state = { ...mock.state, ...next };
    view.rerender(
      <CustomVimeoPlayer vimeoId="123" onPlay={onPlay} onProgress={onProgress} onComplete={onComplete} />,
    );
  };
  return { onPlay, onProgress, onComplete, at };
}

describe('動画の再生・進捗・完了コールバック（#262）', () => {
  it('再生は最初の1回だけ、進捗は25/50/75%で各1回、完了は90%で1回', () => {
    const { onPlay, onProgress, onComplete, at } = setup();
    expect(onPlay).not.toHaveBeenCalled();

    at({ isPlaying: true, currentTime: 1 });
    expect(onPlay).toHaveBeenCalledOnce();

    // 一時停止 → 再開しても再生は増えない
    at({ isPlaying: false });
    at({ isPlaying: true });
    expect(onPlay).toHaveBeenCalledOnce();

    for (const time of [10, 20, 26, 30, 40, 51, 60, 76, 85]) at({ currentTime: time });
    expect(onProgress.mock.calls.map((c) => c[0])).toEqual([25, 50, 75]);
    expect(onComplete).not.toHaveBeenCalled();

    at({ currentTime: 90 });
    expect(onComplete).toHaveBeenCalledOnce();

    // シークで戻って見直しても重複しない
    for (const time of [5, 30, 55, 80, 95, 100]) at({ currentTime: time });
    expect(onProgress).toHaveBeenCalledTimes(3);
    expect(onComplete).toHaveBeenCalledOnce();

    // ended が後から来ても完了は1回のまま
    mock.onEnded?.();
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('90%に届く前に ended が来たら完了を1回送る', () => {
    const { onComplete, at } = setup();
    at({ isPlaying: true, currentTime: 50 });
    mock.onEnded?.();
    mock.onEnded?.();
    expect(onComplete).toHaveBeenCalledOnce();
    at({ currentTime: 99 });
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('同じ位置での再描画では何も呼ばない', () => {
    const { onProgress, onComplete, at } = setup();
    at({ isPlaying: true, currentTime: 30 });
    expect(onProgress).toHaveBeenCalledOnce();
    at({ currentTime: 30 });
    at({ currentTime: 31 });
    expect(onProgress).toHaveBeenCalledOnce();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
