import React from 'react';
import type { FieldSourceBadge } from '../../store/slices/complaintSlice';
import { StatusBadge } from '../common/StatusBadge';

interface ComplaintFieldProps {
  id: string;
  label: string;
  badge?: FieldSourceBadge;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  highlighted?: boolean;
}

export const ComplaintField: React.FC<ComplaintFieldProps> = ({
  id,
  label,
  badge,
  error,
  required,
  children,
  highlighted,
}) => {
  return (
    <div
      className={`p-3 rounded-lg border transition-all duration-200 ${
        highlighted
          ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-400/30'
          : error
          ? 'bg-rose-50/50 border-rose-300'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <label
          htmlFor={id}
          className="text-xs font-semibold text-slate-800 tracking-wide flex items-center gap-1"
        >
          {label}
          {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
        {badge && <StatusBadge type="ai-source" value={badge} />}
      </div>

      {children}

      {error && (
        <p className="text-[11px] font-medium text-rose-600 mt-1 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
};
