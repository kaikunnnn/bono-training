import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function TrainingDetailLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
