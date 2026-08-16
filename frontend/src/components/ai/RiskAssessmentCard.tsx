import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';

export const RiskAssessmentCard: React.FC = () => {
  const { riskAssessment } = useAppSelector((state) => state.ai);

  if (!riskAssessment) return null;

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            AI Copilot Risk Assessment
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
          {riskAssessment.overallRisk} RISK
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[10px] text-slate-500 block font-medium">Severity</span>
          <span className="text-xs font-bold text-slate-900">{riskAssessment.severity}</span>
        </div>
        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[10px] text-slate-500 block font-medium">Priority</span>
          <span className="text-xs font-bold text-amber-700">{riskAssessment.priority}</span>
        </div>
        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[10px] text-slate-500 block font-medium">Confidence</span>
          <span className="text-xs font-bold text-blue-700">{riskAssessment.confidenceScore}%</span>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-900">
          <span className="font-bold block text-[11px]">Potential Impact:</span>
          <p className="mt-0.5 font-medium">{riskAssessment.potentialImpact}</p>
        </div>

        <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-900">
          <span className="font-bold block text-[11px]">Recommended Action:</span>
          <p className="mt-0.5 font-medium">
            Route to QA investigation, review retention samples, and issue immediate batch hold.
          </p>
        </div>
      </div>
    </div>
  );
};
