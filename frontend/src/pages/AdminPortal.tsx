import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { FileUpload } from '../components/FileUpload';
import {
  ShieldAlert,
  Users,
  BookOpen,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  CheckSquare,
  Activity,
  History,
  Lock,
  Plus,
  Upload,
  ExternalLink
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'courses' | 'companies' | 'audit' | 'analytics' | 'enrollments'>('analytics');
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [notification, setNotification] = useState('');

  // Add Company Modal State
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: 'Big Tech & Cloud',
    description: '',
    salaryRange: '₹15 - ₹28 LPA',
    logo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=100&auto=format&fit=crop&q=80',
    eligibility: {
      minCgpa: 7.5,
      allowedBranches: ['CSE', 'IT', 'ECE'],
      maxBacklogs: 0,
      gradYears: [2025, 2026]
    },
    requiredSkills: ['Python', 'DSA', 'DBMS', 'OOP'],
    assessmentAreas: ['Online OA', 'Technical Interview 1', 'HR Round']
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [usrRes, crsRes, logRes, anaRes, cmpRes, enrRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/courses?status=all'),
        api.get('/admin/audit-logs'),
        api.get('/admin/analytics'),
        api.get('/companies'),
        api.get('/courses/admin/enrollments')
      ]);

      setUsers(usrRes.data.users || []);
      setCourses(crsRes.data.courses || []);
      setAuditLogs(logRes.data.logs || []);
      setAnalytics(anaRes.data.metrics || {});
      setCompanies(cmpRes.data.companies || []);
      setEnrollments(enrRes.data.enrollments || []);
    } catch (err) {
      console.error('Error fetching admin data', err);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setNotification(`Updated user role to ${newRole}`);
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Role update failed');
    }
  };

  const handleCourseStatus = async (courseId: string, status: string) => {
    try {
      await api.put(`/admin/courses/${courseId}/status`, { status });
      setNotification(`Course status set to ${status}`);
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Status update failed');
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/companies', newCompany);
      setShowCompanyModal(false);
      setNotification('Company profile and uploaded logo saved successfully!');
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create company');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-rose-400" />
            <span>Administrator Governance & Uploads Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Role-Based Access Control, media uploads, curriculum approvals, and security audit trail.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap bg-slate-900 border border-slate-800 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'analytics' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'users' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Users &amp; Roles ({users.length})
          </button>
          <button
            onClick={() => navigate('/admin/courses')}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-colors text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Course Management
            <ExternalLink className="w-3 h-3 opacity-60" />
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'courses' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Quick Approvals
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'companies' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Companies ({companies.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'audit' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Trail ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('enrollments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'enrollments' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' : 'text-slate-400 hover:text-white'
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

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500">Students</div>
              <div className="text-2xl font-extrabold text-white">{analytics?.totalStudents || 1}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500">Instructors</div>
              <div className="text-2xl font-extrabold text-amber-400">{analytics?.totalInstructors || 1}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500">Courses</div>
              <div className="text-2xl font-extrabold text-indigo-400">{courses.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500">Assessments</div>
              <div className="text-2xl font-extrabold text-emerald-400">{analytics?.totalAssessments || 4}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500">Coding Problems</div>
              <div className="text-2xl font-extrabold text-cyan-400">{analytics?.totalCodingProblems || 3}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500">Companies</div>
              <div className="text-2xl font-extrabold text-rose-400">{companies.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white">Registered Users & Role Assignment</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800 bg-slate-950/50">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4 text-right">Assign Role (RBAC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-850/50">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                      <img
                        src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=6366f1&color=fff&size=50`}
                        alt={u.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                        u.role === 'ADMIN' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                        u.role === 'INSTRUCTOR' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="INSTRUCTOR">INSTRUCTOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Course Approvals Tab */}
      {activeTab === 'courses' && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Quick Approval Queue</h2>
            <button
              onClick={() => navigate('/admin/courses')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Open Full Course Manager
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {courses.length === 0 && (
              <p className="text-slate-500 text-xs text-center py-8">No courses found. Use Course Management to create courses.</p>
            )}
            {courses.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={c.thumbnail} alt={c.title} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <div className="text-xs font-bold text-white">{c.title}</div>
                    <div className="text-[11px] text-slate-400">By: {c.instructorName} • {c.category}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-amber-400 mr-2 uppercase">{c.status}</span>
                  <button
                    onClick={() => handleCourseStatus(c.id, 'published')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                  >
                    Approve &amp; Publish
                  </button>
                  <button
                    onClick={() => handleCourseStatus(c.id, 'archived')}
                    className="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white text-xs font-bold border border-rose-500/30"
                  >
                    Reject / Archive
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Companies Tab with Logo File Upload */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-white">Managed Placement Companies</h2>
            <button
              onClick={() => setShowCompanyModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Company Drive Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((cmp) => (
              <div key={cmp.id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center">
                    <img src={cmp.logo} alt={cmp.name} className="max-h-7 max-w-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{cmp.name}</h3>
                    <div className="text-[10px] text-cyan-400">{cmp.industry}</div>
                  </div>
                </div>
                <div className="text-xs font-extrabold text-emerald-400">{cmp.salaryRange}</div>
                <div className="pt-2 flex justify-between text-[11px] text-slate-400 border-t border-slate-800">
                  <span>Min CGPA: {cmp.eligibility?.minCgpa}+</span>
                  <span>{cmp.requiredSkills?.length || 0} Skills Required</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white">System Security & Audit Trail</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800 bg-slate-950/50">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/50">
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 text-white font-bold">{log.userName} ({log.role})</td>
                    <td className="py-3 px-4 text-indigo-300 font-bold">{log.action}</td>
                    <td className="py-3 px-4 text-cyan-300">{log.resourceType}</td>
                    <td className="py-3 px-4 text-slate-400 font-sans text-xs">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enrollments Tab */}
      {activeTab === 'enrollments' && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Platform-Wide Enrollment Analytics</h2>
            <div className="flex items-center gap-3">
              <div className="text-[11px] text-slate-400 font-mono">{enrollments.length} total enrollments</div>
              <div className="text-[11px] font-bold text-emerald-400">
                {enrollments.filter(e => e.status === 'Completed').length} completed
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
              <div className="text-[10px] uppercase font-bold text-indigo-400 mb-1">Total Enrollments</div>
              <div className="text-xl font-extrabold text-white">{enrollments.length}</div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">Completed</div>
              <div className="text-xl font-extrabold text-white">{enrollments.filter(e => e.status === 'Completed').length}</div>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
              <div className="text-[10px] uppercase font-bold text-amber-400 mb-1">In Progress</div>
              <div className="text-xl font-extrabold text-white">{enrollments.filter(e => e.status === 'Enrolled').length}</div>
            </div>
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center">
              <div className="text-[10px] uppercase font-bold text-cyan-400 mb-1">Avg Progress</div>
              <div className="text-xl font-extrabold text-white">
                {enrollments.length > 0
                  ? Math.round(enrollments.reduce((sum, e) => sum + e.progressPercentage, 0) / enrollments.length)
                  : 0}%
              </div>
            </div>
          </div>

          {enrollments.length === 0 ? (
            <p className="text-slate-500 text-xs text-center py-10">No enrollments recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800 bg-slate-950/50">
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
                          <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[9px] font-extrabold shrink-0">
                            {e.studentName?.[0]?.toUpperCase()}
                          </div>
                          {e.studentName}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{e.studentEmail}</td>
                      <td className="py-3 px-4 text-indigo-300 font-medium max-w-[200px] truncate">{e.courseTitle}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-800 min-w-[60px]">
                            <div
                              className="h-1.5 rounded-full bg-rose-400 transition-all"
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

      {/* Add Company Modal with Logo Upload */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleCreateCompany} className="rounded-3xl bg-slate-900 border border-slate-800 p-6 max-w-xl w-full space-y-4 text-xs my-8">
            <h3 className="text-base font-bold text-white">Add Placement Company Profile</h3>
            
            <div className="space-y-1">
              <label className="text-slate-400">Company Name</label>
              <input
                type="text"
                required
                value={newCompany.name}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                placeholder="e.g. Uber / Atlassian"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400">Industry</label>
                <input
                  type="text"
                  value={newCompany.industry}
                  onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400">Salary Range</label>
                <input
                  type="text"
                  value={newCompany.salaryRange}
                  onChange={(e) => setNewCompany({ ...newCompany, salaryRange: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>

            {/* Logo File Upload */}
            <FileUpload
              label="Company Logo (Upload from Computer or URL)"
              accept="image/*"
              currentValue={newCompany.logo}
              onUploadComplete={(url) => {
                if (url) setNewCompany({ ...newCompany, logo: url });
              }}
            />

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCompanyModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold">Save Company</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
