
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Circle,
  Clock3,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

const API_URL = "http://127.0.0.1:8000";

interface Career {
  id: number;
  title: string;
  description?: string;
  required_skills?: string[];
}

interface InterviewQuestion {
  id: number;
  question: string;
  expected_answer: string;
  user_answer: string;
  score: number;
  feedback: string;
}

interface Interview {
  id: number;
  career: number;
  career_title: string;
  score: number;
  total_questions: number;
  completed: boolean;
  created_at: string;
  questions: InterviewQuestion[];
}

interface LocationState {
  career?: Career;
}

const getToken = () => localStorage.getItem("access_token");

export default function MockInterview() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as LocationState | null;
  const selectedCareer = state?.career;

  const [interview, setInterview] = useState<Interview | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = interview?.questions?.[currentIndex];

  const answeredCount = useMemo(() => {
    if (!interview) return 0;

    return interview.questions.filter(
      (question) => question.user_answer?.trim()
    ).length;
  }, [interview]);

  const progress = interview
    ? Math.round(
        ((currentIndex + (showResult ? 1 : 0)) /
          interview.total_questions) *
          100
      )
    : 0;

  // Create a new interview when the page opens.
  useEffect(() => {
    const createInterview = async () => {
      if (!selectedCareer?.id) {
        setError(
          "No career was selected. Please start the interview from the Career page."
        );
        setLoading(false);
        return;
      }

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/mock-interviews/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              career_id: selectedCareer.id,
              number_of_questions: 5,
            }),
          }
        );

        if (!response.ok) {
          const data = await response.json().catch(() => null);

          throw new Error(
            data?.detail ||
              "Unable to start the mock interview."
          );
        }

        const data: Interview = await response.json();

        setInterview(data);

        if (data.questions?.length > 0) {
          setAnswer(data.questions[0].user_answer || "");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while starting the interview."
        );
      } finally {
        setLoading(false);
      }
    };

    createInterview();
  }, [navigate, selectedCareer?.id]);

  const submitCurrentAnswer = async () => {
    if (!interview || !currentQuestion) return;

    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    if (!answer.trim()) {
      setError("Please write an answer before continuing.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/mock-interviews/${interview.id}/questions/${currentQuestion.id}/answer/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_answer: answer,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.detail ||
            "Unable to submit your answer."
        );
      }

      const result = await response.json();

      // Update current question locally.
      const updatedQuestions = interview.questions.map(
        (question) =>
          question.id === currentQuestion.id
            ? {
                ...question,
                user_answer: answer,
                score: result.score ?? question.score,
                feedback: result.feedback ?? question.feedback,
              }
            : question
      );

      const updatedInterview = {
        ...interview,
        questions: updatedQuestions,
        completed:
          result.interview_completed ?? interview.completed,
        score:
          result.interview_score ?? interview.score,
      };

      setInterview(updatedInterview);

      // Last question.
      if (currentIndex === interview.questions.length - 1) {
        setShowResult(true);
        return;
      }

      const nextIndex = currentIndex + 1;

      setCurrentIndex(nextIndex);
      setAnswer(
        updatedQuestions[nextIndex]?.user_answer || ""
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your answer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const startAnotherInterview = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 transition-colors dark:bg-[var(--background)] dark:text-[var(--text)]">
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-[var(--border)] dark:bg-[var(--surface)]/90">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[var(--primary)] dark:text-[var(--text)]"
            >
              <ArrowLeft size={17} />
              Back
            </button>

            <ThemeToggle />
          </div>
        </header>

        <main className="flex min-h-[75vh] items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-[var(--primary)]/10">
              <BrainCircuit
                size={28}
                className="text-[var(--primary)]"
              />
            </div>

            <h1 className="text-xl font-bold text-slate-900 dark:text-[var(--text-heading)]">
              Preparing your interview
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-[var(--text)]">
              Generating questions based on your career path...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !interview) {
    return (
      <div className="min-h-screen bg-white text-slate-900 dark:bg-[var(--background)] dark:text-[var(--text)]">
        <header className="border-b border-slate-200 bg-white dark:border-[var(--border)] dark:bg-[var(--surface)]">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[var(--primary)] dark:text-[var(--text)]"
            >
              <ArrowLeft size={17} />
              Back
            </button>

            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto flex min-h-[75vh] max-w-2xl items-center justify-center px-4">
          <div className="w-full rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-500/20 dark:bg-red-500/5">
            <Target
              size={35}
              className="mx-auto mb-4 text-red-500"
            />

            <h1 className="text-xl font-bold text-slate-900 dark:text-[var(--text-heading)]">
              Unable to start interview
            </h1>

            <p className="mt-3 text-sm text-slate-600 dark:text-[var(--text)]">
              {error}
            </p>

            <button
              onClick={() => navigate("/career")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
            >
              Back to Career
              <ArrowRight size={16} />
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!interview || !currentQuestion) {
    return null;
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-white text-slate-900 transition-colors dark:bg-[var(--background)] dark:text-[var(--text)]">
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-[var(--border)] dark:bg-[var(--surface)]/90">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate("/career")}
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[var(--primary)] dark:text-[var(--text)]"
            >
              <ArrowLeft size={17} />
              Career
            </button>

            <div className="flex items-center gap-3">
              <span className="hidden text-sm font-semibold text-slate-500 sm:block dark:text-[var(--text)]">
                Interview Complete
              </span>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            {/* Result hero */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)] sm:p-12">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[var(--primary)]/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

              <div className="relative">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10">
                  <CheckCircle2
                    size={32}
                    className="text-[var(--primary)]"
                  />
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                  Interview Complete
                </p>

                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-[var(--text-heading)] sm:text-4xl">
                  Great work!
                </h1>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-[var(--text)]">
                  You completed your mock interview for{" "}
                  <strong className="text-slate-700 dark:text-[var(--text-heading)]">
                    {interview.career_title}
                  </strong>
                  .
                </p>

                {/* Score */}
                <div className="mx-auto mt-8 flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-[var(--primary)]/15">
                  <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[var(--primary)]/10">
                    <span className="text-4xl font-black text-[var(--primary)]">
                      {interview.score}%
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[var(--text)]">
                      Score
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[var(--border)] dark:bg-[var(--background)]">
                    <p className="text-2xl font-black text-slate-900 dark:text-[var(--text-heading)]">
                      {interview.total_questions}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-[var(--text)]">
                      Questions
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[var(--border)] dark:bg-[var(--background)]">
                    <p className="text-2xl font-black text-slate-900 dark:text-[var(--text-heading)]">
                      {answeredCount}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-[var(--text)]">
                      Answered
                    </p>
                  </div>

                  <div className="col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[var(--border)] dark:bg-[var(--background)] sm:col-span-1">
                    <p className="text-2xl font-black text-[var(--primary)]">
                      {interview.score >= 80
                        ? "Excellent"
                        : interview.score >= 60
                        ? "Strong"
                        : "Keep Going"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-[var(--text)]">
                      Performance
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    onClick={startAnotherInterview}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-90"
                  >
                    <RotateCcw size={16} />
                    Try Again
                  </button>

                  <button
                    onClick={() => navigate("/career")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-[var(--primary)] hover:text-[var(--primary)] dark:border-[var(--border)] dark:bg-[var(--background)] dark:text-[var(--text-heading)]"
                  >
                    Back to Career
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 dark:border-[var(--border)] dark:bg-[var(--surface)] sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                  <Lightbulb
                    size={21}
                    className="text-amber-500"
                  />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900 dark:text-[var(--text-heading)]">
                    Interview Feedback
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-[var(--text)]">
                    Review your answers and keep practicing the skills
                    related to your selected career. AI-powered detailed
                    feedback can be added to this section later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors dark:bg-[var(--background)] dark:text-[var(--text)]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-[var(--border)] dark:bg-[var(--surface)]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/career")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[var(--primary)] dark:text-[var(--text)]"
          >
            <ArrowLeft size={17} />
            <span className="hidden sm:inline">
              Back to Career
            </span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-[var(--border)] dark:text-[var(--text)] sm:flex">
              <Clock3 size={14} />
              Mock Interview
            </div>

            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 sm:py-10">
        {/* Page heading */}
        <section className="mb-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/8 px-3 py-1.5 text-xs font-bold text-[var(--primary)]">
                <Sparkles size={13} />
                AI Career Practice
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-[var(--text-heading)] sm:text-4xl">
                Mock Interview
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-[var(--text)]">
                Practice interview questions tailored to your target
                career and build confidence before the real interview.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Career
              </p>
              <p className="mt-1 font-bold text-slate-900 dark:text-[var(--text-heading)]">
                {interview.career_title}
              </p>
            </div>
          </div>
        </section>

        {/* Progress */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)] sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Your Progress
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-[var(--text-heading)]">
                Question {currentIndex + 1}{" "}
                <span className="font-medium text-slate-400">
                  of {interview.total_questions}
                </span>
              </p>
            </div>

            <span className="text-sm font-black text-[var(--primary)]">
              {Math.min(progress, 100)}%
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-[var(--background)]">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
              style={{
                width: `${Math.min(progress, 100)}%`,
              }}
            />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_310px]">
          {/* Question */}
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)]">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                    <BrainCircuit
                      size={22}
                      className="text-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                      Interview Question
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Take your time and answer clearly
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 dark:bg-[var(--background)] dark:text-[var(--text)]">
                  {currentIndex + 1}/{interview.total_questions}
                </span>
              </div>

              <div className="mt-8">
                <h2 className="text-2xl font-black leading-tight tracking-tight text-slate-900 dark:text-[var(--text-heading)] sm:text-3xl">
                  {currentQuestion.question}
                </h2>
              </div>

              <div className="mt-8">
                <label className="mb-2.5 block text-sm font-bold text-slate-700 dark:text-[var(--text-heading)]">
                  Your Answer
                </label>

                <textarea
                  value={answer}
                  onChange={(event) => {
                    setAnswer(event.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Write your answer here..."
                  rows={8}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 dark:border-[var(--border)] dark:bg-[var(--background)] dark:text-[var(--text-heading)] dark:placeholder:text-slate-500"
                />

                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>
                    Explain your answer with practical examples when possible.
                  </span>

                  <span>{answer.length} characters</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/5 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="mt-7 flex justify-end">
                <button
                  onClick={submitCurrentAnswer}
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Submitting..."
                    : currentIndex ===
                      interview.questions.length - 1
                    ? "Finish Interview"
                    : "Next Question"}

                  {!submitting && <ArrowRight size={16} />}
                </button>
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Skills */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
                  <Target
                    size={19}
                    className="text-cyan-500"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-[var(--text-heading)]">
                    Skills Assessed
                  </h3>
                  <p className="text-xs text-slate-400">
                    Based on your career
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {(selectedCareer?.required_skills?.length
                  ? selectedCareer.required_skills
                  : ["Career Skills"]
                ).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-[var(--border)] dark:bg-[var(--background)] dark:text-[var(--text)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Tip */}
            <div className="rounded-3xl border border-[var(--primary)]/15 bg-[var(--primary)]/5 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                  <Lightbulb
                    size={19}
                    className="text-[var(--primary)]"
                  />
                </div>

                <h3 className="font-bold text-slate-900 dark:text-[var(--text-heading)]">
                  Interview Tip
                </h3>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-[var(--text)]">
                Keep your answers clear and practical. Mention real
                project experience whenever possible instead of only
                giving definitions.
              </p>
            </div>

            {/* Progress list */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)]">
              <h3 className="font-bold text-slate-900 dark:text-[var(--text-heading)]">
                Interview Progress
              </h3>

              <div className="mt-5 space-y-3">
                {interview.questions.map((question, index) => {
                  const answered = Boolean(
                    question.user_answer?.trim()
                  );

                  const active = index === currentIndex;

                  return (
                    <div
                      key={question.id}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                        active
                          ? "bg-[var(--primary)]/10"
                          : ""
                      }`}
                    >
                      {answered ? (
                        <CheckCircle2
                          size={17}
                          className="shrink-0 text-[var(--primary)]"
                        />
                      ) : active ? (
                        <Circle
                          size={17}
                          className="shrink-0 text-[var(--primary)]"
                        />
                      ) : (
                        <Circle
                          size={17}
                          className="shrink-0 text-slate-300 dark:text-slate-600"
                        />
                      )}

                      <span
                        className={`text-xs font-semibold ${
                          active
                            ? "text-[var(--primary)]"
                            : "text-slate-500 dark:text-[var(--text)]"
                        }`}
                      >
                        Question {index + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}