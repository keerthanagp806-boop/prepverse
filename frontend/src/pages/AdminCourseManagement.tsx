import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { FileUpload } from '../components/FileUpload';
import {
  BookOpen, Plus, Search, Filter, CheckCircle2, XCircle,
  Edit2, Trash2, Eye, Layers, ChevronDown, ChevronUp,
  Save, Globe, Archive, AlertCircle, Loader2, X,
  GripVertical, FileText, Video, Link2, Code2
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Resource { id: string; title: string; type: 'video' | 'pdf' | 'note' | 'link' | 'code'; url: string; durationOrSize?: string; }
interface Lesson { id: string; title: string; durationMinutes: number; content: string; resources: Resource[]; }
interface Module { id: string; title: string; description: string; lessons: Lesson[]; }
interface Course {
  id: string; title: string; description: string; category: string; difficulty: string;
  thumbnail: string; duration: string; objectives: string[]; prerequisites: string[];
  instructorId: string; instructorName: string; status: string;
  modules: Module[]; enrolledCount: number; rating: number;
  createdAt: string; updatedAt: string; publishedAt?: string;
}

const CATEGORIES = ['DSA', 'Programming', 'Core CS', 'Aptitude', 'Web Dev', 'System Design', 'Java', 'Python', 'Database', 'DevOps', 'AI & ML'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const STATUS_COLORS: Record<string, string> = {
  published: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  draft: 'bg-slate-700/50 text-slate-300 border-slate-600/30',
  pending_approval: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  archived: 'bg-rose-900/30 text-rose-400 border-rose-500/30',
};

const uid = () => `id-${Math.random().toString(36).slice(2, 10)}`;

const emptyLesson = (): Lesson => ({
  id: uid(), title: 'New Lesson', durationMinutes: 20, content: '# Lesson Title\n\nAdd your lecture notes here.', resources: []
});
const emptyModule = (): Module => ({
  id: uid(), title: 'New Module', description: 'Module description.', lessons: [emptyLesson()]
});
const emptyCourse = () => ({
  title: '', description: '', category: 'DSA', difficulty: 'Intermediate',
  thumbnail: '', duration: '10 hours', objectives: [''], prerequisites: [''],
  modules: [emptyModule()]
});

// ─── Toast ────────────────────────────────────────────────────────────────────
interface Toast { id: string; msg: string; type: 'success' | 'error'; }
const useToasts = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((msg: string, type: Toast['type'] = 'success') => {
    const id = uid();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
  }, []);
  return { toasts, push };
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const AdminCourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const { toasts, push } = useToasts();

  // Modal state
  const [mode, setMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCourse());
  const [saving, setSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState<'draft' | 'published'>('draft');

  // Confirm delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // ─── Data fetching ────────────────────────────────────────────────────────
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses', { params: { status: 'all' } });
      setCourses(res.data.courses || []);
    } catch (e: any) {
      push(e.response?.data?.error || 'Failed to load courses.', 'error');
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  // ─── Filtered list ────────────────────────────────────────────────────────
  const filtered = courses.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.instructorName.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchCat = filterCategory === 'all' || c.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  // ─── Open create modal ────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(emptyCourse());
    setEditingId(null);
    setMode('create');
  };

  // ─── Open edit modal ──────────────────────────────────────────────────────
  const openEdit = (c: Course) => {
    setForm({
      title: c.title, description: c.description, category: c.category,
      difficulty: c.difficulty, thumbnail: c.thumbnail, duration: c.duration || '',
      objectives: c.objectives?.length ? c.objectives : [''],
      prerequisites: c.prerequisites?.length ? c.prerequisites : [''],
      modules: c.modules?.length ? c.modules : [emptyModule()]
    });
    setEditingId(c.id);
    setMode('edit');
  };

  // ─── Save (create or update) ──────────────────────────────────────────────
  const handleSave = async (status: 'draft' | 'published') => {
    if (!form.title.trim()) { push('Course title is required.', 'error'); return; }
    if (!form.description.trim()) { push('Course description is required.', 'error'); return; }
    if (!form.category.trim()) { push('Course category is required.', 'error'); return; }

    setSaving(true);
    setSavingStatus(status);
    const payload = {
      ...form,
      objectives: form.objectives.filter(o => o.trim()),
      prerequisites: form.prerequisites.filter(p => p.trim()),
      status
    };

    try {
      if (mode === 'create') {
        const res = await api.post('/courses', payload);
        push(status === 'published'
          ? `Course "${res.data.course.title}" published successfully!`
          : `Course "${res.data.course.title}" saved as draft.`);
      } else {
        const res = await api.put(`/courses/${editingId}`, payload);
        push(`Course "${res.data.course.title}" updated.`);
        // Also publish if requested
        if (status === 'published') {
          const existing = courses.find(c => c.id === editingId);
          if (existing?.status !== 'published') {
            await api.post(`/courses/${editingId}/publish`);
            push('Course published successfully!');
          }
        }
      }
      setMode(null);
      fetchCourses();
    } catch (e: any) {
      push(e.response?.data?.error || 'Could not save course. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ─── Publish / Unpublish ──────────────────────────────────────────────────
  const handlePublish = async (c: Course) => {
    try {
      if (c.status === 'published') {
        await api.post(`/courses/${c.id}/unpublish`);
        push(`"${c.title}" unpublished — reverted to draft.`);
      } else {
        await api.post(`/courses/${c.id}/publish`);
        push(`"${c.title}" is now live and visible to students!`);
      }
      fetchCourses();
    } catch (e: any) {
      push(e.response?.data?.error || 'Status change failed.', 'error');
    }
  };

  // ─── Archive ──────────────────────────────────────────────────────────────
  const handleArchive = async (c: Course) => {
    try {
      await api.put(`/admin/courses/${c.id}/status`, { status: 'archived' });
      push(`"${c.title}" archived.`);
      fetchCourses();
    } catch (e: any) {
      push(e.response?.data?.error || 'Archive failed.', 'error');
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const c = courses.find(x => x.id === deleteId);
      await api.delete(`/courses/${deleteId}`);
      push(`"${c?.title}" has been permanently deleted.`);
      setDeleteConfirm(false);
      setDeleteId(null);
      fetchCourses();
    } catch (e: any) {
      push(e.response?.data?.error || 'Delete failed.', 'error');
    }
  };

  // ─── Form helpers ─────────────────────────────────────────────────────────
  const updateModule = (mIdx: number, updates: Partial<Module>) =>
    setForm(f => { const m = [...f.modules]; m[mIdx] = { ...m[mIdx], ...updates }; return { ...f, modules: m }; });

  const updateLesson = (mIdx: number, lIdx: number, updates: Partial<Lesson>) =>
    setForm(f => {
      const m = [...f.modules];
      const ls = [...m[mIdx].lessons];
      ls[lIdx] = { ...ls[lIdx], ...updates };
      m[mIdx] = { ...m[mIdx], lessons: ls };
      return { ...f, modules: m };
    });

  const addModule = () => setForm(f => ({ ...f, modules: [...f.modules, emptyModule()] }));
  const removeModule = (mIdx: number) => setForm(f => ({ ...f, modules: f.modules.filter((_, i) => i !== mIdx) }));
  const addLesson = (mIdx: number) =>
    setForm(f => { const m = [...f.modules]; m[mIdx] = { ...m[mIdx], lessons: [...m[mIdx].lessons, emptyLesson()] }; return { ...f, modules: m }; });
  const removeLesson = (mIdx: number, lIdx: number) =>
    setForm(f => { const m = [...f.modules]; m[mIdx].lessons = m[mIdx].lessons.filter((_, i) => i !== lIdx); return { ...f, modules: m }; });

  const addObjective = () => setForm(f => ({ ...f, objectives: [...f.objectives, ''] }));
  const removeObjective = (i: number) => setForm(f => ({ ...f, objectives: f.objectives.filter((_, j) => j !== i) }));
  const setObjective = (i: number, v: string) => setForm(f => { const o = [...f.objectives]; o[i] = v; return { ...f, objectives: o }; });
  const addPrereq = () => setForm(f => ({ ...f, prerequisites: [...f.prerequisites, ''] }));
  const removePrereq = (i: number) => setForm(f => ({ ...f, prerequisites: f.prerequisites.filter((_, j) => j !== i) }));
  const setPrereq = (i: number, v: string) => setForm(f => { const p = [...f.prerequisites]; p[i] = v; return { ...f, prerequisites: p }; });

  const addResource = (mIdx: number, lIdx: number) =>
    updateLesson(mIdx, lIdx, {
      resources: [...form.modules[mIdx].lessons[lIdx].resources, { id: uid(), title: 'New Resource', type: 'link', url: '', durationOrSize: '' }]
    });
  const removeResource = (mIdx: number, lIdx: number, rIdx: number) =>
    updateLesson(mIdx, lIdx, { resources: form.modules[mIdx].lessons[lIdx].resources.filter((_, i) => i !== rIdx) });
  const updateResource = (mIdx: number, lIdx: number, rIdx: number, updates: Partial<Resource>) =>
    updateLesson(mIdx, lIdx, {
      resources: form.modules[mIdx].lessons[lIdx].resources.map((r, i) => i === rIdx ? { ...r, ...updates } : r)
    });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-3 rounded-2xl text-xs font-bold shadow-xl backdrop-blur flex items-center gap-2 pointer-events-auto
            ${t.type === 'success' ? 'bg-emerald-950/90 border border-emerald-500/40 text-emerald-300' : 'bg-rose-950/90 border border-rose-500/40 text-rose-300'}`}>
            {t.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {t.msg}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-rose-400" />
            Course Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Create, edit, publish and manage all platform courses.</p>
        </div>
        <button
          onClick={openCreate}
          id="admin-add-course-btn"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold shadow-lg shadow-rose-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search courses, instructors…"
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 focus:outline-none focus:border-rose-500">
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="archived">Archived</option>
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 focus:outline-none focus:border-rose-500">
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Course Table */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading courses…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <BookOpen className="w-10 h-10 text-slate-700" />
            <p className="text-slate-400 text-sm font-bold">No courses found</p>
            <p className="text-slate-600 text-xs">{search || filterStatus !== 'all' ? 'Try adjusting your filters.' : 'Click "Add Course" to get started.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800 bg-slate-950/50">
                <tr>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4 hidden md:table-cell">Instructor</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 hidden md:table-cell">Modules</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={c.thumbnail || 'https://images.unsplash.com/photo-1516116211227-bbc13c0d8f07?w=200&auto=format&fit=crop&q=80'}
                          alt={c.title} className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0" />
                        <div>
                          <div className="font-bold text-white text-[13px] leading-tight line-clamp-1">{c.title}</div>
                          <div className="text-slate-500 text-[10px] mt-0.5">{c.difficulty}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-slate-400">{c.instructorName}</td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold">{c.category}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${STATUS_COLORS[c.status] || STATUS_COLORS.draft}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-slate-500">{c.modules?.length || 0}</td>
                    <td className="py-3 px-4 hidden lg:table-cell text-slate-500">
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(c)} title="Edit"
                          className="p-1.5 rounded-lg hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-300 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handlePublish(c)}
                          title={c.status === 'published' ? 'Unpublish' : 'Publish'}
                          className={`p-1.5 rounded-lg transition-colors ${c.status === 'published' ? 'hover:bg-amber-500/20 text-amber-400 hover:text-amber-300' : 'hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300'}`}>
                          {c.status === 'published' ? <XCircle className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => handleArchive(c)} title="Archive"
                          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-slate-300 transition-colors">
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setDeleteId(c.id); setDeleteConfirm(true); }} title="Delete"
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats bar */}
      {!loading && (
        <div className="flex gap-4 text-xs text-slate-500">
          <span>{courses.length} total courses</span>
          <span>·</span>
          <span className="text-emerald-400">{courses.filter(c => c.status === 'published').length} published</span>
          <span>·</span>
          <span className="text-slate-400">{courses.filter(c => c.status === 'draft').length} draft</span>
          <span>·</span>
          <span className="text-amber-400">{courses.filter(c => c.status === 'pending_approval').length} pending</span>
        </div>
      )}

      {/* ── Delete Confirm Dialog ─────────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl bg-slate-900 border border-rose-500/30 p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <Trash2 className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Permanently delete course?</h3>
            </div>
            <p className="text-xs text-slate-400">This action cannot be undone. All modules and lessons will be removed. Enrollments will be affected.</p>
            <div className="flex gap-3 pt-1">
              <button onClick={() => { setDeleteConfirm(false); setDeleteId(null); }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700">Cancel</button>
              <button onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
      {mode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center p-4 py-8">
            <div className="rounded-3xl bg-slate-900 border border-slate-800 w-full max-w-4xl shadow-2xl">

              {/* Modal header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-rose-400" />
                  {mode === 'create' ? 'Create New Course' : 'Edit Course'}
                </h3>
                <button onClick={() => setMode(null)} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* ── Section 1: Basic Information ── */}
                <Section title="Basic Information" icon={<Eye className="w-4 h-4" />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-1">
                      <label className="form-label">Course Title *</label>
                      <input id="course-title" type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="e.g. Complete Data Structures & Algorithms for Placements"
                        className="form-input" />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="form-label">Description *</label>
                      <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Describe what students will learn in this course…"
                        rows={3} className="form-input resize-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="form-label">Category *</label>
                      <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="form-input">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="form-label">Difficulty</label>
                      <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} className="form-input">
                        {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="form-label">Duration</label>
                      <input type="text" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                        placeholder="e.g. 12 hours" className="form-input" />
                    </div>
                  </div>
                  {/* Thumbnail upload */}
                  <div className="mt-4">
                    <FileUpload
                      label="Course Thumbnail (Image)"
                      accept="image/*"
                      currentValue={form.thumbnail}
                      onUploadComplete={(url) => { if (url) setForm(f => ({ ...f, thumbnail: url })); }}
                    />
                    {!form.thumbnail && (
                      <div className="mt-2 space-y-1">
                        <label className="form-label">Or paste thumbnail URL</label>
                        <input type="text" value={form.thumbnail} onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))}
                          placeholder="https://…" className="form-input" />
                      </div>
                    )}
                  </div>
                </Section>

                {/* ── Section 2: Learning Information ── */}
                <Section title="Learning Information" icon={<CheckCircle2 className="w-4 h-4" />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="form-label">Learning Objectives</label>
                      <p className="text-[10px] text-slate-500">What will students be able to do after completing this course?</p>
                      {form.objectives.map((o, i) => (
                        <div key={i} className="flex gap-2">
                          <input type="text" value={o} onChange={e => setObjective(i, e.target.value)}
                            placeholder={`Objective ${i + 1}`} className="form-input flex-1" />
                          {form.objectives.length > 1 && (
                            <button type="button" onClick={() => removeObjective(i)} className="p-2 text-rose-400 hover:text-rose-300">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={addObjective} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Objective
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="form-label">Prerequisites</label>
                      <p className="text-[10px] text-slate-500">What should students know before starting?</p>
                      {form.prerequisites.map((p, i) => (
                        <div key={i} className="flex gap-2">
                          <input type="text" value={p} onChange={e => setPrereq(i, e.target.value)}
                            placeholder={`Prerequisite ${i + 1}`} className="form-input flex-1" />
                          {form.prerequisites.length > 1 && (
                            <button type="button" onClick={() => removePrereq(i)} className="p-2 text-rose-400 hover:text-rose-300">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={addPrereq} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Prerequisite
                      </button>
                    </div>
                  </div>
                </Section>

                {/* ── Section 3: Course Structure ── */}
                <Section title="Course Structure" icon={<Layers className="w-4 h-4" />}>
                  <p className="text-[11px] text-slate-500 mb-4">
                    Build your course by adding modules and lessons. Each lesson can contain notes, video links, PDF uploads, and more.
                  </p>
                  <div className="space-y-4">
                    {form.modules.map((mod, mIdx) => (
                      <ModuleBlock
                        key={mod.id} mod={mod} mIdx={mIdx}
                        onUpdateModule={updates => updateModule(mIdx, updates)}
                        onRemoveModule={() => removeModule(mIdx)}
                        onAddLesson={() => addLesson(mIdx)}
                        onUpdateLesson={(lIdx, updates) => updateLesson(mIdx, lIdx, updates)}
                        onRemoveLesson={lIdx => removeLesson(mIdx, lIdx)}
                        onAddResource={lIdx => addResource(mIdx, lIdx)}
                        onRemoveResource={(lIdx, rIdx) => removeResource(mIdx, lIdx, rIdx)}
                        onUpdateResource={(lIdx, rIdx, updates) => updateResource(mIdx, lIdx, rIdx, updates)}
                        canRemove={form.modules.length > 1}
                      />
                    ))}
                    <button type="button" onClick={addModule}
                      className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-700 text-slate-400 hover:border-indigo-500 hover:text-indigo-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                      <Plus className="w-4 h-4" /> Add Module
                    </button>
                  </div>
                </Section>

                {/* ── Action Buttons ── */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-800">
                  <button type="button" onClick={() => setMode(null)}
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors">
                    Cancel
                  </button>
                  <div className="flex-1" />
                  <button type="button" onClick={() => handleSave('draft')} disabled={saving}
                    id="save-draft-btn"
                    className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50">
                    {saving && savingStatus === 'draft' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Draft
                  </button>
                  <button type="button" onClick={() => handleSave('published')} disabled={saving}
                    id="publish-course-btn"
                    className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50">
                    {saving && savingStatus === 'published' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                    {mode === 'create' ? 'Publish Course' : 'Save & Publish'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sm font-extrabold text-white">
      <span className="text-rose-400">{icon}</span>
      {title}
    </div>
    <div className="pl-6 border-l border-slate-800">{children}</div>
  </div>
);

// ─── Module Block ─────────────────────────────────────────────────────────────
interface ModuleBlockProps {
  mod: Module; mIdx: number; canRemove: boolean;
  onUpdateModule: (u: Partial<Module>) => void;
  onRemoveModule: () => void;
  onAddLesson: () => void;
  onUpdateLesson: (lIdx: number, u: Partial<Lesson>) => void;
  onRemoveLesson: (lIdx: number) => void;
  onAddResource: (lIdx: number) => void;
  onRemoveResource: (lIdx: number, rIdx: number) => void;
  onUpdateResource: (lIdx: number, rIdx: number, u: Partial<Resource>) => void;
}

const ModuleBlock: React.FC<ModuleBlockProps> = ({
  mod, mIdx, canRemove, onUpdateModule, onRemoveModule, onAddLesson,
  onUpdateLesson, onRemoveLesson, onAddResource, onRemoveResource, onUpdateResource
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-950/40 overflow-hidden">
      {/* Module header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/60 border-b border-slate-800">
        <GripVertical className="w-4 h-4 text-slate-600 shrink-0" />
        <input type="text" value={mod.title} onChange={e => onUpdateModule({ title: e.target.value })}
          className="flex-1 bg-transparent text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none"
          placeholder="Module Title" />
        <span className="text-[10px] text-slate-500 shrink-0">{mod.lessons.length} lessons</span>
        <button type="button" onClick={() => setCollapsed(!collapsed)} className="p-1 text-slate-500 hover:text-slate-300">
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
        {canRemove && (
          <button type="button" onClick={onRemoveModule} className="p-1 text-rose-600 hover:text-rose-400">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="p-4 space-y-3">
          <input type="text" value={mod.description} onChange={e => onUpdateModule({ description: e.target.value })}
            placeholder="Module description (optional)" className="form-input text-[11px]" />

          {mod.lessons.map((les, lIdx) => (
            <LessonBlock key={les.id} les={les} lIdx={lIdx} mIdx={mIdx}
              canRemove={mod.lessons.length > 1}
              onUpdate={u => onUpdateLesson(lIdx, u)}
              onRemove={() => onRemoveLesson(lIdx)}
              onAddResource={() => onAddResource(lIdx)}
              onRemoveResource={rIdx => onRemoveResource(lIdx, rIdx)}
              onUpdateResource={(rIdx, u) => onUpdateResource(lIdx, rIdx, u)}
            />
          ))}

          <button type="button" onClick={onAddLesson}
            className="w-full py-2 rounded-xl border border-dashed border-slate-700 text-slate-500 hover:text-indigo-300 hover:border-indigo-500 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Lesson
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Lesson Block ─────────────────────────────────────────────────────────────
interface LessonBlockProps {
  les: Lesson; lIdx: number; mIdx: number; canRemove: boolean;
  onUpdate: (u: Partial<Lesson>) => void;
  onRemove: () => void;
  onAddResource: () => void;
  onRemoveResource: (rIdx: number) => void;
  onUpdateResource: (rIdx: number, u: Partial<Resource>) => void;
}

const LessonBlock: React.FC<LessonBlockProps> = ({
  les, canRemove, onUpdate, onRemove, onAddResource, onRemoveResource, onUpdateResource
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <GripVertical className="w-3.5 h-3.5 text-slate-700 shrink-0" />
        <input type="text" value={les.title} onChange={e => onUpdate({ title: e.target.value })}
          className="flex-1 bg-transparent text-xs font-bold text-slate-200 placeholder:text-slate-600 focus:outline-none"
          placeholder="Lesson Title" />
        <input type="number" min={1} max={300} value={les.durationMinutes}
          onChange={e => onUpdate({ durationMinutes: Number(e.target.value) })}
          className="w-12 bg-slate-950 border border-slate-800 text-center text-xs text-slate-400 rounded-lg px-1 py-1 focus:outline-none" />
        <span className="text-[10px] text-slate-600 shrink-0">min</span>
        <button type="button" onClick={() => setExpanded(!expanded)} className="p-1 text-slate-500 hover:text-slate-300 text-[10px]">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {canRemove && (
          <button type="button" onClick={onRemove} className="p-1 text-rose-700 hover:text-rose-400">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-slate-800 pt-3">
          <div className="space-y-1">
            <label className="form-label">Lesson Notes / Content (Markdown)</label>
            <textarea value={les.content} onChange={e => onUpdate({ content: e.target.value })}
              rows={5} placeholder="# Lesson Title&#10;&#10;Write your lecture notes in markdown format..."
              className="form-input resize-y text-[11px] font-mono" />
          </div>

          <div className="space-y-2">
            <label className="form-label">Resources</label>
            {les.resources.map((r, rIdx) => (
              <ResourceRow key={r.id} resource={r}
                onUpdate={u => onUpdateResource(rIdx, u)}
                onRemove={() => onRemoveResource(rIdx)}
              />
            ))}
            <button type="button" onClick={onAddResource}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add Resource
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Resource Row ─────────────────────────────────────────────────────────────
const RESOURCE_ICONS: Record<string, React.ReactNode> = {
  video: <Video className="w-3.5 h-3.5" />,
  pdf: <FileText className="w-3.5 h-3.5" />,
  note: <FileText className="w-3.5 h-3.5" />,
  link: <Link2 className="w-3.5 h-3.5" />,
  code: <Code2 className="w-3.5 h-3.5" />,
};

const ResourceRow: React.FC<{
  resource: Resource;
  onUpdate: (u: Partial<Resource>) => void;
  onRemove: () => void;
}> = ({ resource, onUpdate, onRemove }) => {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-slate-500">{RESOURCE_ICONS[resource.type]}</span>
        <input type="text" value={resource.title} onChange={e => onUpdate({ title: e.target.value })}
          placeholder="Resource title" className="flex-1 bg-transparent text-[11px] font-bold text-slate-300 focus:outline-none" />
        <select value={resource.type} onChange={e => onUpdate({ type: e.target.value as Resource['type'] })}
          className="bg-slate-900 border border-slate-700 text-[10px] text-slate-400 rounded-lg px-1.5 py-1 focus:outline-none">
          <option value="video">Video</option>
          <option value="pdf">PDF</option>
          <option value="note">Note</option>
          <option value="link">Link</option>
          <option value="code">Code</option>
        </select>
        <button type="button" onClick={onRemove} className="text-rose-700 hover:text-rose-400">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex gap-2 items-center">
        <input type="text" value={resource.url} onChange={e => onUpdate({ url: e.target.value })}
          placeholder="https:// or /uploads/..." className="flex-1 form-input text-[10px]" />
        {(resource.type === 'pdf' || resource.type === 'video') && (
          <button type="button" onClick={() => setShowUpload(!showUpload)}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 whitespace-nowrap">
            {showUpload ? 'Hide Upload' : '↑ Upload File'}
          </button>
        )}
      </div>
      {showUpload && (
        <FileUpload
          label={`Upload ${resource.type === 'pdf' ? 'PDF' : 'Video'} File`}
          accept={resource.type === 'pdf' ? 'application/pdf' : 'video/*'}
          onUploadComplete={(url) => { if (url) { onUpdate({ url }); setShowUpload(false); } }}
        />
      )}
    </div>
  );
};

export default AdminCourseManagement;
