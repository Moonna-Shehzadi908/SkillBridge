
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

function Skills() {
  const navigate = useNavigate();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [mySkills, setMySkills] = useState<Skill[]>([]);

  const [loading, setLoading] = useState(true);
  const [mySkillsLoading, setMySkillsLoading] = useState(true);

  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // =========================
  // Get JWT token
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

      await fetchMySkills();
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

      await fetchMySkills();
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
  // Check if skill is selected
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      <ThemeToggle />

      {/* =========================
          Navigation
      ========================== */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/dashboard"
            aria-label="Go to SkillBridge dashboard"
            className="group flex items-center gap-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-lg font-bold text-white shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
              S
            </span>

            <span className="text-xl font-bold tracking-tight text-[var(--text-heading)]">
              Skill<span className="text-[var(--primary)]">Bridge</span>
            </span>
          </Link>
<Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text-heading)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-md"
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
            Hero Header
        ========================== */}
       {/* =========================
    Hero Header
========================== */}
<section className="relative mb-10 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">

  {/* Background decorative glow */}
  <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[var(--primary-soft)] opacity-50 blur-3xl" />
  <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-[var(--primary-soft)] opacity-30 blur-3xl" />

  {/* Hero Image — part of the same box */}
  <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] lg:block">
    <div className="absolute inset-0 bg-gradient-to-r from-[var(--surface)] via-[var(--surface)]/70 to-transparent z-10" />

    <img
  src={skillsHero}
  alt=""
  aria-hidden="true"
  className="h-full w-full object-cover object-center opacity-95 brightness-[0.72] contrast-[1.18] saturate-[1.08]"
/>
  </div>

  {/* Content */}
  <div className="relative z-20 px-6 py-8 sm:px-8 sm:py-10 lg:max-w-[65%] lg:px-10 lg:py-12">

    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--primary)] shadow-sm">
      <span>✦</span>
      Skill Development
    </div>

    <h1 className="mt-5 text-3xl font-bold tracking-tight text-[var(--text-heading)] sm:text-4xl lg:text-5xl">
      Build your
      <span className="text-[var(--primary)]"> skill profile</span>
    </h1>

    <p className="mt-4 max-w-2xl text-sm leading-7 sm:text-base">
      Discover the skills that match your interests, strengthen your
      profile, and create a personalized learning journey with
      SkillBridge.
    </p>

    {/* Stats */}
    <div className="mt-7 flex flex-wrap gap-3">

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]/90 px-4 py-3 shadow-sm backdrop-blur-sm">
        <p className="text-xs font-medium">
          Available Skills
        </p>

        <p className="mt-1 text-xl font-bold text-[var(--text-heading)]">
          {skills.length}
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]/90 px-4 py-3 shadow-sm backdrop-blur-sm">
        <p className="text-xs font-medium">
          My Skills
        </p>

        <p className="mt-1 text-xl font-bold text-[var(--primary)]">
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
            className={`mb-7 flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-semibold shadow-sm ${
              actionMessage.includes("successfully")
                ? "border-[var(--border)] bg-[var(--surface)] text-[var(--primary)]"
                : "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                actionMessage.includes("successfully")
                  ? "bg-[var(--primary-soft)]"
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
            className="mb-7 flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
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
            My Skills
        ========================== */}
        <section className="mb-12">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
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
              <div className="rounded-full bg-[var(--primary-soft)] px-3.5 py-1.5 text-xs font-bold text-[var(--primary)]">
                {mySkills.length}{" "}
                {mySkills.length === 1 ? "skill" : "skills"} selected
              </div>
            )}
          </div>

          {mySkills.length === 0 ? (
            <div className="relative overflow-hidden rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center shadow-sm sm:px-8">
              <div className="absolute inset-0 bg-[var(--primary-soft)] opacity-30" />

              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-3xl shadow-sm">
                  🎯
                </div>

                <h3 className="mt-5 text-xl font-bold text-[var(--text-heading)]">
                  Your skill profile is waiting
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6">
                  Explore the available skills below and add the ones you
                  want to learn or improve.
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
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {mySkills.map((skill) => (
                <article
                  key={skill.id}
                  className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/40 hover:shadow-xl"
                >
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[var(--primary-soft)] opacity-50 blur-2xl transition group-hover:opacity-80" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xl shadow-sm">
                        ✓
                      </div>

                      <span className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                        Selected
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-[var(--text-heading)]">
                      {skill.name}
                    </h3>

                    {skill.category && (
                      <span className="mt-2 inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                        {skill.category}
                      </span>
                    )}

                    {skill.description && (
                      <p className="mt-4 min-h-[48px] text-sm leading-6">
                        {skill.description}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.id)}
                      disabled={actionLoading === skill.id}
                      className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm font-semibold text-[var(--text-heading)] transition-all duration-200 hover:border-red-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLoading === skill.id
                        ? "Removing..."
                        : "Remove Skill"}
                    </button>
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
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
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
              <p className="text-xs font-medium">
                {skills.length} opportunities to explore
              </p>
            )}
          </div>

          {skills.length === 0 ? (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl">
                📚
              </div>

              <h3 className="mt-5 text-lg font-bold text-[var(--text-heading)]">
                No skills available
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6">
                Skills will appear here once they are added by an
                administrator.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => {
                const selected = isSkillSelected(skill.id);

                return (
                  <article
                    key={skill.id}
                    className={`group relative overflow-hidden rounded-2xl border bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 ${
                      selected
                        ? "border-[var(--primary)]/40 shadow-md"
                        : "border-[var(--border)] hover:-translate-y-1 hover:border-[var(--primary)]/40 hover:shadow-xl"
                    }`}
                  >
                    <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[var(--primary-soft)] opacity-30 blur-2xl transition group-hover:opacity-70" />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xl shadow-sm transition duration-200 group-hover:scale-105">
                          🎯
                        </div>

                        {selected ? (
                          <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                            Added
                          </span>
                        ) : (
                          <span className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                            Available
                          </span>
                        )}
                      </div>

                      <h3 className="mt-5 text-lg font-bold text-[var(--text-heading)]">
                        {skill.name}
                      </h3>

                      {skill.category && (
                        <span className="mt-2 inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                          {skill.category}
                        </span>
                      )}

                      <p className="mt-4 min-h-[48px] text-sm leading-6">
                        {skill.description || "No description available."}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleAddSkill(skill.id)}
                        disabled={selected || actionLoading === skill.id}
                        className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ${
                          selected
                            ? "cursor-not-allowed border border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"
                            : "bg-[var(--primary)] text-white shadow-sm hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                        }`}
                      >
                        {actionLoading === skill.id
                          ? "Adding..."
                          : selected
                            ? "Skill Added ✓"
                            : "Add Skill →"}
                      </button>
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
          <section className="mt-12 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <div className="relative px-6 py-8 text-center sm:px-8">
              <div className="absolute inset-0 bg-[var(--primary-soft)] opacity-30" />

              <div className="relative">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xl">
                  🚀
                </div>

                <h2 className="mt-4 text-xl font-bold text-[var(--text-heading)]">
                  Keep building your future
                </h2>

             <p className="text-center text-sm leading-6">
  Your skills are the foundation of your career journey. Keep exploring,
  keep learning, and keep growing.
</p>

                <Link
                  to="/dashboard"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold !text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                                <span aria-hidden="true">←</span>

                  Back to Dashboard
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* =========================
          Footer
      ========================== */}
      <footer className="mt-4 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-7xl px-4 py-7 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-medium">
            © {new Date().getFullYear()} SkillBridge. Keep learning, keep
            growing.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Skills;
