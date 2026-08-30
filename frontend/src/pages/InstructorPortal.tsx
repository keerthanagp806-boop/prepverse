import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileUpload } from '../components/FileUpload';
import {
  GraduationCap,
  Plus,
  BookOpen,
  CheckSquare,
  Code2,
  Clock,
  Layers,
  Save,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  Upload,
  Video,
  FileText
} from 'lucide-react';

export const InstructorPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'assessments' | 'problems' | 'enrollments'>('courses');
  const [courses, setCourses] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  // Create Course State with File/Media upload
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: 'DSA',
    difficulty: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1516116211227-bbc13c0d8f07?w=600&auto=format&fit=crop&q=80',
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1: Foundations',
        description: 'Core concepts and interview patterns.',
        lessons: [
          {
            id: 'les-101',
            title: 'Lesson 1: Introduction & Complexity',
            durationMinutes: 30,
            content: '# Introduction to the Topic\n\nDetailed lecture notes and key placement insights.',
            resources: [] as any[]
          }
        ]
      }
    ]
  });

  // Create Assessment State
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    description: '',
    category: 'DSA',
    difficulty: 'Medium',
    durationMinutes: 20,
    timerMode: 'OVERALL',
    questionTimerSeconds: 45,
    passingScorePercentage: 70,
    tabSwitchLimit: 3,
    questions: [
      {
        questionText: 'What is the time complexity of searching in a Balanced BST with N nodes?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'],
        correctIndex: 1,
        marks: 4,
        explanation: 'Balanced BST has height O(log N).'
      }
    ]
  });

  // Create Coding Problem State
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [newProblem, setNewProblem] = useState({
    title: '',
    description: 'Given an array of integers, find the maximum sum subarray.',
    inputFormat: 'First line: array elements space-separated\nSecond line: array size N',
    outputFormat: 'A single integer representing the maximum subarray sum',
    difficulty: 'Medium',
    topic: 'Arrays',
    examples: [
      { input: '-2 1 -3 4 -1 2 1 -5 4', output: '6', explanation: 'Subarray [4,-1,2,1] has max sum 6' }
    ],
    constraints: ['1 <= N <= 10^5', '-10^4 <= arr[i] <= 10^4'],
    starterCode: {
      python: 'def max_subarray(nums):\n    # Your code here\n    pass\n\nnums = list(map(int, input().split()))\nprint(max_subarray(nums))',
      javascript: 'const lines = require(\'fs\').readFileSync(\'/dev/stdin\', \'utf8\').split(\'\\n\');\nconst nums = lines[0].split(\' \').map(Number);\n\nfunction maxSubarray(nums) {\n    // Your code here\n}\n\nconsole.log(maxSubarray(nums));',
      java: 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your code here\n    }\n}',
      cpp: '#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    // Your code here\n    return 0;\n}'
    },
    privateSolution: 'def max_subarray(nums):\n    max_sum = cur = nums[0]\n    for n in nums[1:]:\n        cur = max(n, cur + n)\n        max_sum = max(max_sum, cur)\n    return max_sum\n\nnums = list(map(int, input().split()))\nprint(max_subarray(nums))',
    testCases: [
      { input: '-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isHidden: false },
      { input: '1', expectedOutput: '1', isHidden: false },
      { input: '-2 -3 4 -1 -2 1 5 -3', expectedOutput: '7', isHidden: true }
    ]
  });

  const [notification, setNotification] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [crsRes, asmRes, probRes, enrRes] = await Promise.all([
        api.get('/courses'),
        api.get('/assessments'),
        api.get('/coding/problems'),
        api.get('/courses/instructor/enrollments')
      ]);
      setCourses(crsRes.data.courses || []);
      setAssessments(asmRes.data.assessments || []);
      setProblems(probRes.data.problems || []);
      setEnrollments(enrRes.data.enrollments || []);
    } catch (err) {
      console.error('Error fetching instructor data', err);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/courses', newCourse);
      setShowCourseModal(false);
      setNotification('Course with attached media published successfully!');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create course');
    }
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/assessments', newAssessment);
      setShowAssessmentModal(false);
      setNotification('Assessment created with timer rules successfully!');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create assessment');
    }
  };

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/coding/problems', newProblem);
      setShowProblemModal(false);
      setNotification('Coding problem created with test cases and private solution!');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create problem');
    }
  };

  const addTestCase = () => {
    setNewProblem(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '', isHidden: false }]
    }));
  };

  const removeTestCase = (idx: number) => {
    setNewProblem(prev => ({
      ...prev,
      testCases: prev.testCases.filter((_: any, i: number) => i !== idx)
    }));
  };

  const updateTestCase = (idx: number, field: string, value: any) => {
    setNewProblem(prev => {
      const tcs = [...prev.testCases];
      tcs[idx] = { ...tcs[idx], [field]: value };
      return { ...prev, testCases: tcs };
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <GraduationCap className="w-7 h-7 text-amber-400" />
            <span>Instructor Studio & Content Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Publish courses with video & PDF uploads, configure timed assessments with question-level timers, and author coding problems.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'courses' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('assessments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'assessments' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            Assessments ({assessments.length})
          </button>
          <button
            onClick={() => setActiveTab('problems')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'problems' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            Coding Problems ({problems.length})
          </button>
          <button
            onClick={() => setActiveTab('enrollments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'enrollments' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            Enrollments ({enrollments.length})
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-white">Managed Courses</h2>
            <button
              onClick={() => setShowCourseModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course with Media Upload</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c) => (
              <div key={c.id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="h-32 rounded-xl overflow-hidden bg-slate-950">
                  <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                </div>
                <div className="text-[10px] font-bold uppercase text-amber-400">{c.category} • {c.difficulty}</div>
                <h3 className="text-sm font-bold text-white">{c.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
                <div className="pt-2 flex justify-between text-[11px] text-slate-400 border-t border-slate-800">
                  <span>{c.modules?.length || 0} Modules</span>
                  <span className="text-emerald-400 font-bold uppercase">{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assessments Tab */}
      {activeTab === 'assessments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-white">Author Assessments & Timers</h2>
            <button
              onClick={() => setShowAssessmentModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Timed Assessment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((a) => (
              <div key={a.id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-indigo-400 uppercase">{a.category}</span>
                  <span className="text-amber-400 uppercase">{a.timerMode} TIMER</span>
                </div>
                <h3 className="text-sm font-bold text-white">{a.title}</h3>
                <div className="text-xs text-slate-400">
                  Duration: {a.timerMode === 'QUESTION' ? `${a.questionTimerSeconds}s / Question` : `${a.durationMinutes} mins`}
                </div>
                <div className="pt-2 flex justify-between text-[11px] text-slate-400 border-t border-slate-800">
                  <span>Pass: {a.passingScorePercentage}%</span>
                  <span className="text-rose-400">Limit: {a.tabSwitchLimit} Tab Switches</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Problems Tab */}
      {activeTab === 'problems' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-white">Coding Problems & Test Cases</h2>
            <button
              onClick={() => setShowProblemModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Coding Problem</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((p) => (
              <div key={p.id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="text-[10px] font-bold text-emerald-400 uppercase">{p.topic} • {p.difficulty}</div>
                <h3 className="text-sm font-bold text-white">{p.title}</h3>
                <div className="pt-2 flex justify-between text-[11px] text-slate-400 border-t border-slate-800">
                  <span>{p.totalTestCases || p.testCases?.length || 2} Test Cases</span>
                  <span>Acceptance: {p.acceptanceRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enrollments Tab */}
      {activeTab === 'enrollments' && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Student Enrollments in Your Courses</h2>
            <span className="text-[11px] text-slate-400 font-mono">{enrollments.length} total enrollments</span>
          </div>
          {enrollments.length === 0 ? (
            <p className="text-slate-500 text-xs text-center py-10">No enrollments yet. Students will appear here when they enroll in your courses.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Progress</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Enrolled On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {enrollments.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-950/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[9px] font-extrabold shrink-0">
                            {e.studentName?.[0]?.toUpperCase()}
                          </div>
                          {e.studentName}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{e.studentEmail}</td>
                      <td className="py-3 px-4 text-indigo-300 font-medium max-w-[180px] truncate">{e.courseTitle}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-800 min-w-[60px]">
                            <div
                              className="h-1.5 rounded-full bg-amber-400 transition-all"
                              style={{ width: `${e.progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-300 shrink-0">{e.progressPercentage}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          e.status === 'Completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-indigo-500/20 text-indigo-400'
                        }`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-500">
                        {new Date(e.enrolledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleCreateCourse} className="rounded-3xl bg-slate-900 border border-slate-800 p-6 max-w-2xl w-full space-y-4 text-xs my-8">
            <h3 className="text-base font-bold text-white">Create New Course with Uploaded Media</h3>
            
            <div className="space-y-1">
              <label className="text-slate-400">Course Title</label>
              <input
                type="text"
                required
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                placeholder="e.g. Full-Stack System Design & Redis Caching"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Description</label>
              <textarea
                rows={2}
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400">Category</label>
                <select
                  value={newCourse.category}
                  onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="DSA">DSA</option>
                  <option value="Core CS">Core CS</option>
                  <option value="Aptitude">Aptitude</option>
                  <option value="Programming">Programming</option>
                  <option value="System Design">System Design</option>
                  <option value="Web Dev">Web Dev</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400">Difficulty</label>
                <select
                  value={newCourse.difficulty}
                  onChange={(e) => setNewCourse({ ...newCourse, difficulty: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Direct File/Thumbnail Upload */}
            <FileUpload
              label="Course Thumbnail Image (Upload from Computer)"
              accept="image/*"
              currentValue={newCourse.thumbnail}
              onUploadComplete={(url) => {
                if (url) setNewCourse({ ...newCourse, thumbnail: url });
              }}
            />

            {/* Lesson Video & PDF Resource Upload */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="font-bold text-white text-xs">Module 1 Initial Lesson & Resource Attachment</div>
              <FileUpload
                label="Attach Lecture Video or PDF Worksheet (Optional)"
                accept="video/*,application/pdf,.pdf"
                onUploadComplete={(url, meta) => {
                  if (url) {
                    const resource = {
                      id: `res-${Date.now()}`,
                      title: meta?.originalName || 'Lesson Resource',
                      type: meta?.type || 'pdf',
                      url: url,
                      durationOrSize: meta?.sizeBytes ? `${Math.round(meta.sizeBytes / 1024 / 1024)} MB` : '1.5 MB'
                    };
                    const updated = { ...newCourse };
                    updated.modules[0].lessons[0].resources = [resource];
                    setNewCourse(updated);
                  }
                }}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCourseModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold">Publish Course</button>
            </div>
          </form>
        </div>
      )}

      {/* Create Assessment Modal */}
      {showAssessmentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateAssessment} className="rounded-3xl bg-slate-900 border border-slate-800 p-6 max-w-xl w-full space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Create Assessment & Timer Configuration</h3>
            <div className="space-y-1">
              <label className="text-slate-400">Assessment Title</label>
              <input
                type="text"
                required
                value={newAssessment.title}
                onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                placeholder="e.g. Graph Algorithms National Speed Benchmark"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400">Timer Mode (Req 6)</label>
                <select
                  value={newAssessment.timerMode}
                  onChange={(e) => setNewAssessment({ ...newAssessment, timerMode: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300 font-bold"
                >
                  <option value="OVERALL">Overall Assessment Timer (e.g. 20 mins)</option>
                  <option value="QUESTION">Question-Level Timer (e.g. 45s / Q)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400">Duration (Mins or Secs)</label>
                <input
                  type="number"
                  value={newAssessment.durationMinutes}
                  onChange={(e) => setNewAssessment({ ...newAssessment, durationMinutes: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400">Pass Score (%)</label>
                <input
                  type="number"
                  value={newAssessment.passingScorePercentage}
                  onChange={(e) => setNewAssessment({ ...newAssessment, passingScorePercentage: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400">Tab-Switch Limit</label>
                <input
                  type="number"
                  value={newAssessment.tabSwitchLimit}
                  onChange={(e) => setNewAssessment({ ...newAssessment, tabSwitchLimit: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowAssessmentModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold">Create Assessment</button>
            </div>
          </form>
        </div>
      )}

      {/* Create Problem Modal – Full Featured */}
      {showProblemModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <form onSubmit={handleCreateProblem} className="rounded-3xl bg-slate-900 border border-slate-800 p-6 max-w-3xl w-full space-y-5 text-xs my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-amber-400" />
                Create Coding Problem
              </h3>
              <button type="button" onClick={() => setShowProblemModal(false)} className="text-slate-400 hover:text-white text-lg leading-none">&times;</button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-400 font-medium">Problem Title *</label>
                <input type="text" required value={newProblem.title}
                  onChange={e => setNewProblem({ ...newProblem, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  placeholder="e.g. Maximum Subarray Sum" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Topic</label>
                  <select value={newProblem.topic}
                    onChange={e => setNewProblem({ ...newProblem, topic: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white">
                    {['Arrays','Strings','LinkedList','Trees','Dynamic Programming','Graphs','Sorting','Binary Search','Hashing','Stack & Queue'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Difficulty</label>
                  <select value={newProblem.difficulty}
                    onChange={e => setNewProblem({ ...newProblem, difficulty: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Problem Description *</label>
              <textarea rows={4} required value={newProblem.description}
                onChange={e => setNewProblem({ ...newProblem, description: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white resize-none font-mono"
                placeholder="Describe the problem clearly with context and goal..." />
            </div>

            {/* Input / Output Format */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Input Format</label>
                <textarea rows={2} value={newProblem.inputFormat}
                  onChange={e => setNewProblem({ ...newProblem, inputFormat: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white resize-none" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Output Format</label>
                <textarea rows={2} value={newProblem.outputFormat}
                  onChange={e => setNewProblem({ ...newProblem, outputFormat: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white resize-none" />
              </div>
            </div>

            {/* Starter Code (Python only for brevity, others auto-filled) */}
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Python Starter Code <span className="text-indigo-400">(shown to students)</span></label>
              <textarea rows={5} value={newProblem.starterCode.python}
                onChange={e => setNewProblem({ ...newProblem, starterCode: { ...newProblem.starterCode, python: e.target.value } })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono resize-none" />
            </div>

            {/* Private Solution */}
            <div className="space-y-1 p-3 rounded-2xl bg-rose-950/20 border border-rose-500/20">
              <label className="text-rose-300 font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Private Solution (Python) — NEVER shown to students
              </label>
              <textarea rows={5} value={newProblem.privateSolution}
                onChange={e => setNewProblem({ ...newProblem, privateSolution: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-rose-500/30 text-emerald-300 font-mono resize-none" />
            </div>

            {/* Test Cases */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-slate-400 font-medium">Test Cases ({newProblem.testCases.length})</label>
                <button type="button" onClick={addTestCase}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold hover:bg-amber-500/20">
                  <Plus className="w-3.5 h-3.5" /> Add Test Case
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {newProblem.testCases.map((tc: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300">Case {idx + 1}</span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={tc.isHidden}
                            onChange={e => updateTestCase(idx, 'isHidden', e.target.checked)}
                            className="w-3.5 h-3.5 rounded" />
                          <span className={tc.isHidden ? 'text-rose-400 font-bold' : 'text-slate-400'}>Hidden</span>
                        </label>
                        {idx > 0 && (
                          <button type="button" onClick={() => removeTestCase(idx)}
                            className="text-rose-400 hover:text-rose-300">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <div className="text-slate-500">Input (stdin)</div>
                        <textarea rows={2} value={tc.input}
                          onChange={e => updateTestCase(idx, 'input', e.target.value)}
                          className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono resize-none" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-slate-500">Expected Output</div>
                        <textarea rows={2} value={tc.expectedOutput}
                          onChange={e => updateTestCase(idx, 'expectedOutput', e.target.value)}
                          className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono resize-none" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-slate-800">
              <button type="button" onClick={() => setShowProblemModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700">Cancel</button>
              <button type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">Create Problem</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
