
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
  // Loading
  // =========================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]" />

          <p>Loading career paths...</p>
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
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-lg font-bold text-white">
              S
            </span>

            <span className="text-xl font-bold tracking-tight text-[var(--text-heading)]">
              Skill<span className="text-[var(--primary)]">Bridge</span>
            </span>
          </Link>

          {/* Dashboard */}
          <Link
            to="/dashboard"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-heading)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* =========================
          Main
      ========================== */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page Header */}
        <section className="mb-8">
          <p className="text-sm font-semibold text-[var(--primary)]">
            Career Development 🚀
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--text-heading)] sm:text-4xl">
            Explore Career Paths
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6">
            Discover career opportunities based on your skills, interests, and
            learning goals.
          </p>
        </section>

        {/* =========================
            Error
        ========================== */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {/* =========================
            No Careers
        ========================== */}
        {careers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center">
            <div className="text-5xl">🚀</div>

            <h2 className="mt-4 text-xl font-bold text-[var(--text-heading)]">
              No career paths available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6">
              Career paths will appear here once they are added to SkillBridge.
            </p>
          </div>
        ) : (
          /* =========================
             Career Cards
          ========================== */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {careers.map((career) => (
              <article
                key={career.id}
                className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {/* Icon + Demand */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-2xl">
                    🚀
                  </div>

                  <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                    {getDemandLabel(career.demand_level)}
                  </span>
                </div>

                {/* Title */}
                <h2 className="mt-5 text-xl font-bold leading-7 text-[var(--text-heading)]">
                  {career.title}
                </h2>

                {/* Description */}
                <p className="mt-4 flex-1 text-sm leading-6">
                  {career.description}
                </p>

                {/* Required Skills */}
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide">
                    Required Skills
                  </p>

                  {career.required_skills.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {career.required_skills.map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1 text-xs font-medium text-[var(--text-heading)]"
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
                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide">
                      Average Salary
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[var(--primary)]">
                      {career.average_salary}
                    </p>
                  </div>
                )}

                {/* Career URL */}
                {career.career_url && (
                  <a
                    href={career.career_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold !text-white transition hover:bg-[var(--primary-hover)]"
                  >
                    Explore Career →
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default CareerPage;
