import React from 'react';
import { Bell, ChevronRight, Sparkles, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const location = useLocation();

  const getBreadcrumbs = () => {
    if (location.pathname === '/complaints/new') {
      return ['QMS', 'Complaints', 'New Complaint'];
    }
    if (location.pathname === '/complaints') {
      return ['QMS', 'Complaints', 'All Complaints'];
    }
    if (location.pathname === '/') {
      return ['QMS', 'Dashboard'];
    }
    const clean = location.pathname.split('/').filter(Boolean);
    return ['QMS', ...clean.map((c) => c.charAt(0).toUpperCase() + c.slice(1))];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-30 shadow-2xs">
      <div>
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-medium">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb}>
              <span className={idx === breadcrumbs.length - 1 ? 'text-slate-900 font-semibold' : ''}>
                {crumb}
              </span>
              {idx < breadcrumbs.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Page Title & Subtitle */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
            Log Customer Complaint
          </h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles className="w-3 h-3 text-blue-600" />
            AI-Assisted Intake
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          API & FDF Quality Assurance Module • Capture and assess a pharmaceutical customer complaint.
        </p>
      </div>

      {/* Header Right Actions */}
      <div className="flex items-center gap-3 self-end md:self-auto">
        {/* Triage Badge */}
        <div className="px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-md flex items-center gap-1.5 text-amber-900 font-semibold text-xs shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Pending Triage
        </div>

        {/* Notification Icon */}
        <button
          type="button"
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold ring-2 ring-slate-100">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
};
