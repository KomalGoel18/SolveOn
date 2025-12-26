// frontend/src/components/problems/ProblemDetailPage.tsx
import { useState, useEffect } from "react";
import { ArrowLeft, Play, Check, Upload, MessageSquare } from "lucide-react";
import { problemsAPI, submissionsAPI, testsAPI } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import CodeEditor from "./CodeEditor";
import TestResults from "./TestResults";
import DiscussionSection from "./DiscussionSection";
import { useParams, useNavigate } from "react-router-dom";

interface ProblemDetailPageProps {
  problem?: any;
  onBack?: () => void;
}

export default function ProblemDetailPage({ problem, onBack }: ProblemDetailPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"description" | "discussion">("description");
  const [language, setLanguage] = useState("javascript");
  const [fullProblem, setFullProblem] = useState<any>(problem ?? null);
  const [code, setCode] = useState("");
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();

  // --- Helper to fetch full problem from backend ---
  const fetchFullProblem = async (identifier?: string | number) => {
  setLoading(true);
  try {
    // Prefer explicit identifier, then URL :id, then known problemNumber
    const raw =
      identifier ??
      params.id ??
      problem?.problemNumber ??
      fullProblem?.problemNumber;

    if (raw == null) return;

    const num = Number(raw);
    if (Number.isNaN(num)) {
      console.error("Invalid problem number:", raw);
      return;
    }

    const fetched = await problemsAPI.getProblem(num); // 👈 calls /problems/:number
    const p = (fetched as any)?.problem ?? fetched;

    setFullProblem(p);
    setCode(p?.starterCode?.[language] || p?.starter_code?.[language] || "");
  } catch (err) {
    console.error("Error fetching problem details:", err);
  } finally {
    setLoading(false);
  }
};

  // --- Initial load: use prop if present, then fetch full details if needed ---
  useEffect(() => {
  (async () => {
    if (problem) {
      setFullProblem(problem);
      setCode(
        problem.starterCode?.[language] ||
          problem.starter_code?.[language] ||
          ""
      );

      if (!problem.description && !problem.statement && !problem.body) {
        await fetchFullProblem(problem.problemNumber);
      }
      return;
    }

    if (params.id) {
      await fetchFullProblem(params.id);  // "1", "2", "3", ...
    }
  })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [problem, params.id]);

  // --- Update code when language or fullProblem changes ---
  useEffect(() => {
    if (fullProblem) {
      setCode(
        fullProblem.starterCode?.[language] ||
          fullProblem.starter_code?.[language] ||
          ""
      );
    }
  }, [language, fullProblem]);

  const languages = [
    { id: "javascript", name: "JavaScript" },
    { id: "python", name: "Python" },
    { id: "java", name: "Java" },
    { id: "cpp", name: "C++" },
  ];

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(
      fullProblem?.starterCode?.[lang] ||
        fullProblem?.starter_code?.[lang] ||
        ""
    );
  };

  // --- inside ProblemDetailPage.tsx replace existing runTests with this ---
const runTests = async () => {
  setTestResults(null);

  if (!code.trim()) {
    setTestResults({ error: "Please write some code before running the tests." });
    return;
  }

  if (!fullProblem) {
    setTestResults({ error: "Problem not loaded yet." });
    return;
  }

  const idToSend = fullProblem._id ?? fullProblem.id ?? fullProblem.problemNumber;

  setIsRunning(true);
  try {
    const res = await testsAPI.runTests(idToSend, code, language);
    setTestResults(res);

    if (res.passed !== res.total) {
      setTestResults((prev: any) => ({
        ...(prev || {}),
        warning: "Some sample tests failed — you can still submit.",
      }));
    }
  } catch (err: any) {
    console.error("Error running tests:", err);
    setTestResults({ error: "Failed to run tests." });
  } finally {
    setIsRunning(false);
  }
};

  const handleSubmit = async () => {
  if (!user || !fullProblem) return;

  if (!code.trim()) {
  setTestResults({ error: "Please write code before submitting." });
  return;
}

  setIsSubmitting(true);
  try {
    const idToSend = fullProblem._id ?? fullProblem.id ?? fullProblem.problemNumber;
    console.debug("Submitting solution for", idToSend);

    // submitSolution should accept either problemId (mongo _id) or problemNumber depending on backend:
    const result = await submissionsAPI.submitSolution(idToSend, code, language);

    const submission = result?.submission ?? null;
    if (!submission) {
      // backend didn't return submission object
      setTestResults({
        ...(testResults || {}),
        error: result?.message || "Submission accepted by server but no result returned.",
      });
      return;
    }

    const verdict = String(submission.verdict || submission.status || "").toLowerCase();

    // Merge final verdict details into testResults
    setTestResults((prev: any) => ({
      ...(prev || {}),
      verdict: submission.verdict ?? submission.status,
      runtime: submission.executionTime ?? submission.runtime,
      memory: submission.memory,
      passed: submission.passed ?? prev?.passed ?? 0,
      total: submission.total ?? prev?.total ?? 0,
    }));

    // Optionally allow re-submission later only if verdict is not accepted
  } catch (error: any) {
    console.error("Error submitting solution:", error);
    setTestResults({
      ...(testResults || {}),
      error: error?.message || "Submit failed. Check server logs.",
    });
  } finally {
    setIsSubmitting(false);
  }
};

  // Prefer description, but fall back to other possible fields if backend uses them
  const descriptionText =
    fullProblem?.description ??
    fullProblem?.statement ??
    fullProblem?.body ??
    problem?.description ??
    problem?.statement ??
    "";

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              if (onBack) onBack();
              else navigate("/problems");
            }}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Problems</span>
          </button>

          <div className="flex items-center space-x-2">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleLanguageChange(lang.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  language === lang.id
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "bg-gray-800 text-gray-400 border border-gray-700 hover:text-white"
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="lg:w-1/2 border-r border-gray-800 overflow-y-auto">
          <div className="p-6">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-800 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-800 rounded w-1/4 mb-6"></div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-white mb-4">
                  {fullProblem?.title || problem?.title}
                </h1>

                <div className="flex items-center space-x-3 mb-6">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      (fullProblem?.difficulty || problem?.difficulty)?.toLowerCase() ===
                      "easy"
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : (fullProblem?.difficulty || problem?.difficulty)?.toLowerCase() ===
                          "medium"
                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {(fullProblem?.difficulty || problem?.difficulty || "MEDIUM").toUpperCase()}
                  </span>
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm border border-blue-500/20">
                    {fullProblem?.category || problem?.category || "General"}
                  </span>
                </div>
              </>
            )}

            <div className="flex space-x-1 mb-6 border-b border-gray-800">
              <button
                onClick={() => setActiveTab("description")}
                className={`px-4 py-3 font-medium transition-all ${
                  activeTab === "description"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("discussion")}
                className={`flex items-center space-x-2 px-4 py-3 font-medium transition-all ${
                  activeTab === "discussion"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Discussion</span>
              </button>
            </div>

            {activeTab === "description" ? (
              loading ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-32 bg-gray-800 rounded"></div>
                  <div className="h-24 bg-gray-800 rounded"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Problem Statement
                    </h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                      {descriptionText || "No description available"}
                    </p>
                  </div>

                  {((fullProblem?.examples || problem?.examples) &&
                    (fullProblem?.examples || problem?.examples).length > 0) && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Examples</h3>
                      {(fullProblem?.examples || problem?.examples).map(
                        (example: any, index: number) => (
                          <div
                            key={index}
                            className="bg-gray-800/50 rounded-lg p-4 mb-3 border border-gray-700"
                          >
                            <p className="text-gray-400 text-sm mb-2">
                              Example {index + 1}:
                            </p>
                            <div className="space-y-2">
                              <p className="text-white font-mono text-sm">
                                <span className="text-gray-400">Input:</span>{" "}
                                {example.input}
                              </p>
                              <p className="text-white font-mono text-sm">
                                <span className="text-gray-400">Output:</span>{" "}
                                {example.output}
                              </p>
                              {example.explanation && (
                                <p className="text-gray-300 text-sm">
                                  <span className="text-gray-400">Explanation:</span>{" "}
                                  {example.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {(fullProblem?.constraints || problem?.constraints) && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Constraints
                      </h3>
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <p className="text-gray-300 text-sm whitespace-pre-line">
                          {fullProblem?.constraints || problem?.constraints}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              <DiscussionSection
                problemId={fullProblem?._id || fullProblem?.id || problem?.id}
              />
            )}
          </div>
        </div>

        <div className="lg:w-1/2 flex flex-col">
  <div className="flex-1 flex flex-col">
    <CodeEditor code={code} setCode={setCode} language={language} />
    {testResults && <TestResults results={testResults} />}

    {testResults?.verdict && (
      <div
        className={`mx-4 mb-3 p-3 rounded-lg text-center font-semibold ${
          testResults.verdict === "Accepted"
            ? "bg-green-500/10 text-green-400 border border-green-500/20"
            : "bg-red-500/10 text-red-400 border border-red-500/20"
        }`}
      >
        Final Verdict: {testResults.verdict}
      </div>
    )}
  </div>

          <div className="bg-gray-900 border-t border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <button
                  onClick={runTests}
                  disabled={isRunning}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700"
                >
                  <Play className="w-4 h-4" />
                  <span className="font-medium">
                    {isRunning ? "Running..." : "Run Tests"}
                  </span>
                </button>

                <button
  onClick={handleSubmit}
  disabled={isSubmitting}
  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
>
                  <Upload className="w-4 h-4" />
                  <span>{isSubmitting ? "Submitting..." : "Submit"}</span>
                </button>
              </div>

              {testResults && (
                <div className="flex items-center space-x-2">
                  {testResults.passed === testResults.total ? (
                    <div className="flex items-center space-x-2 text-green-400">
                      <Check className="w-5 h-5" />
                      <span className="font-semibold">All tests passed!</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">
                      {testResults.passed}/{testResults.total} tests passed
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
