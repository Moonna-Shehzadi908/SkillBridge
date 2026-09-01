
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import skillsHero from "../assets/skills-hero.png";

const API_URL = "http://127.0.0.1:8000";

interface Skill {
  id: number;
  name: string;
  description: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

interface SkillRecommendation {
  id: number;
  name: string;
  description: string;
  category: string;
  match_score: number;
  reason: string;
}

function Skills() {
  const navigate = useNavigate();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [mySkills, setMySkills] = useState<Skill[]>([]);
  const [recommendations, setRecommendations] = useState<
    SkillRecommendation[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [mySkillsLoading, setMySkillsLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);

  const [error, setError] = useState("");
  const [recommendationError, setRecommendationError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // =========================
  // Get JWT Token
  // =========================
  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  // =========================
  // Handle Unauthorized
  // =========================
  const handleUnauthorized = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  // =========================
  // Fetch All Skills
  // =========================
  const fetchSkills = async () => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/skills/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load skills.");
      }

      const data: Skill[] = await response.json();
      setSkills(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading skills.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Fetch User's Skills
  // =========================
  const fetchMySkills = async () => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/accounts/me/skills/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load your skills.");
      }

      const data: Skill[] = await response.json();
      setMySkills(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading your skills.",
      );
    } finally {
      setMySkillsLoading(false);
    }
  };

  // =========================
  // Fetch Smart Recommendations
  // =========================
  const fetchRecommendations = async () => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setRecommendationError("");

      const response = await fetch(
        `${API_URL}/api/skills/recommendations/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load skill recommendations.");
      }

      const data: SkillRecommendation[] = await response.json();

      setRecommendations(data);
    } catch (err) {
      setRecommendationError(
        err instanceof Error
          ? err.message
          : "Unable to load skill recommendations.",
      );
    } finally {
      setRecommendationsLoading(false);
    }
  };

  // =========================
  // Initial Load
  // =========================
  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    fetchSkills();
    fetchMySkills();
    fetchRecommendations();
  }, [navigate]);

  // =========================
  // Add Skill
  // =========================
  const handleAddSkill = async (skillId: number) => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    setActionLoading(skillId);
    setActionMessage("");

    try {
      const response = await fetch(`${API_URL}/api/accounts/me/skills/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skill_id: skillId,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(data?.error || "Unable to add this skill.");
      }

      setActionMessage("Skill added successfully.");

