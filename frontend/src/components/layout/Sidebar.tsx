import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Bot,
  FileText,
  ShieldAlert,
  BarChart3,
  ShieldCheck,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleSidebar } from '../../store/slices/uiSlice';

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isSidebarOpen } = useAppSelector((state) => state.ui);
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Complaints', path: '/complaints/new', icon: ClipboardList },
    { label: 'AI Copilot', path: '/ai-copilot', icon: Bot },
    { label: 'Documents', path: '/documents', icon: FileText },
    { label: 'Risk Assessment', path: '/risk-assessment', icon: ShieldAlert },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-slate-900 text-slate-100 border-r border-slate-800 transition-all duration-300 flex flex-col ${
        isSidebarOpen ? 'w-[230px]' : 'w-[68px]'
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
            A
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white tracking-wide leading-none">
                AIVOA QMS
              </span>
              <span className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                Quality Management System
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {isSidebarOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path === '/complaints/new' && location.pathname.startsWith('/complaints'));

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs border-l-4 border-blue-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title={!isSidebarOpen ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {isSidebarOpen && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* System Status Section */}
      {isSidebarOpen && (
        <div className="mx-3 mb-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>System Status</span>
          </div>
          <div className="space-y-1 pl-1">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-soft-pulse" />
              <span>AI Services Online</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>API Connected</span>
            </div>
          </div>
        </div>
      )}

      {/* User Info Section */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-semibold shrink-0">
          <UserCheck className="w-4 h-4" />
        </div>
        {isSidebarOpen && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-semibold text-white truncate">
              AI Product Engineer
            </span>
            <span className="text-[10px] text-slate-400 truncate">
              Quality Assurance Admin
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
