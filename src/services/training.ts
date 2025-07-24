
// 各機能を re-export するメインファイル
export { getTrainings } from './training/training-list';
export { getTrainingDetail } from './training/training-detail';
export { getTrainingDetailV2 } from './training/training-detail-v2'; // 🆕 新システム
export { getTrainingTaskDetail } from './training/task-detail';
export { getUserTaskProgress, updateTaskProgress } from './training/progress';
