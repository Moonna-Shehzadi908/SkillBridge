import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

const API_URL = "http://127.0.0.1:8000";

type ResourceType =
  | "article"
  | "video"
  | "course"
  | "documentation";

type ProgressStatus =
  | "not_started"
  | "in_progress"
  | "completed";

interface Resource {
  id: number;
  title: string;
  description: string;
  url: string;
  resource_type: ResourceType;
  resource_type_display?: string;
  skill: number;
  skill_name: string;
  created_at: string;
  updated_at: string;
}

interface ResourceRecommendation extends Resource {
  match_score: number;
  reason: string;
}

interface ResourceProgress {
  id: number;
  resource: number;
  resource_title: string;
  resource_type: ResourceType;
  skill_name: string;
  status: ProgressStatus;
  progress_percentage: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

function Resources() {
  const navigate = useNavigate();

  // =========================
  // Resource State
  // =========================

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState("");

  // =========================
  // AI Recommendation State
  // =========================

  const [aiRecommendations, setAiRecommendations] = useState<
    ResourceRecommendation[]
  >([]);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState("");

  // =========================
  // Search & Filter State
  // =========================

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState("all");

  // =========================
  // Learning Progress State
  // =========================

  const [progressRecords, setProgressRecords] = useState<
    ResourceProgress[]
  >([]);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressUpdating, setProgressUpdating] = useState<number | null>(
    null,
  );
  const [progressError, setProgressError] = useState("");

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

  const fetchResources = useCallback(
    async (isRefresh = false) => {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

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
        setLastUpdated(new Date());
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading resources.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigate],
  );

  // =========================
  // Fetch AI Recommendations
  // =========================

