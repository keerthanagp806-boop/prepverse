import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  Camera,
  Loader2,
  AlertCircle,
  Upload
} from 'lucide-react';

const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_AVATAR_SIZE_MB = 5;

export const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [branch, setBranch] = useState(user?.branch || 'Computer Science & Engineering');
  const [graduationYear, setGraduationYear] = useState(user?.graduationYear || 2026);
  const [cgpa, setCgpa] = useState(user?.cgpa || 8.7);
  const [skillsText, setSkillsText] = useState(user?.skills?.join(', ') || 'Python, C++, DSA, SQL, DBMS');

  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Only JPEG, PNG, or WebP images are allowed.');
      return;
    }
    // Validate size
    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      setAvatarError(`Image must be smaller than ${MAX_AVATAR_SIZE_MB} MB.`);
      return;
    }

    setAvatarError('');
    setAvatarSuccess(false);

    // Show preview immediately using data URL
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to backend
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const uploadedUrl: string = uploadRes.data.file?.url || uploadRes.data.url;
      // Persist avatar URL to user profile in backend
      await updateProfile({ avatar: uploadedUrl });
      // Clear the local blob preview — user.avatar (from context) is now the truth
      setAvatarPreview(null);
      setAvatarSuccess(true);
      setTimeout(() => setAvatarSuccess(false), 3000);
    } catch (err: any) {
      setAvatarError(err.response?.data?.error || 'Avatar upload failed. Please try again.');
      setAvatarPreview(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    try {
      const skills = skillsText.split(',').map((s) => s.trim()).filter(Boolean);
      await updateProfile({
        name,
        email,
        branch,
        graduationYear: Number(graduationYear),
        cgpa: Number(cgpa),
        skills,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      setSaveError(err.response?.data?.error || 'Failed to save profile changes.');
    }
  };

  const currentAvatar = avatarPreview || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&size=128`;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <SettingsIcon className="w-7 h-7 text-indigo-400" />
          <span>Profile &amp; Academic Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Keep your academic information and placement profile accurate for company eligibility calculation.
        </p>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile updated and placement readiness recalculated!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{saveError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">

        {/* Avatar Section */}
        <div className="flex items-center gap-5 pb-6 border-b border-slate-800">
          <div className="relative group shrink-0">
            <img
              src={currentAvatar}
              alt="Avatar"
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500/50"
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
              title="Upload profile photo"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="flex-1 space-y-1">
            <h2 className="text-base font-bold text-white">{user?.name}</h2>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-block">
              {user?.role}
            </span>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
              >
                <Upload className="w-3 h-3" />
                {isUploading ? 'Uploading...' : 'Change Profile Photo'}
              </button>
              {avatarSuccess && (
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  Photo updated successfully!
                </div>
              )}
              {avatarError && (
                <div className="flex items-center gap-1 text-[11px] text-rose-400 mt-0.5">
                  <AlertCircle className="w-3 h-3" />
                  {avatarError}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="your@email.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Engineering Branch</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Graduation Year</label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Current CGPA (out of 10.0)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={cgpa}
                onChange={(e) => setCgpa(Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Technical Skills (Comma Separated)</label>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Python, C++, Java, DSA, DBMS, System Design"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
