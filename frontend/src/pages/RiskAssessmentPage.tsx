import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ShieldAlert } from 'lucide-react';

export const RiskAssessmentPage: React.FC = () => {
  return (
    <PageContainer>
      <div className="space-y-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Quality Risk Assessment Matrix
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            ICH Q9 Quality Risk Management framework for pharmaceutical complaint evaluation
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>Risk Evaluation Parameters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <span className="font-bold text-rose-900 text-sm">Critical Risk</span>
              <p className="text-[11px] text-rose-700">
                Potential adverse patient reaction or severe batch quality contamination. Immediate quarantine & recall.
              </p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="font-bold text-amber-900 text-sm">Major Risk</span>
              <p className="text-[11px] text-amber-700">
                Tablet damage, discoloration, or API specification deviation. QA batch hold & retention testing.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 text-sm">Minor Risk</span>
              <p className="text-[11px] text-slate-600">
                Outer carton cosmetic defect or shipping box scuffing without product integrity degradation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
