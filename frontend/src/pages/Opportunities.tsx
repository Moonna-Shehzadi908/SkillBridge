
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  ExternalLink,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

const API_URL = "http://127.0.0.1:8000";

type OpportunityType =
  | "internship"
  | "job"
  | "freelance"
  | "scholarship"
  | "other";

interface Opportunity {
  id: number;
  title: string;
  company: string;
  description: string;
  opportunity_type: OpportunityType;
  opportunity_type_display: string;
  location: string;
  is_remote: boolean;
  url: string;
  skill: number;
  skill_name: string;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  match_score?: number;
  match_reason?: string;
}

interface UserSkill {
  id: number;
  name: string;
}

const opportunityTypeOptions = [
  { value: "all", label: "All Opportunities" },
  { value: "internship", label: "Internships" },
  { value: "job", label: "Jobs" },
  { value: "freelance", label: "Freelance" },
  { value: "scholarship", label: "Scholarships" },
  { value: "other", label: "Other" },
];

function getToken() {
  return localStorage.getItem("access_token");
}

function formatDeadline(deadline: string | null) {
  if (!deadline) {
    return "No deadline";
  }

  const date = new Date(deadline);

  if (Number.isNaN(date.getTime())) {
    return deadline;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getDaysRemaining(deadline: string | null) {
  if (!deadline) {
    return null;
  }

  const deadlineDate = new Date(deadline);
  const today = new Date();

  if (Number.isNaN(deadlineDate.getTime())) {
    return null;
  }

  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  const difference =
    deadlineDate.getTime() - today.getTime();

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24),
  );
}

function getMatchLabel(score?: number) {
  if (score === undefined) {
    return "Skill Match";
  }

  if (score >= 90) {
    return "Excellent Match";
  }

  if (score >= 70) {
    return "Strong Match";
  }

  if (score >= 50) {
    return "Good Match";
  }

  return "Potential Match";
}

function getMatchClasses(score?: number) {
  if (score === undefined) {
    return "bg-[var(--surface-soft)] text-[var(--text)]";
  }

  if (score >= 90) {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
  }

  if (score >= 70) {
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  }

  if (score >= 50) {
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  }

  return "bg-[var(--surface-soft)] text-[var(--text)]";
}

