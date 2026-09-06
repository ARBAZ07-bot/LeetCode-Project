import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient"
import SubmissionHistory from "../components/SubmissionHistory"
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import ThemeToggle from '../components/ThemeToggle';
import {
  FileText, Video, Lightbulb, History, Bot,
  Play, Send, CheckCircle2, XCircle, Clock, MemoryStick
} from 'lucide-react';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript'
};


const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  let { problemId } = useParams();



  const { handleSubmit } = useForm();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {

        const response = await axiosClient.get(`/problem/problemById/${problemId}`);

        const matchedStartCode = response.data.startCode.find(
          sc => sc.language === langMap[selectedLanguage]
        );
        const initialCode = matchedStartCode ? matchedStartCode.initialCode : '';

        setProblem(response.data);

        setCode(initialCode);
        setLoading(false);

      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Update code when language changes
  useEffect(() => {
    if (problem) {
      const matchedStartCode = problem.startCode.find(
        sc => sc.language === langMap[selectedLanguage]
      );
      setCode(matchedStartCode ? matchedStartCode.initialCode : '');
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);

    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });

      setRunResult(response.data);
      setLoading(false);
      setActiveRightTab('testcase');

    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: 'Internal server error'
      });
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);

    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });

      setSubmitResult(response.data);
      setLoading(false);
      setActiveRightTab('result');

    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult(null);
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'badge-success';
      case 'medium': return 'badge-warning';
      case 'hard': return 'badge-error';
      default: return 'badge-neutral';
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const leftTabs = [
    { id: 'description', label: 'Description', icon: FileText },
    { id: 'editorial', label: 'Editorial', icon: Video },
    { id: 'solutions', label: 'Solutions', icon: Lightbulb },
    { id: 'submissions', label: 'Submissions', icon: History },
    { id: 'chatAI', label: 'ChatAI', icon: Bot },
  ];

  return (
    <div className="h-screen flex flex-col bg-base-100">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-base-300 bg-base-100">
        <span className="font-semibold text-sm text-base-content/70">
          {problem?.title || 'Loading...'}
        </span>
        <ThemeToggle />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-1/2 flex flex-col border-r border-base-300">
          {/* Left Tabs */}
          <div className="tabs tabs-bordered bg-base-200 px-4 flex-nowrap overflow-x-auto">
            {leftTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`tab gap-1.5 ${activeLeftTab === id ? 'tab-active' : ''}`}
                onClick={() => setActiveLeftTab(id)}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* Left Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {problem && (
              <>
                {activeLeftTab === 'description' && (
                  <div>
                    <div className="flex items-center gap-2 mb-6 flex-wrap">
                      <h1 className="text-2xl font-bold">{problem.title}</h1>
                      <div className={`badge ${getDifficultyBadge(problem.difficulty)}`}>
                        {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                      </div>
                      {problem.tags?.map((tag, i) => (
                        <div key={i} className="badge badge-outline">{tag}</div>
                      ))}
                    </div>

                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-base-content/90">
                        {problem.description}
                      </div>
                    </div>

                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Examples</h3>
                      <div className="space-y-3">
                        {problem.visibleTestCases.map((example, index) => (
                          <div key={index} className="bg-base-200 border border-base-300 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 text-sm text-base-content/70">Example {index + 1}</h4>
                            <div className="space-y-1.5 text-sm font-mono">
                              <div><span className="text-base-content/60">Input:</span> {example.input}</div>
                              <div><span className="text-base-content/60">Output:</span> {example.output}</div>
                              <div><span className="text-base-content/60">Explanation:</span> {example.explanation}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeLeftTab === 'editorial' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Editorial</h2>
                    <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration} />
                  </div>
                )}

                {activeLeftTab === 'solutions' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Solutions</h2>
                    <div className="space-y-4">
                      {problem.referenceSolution?.map((solution, index) => (
                        <div key={index} className="border border-base-300 rounded-lg overflow-hidden">
                          <div className="bg-base-200 px-4 py-2">
                            <h3 className="font-semibold text-sm">{problem?.title} — {solution?.language}</h3>
                          </div>
                          <pre className="bg-base-300 p-4 text-sm overflow-x-auto">
                            <code>{solution?.completeCode}</code>
                          </pre>
                        </div>
                      )) || <p className="text-base-content/60">Solutions will be available after you solve the problem.</p>}
                    </div>
                  </div>
                )}

                {activeLeftTab === 'submissions' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">My Submissions</h2>
                    <SubmissionHistory problemId={problemId} />
                  </div>
                )}

                {activeLeftTab === 'chatAI' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Chat with AI</h2>
                    <ChatAi problem={problem}></ChatAi>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 flex flex-col">
          {/* Right Tabs */}
          <div className="tabs tabs-bordered bg-base-200 px-4">
            <button
              className={`tab ${activeRightTab === 'code' ? 'tab-active' : ''}`}
              onClick={() => setActiveRightTab('code')}
            >
              Code
            </button>
            <button
              className={`tab ${activeRightTab === 'testcase' ? 'tab-active' : ''}`}
              onClick={() => setActiveRightTab('testcase')}
            >
              Testcase
            </button>
            <button
              className={`tab ${activeRightTab === 'result' ? 'tab-active' : ''}`}
              onClick={() => setActiveRightTab('result')}
            >
              Result
            </button>
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeRightTab === 'code' && (
              <div className="flex-1 flex flex-col">
                {/* Language Selector */}
                <div className="flex justify-between items-center p-3 border-b border-base-300">
                  <div className="flex gap-2">
                    {['javascript', 'java', 'cpp'].map((lang) => (
                      <button
                        key={lang}
                        className={`btn btn-sm ${selectedLanguage === lang ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => handleLanguageChange(lang)}
                      >
                        {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monaco Editor */}
                <div className="flex-1">
                  <Editor
                    height="100%"
                    language={getLanguageForMonaco(selectedLanguage)}
                    value={code}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                      wordWrap: 'on',
                      lineNumbers: 'on',
                      glyphMargin: false,
                      folding: true,
                      lineDecorationsWidth: 10,
                      lineNumbersMinChars: 3,
                      renderLineHighlight: 'line',
                      selectOnLineNumbers: true,
                      roundedSelection: false,
                      readOnly: false,
                      cursorStyle: 'line',
                      mouseWheelZoom: true,
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="p-3 border-t border-base-300 flex justify-end gap-2">
                  <button
                    className="btn btn-outline btn-sm gap-1.5"
                    onClick={handleRun}
                    disabled={loading}
                  >
                    {loading ? <span className="loading loading-spinner loading-xs"></span> : <Play size={15} />}
                    Run
                  </button>
                  <button
                    className="btn btn-primary btn-sm gap-1.5"
                    onClick={handleSubmitCode}
                    disabled={loading}
                  >
                    {loading ? <span className="loading loading-spinner loading-xs"></span> : <Send size={15} />}
                    Submit
                  </button>
                </div>
              </div>
            )}

            {activeRightTab === 'testcase' && (
              <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="font-semibold mb-4">Test Results</h3>
                {runResult ? (
                  <div>
                    {runResult.success ? (
                      <div className="alert alert-success mb-4">
                        <CheckCircle2 size={20} />
                        <div>
                          <h4 className="font-bold">All test cases passed!</h4>
                          <div className="flex gap-4 text-sm mt-1">
                            <span className="flex items-center gap-1"><Clock size={13} /> {runResult.runtime} sec</span>
                            <span className="flex items-center gap-1"><MemoryStick size={13} /> {runResult.memory} KB</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="alert alert-error mb-4">
                        <XCircle size={20} />
                        <h4 className="font-bold">Some test cases failed</h4>
                      </div>
                    )}

                    <div className="space-y-2">
                      {(runResult.testCases || []).map((tc, i) => (
                        <div key={i} className="bg-base-200 border border-base-300 p-3 rounded-lg text-xs">
                          <div className="font-mono space-y-1">
                            <div><span className="text-base-content/60">Input:</span> {tc.stdin}</div>
                            <div><span className="text-base-content/60">Expected:</span> {tc.expected_output}</div>
                            <div><span className="text-base-content/60">Output:</span> {tc.stdout}</div>
                            <div className={`flex items-center gap-1 font-semibold ${tc.status_id == 3 ? 'text-success' : 'text-error'}`}>
                              {tc.status_id == 3 ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                              {tc.status_id == 3 ? 'Passed' : 'Failed'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-base-content/50 text-sm">
                    Click "Run" to test your code with the example test cases.
                  </div>
                )}
              </div>
            )}

            {activeRightTab === 'result' && (
              <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="font-semibold mb-4">Submission Result</h3>
                {submitResult ? (
                  <div className={`alert ${submitResult.accepted ? 'alert-success' : 'alert-error'}`}>
                    {submitResult.accepted ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                    <div>
                      {submitResult.accepted ? (
                        <>
                          <h4 className="font-bold text-lg">Accepted</h4>
                          <div className="mt-2 space-y-1 text-sm">
                            <p>Test Cases: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                            <p className="flex items-center gap-1"><Clock size={13} /> {submitResult.runtime} sec</p>
                            <p className="flex items-center gap-1"><MemoryStick size={13} /> {submitResult.memory} KB</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <h4 className="font-bold text-lg">{submitResult.error || 'Not Accepted'}</h4>
                          <p className="text-sm mt-1">Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-base-content/50 text-sm">
                    Click "Submit" to submit your solution for evaluation.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;