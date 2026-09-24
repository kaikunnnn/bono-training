import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VideoControls } from './VideoControls';
import type { VimeoPlayerState } from './hooks/useVimeoPlayer';

const state: VimeoPlayerState = {
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
  chapters: [],
  currentChapter: null,
};

function setup(playerState: VimeoPlayerState = state) {
  const onSeek = vi.fn();
  const onSeekStart = vi.fn();
  const onSeekCancel = vi.fn();
  render(
    <VideoControls
      state={playerState}
      onTogglePlay={vi.fn()}
      onSeek={onSeek}
      onSeekStart={onSeekStart}
      onSeekCancel={onSeekCancel}
      onVolumeChange={vi.fn()}
      onPlaybackRateChange={vi.fn()}
      onToggleFullscreen={vi.fn()}
      onEnableTextTrack={vi.fn()}
      onDisableTextTrack={vi.fn()}
    />,
  );
  const slider = screen.getByRole('slider', { name: '再生位置' });
  slider.getBoundingClientRect = () => ({
    x: 0, y: 0, left: 0, top: 0, right: 200, bottom: 32,
    width: 200, height: 32, toJSON: () => ({}),
  });
  slider.setPointerCapture = vi.fn();
  slider.hasPointerCapture = vi.fn(() => true);
  slider.releasePointerCapture = vi.fn();
  return { slider, onSeek, onSeekStart, onSeekCancel };
}

describe('video progress slider', () => {
  it('shows the requested position immediately while Vimeo is seeking', () => {
    const { slider } = setup({ ...state, pendingSeekTime: 70 });
    expect(slider.getAttribute('aria-valuenow')).toBe('70');
    expect(slider.getAttribute('aria-valuetext')).toBe('1:10 / 1:40');
  });

  it('tracks a touch drag and seeks once at the released position', () => {
    const { slider, onSeek, onSeekStart } = setup();

    fireEvent.pointerDown(slider, { pointerId: 1, pointerType: 'touch', isPrimary: true, clientX: 40 });
    expect(onSeekStart).toHaveBeenCalledOnce();
    expect(slider.setPointerCapture).toHaveBeenCalledWith(1);
    fireEvent.pointerMove(slider, { pointerId: 1, pointerType: 'touch', clientX: 140 });
    expect(slider.getAttribute('aria-valuenow')).toBe('70');
    expect(onSeek).not.toHaveBeenCalled();

    fireEvent.pointerUp(slider, { pointerId: 1, pointerType: 'touch', clientX: 160 });
    expect(onSeek).toHaveBeenCalledExactlyOnceWith(80);
    expect(slider.releasePointerCapture).toHaveBeenCalledWith(1);
  });

  it('does not seek when a touch gesture is cancelled', () => {
    const { slider, onSeek, onSeekCancel } = setup();
    fireEvent.pointerDown(slider, { pointerId: 2, pointerType: 'touch', isPrimary: true, clientX: 40 });
    fireEvent.pointerCancel(slider, { pointerId: 2, pointerType: 'touch', clientX: 140 });
    expect(onSeek).not.toHaveBeenCalled();
    expect(onSeekCancel).toHaveBeenCalledOnce();
    expect(slider.getAttribute('aria-valuenow')).toBe('10');
  });

  it('supports keyboard seeking without triggering the global player shortcut', () => {
    const { slider, onSeek } = setup();
    const globalKeyDown = vi.fn();
    window.addEventListener('keydown', globalKeyDown);
    try {
      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      expect(onSeek).toHaveBeenCalledExactlyOnceWith(15);
      expect(globalKeyDown).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener('keydown', globalKeyDown);
    }
  });
});

describe('video chapters', () => {
  const chapters = [
    { index: 0, startTime: 0, title: 'はじめに' },
    { index: 1, startTime: 40, title: '実践' },
    { index: 2, startTime: 75, title: 'まとめ' },
  ];

  it('seeks to the start of a chapter selected from the menu', () => {
    const { onSeek } = setup({ ...state, chapters, currentChapter: chapters[0] });

    fireEvent.click(screen.getByRole('button', { name: 'チャプター' }));
    fireEvent.click(screen.getByRole('button', { name: '実践0:40' }));

    expect(onSeek).toHaveBeenCalledExactlyOnceWith(40);
    expect(screen.queryByRole('button', { name: '実践0:40' })).toBeNull();
  });

  it('seeks to the tapped time within a chapter segment on touch', () => {
    const { slider, onSeek } = setup({ ...state, chapters, currentChapter: chapters[0] });
    const secondSegment = slider.querySelector('.flex.h-full')?.children[1];
    expect(secondSegment).toBeTruthy();

    fireEvent.pointerDown(secondSegment!, { pointerId: 3, pointerType: 'touch', isPrimary: true, clientX: 100 });
    fireEvent.pointerUp(secondSegment!, { pointerId: 3, pointerType: 'touch', clientX: 100 });

    expect(onSeek).toHaveBeenCalledExactlyOnceWith(50);
  });
});
