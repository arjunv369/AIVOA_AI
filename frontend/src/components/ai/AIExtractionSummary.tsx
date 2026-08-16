import React from 'react';
import { ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setHighlightedField } from '../../store/slices/complaintSlice';

export const AIExtractionSummary: React.FC = () => {
  const dispatch = useAppDispatch();
  const { extractionStatus } = useAppSelector((state) => state.ai);
  const { formData } = useAppSelector((state) => state.complaint);

  if (extractionStatus !== 'completed') return null;

  const handleReview = () => {
    dispatch(setHighlightedField('customer_name'));
    setTimeout(() => dispatch(setHighlightedField('batch_number')), 600);
    setTimeout(() => dispatch(setHighlightedField('description')), 1200);
    setTimeout(() => dispatch(setHighlightedField(null)), 2000);
  };

  return (
    <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>AI Extraction Complete</span>
        </div>
        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
          100% Confidence
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-emerald-100">
        <div>
          <span className="text-[11px] text-slate-500 block">Customer:</span>
          <span className="font-semibold text-slate-900 truncate block">
            {formData.customer_name || 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">Product:</span>
          <span className="font-semibold text-slate-900 truncate block">
            {formData.product_name || 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">Strength:</span>
          <span className="font-semibold text-slate-900 truncate block">
            {formData.product_strength || 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">Batch:</span>
          <span className="font-mono font-semibold text-slate-900 truncate block">
            {formData.batch_number || 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">Complaint Type:</span>
          <span className="font-semibold text-slate-900 truncate block">
            {formData.complaint_type || 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">Severity / Priority:</span>
          <span className="font-bold text-amber-700 truncate block">
            {formData.initial_severity || 'Major'} / {formData.priority || 'High'}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleReview}
        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
      >
        <ArrowLeftRight className="w-3.5 h-3.5" />
        Review Extracted Data
      </button>
    </div>
  );
};
