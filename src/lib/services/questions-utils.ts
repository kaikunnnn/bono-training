import type { ReactionKey } from "./questions";

const EMPTY_REACTIONS: Record<ReactionKey, number> = {
  cheer: 0,
  thanks: 0,
  insight: 0,
};

export function emptyReactionCounts(): Record<ReactionKey, number> {
  return { ...EMPTY_REACTIONS };
}
