
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

  // Search & Filters
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
        return "📄";
      case "video":
        return "🎥";
      case "course":
        return "🎓";
      case "documentation":
        return "📘";
      default:
        return "📚";
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

  // =========================
  // Loading
  // =========================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]" />

          <p>Loading learning resources...</p>
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
            Learning Resources 📚
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--text-heading)] sm:text-4xl">
            Learning Resources
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6">
            Explore useful articles, videos, courses, and documentation to
            improve your skills.
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
            Search & Filters
        ========================== */}
        {resources.length > 0 && (
          <section className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Search */}
              <div className="lg:col-span-1">
                <label
                  htmlFor="resource-search"
                  className="mb-2 block text-sm font-semibold text-[var(--text-heading)]"
                >
                  Search Resources
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                    🔎
                  </span>

                  <input
                    id="resource-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, skill..."
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] py-3 pl-11 pr-4 text-sm text-[var(--text-heading)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label
                  htmlFor="resource-type"
                  className="mb-2 block text-sm font-semibold text-[var(--text-heading)]"
                >
                  Resource Type
                </label>

                <select
                  id="resource-type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
                >
                  <option value="all">All Types</option>
                  <option value="article">Articles</option>
                  <option value="video">Videos</option>
                  <option value="course">Courses</option>
                  <option value="documentation">Documentation</option>
                </select>
              </div>

              {/* Skill Filter */}
              <div>
                <label
                  htmlFor="resource-skill"
                  className="mb-2 block text-sm font-semibold text-[var(--text-heading)]"
                >
                  Skill
                </label>

                <select
                  id="resource-skill"
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
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

            {/* Filter Footer */}
            <div className="mt-5 flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm">
                Showing{" "}
                <span className="font-semibold text-[var(--text-heading)]">
                  {filteredResources.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[var(--text-heading)]">
                  {resources.length}
                </span>{" "}
                resources
              </p>

              {(searchQuery ||
                selectedType !== "all" ||
                selectedSkill !== "all") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="self-start rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-heading)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:self-auto"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </section>
        )}

        {/* =========================
            No Resources
        ========================== */}
        {resources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center">
            <div className="text-5xl">📚</div>

            <h2 className="mt-4 text-xl font-bold text-[var(--text-heading)]">
              No resources available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6">
              Learning resources will appear here once they are added to
              SkillBridge.
            </p>
          </div>
        ) : filteredResources.length === 0 ? (
          /* =========================
              No Search Results
          ========================== */
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center">
            <div className="text-5xl">🔎</div>

            <h2 className="mt-4 text-xl font-bold text-[var(--text-heading)]">
              No matching resources
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6">
              Try changing your search or filters to find the resources you
              are looking for.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* =========================
              Resources
          ========================== */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => (
              <article
                key={resource.id}
                className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {/* Icon + Type */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-2xl">
                    {getResourceIcon(resource.resource_type)}
                  </div>

                  <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                    {getResourceTypeLabel(resource.resource_type)}
                  </span>
                </div>

                {/* Title */}
                <h2 className="mt-5 text-xl font-bold leading-7 text-[var(--text-heading)]">
                  {resource.title}
                </h2>

                {/* Skill */}
                {resource.skill_name && (
                  <div className="mt-3">
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Skill
                    </span>

                    <p className="mt-1 text-sm font-semibold text-[var(--primary)]">
                      {resource.skill_name}
                    </p>
                  </div>
                )}

                {/* Description */}
                <p className="mt-4 flex-1 text-sm leading-6">
                  {resource.description || "No description available."}
                </p>

                {/* Open Resource */}
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold !text-white transition hover:bg-[var(--primary-hover)]"
                >
                  Open Resource →
                </a>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Resources;
