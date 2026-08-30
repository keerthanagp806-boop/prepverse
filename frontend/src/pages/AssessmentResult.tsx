import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  HelpCircle,
  RotateCcw,
  BookOpen,
  ChevronLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const AssessmentResult: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [resultData, setResultData] = useState<any>(null);
  const [expandedQId, setExpandedQId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/assessments/attempts/${attemptId}/result`);
        setResultData(res.data);

        // Confetti explosion if passed
        if (res.data?.attempt?.passed) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } catch (err) {
        console.error('Error fetching result', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-400">Evaluating answers and computing readiness metrics...</p>
      </div>
    );
  }

  if (!resultData || !resultData.attempt) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-sm text-slate-400">Assessment attempt result unavailable.</p>
        <Link to="/assessments" className="text-xs text-indigo-400">Back to Assessments</Link>
      </div>
    );
  }

  const { attempt, assessmentTitle, passingScorePercentage, questionReview } = resultData;
  const isPassed = attempt.passed;
  const isTerminated = attempt.status === 'TERMINATED_VIOLATION';

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <Link
        to="/assessments"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Assessments</span>
      </Link>

      {/* Score Summary Card */}
      <div className={`rounded-3xl border p-6 sm:p-8 shadow-2xl space-y-6 ${
        isTerminated
          ? 'bg-rose-950/20 border-rose-500/40'
          : isPassed
          ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border-emerald-500/30'
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Assessment Performance Report
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              {assessmentTitle}
            </h1>
          </div>

          <div className="text-right">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold border ${
              isTerminated
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : isPassed
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              {isTerminated ? <ShieldAlert className="w-4 h-4" /> : isPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span>{isTerminated ? 'TERMINATED (INTEGRITY VIOLATION)' : isPassed ? 'PASSED (BENCHMARK MET)' : 'NEEDS PRACTICE'}</span>
            </span>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400">Total Score</div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {attempt.score} <span className="text-xs text-slate-500">/ {attempt.totalPossibleScore}</span>
            </div>
            <div className="text-xs font-bold text-indigo-400 mt-0.5">{attempt.percentage}%</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400">Accuracy</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              {attempt.correctAnswersCount} <span className="text-xs text-slate-500">/ {questionReview?.length}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{attempt.incorrectAnswersCount} Incorrect</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400">Time Spent</div>
            <div className="text-lg font-extrabold text-cyan-400 mt-2 font-mono">
              {formatSeconds(attempt.timeSpentSeconds || 0)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400">Tab Switches</div>
            <div className={`text-2xl font-extrabold mt-1 ${attempt.tabSwitchCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {attempt.tabSwitchCount || 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Integrity Logged</div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <Link
            to="/assessments"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Another Test</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-colors"
          >
            <Award className="w-4 h-4" />
            <span>View Updated Placement Readiness</span>
          </Link>
        </div>
      </div>

      {/* Question-By-Question Detailed Solutions Review */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">Detailed Solutions & Explanations</h2>
          <p className="text-xs text-slate-400">Review your choices against verified answer keys and detailed reasoning.</p>
        </div>

        <div className="space-y-4">
          {questionReview?.map((q: any, idx: number) => {
            const isOpen = expandedQId === q.id;
            const isAnsCorrect = q.isCorrect;
            const isUnanswered = q.studentAnswer === null || q.studentAnswer === undefined;

            return (
              <div
                key={q.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isAnsCorrect
                    ? 'bg-emerald-950/10 border-emerald-500/30'
                    : isUnanswered
                    ? 'bg-slate-950/60 border-slate-800'
                    : 'bg-rose-950/10 border-rose-500/30'
                }`}
              >
                <button
                  onClick={() => setExpandedQId(isOpen ? null : q.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isAnsCorrect
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isUnanswered
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {isAnsCorrect ? <CheckCircle2 className="w-4 h-4" /> : isUnanswered ? <HelpCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        Q{idx + 1}: {q.questionText}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Topic: <strong className="text-indigo-300">{q.topic}</strong> • {q.marks} Marks
                      </div>
                    </div>
                  </div>

                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="p-4 pt-0 border-t border-slate-800/60 space-y-4 mt-2">
                    {/* Options List */}
                    <div className="space-y-2 pt-2">
                      {q.options?.map((opt: string, optIdx: number) => {
                        const isCorrectOption = optIdx === q.correctIndex;
                        const isStudentChoice = optIdx === q.studentAnswer;

                        let optClass = 'bg-slate-950/60 border-slate-800 text-slate-400';
                        if (isCorrectOption) optClass = 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300 font-bold';
                        else if (isStudentChoice) optClass = 'bg-rose-600/20 border-rose-500/50 text-rose-300 line-through';

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optClass}`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px]">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </div>

                            <div className="text-[10px] font-bold">
                              {isCorrectOption && <span className="text-emerald-400">✓ Correct Answer</span>}
                              {isStudentChoice && !isCorrectOption && <span className="text-rose-400">Your Choice</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1">
                      <div className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">Explanation</div>
                      <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
