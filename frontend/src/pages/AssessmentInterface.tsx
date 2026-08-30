import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Clock,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const AssessmentInterface: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [questionRemainingSeconds, setQuestionRemainingSeconds] = useState<number>(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [isLoading, setIsLoading] = useState(true);

  const timerRef = useRef<any>(null);
  const questionTimerRef = useRef<any>(null);

  // 1. Fetch Attempt & Assessment on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get(`/assessments/attempts/${attemptId}/result`).catch(async () => {
          // If in progress, fetch from attempts history list to find this attempt
          const histRes = await api.get('/assessments/history/me');
          const myAtm = histRes.data.attempts?.find((a: any) => a.id === attemptId);
          if (!myAtm) throw new Error('Attempt not found');
          const asmRes = await api.get(`/assessments/${myAtm.assessmentId}`);
          return {
            data: {
              attempt: myAtm,
              assessment: asmRes.data.assessment
            }
          };
        });

        const atm = res.data.attempt;
        const asm = res.data.assessment || (await api.get(`/assessments/${atm.assessmentId}`)).data.assessment;

        setAttempt(atm);
        setAssessment(asm);
        setAnswers(atm.answers || {});
        setTabSwitchCount(atm.tabSwitchCount || 0);

        // Calculate authoritative server time remaining
        const serverEnd = new Date(atm.serverEndTime).getTime();
        const now = Date.now();
        const diffSeconds = Math.max(0, Math.floor((serverEnd - now) / 1000));
        setRemainingSeconds(diffSeconds);

        if (asm.timerMode === 'QUESTION') {
          const qLimit = asm.questions[0]?.timeLimitSeconds || asm.questionTimerSeconds || 45;
          setQuestionRemainingSeconds(qLimit);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Session load error', err);
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [attemptId]);

  // 2. Authoritative Overall Timer Countdown
  useEffect(() => {
    if (isLoading || !assessment) return;

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit('TIMEOUT');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading, assessment]);

  // 3. Question-Level Timer Countdown (If timerMode === 'QUESTION')
  useEffect(() => {
    if (isLoading || !assessment || assessment.timerMode !== 'QUESTION') return;

    const currentQ = assessment.questions[currentQIndex];
    const qDuration = currentQ?.timeLimitSeconds || assessment.questionTimerSeconds || 45;
    setQuestionRemainingSeconds(qDuration);

    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    questionTimerRef.current = setInterval(() => {
      setQuestionRemainingSeconds((prev) => {
        if (prev <= 1) {
          // Move to next question automatically
          if (currentQIndex < assessment.questions.length - 1) {
            setCurrentQIndex((idx) => idx + 1);
          } else {
            handleAutoSubmit('TIMEOUT');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [currentQIndex, isLoading, assessment]);

  // 4. Tab-Switch & Visibility Monitoring (Assessment Integrity)
  useEffect(() => {
    if (isLoading || !attemptId || !assessment) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        handleViolation('Tab Switch / Page Hidden Detected');
      }
    };

    const handleBlur = () => {
      handleViolation('Window Lost Focus Detected');
    };

    const handleViolation = async (details: string) => {
      try {
        const res = await api.post(`/assessments/attempts/${attemptId}/integrity-event`, {
          type: 'TAB_SWITCH',
          details
        });

        const newCount = res.data.tabSwitchCount;
        setTabSwitchCount(newCount);

        const limit = res.data.tabSwitchLimit || 3;

        if (res.data.isTerminated) {
          setWarningMessage(`Assessment terminated due to exceeding tab-switch limit (${newCount}/${limit}).`);
          setShowWarningModal(true);
          setTimeout(() => {
            navigate(`/assessments/attempts/${attemptId}/result`);
          }, 3000);
        } else {
          setWarningMessage(`You have left the assessment window. Please return to the assessment. Warning: ${newCount}/${limit}`);
          setShowWarningModal(true);
        }
      } catch (err) {
        console.error('Failed to log integrity event', err);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isLoading, attemptId, assessment]);

  // 5. Save answer on selection
  const handleSelectOption = async (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    setSaveStatus('saving');

    try {
      await api.post(`/assessments/attempts/${attemptId}/save-answer`, {
        questionId,
        selectedOptionIndex: optionIndex
      });
      setSaveStatus('saved');
    } catch (err) {
      console.error('Error saving answer', err);
    }
  };

  // 6. Submit Assessment (Manual or Automatic)
  const handleAutoSubmit = async (reason: 'USER_SUBMIT' | 'TIMEOUT' = 'USER_SUBMIT') => {
    setIsSubmitting(true);
    try {
      await api.post(`/assessments/attempts/${attemptId}/submit`, { reason });
      navigate(`/assessments/attempts/${attemptId}/result`);
    } catch (err) {
      console.error('Submit error', err);
      navigate(`/assessments/attempts/${attemptId}/result`);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-24">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-400 font-medium">Securing assessment environment...</p>
      </div>
    );
  }

  if (!assessment || !assessment.questions || assessment.questions.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-slate-400">Assessment questions unavailable.</p>
      </div>
    );
  }

  const currentQ = assessment.questions[currentQIndex];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = assessment.questions.length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none animate-in fade-in duration-200">
      {/* Top Exam Status Bar */}
      <div className="sticky top-16 z-30 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-800 p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exam Title</div>
          <div className="text-sm font-bold text-white max-w-sm truncate">{assessment.title}</div>
        </div>

        {/* Timers & Integrity Alerts */}
        <div className="flex items-center gap-3">
          {/* Question Level Timer (if enabled) */}
          {assessment.timerMode === 'QUESTION' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <Clock className="w-4 h-4 animate-spin" />
              <div className="text-xs font-bold font-mono">
                Q-Time: {questionRemainingSeconds}s
              </div>
            </div>
          )}

          {/* Overall Countdown Timer */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-extrabold border ${
            remainingSeconds < 300
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
              : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
          }`}>
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Time Left: {formatTime(remainingSeconds)}</span>
          </div>

          {/* Tab Switch Penalty Monitor */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400">Warnings:</span>
            <span className="font-bold text-rose-400">{tabSwitchCount}/{assessment.tabSwitchLimit}</span>
          </div>
        </div>
      </div>

      {/* Main Examination Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Area (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Header: Question Number & Marks */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                  Question {currentQIndex + 1} of {totalQuestions}
                </span>
                <span className="text-[11px] text-slate-400">({currentQ.marks} Marks)</span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className={saveStatus === 'saved' ? 'text-emerald-400' : 'text-amber-400'}>
                  {saveStatus === 'saved' ? '✓ Auto-Saved' : 'Saving...'}
                </span>
                <button
                  onClick={() => setMarkedForReview({ ...markedForReview, [currentQ.id]: !markedForReview[currentQ.id] })}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    markedForReview[currentQ.id]
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{markedForReview[currentQ.id] ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentQ.questionText}
              </h2>

              {currentQ.codeSnippet && (
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
                  <code>{currentQ.codeSnippet}</code>
                </pre>
              )}
            </div>

            {/* Answer Options Radio Grid */}
            <div className="space-y-3 pt-2">
              {currentQ.options?.map((option: string, optIdx: number) => {
                const isSelected = answers[currentQ.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ.id, optIdx)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                        : 'bg-slate-950/60 border-slate-800/90 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-slate-700 text-slate-400'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span>{option}</span>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Navigation Controls */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <button
              onClick={() => setCurrentQIndex((i) => Math.max(0, i - 1))}
              disabled={currentQIndex === 0}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                currentQIndex === 0
                  ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-3">
              {currentQIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentQIndex((i) => Math.min(totalQuestions - 1, i + 1))}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
                >
                  <span>Save & Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Exam</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Palette: Question Grid (1 col) */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Question Palette</span>
              <span className="text-xs font-bold text-indigo-400">{answeredCount}/{totalQuestions} Answered</span>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-800 inline-block"></span>
                <span>Unanswered ({totalQuestions - answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                <span>Review ({Object.keys(markedForReview).filter(k => markedForReview[k]).length})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"></span>
                <span>Current</span>
              </div>
            </div>

            {/* Palette Buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-2">
              {assessment.questions.map((q: any, idx: number) => {
                const isCurrent = currentQIndex === idx;
                const isAns = answers[q.id] !== undefined;
                const isMarked = markedForReview[q.id];

                let bgClass = 'bg-slate-950 text-slate-400 border border-slate-800';
                if (isAns) bgClass = 'bg-emerald-600 text-white font-bold';
                if (isMarked) bgClass = 'bg-amber-600 text-white font-bold ring-2 ring-amber-400';
                if (isCurrent) bgClass = 'bg-indigo-600 text-white font-extrabold ring-2 ring-indigo-400';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQIndex(idx)}
                    className={`h-10 rounded-xl text-xs flex items-center justify-center transition-all ${bgClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Submit CTA */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full mt-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Finish & Submit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab-Switch Warning Modal (Assessment Integrity Alert) */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-3xl bg-slate-900 border border-rose-500/40 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Assessment Warning</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {warningMessage}
            </p>
            <p className="text-[11px] text-slate-500">
              Please stay focused on this window. Further violations will cause immediate assessment forfeiture.
            </p>
            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
            >
              I Understand & Return to Exam
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-white">Submit Assessment?</h3>
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <div>
                <div className="text-slate-400">Answered</div>
                <div className="text-base font-bold text-emerald-400">{answeredCount}</div>
              </div>
              <div>
                <div className="text-slate-400">Unanswered</div>
                <div className="text-base font-bold text-amber-400">{totalQuestions - answeredCount}</div>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Are you sure you want to end this attempt and view your evaluated results?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold"
              >
                Continue Test
              </button>
              <button
                onClick={() => handleAutoSubmit('USER_SUBMIT')}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30"
              >
                {isSubmitting ? 'Evaluating...' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
