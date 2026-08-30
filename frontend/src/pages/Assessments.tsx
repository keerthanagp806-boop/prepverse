import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  ShieldAlert,
  Award,
  AlertCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ChevronRight
} from 'lucide-react';

export const Assessments: React.FC = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['All', 'DSA', 'Core CS', 'Aptitude', 'Programming', 'Technical Interview', 'Mock Placement'];

  useEffect(() => {
    fetchAssessments();
  }, [categoryFilter, search]);

  const fetchAssessments = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (search) params.search = search;

      const [asmRes, histRes] = await Promise.all([
        api.get('/assessments', { params }),
        api.get('/assessments/history/me')
      ]);

      setAssessments(asmRes.data.assessments || []);
      setHistory(histRes.data.attempts || []);
    } catch (err) {
      console.error('Error fetching assessments', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <CheckSquare className="w-7 h-7 text-indigo-400" />
            <span>Assessment & Placement Test Engine</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Server-timed evaluations with question-level timers, auto-save, and tab-switch integrity monitoring.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'available'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Available Tests ({assessments.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Past Attempts ({history.length})
          </button>
        </div>
      </div>

      {activeTab === 'available' ? (
        <div className="space-y-6">
          {/* Search & Filter */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search assessments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    categoryFilter === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Assessment Cards Grid */}
          {isLoading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-400">Loading tests...</p>
            </div>
          ) : assessments.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 p-8">
              <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300">No assessments found</h3>
              <p className="text-xs text-slate-500 mt-1">Try another category or search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assessments.map((asm) => (
                <div
                  key={asm.id}
                  className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {asm.category}
                      </span>
                      <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {asm.difficulty}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {asm.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {asm.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>
                          {asm.timerMode === 'QUESTION' ? `${asm.questionTimerSeconds}s / Question` : `${asm.durationMinutes} mins total`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pass: {asm.passingScorePercentage}%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{asm.totalQuestions} Questions</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        <span>Max {asm.tabSwitchLimit} Tab Switches</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/assessments/${asm.id}/instructions`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all group-hover:scale-102"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>View Instructions & Start</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* History Tab */
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl">
          <h2 className="text-base font-bold text-white mb-4">Past Assessment Attempts</h2>
          {history.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">You haven't completed any assessments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800 bg-slate-950/50">
                  <tr>
                    <th className="py-3 px-4">Assessment Title</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Integrity Violations</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {history.map((atm) => (
                    <tr key={atm.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{atm.assessmentTitle}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(atm.startTime).toLocaleDateString()} {new Date(atm.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">
                        {atm.score}/{atm.totalPossibleScore} ({atm.percentage}%)
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          atm.status === 'TERMINATED_VIOLATION'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : atm.passed
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {atm.status === 'TERMINATED_VIOLATION' ? 'TERMINATED' : atm.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {atm.tabSwitchCount > 0 ? (
                          <span className="text-amber-400 flex items-center gap-1 font-semibold text-[11px]">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            {atm.tabSwitchCount} tab switch(es)
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-[11px]">0 (Clean)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/assessments/attempts/${atm.id}/result`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <span>Review Answers</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
