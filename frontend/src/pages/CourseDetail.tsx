import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  PlayCircle,
  FileText,
  Clock,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  User,
  Star,
  ExternalLink,
  Code2,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [openModuleIndex, setOpenModuleIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Enrollment Modal States
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollName, setEnrollName] = useState('');
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollError, setEnrollError] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [courseRes, enrolledRes] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get('/courses/enrolled/me')
        ]);

        setCourse(courseRes.data.course);
        const myEnr = (enrolledRes.data.enrolledCourses || []).find((c: any) => c.id === id);
        if (myEnr) {
          setIsEnrolled(true);
          setEnrollment(myEnr.enrollment);
        }
      } catch (err) {
        console.error('Error fetching course detail', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const openEnrollModal = () => {
    setEnrollName(user?.name || '');
    setEnrollEmail(user?.email || '');
    setEnrollError('');
    setShowEnrollModal(true);
  };

  const handleConfirmEnroll = async () => {
    if (!enrollName.trim()) { setEnrollError('Please enter your full name.'); return; }
    if (!enrollEmail.trim() || !enrollEmail.includes('@')) { setEnrollError('Please enter a valid email address.'); return; }
    setIsEnrolling(true);
    setEnrollError('');
    try {
      const res = await api.post(`/courses/${id}/enroll`, { name: enrollName.trim(), email: enrollEmail.trim() });
      setIsEnrolled(true);
      setEnrollment(res.data.enrollment);
      setShowEnrollModal(false);
    } catch (err: any) {
      setEnrollError(err.response?.data?.error || 'Enrollment failed. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-400">Loading course curriculum...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-slate-400">Course not found.</p>
        <Link to="/courses" className="text-xs text-indigo-400 mt-2 inline-block">Back to Courses</Link>
      </div>
    );
  }

  let totalDurationMinutes = 0;
  course.modules?.forEach((m: any) => {
    m.lessons?.forEach((l: any) => (totalDurationMinutes += l.durationMinutes || 20));
  });

  const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id || 'les-1';
  const continueLessonId = enrollment?.lastAccessedLessonId || firstLessonId;

  return (
    <>
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Course Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {course.category}
              </span>
              <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {course.difficulty}
              </span>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold pl-2">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{course.rating} Rating</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {course.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span>Instructor: <strong className="text-slate-200">{course.instructorName}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Duration: <strong className="text-slate-200">{Math.round(totalDurationMinutes / 60)} Hours ({totalDurationMinutes} mins)</strong></span>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 text-center">
            <div className="space-y-1">
              <div className="text-xs text-slate-400">Status</div>
              <div className="text-lg font-bold text-white">
                {isEnrolled ? (
                  <span className="text-emerald-400 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Enrolled ({enrollment?.progressPercentage || 0}%)
                  </span>
                ) : (
                  'Free Access'
                )}
              </div>
            </div>

            {isEnrolled ? (
              <Link
                to={`/courses/${course.id}/lessons/${continueLessonId}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Continue Learning</span>
              </Link>
            ) : (
              <button
                onClick={openEnrollModal}
                id="enroll-course-btn"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
              >
                Enroll Now — Free
              </button>
            )}

            <p className="text-[11px] text-slate-500">
              Self-paced • Interactive Notes • Quizzes • Certificate Ready
            </p>
          </div>
        </div>
      </div>

      {/* Syllabus / Modules Accordion */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Course Curriculum & Syllabus</h2>
            <p className="text-xs text-slate-400">Structured lessons with downloadable resources and coding exercises.</p>
          </div>
          <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
            {course.modules?.length || 0} Modules
          </span>
        </div>

        <div className="space-y-4">
          {course.modules?.map((module: any, mIdx: number) => {
            const isOpen = openModuleIndex === mIdx;
            return (
              <div
                key={module.id}
                className="rounded-2xl bg-slate-950/60 border border-slate-800 overflow-hidden"
              >
                <button
                  onClick={() => setOpenModuleIndex(isOpen ? -1 : mIdx)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      Module {mIdx + 1}
                    </div>
                    <div className="text-sm font-bold text-white">{module.title}</div>
                    <p className="text-xs text-slate-400">{module.description}</p>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 pt-0 border-t border-slate-800/80 space-y-2 mt-2">
                    {module.lessons?.map((lesson: any, lIdx: number) => {
                      const isCompleted = enrollment?.completedLessonIds?.includes(lesson.id);
                      return (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : lIdx + 1}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-200">{lesson.title}</div>
                              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-cyan-400" />
                                  {lesson.durationMinutes || 20} mins
                                </span>
                                {lesson.resources?.length > 0 && (
                                  <span className="flex items-center gap-1 text-indigo-400">
                                    <FileText className="w-3 h-3" />
                                    {lesson.resources.length} resources
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <Link
                            to={`/courses/${course.id}/lessons/${lesson.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold transition-all"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Start</span>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>

      {/* ── Enrollment Confirmation Modal ─────────────────── */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-700 p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                Confirm Enrollment
              </h3>
              <button onClick={() => setShowEnrollModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              You're enrolling in <strong className="text-white">{course.title}</strong>. Please verify your details:
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="form-label">Full Name *</label>
                <input
                  type="text" value={enrollName} onChange={e => setEnrollName(e.target.value)}
                  placeholder="Enter your full name"
                  className="form-input"
                />
              </div>
              <div className="space-y-1">
                <label className="form-label">Email Address *</label>
                <input
                  type="email" value={enrollEmail} onChange={e => setEnrollEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="form-input"
                />
              </div>
              {enrollError && (
                <div className="flex items-center gap-2 text-xs text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {enrollError}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowEnrollModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700">
                Cancel
              </button>
              <button onClick={handleConfirmEnroll} disabled={isEnrolling}
                id="confirm-enroll-btn"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {isEnrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Confirm Enrollment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
