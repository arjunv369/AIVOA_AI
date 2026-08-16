import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ClipboardList, AlertTriangle, AlertCircle, CheckCircle, TrendingUp, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const kpis = [
    { label: 'Total Complaints', value: '142', icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Open Complaints', value: '18', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'High Priority', value: '7', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Resolved (YTD)', value: '124', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Quality Assurance Management Dashboard
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              High-level overview of active customer quality complaints and QA metrics
            </p>
          </div>
          <Link
            to="/complaints/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs self-start sm:self-auto"
          >
            + Log New Complaint
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-500 block mb-1">
                    {kpi.label}
                  </span>
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">
                    {kpi.value}
                  </span>
                </div>
                <div className={`w-11 h-11 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts & Distribution Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Complaint Trend (Monthly)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">2026 Q3 Data</span>
            </div>

            <div className="h-44 bg-slate-50 rounded-lg border border-slate-200 p-4 flex items-end justify-between gap-2 text-xs text-slate-500 font-mono">
              <div className="w-full flex flex-col items-center gap-2">
                <div className="w-full bg-blue-400 h-16 rounded-t-md" />
                <span>APR</span>
              </div>
              <div className="w-full flex flex-col items-center gap-2">
                <div className="w-full bg-blue-500 h-24 rounded-t-md" />
                <span>MAY</span>
              </div>
              <div className="w-full flex flex-col items-center gap-2">
                <div className="w-full bg-blue-600 h-32 rounded-t-md" />
                <span>JUN</span>
              </div>
              <div className="w-full flex flex-col items-center gap-2">
                <div className="w-full bg-blue-700 h-28 rounded-t-md" />
                <span>JUL</span>
              </div>
              <div className="w-full flex flex-col items-center gap-2">
                <div className="w-full bg-blue-800 h-36 rounded-t-md" />
                <span>AUG</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BarChart className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Complaint Type Distribution
              </h3>
            </div>

            <div className="space-y-3 text-xs font-medium">
              <div>
                <div className="flex justify-between mb-1 text-slate-700">
                  <span>Product Quality</span>
                  <span className="font-bold">45%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-[45%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-slate-700">
                  <span>Stability Issue</span>
                  <span className="font-bold">25%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[25%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-slate-700">
                  <span>Packaging Defect</span>
                  <span className="font-bold">18%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[18%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-slate-700">
                  <span>Other / Labeling</span>
                  <span className="font-bold">12%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[12%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
