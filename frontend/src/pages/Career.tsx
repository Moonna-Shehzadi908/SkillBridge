
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
        return "border-[var(--primary)]/25 bg-[var(--primary-soft)] text-[var(--primary)]";

      case "MEDIUM":
        return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/20 dark:text-amber-300";

      case "LOW":
        return "border-slate-200 bg-slate-50 text-slate-600 dark:border-[var(--border)] dark:bg-[var(--bg)] dark:text-[var(--text)]";

      default:
        return "border-slate-200 bg-slate-50 text-slate-600 dark:border-[var(--border)] dark:bg-[var(--bg)] dark:text-[var(--text)]";
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
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-white via-slate-50/70 to-white text-[var(--text)] transition-colors duration-300 dark:from-[var(--bg)] dark:via-[var(--bg)] dark:to-[var(--bg)]">
      <ThemeToggle />

      {/* =========================
          Navigation
      ========================== */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-xl dark:border-[var(--border)] dark:bg-[var(--surface)]/90">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link
            to="/dashboard"
            aria-label="Go to SkillBridge dashboard"
            className="group flex items-center gap-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-lg font-bold text-white shadow-md transition duration-200 group-hover:-translate-y-0.5 group-hover:rotate-1 group-hover:shadow-lg">
              S
            </span>

            <span className="text-xl font-bold tracking-tight text-[var(--text-heading)]">
              Skill<span className="text-[var(--primary)]">Bridge</span>
            </span>
          </Link>

          {/* Dashboard */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text-heading)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-md dark:border-[var(--border)] dark:bg-[var(--surface)]"
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
        <section className="relative mb-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50/70 shadow-xl shadow-slate-200/50 dark:border-[var(--border)] dark:from-[var(--surface)] dark:via-[var(--surface)] dark:to-[var(--bg)]">

          {/* Decorative Glows */}
          <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[var(--primary)]/10 blur-3xl" />

          <div className="pointer-events-none absolute right-28 top-16 h-32 w-32 rounded-full bg-violet-300/10 blur-2xl" />

          {/* Decorative Grid */}
          <div className="pointer-events-none absolute right-10 top-10 hidden opacity-20 lg:block">
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 25 }).map((_, index) => (
                <div
                  key={index}
                  className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]"
                />
              ))}
            </div>
          </div>

          {/* Decorative Circle */}
          <div className="pointer-events-none absolute bottom-0 right-0 hidden h-48 w-72 rounded-tl-[100%] border-l border-t border-indigo-200/50 lg:block" />

          <div className="relative grid gap-10 px-6 py-10 sm:px-9 sm:py-12 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12 lg:py-14">

            {/* Hero Content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)] shadow-sm backdrop-blur-sm dark:border-[var(--border)] dark:bg-[var(--surface)]">
                <span className="text-sm">✦</span>
                Career Development
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-[var(--text-heading)] sm:text-4xl lg:text-5xl lg:leading-[1.12]">
                Discover your
                <span className="block bg-gradient-to-r from-[var(--primary)] via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                  perfect career path
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-[var(--text)]">
                Explore career opportunities that align with your skills,
                interests, and learning goals. Build the right skills today
                for the career you want tomorrow.
              </p>

              {/* Hero Stats */}
              <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:gap-4">

                <div className="group rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/30 hover:shadow-lg dark:border-[var(--border)] dark:bg-[var(--surface)]/80">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[var(--text)]">
                    Career Paths
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[var(--text-heading)]">
                    {careers.length}
                  </p>

                  <p className="mt-0.5 text-xs">
                    opportunities to explore
                  </p>
                </div>

                <div className="group rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/30 hover:shadow-lg dark:border-[var(--border)] dark:bg-[var(--surface)]/80">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[var(--text)]">
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
              <div className="relative flex h-48 w-48 items-center justify-center rounded-[2rem] border border-indigo-100 bg-white/80 shadow-xl shadow-indigo-100/40 backdrop-blur-sm dark:border-[var(--border)] dark:bg-[var(--surface)]">

                <div className="absolute inset-4 rounded-[1.5rem] bg-gradient-to-br from-[var(--primary-soft)] to-indigo-50 dark:to-[var(--bg)]" />

                <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-[var(--primary)] text-4xl text-white shadow-xl shadow-indigo-200 transition-transform duration-300 hover:scale-105">
                  🚀
                </div>

                <span className="absolute -right-4 top-7 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm shadow-lg dark:border-[var(--border)] dark:bg-[var(--surface)]">
                  ✦
                </span>

                <span className="absolute -bottom-3 left-7 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm shadow-lg dark:border-[var(--border)] dark:bg-[var(--surface)]">
                  ✓
                </span>

                <span className="absolute -left-3 top-20 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs shadow-md dark:bg-[var(--surface)]">
                  ★
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
            className="mb-8 flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 font-bold">
              !
            </span>

            <div>
              <p className="font-semibold">
                Unable to load career paths
              </p>

              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* =========================
            Section Heading
        ========================== */}
        {careers.length > 0 && (
          <section className="mb-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                  Explore opportunities
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-heading)] sm:text-3xl">
                  Career Paths
                </h2>

                <p className="mt-2 text-sm text-slate-500 dark:text-[var(--text)]">
                  Find a direction that matches your goals and strengths.
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-[var(--text-heading)] shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)]">
                <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />

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
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-lg shadow-slate-200/30 sm:px-8 dark:border-[var(--border)] dark:bg-[var(--surface)]">

            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-soft)] to-transparent opacity-40" />

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
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {careers.map((career) => (
              <article
                key={career.id}
                className="
                  group relative flex h-full flex-col overflow-hidden
                  rounded-3xl
                  border border-slate-200
                  bg-gradient-to-br from-white via-white to-slate-50
                  p-6
                  shadow-md shadow-slate-200/50
                  transition-all duration-300 ease-out
                  hover:-translate-y-0.5
                  hover:border-[var(--primary)]/40
                  hover:bg-gradient-to-br
                  hover:from-white
                  hover:via-[var(--primary-soft)]
                  hover:to-indigo-50
                  hover:shadow-2xl
                  hover:shadow-indigo-200/40
                  dark:border-[var(--border)]
                  dark:from-[var(--surface)]
                  dark:via-[var(--surface)]
                  dark:to-[var(--bg)]
                  dark:hover:from-[var(--surface)]
                  dark:hover:via-[var(--primary-soft)]
                  dark:hover:to-[var(--surface)]
                "
              >

                {/* Top-right Glow */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--primary)] opacity-0 blur-3xl transition-all duration-500 group-hover:opacity-20" />

                <div className="pointer-events-none absolute -right-5 top-10 h-24 w-24 rounded-full bg-indigo-400 opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-10" />

                <div className="relative flex h-full flex-col">

                  {/* =========================
                      Top
                  ========================== */}
                  <div className="flex items-start justify-between gap-4">

                    {/* Career Icon */}
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-2xl text-white shadow-md transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:shadow-lg">
                      🚀
                    </div>

                    {/* Demand */}
                    <span
                      className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all duration-300 group-hover:shadow-md ${getDemandStyles(
                        career.demand_level,
                      )}`}
                    >
                      {getDemandLabel(career.demand_level)}
                    </span>
                  </div>

                  {/* =========================
                      Title
                  ========================== */}
                  <h2 className="mt-6 line-clamp-2 text-xl font-bold leading-7 text-[var(--text-heading)] transition-colors duration-300 group-hover:text-[var(--primary)]">
                    {career.title}
                  </h2>

                  {/* =========================
                      Description
                  ========================== */}
                  <p className="mt-3 line-clamp-4 flex-1 text-sm leading-6">
                    {career.description}
                  </p>

                  {/* Divider */}
                  <div className="my-5 h-px bg-slate-200/80 dark:bg-[var(--border)]" />

                  {/* =========================
                      Required Skills
                  ========================== */}
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-heading)]">
                        Required Skills
                      </p>

                      {career.required_skills.length > 0 && (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500 dark:bg-[var(--bg)] dark:text-[var(--text)]">
                          {career.required_skills.length} skills
                        </span>
                      )}
                    </div>

                    {career.required_skills.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {career.required_skills.map((skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="
                              rounded-lg
                              border border-slate-200
                              bg-white/80
                              px-2.5 py-1.5
                              text-xs font-medium
                              text-[var(--text-heading)]
                              shadow-sm
                              transition-all duration-200
                              group-hover:border-[var(--primary)]/20
                              group-hover:bg-white
                              dark:border-[var(--border)]
                              dark:bg-[var(--bg)]
                              dark:group-hover:bg-[var(--surface)]
                            "
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

                  {/* =========================
                      Salary
                  ========================== */}
                  {career.average_salary && (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-3.5 shadow-sm transition-all duration-300 group-hover:border-[var(--primary)]/20 group-hover:shadow-md dark:border-[var(--border)] dark:from-[var(--bg)] dark:to-[var(--surface)]">

                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-[var(--text)]">
                            Average Salary
                          </p>

                          <p className="mt-1 text-sm font-bold text-[var(--primary)]">
                            {career.average_salary}
                          </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-base">
                          💰
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =========================
                      Career URL
                  ========================== */}
                  {career.career_url && (
                    <a
                      href={career.career_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        mt-5
                        inline-flex w-full items-center justify-center gap-2
                        rounded-xl
                        bg-[var(--primary)]
                        px-4 py-3
                        text-sm font-bold !text-white
                        shadow-md
                        transition-all duration-200
                        hover:-translate-y-0.5
                        hover:bg-[var(--primary-hover)]
                        hover:shadow-lg
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[var(--primary)]
                        focus:ring-offset-2
                      "
                    >
                      Explore Career

                      <span
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover:translate-x-1"
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
          <section className="relative mt-14 overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/70 to-violet-50 shadow-xl shadow-indigo-100/50 dark:border-[var(--border)] dark:from-[var(--surface)] dark:via-[var(--surface)] dark:to-[var(--bg)]">

            {/* Glows */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--primary)]/15 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl" />

            {/* Decorative Rings */}
            <div className="pointer-events-none absolute right-10 top-8 hidden h-32 w-32 rounded-full border border-[var(--primary)]/10 lg:block" />

            <div className="pointer-events-none absolute right-16 top-14 hidden h-20 w-20 rounded-full border border-[var(--primary)]/10 lg:block" />

            <div className="relative px-6 py-11 text-center sm:px-8 sm:py-13">

              {/* Icon */}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-xl text-white shadow-lg shadow-indigo-200 transition-transform duration-300 hover:scale-105">
                ✦
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                Shape your future
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-heading)] sm:text-3xl">
                Your next opportunity starts here
              </h2>

              <p className="text-center text-sm leading-6dark:text-[var(--text)]">
                Explore different career paths, identify the skills you need,
                and keep building toward the future you want.
              </p>

              <Link
                to="/dashboard"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3.5 text-sm font-bold !text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:-translate-y-1 hover:bg-[var(--primary-hover)] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
              >
                <span aria-hidden="true">←</span>
                Back to Dashboard
              </Link>

              {/* Bottom Motto */}
              <div className="mx-auto mt-7 flex max-w-sm items-center justify-center gap-3 text-[11px] font-medium text-slate-500 dark:text-[var(--text)]">
                <span className="h-px flex-1 bg-slate-200 dark:bg-[var(--border)]" />

                <span>Discover • Learn • Succeed</span>

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
              Discover your path. Build your future.
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

export default CareerPage;
