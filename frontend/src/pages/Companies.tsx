import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Briefcase,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Target
} from 'lucide-react';

export const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const industries = ['All', 'Big Tech & Cloud', 'Enterprise Software & Cloud (Azure)', 'E-commerce & AWS Cloud', 'IT Services & Consulting', 'Investment Banking & FinTech'];

  useEffect(() => {
    fetchCompanies();
  }, [search, selectedIndustry]);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (selectedIndustry !== 'All') params.industry = selectedIndustry;
      if (search) params.search = search;

      const res = await api.get('/companies', { params });
      setCompanies(res.data.companies || []);
    } catch (err) {
      console.error('Error fetching companies', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Building2 className="w-7 h-7 text-cyan-400" />
          <span>Company-Wise Placement Preparation</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Targeted preparation roadmaps, configurable eligibility validation, salary tiers, and curated problem sets.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company name or required skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedIndustry === ind
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Companies Grid */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-400">Loading placement company profiles...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((cmp) => (
            <div
              key={cmp.id}
              className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white p-2 flex items-center justify-center shadow">
                    <img src={cmp.logo} alt={cmp.name} className="max-h-8 max-w-full object-contain" />
                  </div>
                  <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    {cmp.salaryRange}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {cmp.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {cmp.description}
                  </p>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cmp.requiredSkills?.slice(0, 4).map((skill: string) => (
                    <span
                      key={skill}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800"
                    >
                      {skill}
                    </span>
                  ))}
                  {cmp.requiredSkills?.length > 4 && (
                    <span className="text-[10px] text-slate-500 font-bold self-center">
                      +{cmp.requiredSkills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <Link
                  to={`/companies/${cmp.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors group-hover:border-cyan-500/40"
                >
                  <span>Check Eligibility & Prep Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
