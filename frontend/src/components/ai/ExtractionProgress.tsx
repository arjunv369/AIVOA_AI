import React from 'react';
import { Cpu, CheckCircle2 } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';

export const ExtractionProgress: React.FC = () => {
  const { extractionStatus, extractionProgress, extractionStepMessage } = useAppSelector(
    (state) => state.ai
  );

  if (extractionStatus === 'idle') return null;

  return (
    <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
        <div className="flex items-center gap-1.5 text-blue-700 uppercase tracking-wide text-[11px]">
          <Cpu className="w-3.5 h-3.5 animate-spin text-blue-600" />
          <span>EXTRACTION PROGRESS</span>
        </div>
        <span className="font-mono text-blue-800">{extractionProgress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${extractionProgress}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
        <span>{extractionStepMessage}</span>
        {extractionProgress === 100 && (
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Done
          </span>
        )}
      </div>
    </div>
  );
};
