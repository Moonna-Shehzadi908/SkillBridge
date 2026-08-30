
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

const API_URL = "http://127.0.0.1:8000";

interface Career {
  id: number;
  title: string;
  description: string;
  required_skills: string[];
  average_salary: string | null;
  demand_level: "LOW" | "MEDIUM" | "HIGH";
  career_url: string | null;
  created_at: string;
  updated_at: string;
}

function CareerPage() {
  const navigate = useNavigate();

  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  // Fetch Careers
  // =========================
  useEffect(() => {
    const fetchCareers = async () => {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/career/`, {
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
          throw new Error("Unable to load career paths.");
        }

        const data: Career[] = await response.json();

        setCareers(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading careers.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCareers();
  }, [navigate]);

  // =========================
  // Demand Level Label
  // =========================
  const getDemandLabel = (level: Career["demand_level"]) => {
    switch (level) {
      case "LOW":
        return "Low Demand";
      case "MEDIUM":
        return "Medium Demand";
      case "HIGH":
        return "High Demand";
      default:
        return level;
    }
  };

  // =========================
  // Demand Styling
  // =========================
  const getDemandStyles = (level: Career["demand_level"]) => {
    switch (level) {
      case "HIGH":
        return "border-[var(--primary)]/30 bg-[var(--primary-soft)] text-[var(--primary)]";

      case "MEDIUM":
        return "border-amber-300/60 bg-amber-50 text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/20 dark:text-amber-300";

      case "LOW":
        return "border-[var(--border)] bg-[var(--bg)] text-[var(--text)]";

      default:
        return "border-[var(--border)] bg-[var(--bg)] text-[var(--text)]";
    }
  };

  // =========================
  // Loading
  // =========================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 text-[var(--text)]">
        <div className="text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-[3px] border-[var(--border)] border-t-[var(--primary)]" />

          <p className="text-sm font-semibold text-[var(--text-heading)]">
            Loading career paths...
          </p>

          <p className="mt-1 text-xs">
            Preparing your career discovery space
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
          {/* Logo */}
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

          {/* Dashboard */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text-heading)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-md"
          >
            <span aria-hidden="true">←</span>
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
        <section className="relative mb-10 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          {/* Decorative Background */}
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--primary-soft)] opacity-70 blur-3xl" />

          <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-[var(--primary-soft)] opacity-40 blur-3xl" />

          <div className="absolute right-8 top-8 hidden h-20 w-20 rounded-2xl border border-[var(--primary)]/10 bg-[var(--primary-soft)] opacity-40 lg:block" />

          <div className="relative grid gap-8 px-6 py-9 sm:px-8 sm:py-11 lg:grid-cols-[1fr_auto] lg:items-center lg:px-10 lg:py-12">

            {/* Hero Content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--primary)] shadow-sm">
                <span>✦</span>
                Career Development
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-[var(--text-heading)] sm:text-4xl lg:text-5xl">
                Discover your
                <span className="text-[var(--primary)]">
                  {" "}career path
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 sm:text-base">
                Explore career opportunities that align with your skills,
                interests, and learning goals. Build the right skills today
                for the career you want tomorrow.
              </p>

              {/* Stats */}
              <div className="mt-7 flex flex-wrap gap-3">
                <div className="min-w-[145px] rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider">
                    Career Paths
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[var(--text-heading)]">
                    {careers.length}
                  </p>

                  <p className="mt-0.5 text-xs">
                    opportunities to explore
                  </p>
                </div>

                <div className="min-w-[145px] rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider">
                    Your Journey
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[var(--primary)]">
                    Explore
                  </p>

                  <p className="mt-0.5 text-xs">
                    learn & grow
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:flex lg:justify-end">
              <div className="relative flex h-44 w-44 items-center justify-center rounded-[2rem] border border-[var(--border)] bg-[var(--bg)] shadow-md">
                <div className="absolute inset-3 rounded-[1.5rem] bg-[var(--primary-soft)]" />

                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--primary)] text-4xl text-white shadow-lg">
                  🚀
                </div>

                <span className="absolute -right-3 top-7 flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm shadow-md">
                  ✦
                </span>

                <span className="absolute -bottom-3 left-7 flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm shadow-md">
                  ✓
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            Error
        ========================== */}
        {error && (
          <div
            role="alert"
            className="mb-8 flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 font-bold">
              !
            </span>

            <div>
              <p className="font-semibold">Unable to load career paths</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* =========================
            Section Heading
        ========================== */}
        {careers.length > 0 && (
          <section className="mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                  Explore opportunities
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-heading)] sm:text-3xl">
                  Career Paths
                </h2>

                <p className="mt-1.5 text-sm">
                  Find a direction that matches your goals and strengths.
                </p>
              </div>

              <div className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold shadow-sm">
                {careers.length}{" "}
                {careers.length === 1 ? "path" : "paths"} available
              </div>
            </div>
          </section>
        )}

        {/* =========================
            No Careers
        ========================== */}
        {careers.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center shadow-sm sm:px-8">
            <div className="absolute inset-0 bg-[var(--primary-soft)] opacity-20" />

            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-3xl shadow-sm">
                🚀
              </div>

              <h2 className="mt-5 text-xl font-bold text-[var(--text-heading)]">
                No career paths available
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6">
                Career paths will appear here once they are added to
                SkillBridge.
              </p>

              <Link
                to="/dashboard"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold !text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg"
              >
                <span aria-hidden="true">←</span>
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* =========================
             Career Cards
          ========================== */
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {careers.map((career) => (
              <article
                key={career.id}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/40 hover:shadow-xl"
              >
                {/* Card Glow */}
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[var(--primary-soft)] opacity-30 blur-3xl transition duration-300 group-hover:opacity-70" />

                <div className="relative flex h-full flex-col">

                  {/* Top */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl shadow-sm transition duration-300 group-hover:scale-105">
                      🚀
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${getDemandStyles(
                        career.demand_level,
                      )}`}
                    >
                      {getDemandLabel(career.demand_level)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="mt-6 text-xl font-bold leading-7 text-[var(--text-heading)]">
                    {career.title}
                  </h2>

                  {/* Description */}
                  <p className="mt-3 flex-1 text-sm leading-6">
                    {career.description}
                  </p>

                  {/* Divider */}
                  <div className="my-5 h-px bg-[var(--border)]" />

                  {/* Required Skills */}
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-heading)]">
                        Required Skills
                      </p>

                      {career.required_skills.length > 0 && (
                        <span className="text-[10px] font-semibold">
                          {career.required_skills.length} skills
                        </span>
                      )}
                    </div>

                    {career.required_skills.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {career.required_skills.map((skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-heading)] transition-colors duration-200 group-hover:border-[var(--primary)]/20"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm">
                        No specific skills listed.
                      </p>
                    )}
                  </div>

                  {/* Salary */}
                  {career.average_salary && (
                    <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider">
                        Average Salary
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-base">💰</span>

                        <p className="text-sm font-bold text-[var(--primary)]">
                          {career.average_salary}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Career URL */}
                  {career.career_url && (
                    <a
                      href={career.career_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold !text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
                    >
                      Explore Career
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* =========================
            Bottom CTA
        ========================== */}
        {careers.length > 0 && (
          <section className="relative mt-12 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <div className="absolute inset-0 bg-[var(--primary-soft)] opacity-25" />

            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[var(--primary-soft)] blur-3xl" />

            <div className="relative px-6 py-9 text-center sm:px-8 sm:py-10">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xl">
                ✦
              </div>

              <h2 className="mt-4 text-xl font-bold text-[var(--text-heading)]">
                Your next opportunity starts here
              </h2>

              <p className="text-center text-sm leading-6">
                Explore different career paths, identify the skills you need,
                and keep building toward the future you want.
              </p>

              <Link
                to="/dashboard"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold !text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <span aria-hidden="true">←</span>
                Back to Dashboard
              </Link>
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

export default CareerPage;