import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Award,
  BookOpen,
  Code2,
  FileText,
  ChevronLeft,
  Briefcase,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [companyData, setCompanyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get(`/companies/${id}`);
        setCompanyData(res.data);
      } catch (err) {
        console.error('Error fetching company details', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-400">Loading company preparation profile & eligibility...</p>
      </div>
    );
  }

  if (!companyData || !companyData.company) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-sm text-slate-400">Company profile not found.</p>
        <Link to="/companies" className="text-xs text-cyan-400">Back to Companies</Link>
      </div>
    );
  }

  const { company, eligibilityStatus, curatedProblems } = companyData;
  const isEligible = eligibilityStatus?.isEligible;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      <Link
        to="/companies"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Companies</span>
      </Link>

      {/* Hero Card */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white p-3 flex items-center justify-center shadow-lg">
              <img src={company.logo} alt={company.name} className="max-h-10 max-w-full object-contain" />
            </div>
            <div>
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{company.industry}</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{company.name}</h1>
              <p className="text-xs text-slate-400 mt-1">{company.salaryRange}</p>
            </div>
          </div>

          {/* Real-time Dynamic Eligibility Badge (Requirement 18) */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
            isEligible
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
          }`}>
            {isEligible ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <AlertTriangle className="w-6 h-6 text-rose-400" />}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">Candidate Status</div>
              <div className="text-sm font-extrabold">
                {isEligible ? 'Eligible for Campus Drive' : 'Criteria Not Yet Met'}
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility Criteria Breakdown */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Configured Eligibility Criteria & Your Match
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] text-slate-500">Min CGPA Required</div>
              <div className="text-sm font-bold text-white mt-0.5">{company.eligibility?.minCgpa || 7.0}+</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] text-slate-500">Allowed Branches</div>
              <div className="text-xs font-bold text-white mt-0.5">{company.eligibility?.allowedBranches?.join(', ')}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] text-slate-500">Max Backlogs Allowed</div>
              <div className="text-sm font-bold text-white mt-0.5">{company.eligibility?.maxBacklogs || 0} Backlogs</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] text-slate-500">Eligible Batches</div>
              <div className="text-sm font-bold text-white mt-0.5">{company.eligibility?.gradYears?.join(', ')}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="font-bold text-slate-300">Automated Audit Analysis:</span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              {eligibilityStatus?.reasons?.map((reason: string, i: number) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Preparation Roadmaps & Assessment Rounds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessment & Interview Rounds */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <span>Hiring Rounds & Assessment Areas</span>
          </div>

          <div className="space-y-2.5">
            {company.assessmentAreas?.map((area: string, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                  R{idx + 1}
                </span>
                <span className="text-slate-200 font-medium">{area}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Preparation Modules */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Strategic Preparation Modules</span>
          </div>

          <div className="space-y-3">
            {company.preparationModules?.map((mod: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
                <div className="font-bold text-cyan-300">{mod.category}</div>
                <p className="text-slate-400 leading-relaxed text-[11px]">{mod.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Curated Coding Questions for this Company */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>Curated Coding Questions for {company.name}</span>
          </div>
          <span className="text-xs text-slate-400">{curatedProblems?.length || 0} Targeted Problems</span>
        </div>

        {curatedProblems?.length === 0 ? (
          <p className="text-xs text-slate-500">No targeted coding problems linked yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {curatedProblems.map((prob: any) => (
              <div
                key={prob.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-white">{prob.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {prob.topic} • <span className="font-bold text-emerald-400">{prob.difficulty}</span>
                  </div>
                </div>

                <Link
                  to={`/compiler?problem=${prob.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                >
                  <span>Solve</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