  const fetchAiRecommendations = useCallback(async () => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    setAiLoading(true);
    setAiError("");

    try {
      const response = await fetch(
        `${API_URL}/api/resources/recommendations/`,
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
        throw new Error(
          "Unable to load personalized recommendations.",
        );
      }

      const data: ResourceRecommendation[] =
        await response.json();

      setAiRecommendations(data);
    } catch (err) {
      setAiError(
        err instanceof Error
          ? err.message
          : "Unable to load personalized recommendations.",
      );
    } finally {
      setAiLoading(false);
    }
  }, []);

  // =========================
  // Fetch Learning Progress
  // =========================

  const fetchProgress = useCallback(async () => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    setProgressLoading(true);
    setProgressError("");

    try {
      const response = await fetch(
        `${API_URL}/api/resources/progress/`,
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
        throw new Error(
          "Unable to load your learning progress.",
        );
      }

      const data: ResourceProgress[] =
        await response.json();

      setProgressRecords(data);
    } catch (err) {
      setProgressError(
        err instanceof Error
          ? err.message
          : "Unable to load your learning progress.",
      );
    } finally {
      setProgressLoading(false);
    }
  }, []);

  // =========================
  // Initial API Calls
  // =========================

  useEffect(() => {
    fetchResources();
    fetchAiRecommendations();
    fetchProgress();
  }, [
    fetchResources,
    fetchAiRecommendations,
    fetchProgress,
  ]);

  // =========================
  // Resource Type Helpers
  // =========================

  const getResourceTypeLabel = (type: ResourceType) => {
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

  const getResourceIcon = (type: ResourceType) => {
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
  // Progress Helpers
  // =========================

  const getProgressForResource = (
    resourceId: number,
  ): ResourceProgress | undefined => {
    return progressRecords.find(
      (progress) => progress.resource === resourceId,
    );
  };

  const getProgressPercentage = (resourceId: number) => {
    return getProgressForResource(resourceId)
      ?.progress_percentage ?? 0;
  };

  const getProgressStatus = (
    resourceId: number,
  ): ProgressStatus => {
    return (
      getProgressForResource(resourceId)?.status ??
      "not_started"
    );
  };

  const getProgressStatusLabel = (
    status: ProgressStatus,
  ) => {
    switch (status) {
      case "not_started":
        return "Not Started";

      case "in_progress":
        return "In Progress";

      case "completed":
        return "Completed";

      default:
        return "Not Started";
    }
  };

  const getProgressStatusClasses = (
    status: ProgressStatus,
  ) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";

      case "in_progress":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";

      case "not_started":
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  // =========================
  // Update Learning Progress
  // =========================

    // =========================
  // Update Learning Progress
  // =========================

  const updateProgress = async (
    resourceId: number,
    percentage: number,
    status?: ProgressStatus,
  ) => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    const safePercentage = Math.max(
      0,
      Math.min(100, percentage),
    );

    let nextStatus: ProgressStatus;

    if (safePercentage >= 100) {
      nextStatus = "completed";
    } else if (safePercentage > 0) {
      nextStatus = "in_progress";
    } else {
      nextStatus = status ?? "not_started";
    }

    // Check whether progress already exists
    const existingProgress = getProgressForResource(resourceId);

    setProgressUpdating(resourceId);
    setProgressError("");

    try {
      const endpoint = existingProgress
        ? `${API_URL}/api/resources/progress/${resourceId}/`
        : `${API_URL}/api/resources/progress/`;

      const response = await fetch(endpoint, {
        method: existingProgress ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resource: resourceId,
          status: nextStatus,
          progress_percentage: safePercentage,
        }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => null);

        throw new Error(
          errorData?.detail ||
            "Unable to update learning progress.",
        );
      }

      const updatedProgress: ResourceProgress =
        await response.json();

      setProgressRecords((previous) => {
        const exists = previous.some(
          (item) => item.resource === resourceId,
        );

        if (exists) {
          return previous.map((item) =>
            item.resource === resourceId
              ? updatedProgress
              : item,
          );
        }

        return [...previous, updatedProgress];
      });
    } catch (err) {
      setProgressError(
        err instanceof Error
          ? err.message
          : "Unable to update learning progress.",
      );
    } finally {
      setProgressUpdating(null);
    }
  };

  // =========================
  // Progress Actions
  // =========================

  const handleStartLearning = async (
    resourceId: number,
  ) => {
    await updateProgress(
      resourceId,
      10,
      "in_progress",
    );
  };

  const handleIncreaseProgress = async (
    resourceId: number,
  ) => {
    const currentProgress =
      getProgressPercentage(resourceId);

    const nextProgress = Math.min(
      100,
      currentProgress + 10,
    );

    await updateProgress(
      resourceId,
      nextProgress,
      nextProgress >= 100
        ? "completed"
        : "in_progress",
    );
  };

  const handleComplete = async (
    resourceId: number,
  ) => {
    await updateProgress(
      resourceId,
      100,
      "completed",
    );
  };

  // =========================
  // Overall Progress Statistics
  // =========================

  const progressStats = useMemo(() => {
    const total = resources.length;

    if (total === 0) {
      return {
        total: 0,
        started: 0,
        completed: 0,
        average: 0,
      };
    }

    const percentages = resources.map(
      (resource) =>
        getProgressForResource(resource.id)
          ?.progress_percentage ?? 0,
    );

    const started = percentages.filter(
      (percentage) => percentage > 0,
    ).length;

    const completed = percentages.filter(
      (percentage) => percentage >= 100,
    ).length;

    const average = Math.round(
      percentages.reduce(
        (sum, percentage) => sum + percentage,
        0,
      ) / total,
    );

    return {
      total,
      started,
      completed,
      average,
    };
  }, [resources, progressRecords]);

  // =========================
  // Resource Statistics
  // =========================

  const resourceStats = useMemo(() => {
    return {
      total: resources.length,

      articles: resources.filter(
        (resource) =>
          resource.resource_type === "article",
      ).length,

      videos: resources.filter(
        (resource) =>
          resource.resource_type === "video",
      ).length,

      courses: resources.filter(
        (resource) =>
          resource.resource_type === "course",
      ).length,

      documentation: resources.filter(
        (resource) =>
          resource.resource_type === "documentation",
      ).length,
    };
  }, [resources]);

  // =========================
  // Unique Skills
  // =========================

  const availableSkills = useMemo(() => {
    const skills = resources
      .map((resource) => resource.skill_name)
      .filter(Boolean);

    return [...new Set(skills)].sort();
  }, [resources]);

  // =========================
  // AI Recommended Resources
  // =========================

  const recommendedResources = useMemo(() => {
    if (selectedSkill === "all") {
      return aiRecommendations.slice(0, 3);
    }

    return aiRecommendations
      .filter(
        (resource) =>
          resource.skill_name === selectedSkill,
      )
      .slice(0, 3);
  }, [aiRecommendations, selectedSkill]);

  // =========================
  // Filter Resources
  // =========================

  const filteredResources = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return resources.filter((resource) => {
      const matchesSearch =
        !query ||
        resource.title
          .toLowerCase()
          .includes(query) ||
        resource.description
          .toLowerCase()
          .includes(query) ||
        resource.skill_name
          .toLowerCase()
          .includes(query);

      const matchesType =
        selectedType === "all" ||
        resource.resource_type === selectedType;

      const matchesSkill =
        selectedSkill === "all" ||
        resource.skill_name === selectedSkill;

      return (
        matchesSearch &&
        matchesType &&
        matchesSkill
      );
    });
  }, [
    resources,
    searchQuery,
    selectedType,
    selectedSkill,
  ]);

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
  // Format Date
  // =========================

  const formatDate = (date: string) => {
    try {
      return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(date));
    } catch {
      return "";
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return "";

    return lastUpdated.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // =========================
  // Loading Screen
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 text-[var(--text)]">
        <div className="text-center">
          <div className="relative mx-auto mb-5 h-14 w-14">
            <div className="absolute inset-0 rounded-full bg-[var(--primary)]/10 blur-xl" />

            <div className="relative h-14 w-14 animate-spin rounded-full border-[3px] border-[var(--border)] border-t-[var(--primary)]" />
          </div>

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
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-white via-slate-50/70 to-white text-[var(--text)] transition-colors duration-300 dark:from-[var(--bg)] dark:via-[var(--bg)] dark:to-[var(--bg)]">
      <ThemeToggle />

      {/* =========================
          Navigation
      ========================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-xl dark:border-[var(--border)] dark:bg-[var(--surface)]/90">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            to="/dashboard"
            aria-label="Go to SkillBridge dashboard"
            className="group flex min-w-0 items-center gap-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] via-indigo-500 to-violet-500 text-lg font-bold text-white shadow-md transition duration-200 group-hover:-translate-y-0.5 group-hover:rotate-1 group-hover:shadow-lg">
              S
            </span>

            <span className="truncate text-lg font-bold tracking-tight text-[var(--text-heading)] sm:text-xl">
              Skill
              <span className="text-[var(--primary)]">
                Bridge
              </span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            {/* Refresh Button */}

            <button
              type="button"
              onClick={() => {
                fetchResources(true);
                fetchAiRecommendations();
                fetchProgress();
              }}
              disabled={refreshing}
              aria-label={
                refreshing
                  ? "Refreshing resources"
                  : "Refresh resources"
              }
              className="group inline-flex items-center gap-2 rounded-xl border border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)] to-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200/40 transition-all duration-200 hover:-translate-y-0.5 hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 dark:shadow-none"
            >
              <span
                className={`text-base ${
                  refreshing
                    ? "animate-spin"
                    : "transition-transform duration-300 group-hover:rotate-180"
                }`}
              >
                ↻
              </span>

              <span className="hidden sm:inline">
                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </span>
            </button>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-[var(--text-heading)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-md sm:px-4 dark:border-[var(--border)] dark:bg-[var(--surface)]"
            >
              <span>←</span>

              <span className="hidden sm:inline">
                Dashboard
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* =========================
          Main
      ========================== */}

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

        {/* =========================
            Hero
        ========================== */}

        <section className="relative mb-10 overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/70 to-violet-50 shadow-xl shadow-indigo-100/40 dark:border-[var(--border)] dark:from-[var(--surface)] dark:via-[var(--surface)] dark:to-[var(--bg)]">
          <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[var(--primary)]/10 blur-3xl" />

          <div className="pointer-events-none absolute right-8 top-8 hidden opacity-20 lg:block">
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 25 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]"
                  />
                ),
              )}
            </div>
          </div>

          <div className="relative px-5 py-9 sm:px-9 sm:py-12 lg:px-12 lg:py-14">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--primary)] shadow-sm backdrop-blur-sm sm:text-[11px] dark:border-[var(--border)] dark:bg-[var(--surface)]">
                <span className="text-sm">✦</span>
                Learning Hub
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-[var(--text-heading)] sm:text-4xl lg:text-5xl lg:leading-[1.12]">
                Learn smarter.
                <span className="block bg-gradient-to-r from-[var(--primary)] via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                  Grow stronger.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-[var(--text)]">
                Explore articles, videos, courses, and
                documentation designed to help you build
                practical skills and move closer to your
                career goals.
              </p>

              {/* Statistics */}

              <div className="mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-4 shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-[var(--border)] dark:bg-[var(--surface)]/80">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[var(--text)]">
                    Resources
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[var(--text-heading)]">
                    {resourceStats.total}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-4 shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-[var(--border)] dark:bg-[var(--surface)]/80">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[var(--text)]">
                    Skills
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[var(--primary)]">
                    {availableSkills.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-4 shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-[var(--border)] dark:bg-[var(--surface)]/80">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[var(--text)]">
                    Videos
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[var(--text-heading)]">
                    {resourceStats.videos}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/70 bg-white/75 px-4 py-4 shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-[var(--border)] dark:bg-[var(--surface)]/80">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[var(--text)]">
                    Courses
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[var(--text-heading)]">
                    {resourceStats.courses}
                  </p>
                </div>
              </div>

              {/* Last Updated */}

              {lastUpdated && (
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/70 px-3 py-1.5 text-[10px] font-semibold text-slate-500 shadow-sm backdrop-blur-sm dark:border-[var(--border)] dark:bg-[var(--surface)]/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  Updated at {formatLastUpdated()}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =========================
            Learning Progress Overview
        ========================== */}

        {resources.length > 0 && (
          <section className="mb-11 overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/50 to-violet-50 shadow-lg shadow-indigo-100/30 dark:border-[var(--border)] dark:from-[var(--surface)] dark:via-[var(--surface)] dark:to-[var(--bg)]">
            <div className="border-b border-indigo-100 px-5 py-5 sm:px-7 dark:border-[var(--border)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                    Module 3 • Learning Progress
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[var(--text-heading)]">
                    Track your learning journey
                  </h2>

                  <p className="mt-1 text-xs">
                    Monitor how much you have completed across
                    your learning resources.
                  </p>
                </div>

                <div className="rounded-2xl bg-[var(--primary-soft)] px-4 py-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                    Overall Progress
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[var(--text-heading)]">
                    {progressStats.average}%
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-7">
              {/* Average */}

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)]">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">◔</span>

                  <span className="text-xl font-bold text-[var(--primary)]">
                    {progressStats.average}%
                  </span>
                </div>

                <p className="mt-4 text-sm font-bold text-[var(--text-heading)]">
                  Average Progress
                </p>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-indigo-500 transition-all duration-500"
                    style={{
                      width: `${progressStats.average}%`,
                    }}
                  />
                </div>
              </div>

              {/* Started */}

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)]">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">▶</span>

                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                    {progressStats.started}
                  </span>
                </div>

                <p className="mt-4 text-sm font-bold text-[var(--text-heading)]">
                  Resources Started
                </p>

                <p className="mt-1 text-xs">
                  Resources you have started learning.
                </p>
              </div>

              {/* Completed */}

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)]">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">✓</span>

                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {progressStats.completed}
                  </span>
                </div>

                <p className="mt-4 text-sm font-bold text-[var(--text-heading)]">
                  Completed
                </p>

                <p className="mt-1 text-xs">
                  Resources completed successfully.
                </p>
              </div>
            </div>

            {progressError && (
              <div className="border-t border-red-100 bg-red-50 px-5 py-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
                {progressError}
              </div>
            )}
          </section>
        )}

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

            <div className="flex-1">
              <p className="font-semibold">
                Unable to load resources
              </p>

              <p className="mt-0.5">{error}</p>

              <button
                type="button"
                onClick={() => fetchResources()}
                className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* =========================
            Quick Categories
        ========================== */}

        {resources.length > 0 && (
          <section className="mb-10">
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                Browse by format
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-heading)]">
                Choose how you want to learn
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  type: "article",
                  label: "Articles",
                  count: resourceStats.articles,
                  icon: "◫",
                },
                {
                  type: "video",
                  label: "Videos",
                  count: resourceStats.videos,
                  icon: "▶",
                },
                {
                  type: "course",
                  label: "Courses",
                  count: resourceStats.courses,
                  icon: "◆",
                },
                {
                  type: "documentation",
                  label: "Documentation",
                  count: resourceStats.documentation,
                  icon: "▤",
                },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() =>
                    setSelectedType(
                      selectedType === item.type
                        ? "all"
                        : item.type,
                    )
                  }
                  className={`group rounded-2xl border p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                    selectedType === item.type
                      ? "border-[var(--primary)] bg-gradient-to-br from-[var(--primary-soft)] to-indigo-50 dark:from-[var(--surface)] dark:to-[var(--bg)]"
                      : "border-slate-200 bg-white hover:border-[var(--primary)]/30 dark:border-[var(--border)] dark:bg-[var(--surface)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-lg font-bold text-[var(--primary)] transition-transform group-hover:scale-105">
                      {item.icon}
                    </span>

                    <span className="text-xl font-bold text-[var(--text-heading)]">
                      {item.count}
                    </span>
                  </div>

                  <p className="mt-4 text-sm font-bold text-[var(--text-heading)]">
                    {item.label}
                  </p>

                  <p className="mt-1 text-xs">
                    Explore {item.label.toLowerCase()}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* =========================
            AI Recommended Resources
        ========================== */}

        {resources.length > 0 && (
          <section className="mb-11 overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 shadow-lg shadow-indigo-100/40 dark:border-[var(--border)] dark:from-[var(--surface)] dark:via-[var(--surface)] dark:to-[var(--bg)]">
            <div className="flex flex-col gap-3 border-b border-indigo-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 dark:border-[var(--border)]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                  ✦ AI powered learning
                </p>

                <h2 className="mt-1 text-xl font-bold text-[var(--text-heading)]">
                  {selectedSkill !== "all"
                    ? `AI Resources for ${selectedSkill}`
                    : "AI Recommended for You"}
                </h2>

                <p className="mt-1 text-xs">
                  Personalized resources based on your
                  selected skills.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById(
                      "resource-library",
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
                className="self-start rounded-xl bg-gradient-to-r from-[var(--primary)] to-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:from-indigo-500 hover:to-violet-500 sm:self-auto"
              >
                View Library →
              </button>
            </div>

            {aiLoading ? (
              <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                <div className="relative h-11 w-11">
                  <div className="absolute inset-0 rounded-full bg-[var(--primary)]/10 blur-lg" />

                  <div className="relative h-11 w-11 animate-spin rounded-full border-[3px] border-indigo-100 border-t-[var(--primary)] dark:border-[var(--border)]" />
                </div>

                <p className="mt-4 text-sm font-bold text-[var(--text-heading)]">
                  AI is finding resources for you...
                </p>

                <p className="mt-1 text-xs">
                  Matching resources with your skills
                </p>
              </div>
            ) : aiError ? (
              <div className="px-5 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-xl">
                  !
                </div>

                <h3 className="mt-4 font-bold text-[var(--text-heading)]">
                  Recommendations unavailable
                </h3>

                <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                  {aiError}
                </p>

                <button
                  type="button"
                  onClick={fetchAiRecommendations}
                  className="mt-5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:from-indigo-500 hover:to-violet-500"
                >
                  Try Again
                </button>
              </div>
            ) : recommendedResources.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-xl">
                  ✨
                </div>

                <h3 className="mt-4 font-bold text-[var(--text-heading)]">
                  Build your skill profile
                </h3>

                <p className="mx-auto mt-1 max-w-md text-xs leading-5">
                  Select skills in the Skills page to unlock
                  personalized AI resource recommendations.
                </p>

                <Link
                  to="/skills"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-indigo-500 px-4 py-2.5 text-xs font-bold !text-white shadow-md transition hover:-translate-y-0.5 hover:from-indigo-500 hover:to-violet-500"
                >
                  Build My Skills →
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-7">
                {recommendedResources.map(
                  (resource) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/30 hover:shadow-lg dark:border-[var(--border)] dark:bg-[var(--surface)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] font-bold text-[var(--primary)]">
                          {getResourceIcon(
                            resource.resource_type,
                          )}
                        </span>

                        <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--primary)]">
                          {resource.match_score}%
                          Match
                        </span>
                      </div>

                      <h3 className="mt-4 line-clamp-2 text-sm font-bold leading-6 text-[var(--text-heading)] group-hover:text-[var(--primary)]">
                        {resource.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-xs leading-5">
                        {resource.description ||
                          "Explore this personalized learning resource."}
                      </p>

                      <div className="mt-4 rounded-xl bg-[var(--primary-soft)]/60 px-3 py-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                          Why recommended?
                        </p>

                        <p className="mt-1 text-[11px] leading-5">
                          {resource.reason}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2">
                        <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--primary)]">
                          {resource.skill_name}
                        </span>

                        <span className="text-[10px] font-semibold uppercase tracking-wider">
                          {getResourceTypeLabel(
                            resource.resource_type,
                          )}
                        </span>
                      </div>
                    </a>
                  ),
                )}
              </div>
            )}
          </section>
        )}

        {/* =========================
            Search & Filters
        ========================== */}

        {resources.length > 0 && (
          <section
            id="resource-library"
            className="relative mb-11 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40 dark:border-[var(--border)] dark:bg-[var(--surface)]"
          >
            <div className="h-1 w-full bg-gradient-to-r from-[var(--primary)] via-indigo-500 to-violet-500" />

            <div className="border-b border-slate-100 px-5 py-5 sm:px-7 dark:border-[var(--border)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                    className="self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[var(--text-heading)] shadow-sm transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-md sm:self-auto dark:border-[var(--border)] dark:bg-[var(--surface)]"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {searchQuery.trim() && (
                    <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-[10px] font-bold text-[var(--primary)]">
                      Search: {searchQuery}
                    </span>
                  )}

                  {selectedType !== "all" && (
                    <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-[10px] font-bold capitalize text-[var(--primary)]">
                      Type: {selectedType}
                    </span>
                  )}

                  {selectedSkill !== "all" && (
                    <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-[10px] font-bold text-[var(--primary)]">
                      Skill: {selectedSkill}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-5 bg-gradient-to-br from-white to-slate-50/70 p-5 sm:p-7 lg:grid-cols-3 dark:from-[var(--surface)] dark:to-[var(--bg)]">
              {/* Search */}

              <div>
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
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    placeholder="Search title, skill..."
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-[var(--text-heading)] outline-none transition-all placeholder:text-slate-400 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)] dark:border-[var(--border)] dark:bg-[var(--bg)]"
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
                  onChange={(e) =>
                    setSelectedType(e.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[var(--text-heading)] outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)] dark:border-[var(--border)] dark:bg-[var(--bg)]"
                >
                  <option value="all">
                    All Types
                  </option>

                  <option value="article">
                    Articles
                  </option>

                  <option value="video">
                    Videos
                  </option>

                  <option value="course">
                    Courses
                  </option>

                  <option value="documentation">
                    Documentation
                  </option>
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
                  onChange={(e) =>
                    setSelectedSkill(e.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[var(--text-heading)] outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)] dark:border-[var(--border)] dark:bg-[var(--bg)]"
                >
                  <option value="all">
                    All Skills
                  </option>

                  {availableSkills.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-7 dark:border-[var(--border)] dark:bg-[var(--bg)]/50">
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

        {resources.length > 0 &&
          filteredResources.length > 0 && (
            <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                  Curated for growth
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-heading)] sm:text-3xl">
                  Explore Resources
                </h2>
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-[var(--text)]">
                <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />

                Learn at your own pace
              </div>
            </div>
          )}

        {/* =========================
            Empty States
        ========================== */}

        {resources.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-lg shadow-slate-200/30 sm:px-8 dark:border-[var(--border)] dark:bg-[var(--surface)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-soft)] to-transparent opacity-40" />

            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-3xl shadow-sm">
                ◇
              </div>

              <h2 className="mt-5 text-xl font-bold text-[var(--text-heading)]">
                No learning resources yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6">
                Learning resources will appear here once
                they are added to SkillBridge.
              </p>

              <button
                type="button"
                onClick={() => fetchResources(true)}
                disabled={refreshing}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60"
              >
                <span
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                >
                  ↻
                </span>

                {refreshing
                  ? "Refreshing..."
                  : "Check Again"}
              </button>
            </div>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-lg shadow-slate-200/30 sm:px-8 dark:border-[var(--border)] dark:bg-[var(--surface)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-soft)] to-transparent opacity-40" />

            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl shadow-sm">
                ⌕
              </div>

              <h2 className="mt-5 text-xl font-bold text-[var(--text-heading)]">
                No matching resources
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6">
                Try another search term or adjust your
                filters to discover more learning resources.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
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
            {filteredResources.map((resource) => {
              const resourceProgress =
                getProgressForResource(resource.id);

              const percentage =
                resourceProgress?.progress_percentage ?? 0;

              const status =
                resourceProgress?.status ??
                "not_started";

              const isUpdating =
                progressUpdating === resource.id;

              return (
                <article
                  key={resource.id}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 shadow-md shadow-slate-200/50 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[var(--primary)]/40 hover:from-white hover:via-[var(--primary-soft)] hover:to-indigo-50 hover:shadow-2xl hover:shadow-indigo-200/40 dark:border-[var(--border)] dark:from-[var(--surface)] dark:via-[var(--surface)] dark:to-[var(--bg)] dark:hover:from-[var(--surface)] dark:hover:via-[var(--primary-soft)] dark:hover:to-[var(--surface)]"
                >
                  {/* Top Gradient */}

                  <div className="h-1 w-full bg-gradient-to-r from-[var(--primary)] via-indigo-500 to-violet-500 opacity-80" />

                  {/* Decorative Hover Glow */}

                  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--primary)] opacity-0 blur-3xl transition-all duration-500 group-hover:opacity-20" />

                  <div className="relative flex h-full flex-col p-6">

                    {/* Top Row */}

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] via-indigo-500 to-violet-500 text-xl font-bold text-white shadow-md transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:shadow-lg">
                        {getResourceIcon(
                          resource.resource_type,
                        )}
                      </div>

                      <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text)] shadow-sm backdrop-blur-sm dark:border-[var(--border)] dark:bg-[var(--surface)]/80">
                        {getResourceTypeLabel(
                          resource.resource_type,
                        )}
                      </span>
                    </div>

                    {/* Title */}

                    <h2 className="mt-6 line-clamp-2 text-xl font-bold leading-7 text-[var(--text-heading)] transition-colors duration-300 group-hover:text-[var(--primary)]">
                      {resource.title}
                    </h2>

                    {/* Skill */}

                    {resource.skill_name && (
                      <div className="mt-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text)]">
                          Skill
                        </span>

                        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)] transition-all duration-300 group-hover:bg-[var(--primary)] group-hover:text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] transition-colors duration-300 group-hover:bg-white" />

                          {resource.skill_name}
                        </div>
                      </div>
                    )}

                    {/* Description */}

                    <p className="mt-5 line-clamp-4 flex-1 text-sm leading-6">
                      {resource.description ||
                        "No description available."}
                    </p>

                    {/* =========================
                        Learning Progress
                    ========================== */}

                    <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-[var(--border)] dark:bg-[var(--bg)]/50">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                            Learning Progress
                          </p>

                          <p className="mt-1 text-xs font-semibold text-[var(--text-heading)]">
                            {progressLoading
                              ? "Loading..."
                              : getProgressStatusLabel(
                                  status,
                                )}
                          </p>
                        </div>

                        {!progressLoading && (
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${getProgressStatusClasses(
                              status,
                            )}`}
                          >
                            {percentage}%
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}

                      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] via-indigo-500 to-violet-500 transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      {!progressLoading && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {percentage === 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                handleStartLearning(
                                  resource.id,
                                )
                              }
                              disabled={isUpdating}
                              className="rounded-lg bg-gradient-to-r from-[var(--primary)] to-indigo-500 px-3 py-2 text-[10px] font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isUpdating
                                ? "Updating..."
                                : "Start Learning"}
                            </button>
                          )}

                          {percentage > 0 &&
                            percentage < 100 && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleIncreaseProgress(
                                      resource.id,
                                    )
                                  }
                                  disabled={isUpdating}
                                  className="rounded-lg border border-[var(--primary)]/20 bg-white px-3 py-2 text-[10px] font-bold text-[var(--primary)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-[var(--border)] dark:bg-[var(--surface)]"
                                >
                                  {isUpdating
                                    ? "Updating..."
                                    : "+10% Progress"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleComplete(
                                      resource.id,
                                    )
                                  }
                                  disabled={isUpdating}
                                  className="rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isUpdating
                                    ? "Updating..."
                                    : "Mark Complete"}
                                </button>
                              </>
                            )}

                          {percentage >= 100 && (
                            <div className="flex w-full items-center gap-2 rounded-lg bg-emerald-100 px-3 py-2 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                                ✓
                              </span>

                              Learning completed!
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Metadata */}

                    <div className="mt-5 flex items-center justify-between gap-3 text-[10px]">
                      <span className="font-medium">
                        Added{" "}
                        {formatDate(
                          resource.created_at,
                        )}
                      </span>

                      <span className="font-semibold text-[var(--primary)]">
                        {percentage >= 100
                          ? "Completed"
                          : percentage > 0
                            ? "Keep learning"
                            : "Start learning"}
                      </span>
                    </div>

                    {/* Open Resource */}

                    <div className="mt-5 border-t border-slate-200/80 pt-5 dark:border-[var(--border)]">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-indigo-500 px-4 py-3 text-sm font-bold !text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
                      >
                        Open Resource

                        <span className="transition-transform duration-200 group-hover:translate-x-1">
                          ↗
                        </span>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* =========================
            Bottom CTA
        ========================== */}

        {resources.length > 0 && (
          <section className="relative mt-14 overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/70 to-violet-50 shadow-xl shadow-indigo-100/50 dark:border-[var(--border)] dark:from-[var(--surface)] dark:via-[var(--surface)] dark:to-[var(--bg)]">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--primary)]/15 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl" />

            <div className="relative px-6 py-11 text-center sm:px-8 sm:py-13">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] via-indigo-500 to-violet-500 text-xl text-white shadow-lg">
                ✦
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                Your journey continues
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-heading)] sm:text-3xl">
                Keep building your future
              </h2>

              <p className="text-center text-sm leading-6 dark:text-[var(--text)]">
                Every resource you explore is another step
                toward stronger skills, better opportunities,
                and your career goals.
              </p>

              <Link
                to="/dashboard"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-indigo-500 px-6 py-3.5 text-sm font-bold !text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:-translate-y-1 hover:from-indigo-500 hover:to-violet-500 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
              >
                <span>←</span>
                Back to Dashboard
              </Link>

              <div className="mx-auto mt-7 flex max-w-sm items-center justify-center gap-3 text-[11px] font-medium text-slate-500 dark:text-[var(--text)]">
                <span className="h-px flex-1 bg-slate-200 dark:bg-[var(--border)]" />

                <span>
                  Learn • Practice • Grow
                </span>

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
              Skill
              <span className="text-[var(--primary)]">
                Bridge
              </span>
            </p>

            <p className="mt-1 text-xs">
              Keep learning, keep growing.
            </p>
          </div>

          <p className="text-xs font-medium">
            © {new Date().getFullYear()} SkillBridge. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Resources;