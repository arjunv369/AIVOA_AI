import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { BarChart3, Download, FileSpreadsheet } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  return (
    <PageContainer>
      <div className="space-y-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Quality Assurance Compliance Reports
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Export regulatory complaint summaries for FDA / GMP audit compliance
            </p>
          </div>
          <button
            type="button"
            onClick={() => alert('Generating Q3 Regulatory Complaint Summary Report PDF...')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Regulatory PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              <div>
                <h3 className="text-xs font-bold text-slate-900">Monthly Complaint Trend Log (CSV)</h3>
                <p className="text-[11px] text-slate-500">Includes customer name, batch numbers, and triage status.</p>
              </div>
            </div>
            <button type="button" onClick={() => alert('Exporting CSV...')} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold">
              Download CSV Report
            </button>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-xs font-bold text-slate-900">Batch Defect Analytics Report</h3>
                <p className="text-[11px] text-slate-500">Breakdown of product quality vs packaging defects by manufacturing site.</p>
              </div>
            </div>
            <button type="button" onClick={() => alert('Exporting Analytics Report...')} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold">
              Generate Analytics Summary
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
