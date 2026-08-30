import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Video,
  Download,
  Terminal,
  ExternalLink,
  Layers,
  ChevronLeft,
  Play
} from 'lucide-react';

export const LessonViewer: React.FC = () => {
  const { id: courseId, lessonId } = useParams<{ id: string; lessonId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      setIsLoading(true);
      try {
        const [courseRes, enrolledRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get('/courses/enrolled/me')
        ]);

        const c = courseRes.data.course;
        setCourse(c);

        // Find the lesson in modules
        let foundLesson = null;
        c.modules?.forEach((m: any) => {
          const l = m.lessons?.find((les: any) => les.id === lessonId);
          if (l) foundLesson = l;
        });

        setCurrentLesson(foundLesson);

        const myEnr = (enrolledRes.data.enrolledCourses || []).find((ec: any) => ec.id === courseId);
        if (myEnr) {
          const compIds = myEnr.enrollment?.completedLessonIds || [];
          setCompletedLessonIds(compIds);
          setIsCompleted(compIds.includes(lessonId));
        }

        // Auto track progress as viewed
        if (courseId && lessonId) {
          api.post(`/courses/${courseId}/lessons/${lessonId}/progress`, { markComplete: false });
        }
      } catch (err) {
        console.error('Error fetching lesson', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [courseId, lessonId]);

  const handleToggleComplete = async () => {
    try {
      const nextState = !isCompleted;
      setIsCompleted(nextState);
      const res = await api.post(`/courses/${courseId}/lessons/${lessonId}/progress`, { markComplete: nextState });
      if (res.data.enrollment) {
        setCompletedLessonIds(res.data.enrollment.completedLessonIds || []);
      }
    } catch (err) {
      console.error('Error updating completion', err);
    }
  };

  // Find all lessons in linear order for next/previous navigation
  const allLessons: { id: string; title: string; moduleId: string }[] = [];
  course?.modules?.forEach((m: any) => {
    m.lessons?.forEach((l: any) => {
      allLessons.push({ id: l.id, title: l.title, moduleId: m.id });
    });
  });

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex !== -1 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-400">Loading lesson content...</p>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-sm text-slate-400">Lesson not found.</p>
        <Link to={`/courses/${courseId}`} className="text-xs text-indigo-400">Back to Course Syllabus</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <Link
          to={`/courses/${courseId}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Course Syllabus</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleComplete}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isCompleted
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isCompleted ? 'Completed' : 'Mark as Completed'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Content Area & Resources Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Notes & Lesson Material (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                {course?.title}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {currentLesson.title}
              </h1>
            </div>

            {/* Formatted Markdown Reader */}
            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
              {currentLesson.content?.split('\n\n').map((paragraph: string, idx: number) => {
                if (paragraph.startsWith('# ')) {
                  return <h2 key={idx} className="text-xl font-bold text-white pt-2 border-b border-slate-800 pb-2">{paragraph.replace('# ', '')}</h2>;
                }
                if (paragraph.startsWith('### ')) {
                  return <h3 key={idx} className="text-base font-bold text-indigo-300 pt-2">{paragraph.replace('### ', '')}</h3>;
                }
                if (paragraph.startsWith('```')) {
                  const codeLines = paragraph.replace(/```[a-z]*\n?/g, '');
                  return (
                    <pre key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
                      <code>{codeLines}</code>
                    </pre>
                  );
                }
                return <p key={idx} className="leading-relaxed">{paragraph}</p>;
              })}
            </div>
          </div>

          {/* Previous / Next Lesson Navigation Footer */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            {prevLesson ? (
              <Link
                to={`/courses/${courseId}/lessons/${prevLesson.id}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="max-w-[150px] sm:max-w-[200px] truncate">{prevLesson.title}</span>
              </Link>
            ) : <div />}

            {nextLesson ? (
              <Link
                to={`/courses/${courseId}/lessons/${nextLesson.id}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-white px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-colors"
              >
                <span className="max-w-[150px] sm:max-w-[200px] truncate">{nextLesson.title}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to={`/courses/${courseId}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 px-4 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30"
              >
                <span>Finished Course!</span>
                <CheckCircle2 className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Right: Attached Resources & Course Lessons Navigator */}
        <div className="space-y-6">
          {/* Downloadable / Video Resources */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Lesson Resources</span>
            </div>

            {(!currentLesson.resources || currentLesson.resources.length === 0) ? (
              <p className="text-xs text-slate-500">No external downloads for this lesson.</p>
            ) : (
              <div className="space-y-2.5">
                {currentLesson.resources.map((res: any) => (
                  <a
                    key={res.id}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {res.type === 'video' ? (
                        <Video className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : res.type === 'code' ? (
                        <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                      ) : (
                        <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 truncate">
                          {res.title}
                        </div>
                        <div className="text-[10px] text-slate-400">{res.durationOrSize || 'Resource'}</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Sandbox Link */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-900/40 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Practice in Sandbox</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Test algorithm code with Python, C++, Java, and JavaScript against test cases.
            </p>
            <Link
              to="/compiler"
              className="mt-2 block text-center text-xs font-bold py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Open Online Compiler
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
