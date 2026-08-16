import React from 'react';
import { AlertTriangle, AlertCircle, Info, Sparkles, CheckCircle, RefreshCw } from 'lucide-react';
import type { FieldSourceBadge } from '../../store/slices/complaintSlice';

interface StatusBadgeProps {
  type: 'severity' | 'priority' | 'ai-source' | 'triage';
  value: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value }) => {
  if (!value) return null;

  if (type === 'ai-source') {
    const badge = value as FieldSourceBadge;
    if (badge === 'Awaiting AI extraction...') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 italic bg-slate-100 px-2 py-0.5 rounded-full">
          <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
          Awaiting AI extraction...
        </span>
      );
    }
    if (badge === 'AI Extracted') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
          <Sparkles className="w-3 h-3 text-blue-600" />
          AI Extracted
        </span>
      );
    }
    if (badge === 'AI Updated') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
          <Sparkles className="w-3 h-3 text-amber-600" />
          AI Updated
        </span>
      );
    }
    if (badge === 'User Modified') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
          <CheckCircle className="w-3 h-3 text-slate-500" />
          User Edited
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
        <Sparkles className="w-3 h-3 text-indigo-600" />
        AI Generated
      </span>
    );
  }

  if (type === 'severity') {
    if (value === 'Critical') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          Critical
        </span>
      );
    }
    if (value === 'Major') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
          Major
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
        <Info className="w-3.5 h-3.5 text-slate-500" />
        Minor
      </span>
    );
  }

  if (type === 'priority') {
    if (value === 'Urgent') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          Urgent
        </span>
      );
    }
    if (value === 'High') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          High
        </span>
      );
    }
    if (value === 'Medium') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
        Low
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
      {value}
    </span>
  );
};
