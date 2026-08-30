import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';

export const AssessmentInstructions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<any>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await api.get(`/assessments/${id}`);
        setAssessment(res.data.assessment);
      } catch (err) {
        console.error('Error fetching assessment info', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssessment();
  }, [id]);

  const handleStart = async () => {
    if (!acknowledged) return;
    setIsStarting(true);
    setErrorMsg('');
    try {
      const res = await api.post(`/assessments/${id}/start`);
      const attemptId = res.data.attempt.id;
      navigate(`/assessments/take/${attemptId}`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to start assessment');
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-400">Loading instructions...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-slate-400">Assessment not found.</p>
        <Link to="/assessments" className="text-xs text-indigo-400 mt-2 inline-block">Back</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Link
        to="/assessments"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Assessments</span>
      </Link>

      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-2">
            <span>Mandatory Examination Instructions</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {assessment.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">{assessment.description}</p>
        </div>

        {/* Assessment Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500">Duration</div>
            <div className="text-sm font-extrabold text-white mt-0.5">
              {assessment.timerMode === 'QUESTION' ? `${assessment.questionTimerSeconds}s/Q` : `${assessment.durationMinutes} mins`}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500">Questions</div>
            <div className="text-sm font-extrabold text-white mt-0.5">
              {assessment.questions?.length || 0} Total
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500">Passing Score</div>
            <div className="text-sm font-extrabold text-emerald-400 mt-0.5">
              {assessment.passingScorePercentage}%
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500">Violations Limit</div>
            <div className="text-sm font-extrabold text-rose-400 mt-0.5">
              {assessment.tabSwitchLimit} Tab Switches
            </div>
          </div>
        </div>

        {/* Rules and Disclosures */}
        <div className="space-y-3 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
          <div className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Candidate Examination Rules</span>
          </div>

          <ul className="space-y-2 text-slate-300 list-disc list-inside">
            <li><strong>Server-Authoritative Timer:</strong> The countdown starts immediately when you click <em>Start Assessment</em> and is authoritative on the server.</li>
            <li><strong>Auto-Save Protection:</strong> Your answers are saved continuously as you pick options.</li>
            <li><strong>Assessment Integrity Monitoring:</strong> Switching browser tabs, minimizing the browser, or clicking outside the window triggers an immediate integrity penalty warning. At {assessment.tabSwitchLimit} violations, your assessment is automatically terminated and submitted.</li>
            <li><strong>Automatic Submission:</strong> When time expires, your exam is auto-submitted automatically.</li>
            <li>Do not reload the browser page unnecessarily. If network disconnects temporarily, re-opening will resume from the remaining server time.</li>
          </ul>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Acknowledgment & Start CTA */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs text-slate-300">
              I have read, understood, and agree to adhere strictly to all the examination rules and anti-cheating tab-switch policies mentioned above.
            </span>
          </label>

          <div className="flex items-center justify-between gap-4">
            <Link
              to="/assessments"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition-colors"
            >
              Cancel
            </Link>

            <button
              onClick={handleStart}
              disabled={!acknowledged || isStarting}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all ${
                acknowledged && !isStarting
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:scale-105'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isStarting ? 'Initiating Exam Session...' : 'Start Assessment'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
