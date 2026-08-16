import { CheckCircle2, LoaderCircle } from "lucide-react";

import type { ExtractionStatus, ExtractedComplaintData } from "@/types/ai";

interface AIExtractionSummaryProps {
  extractionStatus: ExtractionStatus;
  extractedData?: ExtractedComplaintData;
}

export function AIExtractionSummary({
  extractionStatus,
  extractedData = {},
}: AIExtractionSummaryProps) {
  if (extractionStatus === "idle") {
    return null;
  }

  if (extractionStatus === "uploading" || extractionStatus === "analyzing") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-[12px] text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        AI is analyzing the complaint information...
      </div>
    );
  }

  if (extractionStatus === "error") {
    return (
      <div className="rounded-md border border-destructive/30 bg-critical-soft px-3 py-2 text-[12px] text-destructive">
        AI extraction could not be completed.
      </div>
    );
  }

  if (
    extractionStatus !== "complete" &&
    extractionStatus !== "completed"
  ) {
    return null;
  }

  const fields = Object.entries(extractedData).filter(
    ([, value]) => value !== undefined && value !== null && String(value).trim() !== "",
  );

  return (
    <section className="rounded-md border border-success/30 bg-success-soft p-3">
      <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-success">
        <CheckCircle2 className="size-4" aria-hidden="true" />
        AI extraction complete
      </div>

      {fields.length > 0 && (
        <div className="grid gap-1.5 sm:grid-cols-2">
          {fields.map(([field, value]) => (
            <div key={field} className="text-[11.5px]">
              <span className="font-medium">{field.replaceAll("_", " ")}: </span>
              <span className="text-muted-foreground">{String(value)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
