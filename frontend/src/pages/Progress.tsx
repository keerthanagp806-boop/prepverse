import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  TrendingUp,
  Award,
  BookOpen,
  CheckSquare,
  Code2,
  Cpu,
  Target,
  Zap,
  Star
} from 'lucide-react';

export const Progress: React.FC = () => {
  const [readinessData, setReadinessData] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [readinessRes, coursesRes, attemptsRes, subRes] = await Promise.all([
          api.get('/placement/readiness'),
          api.get('/courses/enrolled/me'),
          api.get('/assessments/history/me'),
          api.get('/coding/submissions/me')
        ]);

        setReadinessData(readinessRes.data);
        setEnrolledCourses(coursesRes.data.enrolledCourses || []);
        setAttempts(attemptsRes.data.attempts || []);
        setSubmissions(subRes.data.submissions || []);
      } catch (err) {
        console.error('Error fetching progress', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-400">Loading progress analytics...</p>
      </div>
    );
  }

  const overallScore = readinessData?.overallReadiness || 76;
  const categories = readinessData?.categories || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <TrendingUp className="w-7 h-7 text-emerald-400" />
          <span>My Learning & Placement Progress</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Detailed metrics across courses, assessment scores, coding problem submissions, and skills matrix.
        </p>
      </div>

      {/* Top 4 Performance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Overall Readiness</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-400">{overallScore}%</div>
          <div className="text-[11px] text-emerald-400">Campus placement benchmark: 75%+</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Course Progress</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{enrolledCourses.length}</div>
          <div className="text-[11px] text-slate-400">Active enrollments</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Assessments</span>
            <CheckSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{attempts.length}</div>
          <div className="text-[11px] text-slate-400">Completed evaluation attempts</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Coding Submissions</span>
            <Code2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{submissions.length}</div>
          <div className="text-[11px] text-slate-400">Total sandbox code runs</div>
        </div>
      </div>

      {/* 6 Placement Pillars Breakdown */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <h2 className="text-base font-bold text-white">Placement Readiness Pillars</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat: any) => (
            <div key={cat.name} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">{cat.name}</span>
                <span className="font-mono font-extrabold text-white">{cat.score}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${cat.score}%`, backgroundColor: cat.color }}
                />
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Target: {cat.target}%</span>
                <span className={cat.score >= cat.target ? 'text-emerald-400' : 'text-amber-400'}>
                  {cat.score >= cat.target ? 'Achieved' : 'In Progress'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Enrollments Detailed Table */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white">Enrolled Courses & Milestones</h2>
        <div className="space-y-3">
          {enrolledCourses.map((c: any) => (
            <div key={c.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-white">{c.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Instructor: {c.instructorName} • {c.category}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${c.enrollment?.progressPercentage || 0}%` }}
                  />
                </div>
                <span className="text-xs font-bold font-mono text-indigo-300 w-12 text-right">
                  {c.enrollment?.progressPercentage || 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
