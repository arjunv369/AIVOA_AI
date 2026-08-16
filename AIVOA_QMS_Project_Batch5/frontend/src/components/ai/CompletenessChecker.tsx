import { CheckCircle2, AlertCircle } from "lucide-react";

import { Progress } from "@/components/ui/progress";

interface CompletenessCheckerProps {
  score: number;
  missing?: string[];
  missingFields?: string[];
  onReviewMissing?: () => void;
}

export function CompletenessChecker({
  score,
  missing = [],
  missingFields = [],
  onReviewMissing,
}: CompletenessCheckerProps) {
  const fields = missing.length > 0 ? missing : missingFields;

  return (
    <section className="panel space-y-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-semibold">Completeness</h2>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            Required complaint information currently available.
          </p>
        </div>
        <span className="text-[18px] font-semibold">{score}%</span>
      </div>

      <Progress value={score} />

      {fields.length === 0 ? (
        <div className="flex items-center gap-2 text-[12px] text-success">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          All tracked fields are complete.
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[12px] text-warning-foreground">
            <AlertCircle className="size-4" aria-hidden="true" />
            {fields.length} field{fields.length === 1 ? "" : "s"} still missing.
          </div>

          <ul className="space-y-1 text-[11.5px] text-muted-foreground">
            {fields.map((field) => (
              <li key={field}>• {field}</li>
            ))}
          </ul>

          {onReviewMissing && (
            <button
              type="button"
              onClick={onReviewMissing}
              className="text-[11.5px] font-semibold text-primary hover:underline"
            >
              Review missing fields
            </button>
          )}
        </div>
      )}
    </section>
  );
}
