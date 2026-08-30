
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

const API_URL = "http://127.0.0.1:8000";

interface Resource {
  id: number;
  title: string;
  description: string;
  url: string;
  resource_type: "article" | "video" | "course" | "documentation";
  skill: number;
  skill_name: string;
  created_at: string;
  updated_at: string;
}

function Resources() {
  const navigate = useNavigate();

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState("all");

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
  // Fetch Resources
  // =========================
  useEffect(() => {
    const fetchResources = async () => {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/resources/`, {
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
          throw new Error("Unable to load learning resources.");
        }

        const data: Resource[] = await response.json();
        setResources(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading resources.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [navigate]);

  // =========================
  // Resource Type Label
  // =========================
  const getResourceTypeLabel = (type: Resource["resource_type"]) => {
    switch (type) {
      case "article":
        return "Article";
      case "video":
        return "Video";
      case "course":
        return "Course";
      case "documentation":
        return "Documentation";
      default:
        return type;
    }
  };

  // =========================
  // Resource Icon
  // =========================
  const getResourceIcon = (type: Resource["resource_type"]) => {
    switch (type) {
      case "article":
        return "◫";
      case "video":
        return "▶";
      case "course":
        return "◆";
      case "documentation":
        return "▤";
      default:
        return "◇";
    }
  };

  // =========================
  // Resource Accent
  // =========================
  const getResourceAccent = (type: Resource["resource_type"]) => {
    switch (type) {
      case "article":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "video":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "course":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      case "documentation":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      default:
        return "bg-[var(--primary-soft)] text-[var(--primary)]";
    }
  };

  // =========================
  // Unique Skills
  // =========================
  const availableSkills = useMemo(() => {
    const skills = resources
      .map((resource) => resource.skill_name)
      .filter((skill) => skill);

    return [...new Set(skills)].sort();
  }, [resources]);

  // =========================
  // Filter Resources
  // =========================
  const filteredResources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesSearch =
        !query ||
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        resource.skill_name.toLowerCase().includes(query);

      const matchesType =
        selectedType === "all" ||
        resource.resource_type === selectedType;

      const matchesSkill =
        selectedSkill === "all" ||
        resource.skill_name === selectedSkill;

      return matchesSearch && matchesType && matchesSkill;
    });
  }, [resources, searchQuery, selectedType, selectedSkill]);

  // =========================
  // Clear Filters
  // =========================
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedSkill("all");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedType !== "all" ||
    selectedSkill !== "all";

  // =========================
  // Loading
  // =========================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 text-[var(--text)]">
        <div className="text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-[3px] border-[var(--border)] border-t-[var(--primary)]" />

          <p className="text-sm font-semibold text-[var(--text-heading)]">
            Loading learning resources...
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
            Premium Hero
        ========================== */}
        <section className="relative mb-9 overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          {/* Decorative background */}
          <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[var(--primary-soft)] opacity-70 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[var(--primary-soft)] opacity-40 blur-3xl" />

          <div className="absolute right-0 top-0 hidden h-full w-[38%] lg:block">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--surface)] via-[var(--surface)]/80 to-transparent" />

            <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-20">
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 16 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-3 w-3 rounded-full bg-[var(--primary)]"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="relative px-6 py-9 sm:px-9 sm:py-11 lg:px-11 lg:py-12">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)] shadow-sm">
                <span className="text-sm">✦</span>
                Learning Hub
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-[var(--text-heading)] sm:text-4xl lg:text-5xl">
                Learn smarter.
                <span className="block text-[var(--primary)]">
                  Grow stronger.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 sm:text-base">
                Explore carefully selected articles, videos, courses, and
                documentation designed to help you build practical skills and
                move closer to your career goals.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-3.5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider">
                    Resources
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[var(--text-heading)]">
                    {resources.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-3.5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider">
                    Skills
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[var(--primary)]">
                    {availableSkills.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-3.5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider">
                    Showing
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[var(--text-heading)]">
                    {filteredResources.length}
                  </p>
                </div>
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
            className="mb-7 flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 font-bold">
              !
            </span>

            <div>
              <p className="font-semibold">Unable to load resources</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* =========================
            Search & Filters
        ========================== */}
        {resources.length > 0 && (
          <section className="mb-10 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <div className="border-b border-[var(--border)] px-5 py-5 sm:px-7">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                    Find your next resource
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-[var(--text-heading)]">
                    Search & Filter
                  </h2>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="self-start rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-bold text-[var(--text-heading)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] sm:self-auto"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-3">
              {/* Search */}
              <div className="lg:col-span-1">
                <label
                  htmlFor="resource-search"
                  className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-heading)]"
                >
                  Search
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base opacity-70">
                    ⌕
                  </span>

                  <input
                    id="resource-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search title, skill..."
                    className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] py-3 pl-11 pr-4 text-sm text-[var(--text-heading)] outline-none transition-all placeholder:text-[var(--text)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
                  />
                </div>
              </div>

              {/* Type */}
              <div>
                <label
                  htmlFor="resource-type"
                  className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-heading)]"
                >
                  Resource Type
                </label>

                <select
                  id="resource-type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 text-sm text-[var(--text-heading)] outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
                >
                  <option value="all">All Types</option>
                  <option value="article">Articles</option>
                  <option value="video">Videos</option>
                  <option value="course">Courses</option>
                  <option value="documentation">Documentation</option>
                </select>
              </div>

              {/* Skill */}
              <div>
                <label
                  htmlFor="resource-skill"
                  className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-heading)]"
                >
                  Skill
                </label>

                <select
                  id="resource-skill"
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 text-sm text-[var(--text-heading)] outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
                >
                  <option value="all">All Skills</option>

                  {availableSkills.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-[var(--border)] bg-[var(--bg)]/50 px-5 py-4 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <p>
                Showing{" "}
                <span className="font-bold text-[var(--text-heading)]">
                  {filteredResources.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-[var(--text-heading)]">
                  {resources.length}
                </span>{" "}
                resources
              </p>

              {hasActiveFilters && (
                <p className="font-semibold text-[var(--primary)]">
                  Filters applied
                </p>
              )}
            </div>
          </section>
        )}

        {/* =========================
            Section Heading
        ========================== */}
        {resources.length > 0 && filteredResources.length > 0 && (
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                Curated for growth
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-heading)] sm:text-3xl">
                Explore Resources
              </h2>
            </div>

            <p className="text-xs font-medium">
              Learn at your own pace
            </p>
          </div>
        )}

        {/* =========================
            Empty States
        ========================== */}
        {resources.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center shadow-sm sm:px-8">
            <div className="absolute inset-0 bg-[var(--primary-soft)] opacity-20" />

            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-3xl">
                ◇
              </div>

              <h2 className="mt-5 text-xl font-bold text-[var(--text-heading)]">
                No learning resources yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6">
                Learning resources will appear here once they are added to
                SkillBridge.
              </p>
            </div>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center shadow-sm sm:px-8">
            <div className="absolute inset-0 bg-[var(--primary-soft)] opacity-20" />

            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl">
                ⌕
              </div>

              <h2 className="mt-5 text-xl font-bold text-[var(--text-heading)]">
                No matching resources
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6">
                Try another search term or adjust your filters to discover
                more learning resources.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-md"
              >
                Clear Filters
                <span>↗</span>
              </button>
            </div>
          </div>
        ) : (
          /* =========================
              Resource Cards
          ========================== */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => (
              <article
                key={resource.id}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/40 hover:shadow-xl"
              >
                {/* Card glow */}
                <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[var(--primary-soft)] opacity-0 blur-3xl transition duration-500 group-hover:opacity-70" />

                <div className="relative flex h-full flex-col p-6">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`flex h-13 w-13 items-center justify-center rounded-2xl text-xl font-bold shadow-sm ${getResourceAccent(
                        resource.resource_type,
                      )}`}
                    >
                      {getResourceIcon(resource.resource_type)}
                    </div>

                    <span className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text)]">
                      {getResourceTypeLabel(resource.resource_type)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="mt-6 line-clamp-2 text-xl font-bold leading-7 text-[var(--text-heading)] transition-colors group-hover:text-[var(--primary)]">
                    {resource.title}
                  </h2>

                  {/* Skill */}
                  {resource.skill_name && (
                    <div className="mt-4">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text)]">
                        Skill
                      </span>

                      <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                        {resource.skill_name}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <p className="mt-5 line-clamp-4 flex-1 text-sm leading-6">
                    {resource.description || "No description available."}
                  </p>

                  {/* Bottom */}
                  <div className="mt-7 border-t border-[var(--border)] pt-5">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/button inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-bold !text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
                    >
                      Open Resource
                      <span className="transition-transform duration-200 group-hover/button:translate-x-1">
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* =========================
            Bottom CTA
        ========================== */}
        {resources.length > 0 && (
          <section className="relative mt-12 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <div className="absolute inset-0 bg-[var(--primary-soft)] opacity-25" />

            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[var(--primary-soft)] blur-3xl" />

            <div className="relative px-6 py-9 text-center sm:px-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xl">
                ✦
              </div>

              <h2 className="mt-4 text-xl font-bold text-[var(--text-heading)]">
                Keep building your future
              </h2>

              <p  className="text-center text-sm leading-6">
                Every resource you explore is another step toward stronger
                skills, better opportunities, and your career goals.
              </p>

              <Link
                to="/dashboard"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold !text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <span>←</span>
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

export default Resources;
