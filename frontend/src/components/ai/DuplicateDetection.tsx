import React from 'react';
import { Copy, AlertTriangle, ExternalLink } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';

export const DuplicateDetection: React.FC = () => {
  const { duplicateDetection } = useAppSelector((state) => state.ai);

  if (!duplicateDetection) return null;

  return (
    <div className="p-4 bg-white border border-amber-200 rounded-xl space-y-3 shadow-xs">
      <div className="flex items-center justify-between border-b border-amber-100 pb-2">
        <div className="flex items-center gap-2">
          <Copy className="w-4 h-4 text-amber-700" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Possible Duplicate Complaints
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-700" />
          {duplicateDetection.similarityScore}% Match
        </span>
      </div>

      <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-900">{duplicateDetection.complaintId}</span>
          <span className="text-[10px] font-semibold text-amber-800 bg-amber-200/60 px-1.5 py-0.5 rounded">
            {duplicateDetection.status}
          </span>
        </div>

        <p className="text-slate-700 font-medium">
          {duplicateDetection.customerName} • {duplicateDetection.productName}
        </p>

        <p className="text-[10px] text-slate-500">
          Logged on: {duplicateDetection.date}
        </p>
      </div>

      <button
        type="button"
        onClick={() => alert(`Reviewing duplicate complaint record ${duplicateDetection.complaintId}`)}
        className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
      >
        <span>Review Complaint</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