      await Promise.all([
        fetchMySkills(),
        fetchRecommendations(),
      ]);
    } catch (err) {
      setActionMessage(
        err instanceof Error
          ? err.message
          : "Unable to add this skill.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================
  // Remove Skill
  // =========================
  const handleRemoveSkill = async (skillId: number) => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    setActionLoading(skillId);
    setActionMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/accounts/me/skills/${skillId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to remove this skill.",
        );
      }

      setActionMessage("Skill removed successfully.");

      await Promise.all([
        fetchMySkills(),
        fetchRecommendations(),
      ]);
    } catch (err) {
      setActionMessage(
        err instanceof Error
          ? err.message
          : "Unable to remove this skill.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================
  // Check Selected Skill
  // =========================
  const isSkillSelected = (skillId: number) => {
    return mySkills.some((skill) => skill.id === skillId);
  };

  // =========================
  // Loading
  // =========================
  if (loading || mySkillsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 text-[var(--text)]">
        <div className="text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-[3px] border-[var(--border)] border-t-[var(--primary)]" />

          <p className="text-sm font-semibold text-[var(--text-heading)]">
            Loading your skills...
          </p>

          <p className="mt-1 text-xs text-[var(--text)]">
            Preparing your learning space
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-white via-slate-50/70 to-white text-[var(--text)] transition-colors duration-300 dark:from-[var(--bg)] dark:via-[var(--bg)] dark:to-[var(--bg)]">
      <ThemeToggle />

      {/* =========================
          Navigation
      ========================== */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-xl dark:border-[var(--border)] dark:bg-[var(--surface)]/90">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/dashboard"
            aria-label="Go to SkillBridge dashboard"
            className="group flex items-center gap-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-lg font-bold text-white shadow-md transition-all duration-300 group-hover:-translate-y-0.5 group-hover:rotate-1 group-hover:shadow-lg">
              S
            </span>

            <span className="text-xl font-bold tracking-tight text-[var(--text-heading)]">
              Skill<span className="text-[var(--primary)]">Bridge</span>
            </span>
          </Link>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text-heading)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-md dark:border-[var(--border)] dark:bg-[var(--surface)]"
          >
            <span>←</span>
            Dashboard
          </Link>
        </div>
      </header>

      {/* =========================
          Main
      ========================== */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

        {/* =========================
            Premium Hero
        ========================== */}
        <section className="relative mb-11 overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50/70 shadow-xl shadow-slate-200/50 dark:border-[var(--border)] dark:from-[var(--surface)] dark:via-[var(--surface)] dark:to-[var(--bg)]">
          <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[var(--primary)]/10 blur-3xl" />

          <div className="pointer-events-none absolute right-20 top-20 h-32 w-32 rounded-full bg-sky-300/10 blur-2xl" />

          {/* Hero image */}
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[43%] lg:block">
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-white via-white/75 to-transparent dark:from-[var(--surface)] dark:via-[var(--surface)]/75 dark:to-transparent" />

            <img
              src={skillsHero}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-center opacity-90 brightness-[0.78] contrast-[1.08] saturate-[1.05]"
            />
          </div>

          {/* Decorative dots */}
          <div className="pointer-events-none absolute right-10 top-9 hidden opacity-20 lg:block">
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 25 }).map((_, index) => (
                <div
                  key={index}
                  className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]"
                />
              ))}
            </div>
          </div>

          <div className="relative z-20 px-6 py-10 sm:px-9 sm:py-12 lg:max-w-[68%] lg:px-12 lg:py-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)] shadow-sm backdrop-blur-sm dark:border-[var(--border)] dark:bg-[var(--surface)]">
              <span className="text-sm">✦</span>
              Skill Development
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-[var(--text-heading)] sm:text-4xl lg:text-5xl lg:leading-[1.12]">
              Build your
              <span className="block bg-gradient-to-r from-[var(--primary)] via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                skill profile.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-[var(--text)]">
              Discover the skills that match your interests, strengthen your
              profile, and create a personalized learning journey with
              SkillBridge.
            </p>

            {/* Stats */}
            <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:gap-4">
              <div className="group rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/30 hover:shadow-lg dark:border-[var(--border)] dark:bg-[var(--surface)]/80">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[var(--text)]">
                  Available Skills
                </p>

                <p className="mt-1 text-2xl font-bold text-[var(--text-heading)]">
                  {skills.length}
                </p>
              </div>

              <div className="group rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/30 hover:shadow-lg dark:border-[var(--border)] dark:bg-[var(--surface)]/80">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[var(--text)]">
                  My Skills
                </p>

                <p className="mt-1 text-2xl font-bold text-[var(--primary)]">
                  {mySkills.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            Action Message
        ========================== */}
        {actionMessage && (
          <div
            role="status"
            aria-live="polite"
            className={`mb-8 flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-semibold shadow-sm ${
              actionMessage.includes("successfully")
                ? "border-[var(--primary)]/20 bg-[var(--primary-soft)] text-[var(--primary)]"
                : "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                actionMessage.includes("successfully")
                  ? "bg-white/70 shadow-sm dark:bg-[var(--surface)]/70"
                  : "bg-red-500/10"
              }`}
            >
              {actionMessage.includes("successfully") ? "✓" : "!"}
            </span>

            {actionMessage}
          </div>
        )}

        {/* =========================
            Error
        ========================== */}
        {error && (
          <div
            role="alert"
            className="mb-8 flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 font-bold">
              !
            </span>

            <div>
              <p className="font-semibold">Unable to load skills</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* =========================
            Smart Recommendations
        ========================== */}
        <section className="mb-14">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                Personalized for you
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-heading)] sm:text-3xl">
                Smart Recommendations
              </h2>

              <p className="mt-1.5 max-w-2xl text-sm leading-6">
                Discover skills that naturally build on what you already know.
                Your recommendations update as your skill profile grows.
              </p>
            </div>

            {recommendations.length > 0 && (
              <div className="inline-flex w-fit rounded-full bg-[var(--primary-soft)] px-3.5 py-1.5 text-xs font-bold text-[var(--primary)]">
                {recommendations.length}{" "}
                {recommendations.length === 1
                  ? "recommendation"
                  : "recommendations"}
              </div>
            )}
          </div>

          {recommendationsLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-lg shadow-slate-200/30 dark:border-[var(--border)] dark:bg-[var(--surface)]">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-[var(--primary)] dark:border-[var(--border)]" />

                <p className="mt-4 text-sm font-semibold text-[var(--text-heading)]">
                  Finding your next skills...
                </p>

                <p className="mt-1 text-xs">
                  Analyzing your current skill profile
                </p>
              </div>
            </div>
          ) : recommendationError ? (
            <div
              role="alert"
              className="rounded-3xl border border-red-300 bg-red-50 px-6 py-8 text-center text-red-700 shadow-sm dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-xl">
                !
              </div>

              <h3 className="mt-4 font-bold">
                Recommendations unavailable
              </h3>

              <p className="mt-1 text-sm">
                {recommendationError}
              </p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="relative overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-lg shadow-slate-200/30 dark:border-[var(--border)] dark:bg-[var(--surface)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-soft)] to-transparent opacity-40" />

              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-3xl shadow-sm">
                  ✨
                </div>

                <h3 className="mt-5 text-xl font-bold text-[var(--text-heading)]">
                  Build your profile to unlock recommendations
                </h3>

                <p className="text-center text-sm leading-6">
                  Select at least one skill and SkillBridge will suggest
                  related skills that can help you grow further.
                </p>

                <a
                  href="#available-skills"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold !text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  Explore Skills
                  <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((recommendation, index) => (
                <article
                  key={recommendation.id}
                  className="
                    group relative flex h-full flex-col overflow-hidden rounded-3xl
                    border border-indigo-100
                    bg-gradient-to-br from-white via-indigo-50/35 to-violet-50/50
                    p-6
                    shadow-md shadow-indigo-100/40
                    transition-all duration-300 ease-out
                    hover:-translate-y-1
                    hover:border-[var(--primary)]/40
                    hover:shadow-2xl
                    hover:shadow-indigo-200/40
                    dark:border-[var(--border)]
                    dark:from-[var(--surface)]
                    dark:via-[var(--surface)]
                    dark:to-[var(--bg)]
                    dark:hover:border-[var(--primary)]/40
                  "
                >
                  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--primary)] opacity-0 blur-3xl transition-all duration-500 group-hover:opacity-15" />

                  <div className="relative flex h-full flex-col">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-xl font-bold text-[var(--primary)] shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
                        {index === 0
                          ? "★"
                          : index === 1
                            ? "✦"
                            : "↗"}
                      </div>

                      <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                        {recommendation.match_score}% Match
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="mt-6 text-xl font-bold leading-7 text-[var(--text-heading)] transition-colors duration-300 group-hover:text-[var(--primary)]">
                      {recommendation.name}
                    </h3>

                    {/* Category */}
                    {recommendation.category && (
                      <div className="mt-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)] transition-all duration-300 group-hover:bg-[var(--primary)] group-hover:text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] transition-colors duration-300 group-hover:bg-white" />
                          {recommendation.category}
                        </span>
                      </div>
                    )}

                    {/* Reason */}
                    <div className="mt-5 rounded-2xl border border-indigo-100 bg-white/70 p-4 dark:border-[var(--border)] dark:bg-[var(--surface)]/60">
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                        Why this skill?
                      </p>

                      <p className="mt-1.5 text-sm leading-6">
                        {recommendation.reason}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="mt-4 min-h-[48px] flex-1 text-sm leading-6">
                      {recommendation.description ||
                        "A useful skill to add to your learning journey."}
                    </p>

                    {/* Bottom */}
                    <div className="mt-7 border-t border-indigo-100 pt-5 dark:border-[var(--border)]">
                      <button
                        type="button"
                        onClick={() =>
                          handleAddSkill(recommendation.id)
                        }
                        disabled={
                          isSkillSelected(recommendation.id) ||
                          actionLoading === recommendation.id
                        }
                        className={`
                          inline-flex w-full items-center justify-center gap-2
                          rounded-xl px-4 py-3
                          text-sm font-bold
                          transition-all duration-200
                          focus:outline-none
                          focus:ring-2
                          focus:ring-[var(--primary)]
                          focus:ring-offset-2
                          ${
                            isSkillSelected(recommendation.id)
                              ? `
                                cursor-not-allowed
                                border border-slate-200
                                bg-slate-50
                                text-slate-500
                                dark:border-[var(--border)]
                                dark:bg-[var(--bg)]
                                dark:text-[var(--text)]
                              `
                              : `
                                bg-[var(--primary)]
                                text-white
                                shadow-md
                                hover:-translate-y-0.5
                                hover:bg-[var(--primary-hover)]
                                hover:shadow-lg
                              `
                          }
                        `}
                      >
                        {actionLoading === recommendation.id
                          ? "Adding..."
                          : isSkillSelected(recommendation.id)
                            ? "Skill Added ✓"
                            : "Add Recommended Skill →"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* =========================
            My Skills
        ========================== */}
        <section className="mb-14">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                Your collection
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-heading)] sm:text-3xl">
                My Skills
              </h2>

              <p className="mt-1.5 text-sm">
                Skills you have selected for your learning journey.
              </p>
            </div>

            {mySkills.length > 0 && (
              <div className="inline-flex w-fit rounded-full bg-[var(--primary-soft)] px-3.5 py-1.5 text-xs font-bold text-[var(--primary)]">
                {mySkills.length}{" "}
                {mySkills.length === 1 ? "skill" : "skills"} selected
              </div>
            )}
          </div>

          {mySkills.length === 0 ? (
            <div className="relative overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-lg shadow-slate-200/30 dark:border-[var(--border)] dark:bg-[var(--surface)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-soft)] to-transparent opacity-40" />

              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-3xl shadow-sm">
                  🎯
                </div>

                <h3 className="mt-5 text-xl font-bold text-[var(--text-heading)]">
                  Your skill profile is waiting
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6">
                  Explore the available skills below and add the ones you want
                  to learn or improve.
                </p>

                <a
                  href="#available-skills"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  Explore Skills
                  <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mySkills.map((skill) => (
                <article
                  key={skill.id}
                  className="
                    group relative flex h-full flex-col overflow-hidden rounded-3xl
                    border border-slate-200
                    bg-gradient-to-br from-white via-white to-slate-50
                    p-6
                    shadow-md shadow-slate-200/50
                    transition-all duration-300 ease-out
                    hover:-translate-y-1
                    hover:border-[var(--primary)]/35
                    hover:from-white
                    hover:via-[var(--primary-soft)]/45
                    hover:to-indigo-50/60
                    hover:shadow-2xl
                    hover:shadow-indigo-200/35
                    dark:border-[var(--border)]
                    dark:from-[var(--surface)]
                    dark:via-[var(--surface)]
                    dark:to-[var(--bg)]
                    dark:hover:from-[var(--surface)]
                    dark:hover:via-[var(--primary-soft)]/30
                    dark:hover:to-[var(--surface)]
                  "
                >
                  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--primary)] opacity-0 blur-3xl transition-all duration-500 group-hover:opacity-15" />

                  <div className="pointer-events-none absolute -bottom-16 -left-12 h-32 w-32 rounded-full bg-indigo-400 opacity-0 blur-3xl transition-all duration-500 group-hover:opacity-10" />

                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-xl font-bold text-[var(--primary)] shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:shadow-md">
                        ✓
                      </div>

                      <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:border-[var(--primary)]/25 group-hover:bg-white dark:border-[var(--border)] dark:bg-[var(--surface)]/80 dark:group-hover:bg-[var(--surface)]">
                        Selected
                      </span>
                    </div>

                    <h3 className="mt-6 text-xl font-bold leading-7 text-[var(--text-heading)] transition-colors duration-300 group-hover:text-[var(--primary)]">
                      {skill.name}
                    </h3>

                    {skill.category && (
                      <div className="mt-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)] transition-all duration-300 group-hover:bg-[var(--primary)] group-hover:text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] transition-colors duration-300 group-hover:bg-white" />
                          {skill.category}
                        </span>
                      </div>
                    )}

                    {skill.description && (
                      <p className="mt-5 min-h-[72px] flex-1 text-sm leading-6">
                        {skill.description}
                      </p>
                    )}

                    <div className="mt-7 border-t border-slate-200/80 pt-5 dark:border-[var(--border)]">
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill.id)}
                        disabled={actionLoading === skill.id}
                        className="
                          inline-flex w-full items-center justify-center gap-2
                          rounded-xl border border-slate-200
                          bg-white
                          px-4 py-3
                          text-sm font-bold text-[var(--text-heading)]
                          shadow-sm
                          transition-all duration-200
                          hover:-translate-y-0.5
                          hover:border-red-300
                          hover:bg-red-50
                          hover:text-red-500
                          hover:shadow-md
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                          dark:border-[var(--border)]
                          dark:bg-[var(--bg)]
                          dark:hover:border-red-800
                          dark:hover:bg-red-950/20
                        "
                      >
                        {actionLoading === skill.id
                          ? "Removing..."
                          : "Remove Skill"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* =========================
            Available Skills
        ========================== */}
        <section id="available-skills">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                Keep growing
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-heading)] sm:text-3xl">
                Available Skills
              </h2>

              <p className="mt-1.5 text-sm">
                Choose the skills you want to develop next.
              </p>
            </div>

            {skills.length > 0 && (
              <p className="text-xs font-medium text-slate-500 dark:text-[var(--text)]">
                {skills.length} opportunities to explore
              </p>
            )}
          </div>

          {skills.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-lg shadow-slate-200/30 dark:border-[var(--border)] dark:bg-[var(--surface)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl">
                📚
              </div>

              <h3 className="mt-5 text-lg font-bold text-[var(--text-heading)]">
                No skills available
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6">
                Skills will appear here once they are added by an administrator.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => {
                const selected = isSkillSelected(skill.id);

                return (
                  <article
                    key={skill.id}
                    className={`
                      group relative flex h-full flex-col overflow-hidden rounded-3xl
                      border
                      bg-gradient-to-br
                      p-6
                      shadow-md
                      transition-all duration-300 ease-out
                      ${
                        selected
                          ? `
                            border-[var(--primary)]/35
                            from-white
                            via-[var(--primary-soft)]/35
                            to-indigo-50/50
                            shadow-lg shadow-indigo-200/25
                            dark:border-[var(--primary)]/35
                            dark:from-[var(--surface)]
                            dark:via-[var(--primary-soft)]/25
                            dark:to-[var(--surface)]
                          `
                          : `
                            border-slate-200
                            from-white
                            via-white
                            to-slate-50
                            shadow-slate-200/50
                            hover:-translate-y-1
                            hover:border-[var(--primary)]/35
                            hover:from-white
                            hover:via-[var(--primary-soft)]/45
                            hover:to-indigo-50/60
                            hover:shadow-2xl
                            hover:shadow-indigo-200/35
                            dark:border-[var(--border)]
                            dark:from-[var(--surface)]
                            dark:via-[var(--surface)]
                            dark:to-[var(--bg)]
                            dark:hover:from-[var(--surface)]
                            dark:hover:via-[var(--primary-soft)]/30
                            dark:hover:to-[var(--surface)]
                          `
                      }
                    `}
                  >
                    <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--primary)] opacity-0 blur-3xl transition-all duration-500 group-hover:opacity-15" />

                    <div className="pointer-events-none absolute -bottom-16 -left-12 h-32 w-32 rounded-full bg-indigo-400 opacity-0 blur-3xl transition-all duration-500 group-hover:opacity-10" />

                    <div className="relative flex h-full flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-xl shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:shadow-md">
                          🎯
                        </div>

                        {selected ? (
                          <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] transition-all duration-300 group-hover:bg-[var(--primary)] group-hover:text-white">
                            Added
                          </span>
                        ) : (
                          <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:border-[var(--primary)]/25 group-hover:text-[var(--primary)] dark:border-[var(--border)] dark:bg-[var(--surface)]/80 dark:text-[var(--text)]">
                            Available
                          </span>
                        )}
                      </div>

                      <h3 className="mt-6 text-xl font-bold leading-7 text-[var(--text-heading)] transition-colors duration-300 group-hover:text-[var(--primary)]">
                        {skill.name}
                      </h3>

                      {skill.category && (
                        <div className="mt-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)] transition-all duration-300 group-hover:bg-[var(--primary)] group-hover:text-white">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] transition-colors duration-300 group-hover:bg-white" />
                            {skill.category}
                          </span>
                        </div>
                      )}

                      <p className="mt-5 min-h-[72px] flex-1 text-sm leading-6">
                        {skill.description || "No description available."}
                      </p>

                      <div className="mt-7 border-t border-slate-200/80 pt-5 dark:border-[var(--border)]">
                        <button
                          type="button"
                          onClick={() => handleAddSkill(skill.id)}
                          disabled={selected || actionLoading === skill.id}
                          className={`
                            inline-flex w-full items-center justify-center gap-2
                            rounded-xl px-4 py-3
                            text-sm font-bold
                            transition-all duration-200
                            focus:outline-none
                            focus:ring-2
                            focus:ring-[var(--primary)]
                            focus:ring-offset-2
                            ${
                              selected
                                ? `
                                  cursor-not-allowed
                                  border border-slate-200
                                  bg-slate-50
                                  text-slate-500
                                  dark:border-[var(--border)]
                                  dark:bg-[var(--bg)]
                                  dark:text-[var(--text)]
                                `
                                : `
                                  bg-[var(--primary)]
                                  text-white
                                  shadow-md
                                  hover:-translate-y-0.5
                                  hover:bg-[var(--primary-hover)]
                                  hover:shadow-lg
                                `
                            }
                          `}
                        >
                          {actionLoading === skill.id
                            ? "Adding..."
                            : selected
                              ? "Skill Added ✓"
                              : "Add Skill →"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* =========================
            Bottom CTA
        ========================== */}
        {skills.length > 0 && (
          <section className="relative mt-14 overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/70 to-violet-50 shadow-xl shadow-indigo-100/50 dark:border-[var(--border)] dark:from-[var(--surface)] dark:via-[var(--surface)] dark:to-[var(--bg)]">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--primary)]/15 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl" />

            <div className="pointer-events-none absolute right-10 top-8 hidden h-28 w-28 rounded-full border border-[var(--primary)]/10 lg:block" />

            <div className="pointer-events-none absolute right-16 top-14 hidden h-16 w-16 rounded-full border border-[var(--primary)]/10 lg:block" />

            <div className="relative px-6 py-11 text-center sm:px-8 sm:py-13">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-xl text-white shadow-lg shadow-indigo-200 transition-transform duration-300 hover:scale-105">
                ✦
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                Your journey continues
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-heading)] sm:text-3xl">
                Keep building your future
              </h2>

              <p className="text-center text-sm leading-6 dark:text-[var(--text)]">
                Your skills are the foundation of your career journey. Keep
                exploring, keep learning, and keep growing.
              </p>

              <Link
                to="/dashboard"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3.5 text-sm font-bold !text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:-translate-y-1 hover:bg-[var(--primary-hover)] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
              >
                <span>←</span>
                Back to Dashboard
              </Link>

              <div className="mx-auto mt-7 flex max-w-sm items-center justify-center gap-3 text-[11px] font-medium text-slate-500 dark:text-[var(--text)]">
                <span className="h-px flex-1 bg-slate-200 dark:bg-[var(--border)]" />
                <span>Discover • Build • Grow</span>
                <span className="h-px flex-1 bg-slate-200 dark:bg-[var(--border)]" />
              </div>
            </div>
          </section>
        )}
      </main>

      {/* =========================
          Footer
      ========================== */}
      <footer className="mt-6 border-t border-slate-200 bg-white dark:border-[var(--border)] dark:bg-[var(--surface)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-center sm:flex-row sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-bold text-[var(--text-heading)]">
              Skill<span className="text-[var(--primary)]">Bridge</span>
            </p>

            <p className="mt-1 text-xs">
              Keep learning, keep growing.
            </p>
          </div>

          <p className="text-xs font-medium">
            © {new Date().getFullYear()} SkillBridge. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Skills;
