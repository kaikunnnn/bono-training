/**
 * 動画の視聴進み具合の判定（#262）。純粋なロジックだけを置く（React・通信に依存しない）。
 *
 * - play: そのプレーヤーで最初の再生だけ true
 * - update: 再生位置から 25/50/75% の到達（各1回）と 90% 以上の完了（1回）を返す
 * - end: Vimeo の ended イベント。まだ完了していなければ完了として true
 *
 * timeupdate は毎秒数回呼ばれるので、閾値を越えた瞬間以外は空の結果を返すだけにする
 * （呼び出し側は結果が空なら何もしない＝通信・state 更新を増やさない）。
 */

/** 進捗として記録する到達点（%） */
export const VIDEO_PROGRESS_MILESTONES = [25, 50, 75] as const;

/** これ以上見たら「完了」とみなす割合（%） */
export const VIDEO_COMPLETE_PERCENT = 90;

export interface VideoProgressUpdate {
  /** 今回はじめて到達した到達点（小さい順） */
  milestones: number[];
  /** 今回はじめて完了に達したか */
  completed: boolean;
}

export interface VideoProgressTracker {
  play(): boolean;
  update(currentTime: number, duration: number): VideoProgressUpdate;
  end(): boolean;
}

const NOTHING: VideoProgressUpdate = Object.freeze({
  milestones: [],
  completed: false,
}) as VideoProgressUpdate;

export function createVideoProgressTracker(): VideoProgressTracker {
  let played = false;
  let completed = false;
  const reached = new Set<number>();

  return {
    play() {
      if (played) return false;
      played = true;
      return true;
    },

    update(currentTime, duration) {
      // 再生前（読み込み直後の位置など）は数えない
      if (
        !played ||
        (completed && reached.size === VIDEO_PROGRESS_MILESTONES.length)
      ) {
        return NOTHING;
      }
      if (
        !Number.isFinite(currentTime) ||
        !Number.isFinite(duration) ||
        duration <= 0 ||
        currentTime <= 0
      ) {
        return NOTHING;
      }
      const percent = (currentTime / duration) * 100;
      let milestones: number[] | null = null;
      for (const milestone of VIDEO_PROGRESS_MILESTONES) {
        if (percent >= milestone && !reached.has(milestone)) {
          reached.add(milestone);
          (milestones ??= []).push(milestone);
        }
      }
      let justCompleted = false;
      if (!completed && percent >= VIDEO_COMPLETE_PERCENT) {
        completed = true;
        justCompleted = true;
      }
      if (!milestones && !justCompleted) return NOTHING;
      return { milestones: milestones ?? [], completed: justCompleted };
    },

    end() {
      if (completed) return false;
      completed = true;
      return true;
    },
  };
}
