import { PEERS } from "../_data";
import { PeerAvatar } from "./PeerAvatar";

interface ReceivedNoteProps {
  emoji: string;
  label: string;
  fromIds: string[];
}

/** 自分がもらった反応の数（例「今日 3人から おつかれ が届いています」） */
export function ReceivedNote({ emoji, label, fromIds }: ReceivedNoteProps) {
  const from = fromIds
    .map((id) => PEERS.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  return (
    <p className="inline-flex items-center gap-2 rounded-full bg-[var(--reaction-active-bg)] py-1 pl-1 pr-3 text-xs text-text-secondary">
      <span className="flex -space-x-1.5" aria-hidden>
        {from.map((p) => (
          <PeerAvatar
            key={p.id}
            person={p}
            size="xs"
            className="ring-2 ring-surface"
          />
        ))}
      </span>
      <span>
        今日 <b className="font-bold text-text-primary">{from.length}人</b>から{" "}
        <span aria-hidden>{emoji}</span>
        <b className="font-bold text-text-link">{label}</b> が届いています
      </span>
    </p>
  );
}
