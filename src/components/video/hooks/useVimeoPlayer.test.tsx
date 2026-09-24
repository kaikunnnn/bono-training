import { useEffect } from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useVimeoPlayer } from './useVimeoPlayer';

const mock = vi.hoisted(() => ({
  setCurrentTime: vi.fn(),
  handlers: new Map<string, (data: { seconds: number }) => void>(),
}));

vi.mock('@vimeo/player', () => ({
  default: class MockPlayer {
    on(name: string, handler: (data: { seconds: number }) => void) {
      mock.handlers.set(name, handler);
    }
    ready() { return Promise.resolve(); }
    getDuration() { return Promise.resolve(100); }
    getVolume() { return Promise.resolve(1); }
    getTextTracks() { return Promise.resolve([]); }
    getChapters() { return Promise.resolve([]); }
    getMuted() { return Promise.resolve(false); }
    getCurrentTime() { return Promise.resolve(10); }
    setCurrentTime = mock.setCurrentTime;
    destroy() { return Promise.resolve(); }
  },
}));

function PlayerHarness({ onUpdate }: { onUpdate: (player: ReturnType<typeof useVimeoPlayer>) => void }) {
  const player = useVimeoPlayer('19231868');
  const { containerRef } = player;
  useEffect(() => { onUpdate(player); }, [player, onUpdate]);
  return <div ref={containerRef} />;
}

beforeEach(() => {
  mock.handlers.clear();
  mock.setCurrentTime.mockReset();
});

describe('Vimeo seek feedback', () => {
  it('keeps the requested position visible until Vimeo confirms the seek', async () => {
    let player!: ReturnType<typeof useVimeoPlayer>;
    let resolveSeek!: (time: number) => void;
    mock.setCurrentTime.mockReturnValue(new Promise<number>((resolve) => {
      resolveSeek = resolve;
    }));
    render(<PlayerHarness onUpdate={(value) => { player = value; }} />);
    await waitFor(() => expect(player.state.isReady).toBe(true));

    act(() => { void player.seek(70); });
    expect(player.state.pendingSeekTime).toBe(70);
    expect(player.state.currentTime).toBe(10);

    act(() => { mock.handlers.get('timeupdate')?.({ seconds: 11 }); });
    expect(player.state.currentTime).toBe(11);
    expect(player.state.pendingSeekTime).toBe(70);

    await act(async () => { resolveSeek(69.5); });
    expect(player.state.pendingSeekTime).toBeNull();
    expect(player.state.currentTime).toBe(69.5);
  });
});
