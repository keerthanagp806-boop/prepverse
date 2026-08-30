import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Star, 
  Users, 
  Clock, 
  CheckCircle2, 
  Layers,
  GraduationCap
} from 'lucide-react';

export const Courses: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['All', 'DSA', 'Core CS', 'Aptitude', 'Programming', 'Web Dev', 'System Design'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedDifficulty, search]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
      if (search) params.search = search;

      const [coursesRes, enrolledRes] = await Promise.all([
        api.get('/courses', { params }),
        api.get('/courses/enrolled/me')
      ]);

      setCourses(coursesRes.data.courses || []);
      const ids = (enrolledRes.data.enrolledCourses || []).map((c: any) => c.id);
      setEnrolledIds(ids);
    } catch (err) {
      console.error('Error fetching courses', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (e: React.MouseEvent, courseId: string) => {
    e.preventDefault();
    try {
      await api.post(`/courses/${courseId}/enroll`);
      setEnrolledIds([...enrolledIds, courseId]);
    } catch (err) {
      console.error('Enrollment error', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-indigo-400" />
            <span>Course Catalog</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Structured modules with interactive notes, video lessons, downloadable resources, and placement practice.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by course name, topic, or instructor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Difficulty:</span>
          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                selectedDifficulty === diff
                  ? 'bg-slate-800 text-indigo-300 font-bold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-400">Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 p-8">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">No courses found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const isEnrolled = enrolledIds.includes(course.id);
            let totalLessons = 0;
            course.modules?.forEach((m: any) => (totalLessons += m.lessons.length));

            return (
              <div
                key={course.id}
                className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group shadow-xl hover:-translate-y-1 duration-200"
              >
                <div>
                  {/* Thumbnail Banner */}
                  <div className="h-44 w-full relative overflow-hidden bg-slate-950">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-md bg-slate-900/90 backdrop-blur-md text-indigo-300 border border-indigo-500/30">
                        {course.category}
                      </span>
                      <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-md bg-slate-900/90 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                        {course.difficulty}
                      </span>
                    </div>

                    {isEnrolled && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Enrolled</span>
                      </div>
                    )}
                  </div>

                  {/* Body Details */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
                      <div className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{course.modules?.length || 0} Modules • {totalLessons} Lessons</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action footer */}
                <div className="p-5 pt-0">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/courses/${course.id}`}
                      className="flex-1 text-center py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition-colors"
                    >
                      View Syllabus
                    </Link>

                    {isEnrolled ? (
                      <Link
                        to={`/courses/${course.id}/lessons/${course.modules?.[0]?.lessons?.[0]?.id || 'les-1'}`}
                        className="flex-1 text-center py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-colors"
                      >
                        Continue
                      </Link>
                    ) : (
                      <button
                        onClick={(e) => handleEnroll(e, course.id)}
                        className="flex-1 text-center py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-colors"
                      >
                        Enroll Free
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
