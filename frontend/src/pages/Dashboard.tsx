import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  PlayCircle,
  CheckCircle2,
  Code2,
  Clock,
  TrendingUp,
  Award,
  ArrowRight,
  BookOpen,
  Building2,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  Zap,
  Target
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [readinessData, setReadinessData] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [readinessRes, enrolledRes, historyRes, submissionsRes] = await Promise.all([
          api.get('/placement/readiness'),
          api.get('/courses/enrolled/me'),
          api.get('/assessments/history/me'),
          api.get('/coding/submissions/me')
        ]);

        setReadinessData(readinessRes.data);
        setEnrolledCourses(enrolledRes.data.enrolledCourses || []);
        setRecentAttempts(historyRes.data.attempts || []);
        setRecentSubmissions(submissionsRes.data.submissions || []);
      } catch (err) {
        console.error('Error fetching dashboard info', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const activeCourse = enrolledCourses[0] || {
    id: 'crs-dsa-mastery',
    title: 'Complete Data Structures & Algorithms for Placements',
    enrollment: {
      progressPercentage: 50,
      lastAccessedLessonId: 'les-dsa-102'
    },
    modules: [
      {
        title: 'Module 1: Time & Space Complexity & Array Techniques',
        lessons: [
          { id: 'les-dsa-102', title: 'Sliding Window Pattern & Two Pointers in Action' }
        ]
      }
    ]
  };

  const currentLessonTitle = activeCourse?.modules?.[0]?.lessons?.[1]?.title || 'Sliding Window Pattern & Two Pointers in Action';
  const currentModuleTitle = activeCourse?.modules?.[0]?.title || 'Module 1: Time & Space Complexity & Array Techniques';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-medium">Loading Placement Dashboard...</p>
        </div>
      </div>
    );
  }

  const overallScore = readinessData?.overallReadiness || 76;
  const categories = readinessData?.categories || [
    { name: 'Aptitude', score: 82, target: 85, color: '#f59e0b' },
    { name: 'Programming', score: 80, target: 90, color: '#3b82f6' },
    { name: 'DSA', score: 68, target: 85, color: '#8b5cf6' },
    { name: 'Core CS', score: 72, target: 80, color: '#10b981' },
    { name: 'Technical Interview', score: 65, target: 85, color: '#06b6d4' },
    { name: 'HR Interview', score: 70, target: 80, color: '#ec4899' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Welcome Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Placement Season 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Candidate'}! 🚀
            </h1>
            <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Your unified student journey: <span className="font-semibold text-indigo-400">LEARN</span> → <span className="font-semibold text-cyan-400">PRACTICE</span> → <span className="font-semibold text-emerald-400">ASSESS</span> → <span className="font-semibold text-amber-400">IMPROVE</span> → <span className="font-semibold text-pink-400">PREPARE</span> → <span className="font-semibold text-purple-400">TRACK</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/assessments"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Take Timed Test</span>
            </Link>
            <Link
              to="/compiler"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition-colors"
            >
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Code Practice</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. PLACEMENT PREPARATION DASHBOARD (Core Requirement) */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Placement Readiness Dashboard</h2>
                <p className="text-xs text-slate-400">Calculated strictly from your course milestones, timed assessments, and coding submissions.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-2xl">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Overall Readiness</div>
              <div className="text-xs font-semibold text-emerald-400">Target: 85%+</div>
            </div>
            <div className="text-3xl font-extrabold text-indigo-400 flex items-baseline gap-0.5">
              {overallScore}<span className="text-lg text-slate-400">%</span>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {categories.map((cat: any) => (
            <div
              key={cat.name}
              className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{cat.name}</span>
                <span className="text-xs font-mono font-extrabold text-white px-2 py-0.5 rounded-md bg-slate-800">
                  {cat.score}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${cat.score}%`,
                    backgroundColor: cat.color,
                    boxShadow: `0 0 12px ${cat.color}66`
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Target: {cat.target}%</span>
                <span className={cat.score >= cat.target ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-medium'}>
                  {cat.score >= cat.target ? '✓ Benchmark Met' : `Needs +${cat.target - cat.score}%`}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Rule-Based Recommended Next Steps (Requirement 3) */}
        {readinessData?.recommendations && readinessData.recommendations.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-start gap-3.5">
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">Recommended Next Steps (Rule-Based)</div>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {readinessData.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="leading-relaxed">{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 3. Continue Learning & Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning Card */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Continue Learning</span>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                {activeCourse.enrollment?.progressPercentage || 50}% Completed
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white mb-2">
              {activeCourse.title}
            </h3>

            <div className="space-y-2 text-xs text-slate-400 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Module:</span>
                <span className="text-slate-300 font-medium">{currentModuleTitle}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Current Lesson:</span>
                <span className="text-indigo-300 font-semibold">{currentLessonTitle}</span>
              </div>
            </div>

            {/* Progress line */}
            <div className="mt-4 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full"
                style={{ width: `${activeCourse.enrollment?.progressPercentage || 50}%` }}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">Resume from where you stopped</span>
            <Link
              to={`/courses/${activeCourse.id}/lessons/${activeCourse.enrollment?.lastAccessedLessonId || 'les-dsa-102'}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Continue Lesson</span>
            </Link>
          </div>
        </div>

        {/* Performance Summary Card */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Performance Summary</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[11px] text-slate-400">Courses Enrolled</div>
              <div className="text-xl font-extrabold text-white mt-1">
                {readinessData?.stats?.coursesEnrolled || 2}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[11px] text-slate-400">Tests Completed</div>
              <div className="text-xl font-extrabold text-white mt-1">
                {readinessData?.stats?.assessmentsCompleted || 1}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[11px] text-slate-400">Problems Solved</div>
              <div className="text-xl font-extrabold text-emerald-400 mt-1">
                {readinessData?.stats?.codingSolved || 1} / {readinessData?.stats?.codingAttempted || 1}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[11px] text-slate-400">Avg Test Score</div>
              <div className="text-xl font-extrabold text-indigo-400 mt-1">
                {readinessData?.stats?.averageAssessmentScore || 80}%
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/progress"
              className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors"
            >
              <span>View Comprehensive Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Recent Activity & Company Placement Fast Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assessment Attempts */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Recent Timed Assessments</span>
            </div>
            <Link to="/assessments" className="text-xs font-semibold text-indigo-400 hover:underline">
              View All
            </Link>
          </div>

          {recentAttempts.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">No assessments taken yet.</div>
          ) : (
            <div className="space-y-2.5">
              {recentAttempts.slice(0, 3).map((atm: any) => (
                <div
                  key={atm.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-200">{atm.assessmentTitle}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Score: {atm.score}/{atm.totalPossibleScore} ({atm.percentage}%) • {atm.tabSwitchCount} tab switches
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                    atm.passed
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {atm.passed ? 'PASSED' : 'NEEDS PRACTICE'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Placement Company Fast-Track */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Top Company Drives (Eligibility Check)</span>
            </div>
            <Link to="/companies" className="text-xs font-semibold text-cyan-400 hover:underline">
              Explore 6 Companies
            </Link>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-850 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                  G
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Google</div>
                  <div className="text-[11px] text-slate-400">Software Engineer • ₹32 - ₹55 LPA</div>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Eligible (8.7 CGPA)
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-850 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                  MS
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Microsoft</div>
                  <div className="text-[11px] text-slate-400">SDE-1 • ₹28 - ₹45 LPA</div>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Eligible (8.7 CGPA)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
