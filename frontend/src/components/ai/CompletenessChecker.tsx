import React from 'react';
import { ListChecks, AlertCircle, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setHighlightedField } from '../../store/slices/complaintSlice';

export const CompletenessChecker: React.FC = () => {
  const dispatch = useAppDispatch();
  const { completeness } = useAppSelector((state) => state.ai);

  const handleReviewMissing = () => {
    dispatch(setHighlightedField('manufacturing_date'));
    setTimeout(() => dispatch(setHighlightedField('quantity_affected')), 800);
    setTimeout(() => dispatch(setHighlightedField(null)), 2000);
  };

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Complaint Completeness
          </h3>
        </div>
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
          {completeness.percentage}% Complete
        </span>
      </div>

      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${completeness.percentage}%` }}
        />
      </div>

      {completeness.missingFields.length > 0 && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Missing Information:</span>
          </div>
          <ul className="list-disc list-inside text-[11px] text-amber-800 font-medium pl-1">
            {completeness.missingFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={handleReviewMissing}
        className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
      >
        <span>Review Missing Information</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
      </button>
    </div>
  );
};