function Opportunities() {
  const navigate = useNavigate();

  const [opportunities, setOpportunities] =
    useState<Opportunity[]>([]);

  const [userSkills, setUserSkills] =
    useState<UserSkill[]>([]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] =
    useState("all");
  const [remoteOnly, setRemoteOnly] =
    useState(false);

  const [loading, setLoading] =
    useState(true);
  const [skillsLoading, setSkillsLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [skillsError, setSkillsError] =
    useState("");

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  }, [navigate]);

  const fetchOpportunities =
    useCallback(async () => {
      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/api/opportunities/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Unable to load opportunities.",
          );
        }

        const data = await response.json();

        setOpportunities(
          Array.isArray(data)
            ? data
            : data.results ?? [],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load opportunities.",
        );
      } finally {
        setLoading(false);
      }
    }, [handleUnauthorized]);

  const fetchUserSkills =
    useCallback(async () => {
      const token = getToken();

      if (!token) {
        return;
      }

      setSkillsLoading(true);
      setSkillsError("");

      try {
        const response = await fetch(
          `${API_URL}/api/accounts/me/skills/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Unable to load your skills.",
          );
        }

        const data = await response.json();

        let skills: UserSkill[] = [];

        if (Array.isArray(data)) {
          skills = data;
        } else if (Array.isArray(data.skills)) {
          skills = data.skills;
        } else if (Array.isArray(data.results)) {
          skills = data.results;
        }

        setUserSkills(skills);
      } catch (err) {
        setSkillsError(
          err instanceof Error
            ? err.message
            : "Unable to load your skills.",
        );
      } finally {
        setSkillsLoading(false);
      }
    }, [handleUnauthorized]);

  useEffect(() => {
    fetchOpportunities();
    fetchUserSkills();
  }, [fetchOpportunities, fetchUserSkills]);

  const userSkillIds = useMemo(
    () =>
      new Set(
        userSkills.map((skill) => skill.id),
      ),
    [userSkills],
  );

  const filteredOpportunities = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return opportunities
      .filter((opportunity) => {
        if (
          typeFilter !== "all" &&
          opportunity.opportunity_type !==
            typeFilter
        ) {
          return false;
        }

        if (
          remoteOnly &&
          !opportunity.is_remote
        ) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const searchableText = [
          opportunity.title,
          opportunity.company,
          opportunity.description,
          opportunity.location,
          opportunity.skill_name,
          opportunity.opportunity_type_display,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          normalizedSearch,
        );
      })
      .sort(
        (a, b) =>
          (b.match_score ?? 0) -
          (a.match_score ?? 0),
      );
  }, [
    opportunities,
    search,
    typeFilter,
    remoteOnly,
  ]);

  const matchedCount = useMemo(
    () =>
      opportunities.filter((opportunity) =>
        userSkillIds.has(opportunity.skill),
      ).length,
    [opportunities, userSkillIds],
  );

  const remoteCount = useMemo(
    () =>
      opportunities.filter(
        (opportunity) =>
          opportunity.is_remote,
      ).length,
    [opportunities],
  );

  const internshipCount = useMemo(
    () =>
      opportunities.filter(
        (opportunity) =>
          opportunity.opportunity_type ===
          "internship",
      ).length,
    [opportunities],
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-heading)] transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface-glass)] backdrop-blur-xl transition-colors duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-xl p-2 text-[var(--text)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text-heading)]"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-xl font-bold sm:text-2xl">
                Opportunities
              </h1>

              <p className="text-xs text-[var(--text)] sm:text-sm">
                Discover opportunities that match
                your skills
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <button
              onClick={fetchOpportunities}
              disabled={loading}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 text-[var(--text)] shadow-sm transition hover:bg-[var(--surface-soft)] hover:text-[var(--text-heading)] disabled:cursor-not-allowed disabled:opacity-50"
              title="Refresh opportunities"
            >
              <RefreshCw
                size={18}
                className={
                  loading ? "animate-spin" : ""
                }
              />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="mb-8 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-colors duration-300 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/15 bg-purple-500/10 px-3 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-300">
                <Sparkles size={15} />
                AI-Powered Opportunity Discovery
              </div>

              <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                Find opportunities built
                <span className="text-[var(--primary)]">
                  {" "}
                  for your skills.
                </span>
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-[var(--text)]">
                Explore internships, jobs and other
                opportunities. SkillBridge prioritizes
                opportunities that match the skills in
                your profile.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/skills"
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold !text-white shadow-sm transition hover:bg-[var(--primary-hover)]"
                >
                  <Target size={17} />
                  Manage My Skills
                </Link>

                <Link
                  to="/resources"
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--text-heading)] transition hover:bg-[var(--surface-soft)]"
                >
                  Learning Resources
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 transition-colors">
                <Briefcase
                  size={20}
                  className="mb-3 text-purple-600 dark:text-purple-400"
                />

                <p className="text-2xl font-bold">
                  {opportunities.length}
                </p>

                <p className="text-xs text-[var(--text)]">
                  Opportunities
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 transition-colors">
                <Target
                  size={20}
                  className="mb-3 text-emerald-600 dark:text-emerald-400"
                />

                <p className="text-2xl font-bold">
                  {matchedCount}
                </p>

                <p className="text-xs text-[var(--text)]">
                  Skill Matches
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 transition-colors">
                <Building2
                  size={20}
                  className="mb-3 text-blue-600 dark:text-blue-400"
                />

                <p className="text-2xl font-bold">
                  {internshipCount}
                </p>

                <p className="text-xs text-[var(--text)]">
                  Internships
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 transition-colors">
                <MapPin
                  size={20}
                  className="mb-3 text-purple-600 dark:text-purple-400"
                />

                <p className="text-2xl font-bold">
                  {remoteCount}
                </p>

                <p className="text-xs text-[var(--text)]">
                  Remote
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Search + Filters */}
        <section className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition-colors duration-300 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_auto] lg:items-center">
            <div className="relative">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-light)]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by title, company, skill or location..."
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] py-3 pl-11 pr-4 text-sm text-[var(--text-heading)] outline-none transition placeholder:text-[var(--text-light)] focus:border-[var(--primary)] focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-purple-500/20"
            >
              {opportunityTypeOptions.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition hover:bg-[var(--surface-soft)]">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(event) =>
                  setRemoteOnly(
                    event.target.checked,
                  )
                }
                className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />

              <span className="text-sm font-medium">
                Remote only
              </span>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-[var(--text)]">
              Showing{" "}
              <span className="font-semibold text-[var(--text-heading)]">
                {filteredOpportunities.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[var(--text-heading)]">
                {opportunities.length}
              </span>{" "}
              opportunities
            </p>

            {!skillsLoading &&
              userSkills.length > 0 && (
                <p className="text-[var(--primary)]">
                  {userSkills.length} skill
                  {userSkills.length !== 1
                    ? "s"
                    : ""}{" "}
                  used for matching
                </p>
              )}
          </div>
        </section>

        {/* Skill information */}
        {!skillsLoading &&
          userSkills.length > 0 && (
            <section className="mb-8 rounded-2xl border border-purple-500/15 bg-purple-500/5 p-5 transition-colors duration-300">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 text-[var(--primary)] shadow-sm">
                  <Target size={20} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Your matching skills
                  </h3>

                  <p className="mt-1 text-sm text-[var(--text)]">
                    Opportunities matching these
                    skills are prioritized.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {userSkills.map((skill) => (
                      <span
                        key={skill.id}
                        className="rounded-full border border-purple-500/10 bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--primary)] shadow-sm"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

        {/* Skills error */}
        {skillsError && (
          <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            {skillsError}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-700 dark:text-red-300 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              {error}
            </p>

            <button
              onClick={fetchOpportunities}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
              >
                <div className="mb-5 flex justify-between gap-4">
                  <div className="h-10 w-10 rounded-xl bg-[var(--surface-soft)]" />

                  <div className="h-7 w-24 rounded-full bg-[var(--surface-soft)]" />
                </div>

                <div className="h-6 w-3/4 rounded bg-[var(--surface-soft)]" />

                <div className="mt-3 h-4 w-1/2 rounded bg-[var(--surface-soft)]" />

                <div className="mt-5 space-y-2">
                  <div className="h-4 w-full rounded bg-[var(--surface-soft)]" />
                  <div className="h-4 w-5/6 rounded bg-[var(--surface-soft)]" />
                </div>

                <div className="mt-6 h-10 w-full rounded-xl bg-[var(--surface-soft)]" />
              </div>
            ))}
          </div>
        ) : filteredOpportunities.length === 0 ? (
          /* Empty state */
          <section className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center transition-colors duration-300">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--text)]">
              <Briefcase size={30} />
            </div>

            <h3 className="text-xl font-bold">
              No opportunities found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text)]">
              Try changing your search or filters.
              New opportunities can also be added
              through the backend.
            </p>

            {(search ||
              typeFilter !== "all" ||
              remoteOnly) && (
              <button
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                  setRemoteOnly(false);
                }}
                className="mt-5 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
              >
                Clear Filters
              </button>
            )}
          </section>
        ) : (
          /* Opportunity cards */
          <section>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  Explore Opportunities
                </h2>

                <p className="mt-1 text-sm text-[var(--text)]">
                  Best skill matches appear first.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {filteredOpportunities.map(
                (opportunity) => {
                  const daysRemaining =
                    getDaysRemaining(
                      opportunity.deadline,
                    );

                  const hasSkillMatch =
                    userSkillIds.has(
                      opportunity.skill,
                    );

                  return (
                    <article
                      key={opportunity.id}
                      className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      {/* Card top */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-[var(--primary)]">
                            <Briefcase size={21} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-bold">
                              {opportunity.title}
                            </h3>

                            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[var(--text)]">
                              <Building2 size={14} />
                              {opportunity.company}
                            </p>
                          </div>
                        </div>

                        {opportunity.match_score !==
                          undefined && (
                          <span
                            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${getMatchClasses(
                              opportunity.match_score,
                            )}`}
                          >
                            {opportunity.match_score}%
                          </span>
                        )}
                      </div>

                      {/* Badges */}
                      <div className="mt-5 flex flex-wrap gap-2">
                        <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-medium text-[var(--text)]">
                          {opportunity.opportunity_type_display ||
                            opportunity.opportunity_type}
                        </span>

                        {opportunity.is_remote && (
                          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                            Remote
                          </span>
                        )}

                        {opportunity.skill_name && (
                          <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-[var(--primary)]">
                            {opportunity.skill_name}
                          </span>
                        )}

                        {hasSkillMatch && (
                          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                            Your Skill
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="mt-5 line-clamp-3 text-sm leading-6 text-[var(--text)]">
                        {opportunity.description ||
                          "Explore this opportunity and see whether it matches your career goals."}
                      </p>

                      {/* Match reason */}
                      {opportunity.match_reason && (
                        <div className="mt-5 rounded-xl border border-purple-500/15 bg-purple-500/5 p-4">
                          <div className="flex gap-3">
                            <Sparkles
                              size={18}
                              className="mt-0.5 shrink-0 text-[var(--primary)]"
                            />

                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
                                {getMatchLabel(
                                  opportunity.match_score,
                                )}
                              </p>

                              <p className="mt-1 text-sm leading-5 text-[var(--text)]">
                                {
                                  opportunity.match_reason
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Meta */}
                      <div className="mt-5 space-y-2.5 border-t border-[var(--border)] pt-5">
                        <div className="flex items-center gap-2 text-sm text-[var(--text)]">
                          <MapPin size={16} />

                          <span>
                            {opportunity.location ||
                              "Location not specified"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--text)]">
                          <CalendarDays size={16} />

                          <span>
                            Deadline:{" "}
                            {formatDeadline(
                              opportunity.deadline,
                            )}
                          </span>

                          {daysRemaining !== null &&
                            daysRemaining >= 0 && (
                              <span className="font-medium text-amber-600 dark:text-amber-400">
                                ({daysRemaining}{" "}
                                {daysRemaining === 1
                                  ? "day"
                                  : "days"}{" "}
                                left)
                              </span>
                            )}

                          {daysRemaining !== null &&
                            daysRemaining < 0 && (
                              <span className="font-medium text-red-600 dark:text-red-400">
                                Expired
                              </span>
                            )}
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="mt-6 flex gap-3">
                        <a
                          href={opportunity.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                        >
                          View Opportunity

                          <ExternalLink
                            size={16}
                          />
                        </a>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <section className="mt-10 rounded-3xl bg-[var(--primary)] p-6 text-white shadow-lg transition-colors duration-300 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles size={20} />

                <span className="text-sm font-semibold text-purple-100">
                  Keep growing with SkillBridge
                </span>
              </div>

              <h2 className="text-2xl font-bold">
                Don't see the right opportunity yet?
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-purple-100">
                Improve your skills and keep your profile
                updated. Better skills mean better
                opportunity matches.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                to="/skills"
                className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-[var(--primary)] transition hover:bg-slate-100"
              >
                Improve Skills
              </Link>

              <Link
                to="/resources"
                className="rounded-xl border border-purple-300 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700/40"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
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

export default Opportunities;
