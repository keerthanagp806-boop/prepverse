import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Bell, 
  UserCheck, 
  ShieldAlert, 
  GraduationCap, 
  Briefcase, 
  ChevronDown, 
  LogOut, 
  Settings,
  Code2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, demoLogin, logout } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'DSA Benchmark Available', time: '10m ago', unread: true },
    { id: 2, title: 'Google placement drive eligibility updated', time: '1h ago', unread: true },
    { id: 3, title: 'Lesson 2 in Core CS marked completed', time: '1d ago', unread: false },
  ];

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between">
      {/* Brand & Platform Identity */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-lg text-slate-100 flex items-center gap-1.5 tracking-tight">
              PrepVerse <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Pro</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none">Learning & Placement Portal</p>
          </div>
        </Link>
      </div>

      {/* Role Switcher Demo Bar & Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Role Switcher (Crucial for Reviewing Student, Instructor, Admin) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-200 transition-colors"
            title="Switch roles to test Student, Instructor, and Admin views"
          >
            <span className="text-slate-400">Role:</span>
            <span className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
              user?.role === 'ADMIN' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
              user?.role === 'INSTRUCTOR' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {user?.role || 'STUDENT'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">Switch Persona</div>
              <button
                onClick={() => { demoLogin('STUDENT'); setShowRoleDropdown(false); }}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                  user?.role === 'STUDENT' ? 'bg-indigo-600/20 text-indigo-300 font-medium' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-semibold">Student View</div>
                  <div className="text-[10px] text-slate-400">Aditya Sharma (Placement Prep)</div>
                </div>
              </button>
              <button
                onClick={() => { demoLogin('INSTRUCTOR'); setShowRoleDropdown(false); }}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                  user?.role === 'INSTRUCTOR' ? 'bg-indigo-600/20 text-indigo-300 font-medium' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Briefcase className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-semibold">Instructor View</div>
                  <div className="text-[10px] text-slate-400">Dr. Priya Varma (Course & Tests)</div>
                </div>
              </button>
              <button
                onClick={() => { demoLogin('ADMIN'); setShowRoleDropdown(false); }}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                  user?.role === 'ADMIN' ? 'bg-indigo-600/20 text-indigo-300 font-medium' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <div>
                  <div className="font-semibold">Administrator View</div>
                  <div className="text-[10px] text-slate-400">System Admin (Audit & Governance)</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-750 flex items-center justify-center text-slate-300 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-slate-900 animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="text-xs font-bold text-slate-200">Notifications</span>
                <span className="text-[10px] text-indigo-400 cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="space-y-1.5">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-2 rounded-lg text-xs transition-colors ${n.unread ? 'bg-indigo-950/40 border border-indigo-800/30' : 'bg-slate-850'}`}>
                    <div className="font-medium text-slate-200">{n.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition-colors"
          >
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&size=64`}
              alt={user?.name}
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/50"
            />
            <span className="text-xs font-semibold text-slate-200 hidden md:inline-block max-w-[120px] truncate">
              {user?.name || 'Aditya'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <div className="text-xs font-bold text-slate-100">{user?.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
              </div>
              <Link
                to="/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                Profile & Settings
              </Link>
              <button
                onClick={() => { logout(); setShowUserMenu(false); }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-950/30 transition-colors mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
