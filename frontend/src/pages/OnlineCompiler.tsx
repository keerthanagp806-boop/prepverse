import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import {
  Terminal,
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Layers,
  ChevronRight,
  Code2,
  FileCode,
  Sparkles,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const OnlineCompiler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const problemSlug = searchParams.get('problem');

  const [problems, setProblems] = useState<any[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [language, setLanguage] = useState<'python' | 'cpp' | 'java' | 'javascript'>('python');
  const [code, setCode] = useState<string>('');
  const [customInput, setCustomInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'problem' | 'submissions'>('problem');
  const [bottomTab, setBottomTab] = useState<'output' | 'customInput' | 'testcases'>('testcases');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch all problems
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await api.get('/coding/problems');
        const list = res.data.problems || [];
        setProblems(list);

        const target = problemSlug
          ? list.find((p: any) => p.slug === problemSlug || p.id === problemSlug)
          : list[0];

        if (target) {
          loadProblemDetails(target.id);
        }
      } catch (err) {
        console.error('Error loading problems', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, [problemSlug]);

  const loadProblemDetails = async (problemId: string) => {
    try {
      const [detailRes, subRes] = await Promise.all([
        api.get(`/coding/problems/${problemId}`),
        api.get(`/coding/submissions/me?problemId=${problemId}`)
      ]);

      const prob = detailRes.data.problem;
      setSelectedProblem(prob);
      setSubmissionsList(subRes.data.submissions || []);

      // Set starter code
      const starter = prob.starterCode?.[language] || '# Write code here\n';
      setCode(starter);

      // Default custom input from first example
      if (prob.examples?.[0]?.input) {
        setCustomInput(prob.examples[0].input);
      }
      setSubmissionResult(null);
      setOutput('');
    } catch (err) {
      console.error('Error fetching problem details', err);
    }
  };

  const handleLanguageChange = (newLang: 'python' | 'cpp' | 'java' | 'javascript') => {
    setLanguage(newLang);
    if (selectedProblem?.starterCode?.[newLang]) {
      setCode(selectedProblem.starterCode[newLang]);
    }
  };

  // Run against custom input
  const handleRunCode = async () => {
    setIsRunning(true);
    setBottomTab('output');
    setOutput('Running code in isolated sandbox...');
    try {
      const res = await api.post('/coding/run', {
        language,
        code,
        customInput
      });

      const r = res.data.result;
      if (r.error) {
        setOutput(`Runtime Error:\n${r.error}`);
      } else {
        setOutput(r.output || 'Program exited with no standard output.');
      }
    } catch (err: any) {
      setOutput(err.response?.data?.error || 'Execution failed.');
    } finally {
      setIsRunning(false);
    }
  };

  // Submit solution against all test cases
  const handleSubmitCode = async () => {
    if (!selectedProblem) return;
    setIsSubmitting(true);
    setBottomTab('testcases');
    try {
      const res = await api.post(`/coding/problems/${selectedProblem.id}/submit`, {
        language,
        code
      });

      const { submission, result } = res.data;
      setSubmissionResult(result);

      if (result.status === 'Accepted') {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 }
        });
      }

      // Refresh submissions
      const subRes = await api.get(`/coding/submissions/me?problemId=${selectedProblem.id}`);
      setSubmissionsList(subRes.data.submissions || []);
    } catch (err: any) {
      setOutput(err.response?.data?.error || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetToStarterCode = () => {
    if (!selectedProblem?.starterCode?.[language]) return;
    if (window.confirm('Reset your code to the default starter template? Your current code will be lost.')) {
      setCode(selectedProblem.starterCode[language]);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-400">Loading Online Compiler & Problems...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Header & Problem Dropdown Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Online Compiler & Practice Sandbox</span>
              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Multi-Lang
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Isolated execution environment with public & hidden test case evaluation.</p>
          </div>
        </div>

        {/* Problem Selector Dropdown */}
        <div className="flex items-center gap-3">
          <select
            value={selectedProblem?.id || ''}
            onChange={(e) => loadProblemDetails(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {problems.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.difficulty})
              </option>
            ))}
          </select>

          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-indigo-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="python">Python 3</option>
            <option value="cpp">C++ (GCC)</option>
            <option value="java">Java 17</option>
            <option value="javascript">JavaScript (Node.js)</option>
          </select>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[680px]">
        {/* Left Column: Problem Description / Submissions (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl flex flex-col justify-between overflow-hidden">
          {/* Tab buttons */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('problem')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'problem'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Problem Description
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'submissions'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Submissions ({submissionsList.length})
              </button>
            </div>

            {selectedProblem && (
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                selectedProblem.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' :
                selectedProblem.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                'bg-rose-500/20 text-rose-400'
              }`}>
                {selectedProblem.difficulty}
              </span>
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
            {activeTab === 'problem' && selectedProblem ? (
              <div className="space-y-4 text-slate-300">
                <h2 className="text-base font-bold text-white">{selectedProblem.title}</h2>
                <div className="text-[11px] text-slate-400 flex gap-4">
                  <span>Topic: <strong className="text-indigo-300">{selectedProblem.topic}</strong></span>
                  <span>Acceptance: <strong className="text-slate-200">{selectedProblem.acceptanceRate}%</strong></span>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="font-bold text-white text-xs">Description:</div>
                  <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                    {selectedProblem.description}
                  </p>
                </div>

                {/* Examples */}
                {selectedProblem.examples?.map((ex: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="font-bold text-slate-200 text-[11px]">Example {idx + 1}:</div>
                    <div className="text-slate-400"><strong className="text-slate-300">Input:</strong> {ex.input}</div>
                    <div className="text-slate-400"><strong className="text-slate-300">Output:</strong> {ex.output}</div>
                    {ex.explanation && <div className="text-slate-400"><strong className="text-slate-300">Explanation:</strong> {ex.explanation}</div>}
                  </div>
                ))}

                {/* Constraints */}
                {selectedProblem.constraints?.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="font-bold text-white text-xs">Constraints:</div>
                    <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                      {selectedProblem.constraints.map((c: string, idx: number) => (
                        <li key={idx} className="font-mono text-[11px]">{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              /* Submissions History */
              <div className="space-y-2">
                {submissionsList.length === 0 ? (
                  <p className="text-slate-500 text-center py-10">No submissions for this problem yet.</p>
                ) : (
                  submissionsList.map((sub: any) => (
                    <div key={sub.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className={`font-bold ${sub.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {sub.status}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {sub.language.toUpperCase()} • {sub.runtimeMs}ms • {sub.passedTestCases}/{sub.totalTestCases} Test Cases
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor & Output Console (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Monaco Editor Container */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl flex flex-col flex-1">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/90 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span>Solution Editor ({language})</span>
              </div>

              <button
                onClick={resetToStarterCode}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                title="Reset to starter template"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="h-[360px] w-full">
              <Editor
                height="100%"
                language={language === 'cpp' ? 'cpp' : language === 'python' ? 'python' : language === 'java' ? 'java' : 'javascript'}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  fontSize: 13,
                  fontFamily: "'Fira Code', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4
                }}
              />
            </div>

            {/* Run & Submit Toolbar */}
            <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sandbox Worker: Online</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 transition-colors disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-300" />
                  <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                </button>

                <button
                  onClick={handleSubmitCode}
                  disabled={isSubmitting || isRunning}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-102 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Evaluating...' : 'Submit Solution'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Panel: Output, Custom Input, Testcase Results */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 shadow-xl space-y-3 min-h-[180px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setBottomTab('testcases')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    bottomTab === 'testcases' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Test Case Results
                </button>
                <button
                  onClick={() => setBottomTab('customInput')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    bottomTab === 'customInput' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Custom Input
                </button>
                <button
                  onClick={() => setBottomTab('output')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    bottomTab === 'output' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Standard Output
                </button>
              </div>
            </div>

            {bottomTab === 'testcases' && (
              <div className="space-y-3 text-xs">
                {submissionResult ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex items-center gap-2">
                        {submissionResult.status === 'Accepted' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        )}
                        <div>
                          <div className={`text-sm font-bold ${submissionResult.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {submissionResult.status}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Passed {submissionResult.passedTestCases} of {submissionResult.totalTestCases} Test Cases
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-slate-400 font-mono">
                        <div>Runtime: <strong className="text-slate-200">{submissionResult.runtimeMs} ms</strong></div>
                        <div>Memory: <strong className="text-slate-200">{Math.round(submissionResult.memoryKb / 1024)} MB</strong></div>
                      </div>
                    </div>

                    {submissionResult.failedTestCase && (
                      <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-200 space-y-1">
                        {submissionResult.failedTestCase.isHidden ? (
                          <div className="text-[11px] font-semibold text-rose-300 flex items-center gap-2">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Some hidden test cases failed. Check your solution covers all edge cases.
                          </div>
                        ) : (
                          <>
                            <div className="font-bold text-[11px] text-rose-300">Failed Test Case Diff:</div>
                            <div className="text-[11px]">Input: <code>{submissionResult.failedTestCase.input}</code></div>
                            <div className="text-[11px]">Expected: <code>{submissionResult.failedTestCase.expectedOutput}</code></div>
                            <div className="text-[11px]">Actual Output: <code>{submissionResult.failedTestCase.actualOutput}</code></div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 text-slate-400">
                    <p>Public test cases available for validation:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedProblem?.testCases?.map((tc: any, i: number) => (
                        <div key={tc.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
                          <div className="font-bold text-slate-300">Case {i + 1}:</div>
                          <div className="truncate">Input: {tc.input}</div>
                          <div className="truncate">Output: {tc.expectedOutput}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {bottomTab === 'customInput' && (
              <div>
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter custom stdin input here..."
                  rows={4}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            )}

            {bottomTab === 'output' && (
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
                {output || 'No output recorded yet. Click "Run Code" to execute.'}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
