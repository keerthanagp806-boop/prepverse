import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Terminal,
  Building2,
  TrendingUp,
  Settings as SettingsIcon,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const studentNavItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, badge: 'Ready' },
    { to: '/courses', label: 'My Courses', icon: BookOpen },
    { to: '/assessments', label: 'Assessments', icon: CheckSquare, badge: 'Timed' },
    { to: '/compiler', label: 'Online Compiler', icon: Terminal, badge: 'Sandbox' },
    { to: '/companies', label: 'Companies', icon: Building2 },
    { to: '/progress', label: 'My Progress', icon: TrendingUp },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] hidden md:flex">
      <div className="p-4 space-y-6">
        {/* Student Navigation Section */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
            <span>Student Journey</span>
            <span className="text-[9px] text-indigo-400 font-mono">6 Pillars</span>
          </div>
          <nav className="space-y-1">
            {studentNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Instructor / Admin Sections */}
        {(user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN') && (
          <div className="pt-3 border-t border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>Instructor Suite</span>
            </div>
            <nav className="space-y-1">
              <NavLink
                to="/instructor"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  <span>Course & Test Studio</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </NavLink>
            </nav>
          </div>
        )}

        {user?.role === 'ADMIN' && (
          <div className="pt-3 border-t border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Admin Governance</span>
            </div>
            <nav className="space-y-1">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Platform Control</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </NavLink>
              <NavLink
                to="/admin/courses"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-rose-400" />
                  <span>Course Management</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* Placement Readiness Banner at bottom of sidebar */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-900/40">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Placement Benchmark</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Tier-1 hiring criteria active. Complete mock tests to raise readiness.
        </p>
        <NavLink
          to="/"
          className="mt-2.5 block text-center text-[11px] font-bold py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md shadow-indigo-600/20"
        >
          View Readiness Hub
        </NavLink>
      </div>
    </aside>
  );
};
