// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const hookSource = readFileSync(
  new URL("./hooks/useVimeoPlayer.ts", import.meta.url),
  "utf8",
);
const playerSource = readFileSync(
  new URL("./CustomVimeoPlayer.tsx", import.meta.url),
  "utf8",
);

describe("Vimeo player performance", () => {
  it("uses Vimeo events instead of polling four APIs every 100ms", () => {
    expect(hookSource).not.toContain("setInterval(");
    expect(hookSource).not.toContain("pollInterval");
    expect(hookSource).toContain("player.on('timeupdate'");
    expect(hookSource).toContain("player.on('volumechange'");
    expect(hookSource).toContain("player.on('texttrackchange'");
  });

  it("loads independent initial player metadata in parallel", () => {
    expect(hookSource).toContain("await Promise.all([");
    expect(hookSource).toContain("player.getDuration()");
    expect(hookSource).toContain("player.getChapters().catch");
    expect(hookSource).not.toContain("player.on('loaded', async");
  });

  it("does not log every playback state render in production", () => {
    expect(playerSource).not.toContain("[CustomVimeoPlayer] State changed:");
  });

  it("keeps controls visible whenever playback is paused", () => {
    expect(playerSource).toContain(
      "const controlsVisible = !state.isPlaying || showControls;",
    );
  });
});
