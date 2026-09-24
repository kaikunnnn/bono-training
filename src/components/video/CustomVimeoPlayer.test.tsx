import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CustomVimeoPlayer } from './CustomVimeoPlayer';

const { togglePlay, seek, chapters } = vi.hoisted(() => ({
  togglePlay: vi.fn(),
  seek: vi.fn(),
  chapters: [] as { index: number; startTime: number; title: string }[],
}));

vi.mock('./hooks/useVimeoPlayer', () => ({
  useVimeoPlayer: () => ({
    containerRef: { current: null },
    state: {
      isPlaying: true,
      currentTime: 10,
      pendingSeekTime: null,
      duration: 100,
      volume: 1,
      muted: false,
      playbackRate: 1,
      isLoading: false,
      isReady: true,
      textTracks: [],
      activeTextTrack: null,
      chapters,
      currentChapter: null,
    },
    togglePlay,
    seek,
    setVolume: vi.fn(),
    setPlaybackRate: vi.fn(),
    enableTextTrack: vi.fn(),
    disableTextTrack: vi.fn(),
  }),
}));

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    disconnect() {}
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  togglePlay.mockClear();
  seek.mockClear();
  chapters.length = 0;
});

describe('mobile video controls', () => {
  it('reveals hidden controls on the first video tap without pausing', () => {
    vi.useFakeTimers();
    const { container } = render(<CustomVimeoPlayer vimeoId="123" />);
    const overlay = container.querySelector<HTMLDivElement>('.absolute.inset-0.cursor-pointer');
    expect(overlay).not.toBeNull();

    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByRole('slider', { name: '再生位置' }).parentElement?.parentElement?.className).toContain('opacity-0');

    fireEvent.click(overlay!);
    expect(togglePlay).not.toHaveBeenCalled();
    expect(screen.getByRole('slider', { name: '再生位置' }).parentElement?.parentElement?.className).toContain('opacity-100');

    fireEvent.click(overlay!);
    expect(togglePlay).toHaveBeenCalledOnce();
  });

  it('keeps a chapter menu tappable after the controls hide timer expires', () => {
    chapters.push(
      { index: 0, startTime: 0, title: 'はじめに' },
      { index: 1, startTime: 40, title: '実践' },
    );
    vi.useFakeTimers();
    const { container } = render(<CustomVimeoPlayer vimeoId="123" />);
    const controls = container.querySelector<HTMLDivElement>('.absolute.bottom-0.left-0.right-0.transition-opacity');

    fireEvent.click(screen.getByRole('button', { name: 'チャプター' }));
    act(() => vi.advanceTimersByTime(3000));

    expect(controls?.className).toContain('opacity-100');
    fireEvent.click(screen.getByRole('button', { name: '実践0:40' }));
    expect(seek).toHaveBeenCalledExactlyOnceWith(40);
  });
});
