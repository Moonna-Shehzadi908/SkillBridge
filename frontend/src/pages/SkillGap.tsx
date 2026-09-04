
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ExternalLink,
  FileText,
  GraduationCap,
  PlayCircle,
  Route,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

interface UserSkill {
  id: number;
  skill: number;
  skill_name: string;
  proficiency?: string;
}

interface Skill {
  id: number;
  name: string;
}

interface Career {
  id: number;
  title: string;
  description?: string;
  average_salary?: number | string;
  demand_level?: string;
  career_url?: string;
  required_skills?: number[];
}

interface Resource {
  id: number;
  title: string;
  description?: string;
  url: string;
  resource_type?: string;
  skill_name?: string;
}

interface SkillGapState {
  career?: Career;
}

const API_URL = "http://127.0.0.1:8000";

const normalizeSkill = (value: string = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.\-_]/g, " ");

const getResourceIcon = (type?: string) => {
  const value = (type || "").toLowerCase();

  if (value.includes("video") || value.includes("youtube")) {
    return <PlayCircle size={17} />;
  }

  if (value.includes("course")) {
    return <GraduationCap size={17} />;
  }

  return <FileText size={17} />;
};

const getResourceTypeLabel = (type?: string) => {
  const value = (type || "").toLowerCase();

  if (value.includes("video")) return "Video";
  if (value.includes("course")) return "Course";
  if (value.includes("article")) return "Article";

  return type || "Resource";
};

function SkillGap() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as SkillGapState | null;

  const [career, setCareer] = useState<Career | null>(
    state?.career || null
  );

  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  const handleUnauthorized = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  const fetchJSON = async (endpoint: string) => {
    if (!token) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const text = await response.text();

    console.log("SkillGap API:", endpoint);
    console.log("Status:", response.status);

    if (response.status === 401) {
      handleUnauthorized();
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      console.error("SkillGap API Error:", endpoint, text);

      throw new Error(
        `Request failed: ${response.status} - ${endpoint}`
      );
    }

    if (!text) {
      return [];
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON response from ${endpoint}`);
    }
  };

  const extractResults = (data: any) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const mySkillsData = await fetchJSON(
          "/api/accounts/me/skills/"
        );

        if (!mounted) return;

        setUserSkills(extractResults(mySkillsData));

        try {
          const skillsData = await fetchJSON("/api/skills/");

          if (mounted) {
            setSkills(extractResults(skillsData));
          }
        } catch (err) {
          console.error("Skills API failed:", err);

          if (mounted) {
            setSkills([]);
          }
        }

        try {
          const resourcesData = await fetchJSON(
            "/api/resources/"
          );

          if (mounted) {
            setResources(extractResults(resourcesData));
          }
        } catch (err) {
          console.error("Resources API failed:", err);

          if (mounted) {
            setResources([]);
          }
        }

        if (!state?.career) {
          try {
            const recommendationData = await fetchJSON(
              "/api/career/recommendations/"
            );

            const recommendations =
              recommendationData?.recommendations ||
              recommendationData?.results ||
              [];

            if (
              mounted &&
              Array.isArray(recommendations) &&
              recommendations.length > 0
            ) {
              const first = recommendations[0];

              setCareer(first?.career || first);
            }
          } catch (err) {
            console.error(
              "Career recommendation fallback failed:",
              err
            );
          }
        }
      } catch (err) {
        console.error("SkillGap loading error:", err);

        if (
          mounted &&
          (err as Error).message !== "Unauthorized"
        ) {
          setError(
            "Unable to load your skill gap analysis right now."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [navigate, token, state?.career]);

  const userSkillNames = useMemo(() => {
    return userSkills
      .map((item) => item.skill_name)
      .filter(Boolean);
  }, [userSkills]);

  const requiredSkillNames = useMemo(() => {
    if (!career) return [];

    if (
      Array.isArray(career.required_skills) &&
      career.required_skills.length > 0
    ) {
      return career.required_skills
        .map((id) => {
          const skill = skills.find(
            (item) => item.id === id
          );

          return skill?.name;
        })
        .filter(Boolean) as string[];
    }

    return [];
  }, [career, skills]);

  const matchedSkills = useMemo(() => {
    return requiredSkillNames.filter((required) =>
      userSkillNames.some(
        (userSkill) =>
          normalizeSkill(userSkill) ===
          normalizeSkill(required)
      )
    );
  }, [requiredSkillNames, userSkillNames]);

  const missingSkills = useMemo(() => {
    return requiredSkillNames.filter(
      (required) =>
        !userSkillNames.some(
          (userSkill) =>
            normalizeSkill(userSkill) ===
            normalizeSkill(required)
        )
    );
  }, [requiredSkillNames, userSkillNames]);

  const coverage = useMemo(() => {
    if (requiredSkillNames.length === 0) return 0;

    return Math.round(
      (matchedSkills.length / requiredSkillNames.length) * 100
    );
  }, [requiredSkillNames, matchedSkills]);

  const recommendedResources = useMemo(() => {
    if (missingSkills.length === 0) return [];

    const selected: Resource[] = [];

    missingSkills.forEach((missingSkill) => {
      const matching = resources.filter(
        (resource) =>
          normalizeSkill(resource.skill_name || "") ===
          normalizeSkill(missingSkill)
      );

      matching.slice(0, 2).forEach((resource) => {
        if (
          !selected.some(
            (item) => item.id === resource.id
          )
        ) {
          selected.push(resource);
        }
      });
    });

    return selected.slice(0, 6);
  }, [missingSkills, resources]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div
        className="min-h-screen text-[var(--text-heading)] transition-colors duration-300"
        style={{ background: "var(--bg)" }}
      >
        <header
          className="border-b backdrop-blur-xl"
          style={{
            borderColor: "var(--border)",
            background: "color-mix(in srgb, var(--surface) 90%, transparent)",
          }}
        >
          <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
            <Link
              to="/career"
              className="group flex items-center gap-3"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg transition-all duration-300 group-hover:scale-105"
                style={{ background: "var(--primary)" }}
              >
                <Sparkles size={18} />
              </span>

              <span className="text-xl font-bold tracking-tight sm:text-2xl">
                Skill
                <span style={{ color: "var(--primary)" }}>
                  Bridge
                </span>
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                to="/career"
                className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all hover:bg-[var(--primary-soft)] sm:flex"
              >
                <ArrowLeft size={15} />
                Career
              </Link>

              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden px-6">
          <div
            className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl"
            style={{ background: "var(--primary-soft)" }}
          />

          <div className="relative text-center">
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border shadow-xl"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
              }}
            >
              <div
                className="h-7 w-7 animate-spin rounded-full border-2"
                style={{
                  borderColor: "var(--border)",
                  borderTopColor: "var(--primary)",
                }}
              />
            </div>

            <h2 className="text-xl font-bold">
              Analyzing your skills...
            </h2>

            <p
              className="mt-2 text-sm"
              style={{ color: "var(--text)" }}
            >
              Preparing your personalized skill gap analysis.
            </p>
          </div>
        </main>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div
        className="min-h-screen text-[var(--text-heading)] transition-colors duration-300"
        style={{ background: "var(--bg)" }}
      >
        <header
          className="border-b backdrop-blur-xl"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
          }}
        >
          <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
            <Link
              to="/career"
              className="flex items-center gap-3 text-xl font-bold"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
                style={{ background: "var(--primary)" }}
              >
                <Sparkles size={18} />
              </span>

              <span>
                Skill
                <span style={{ color: "var(--primary)" }}>
                  Bridge
                </span>
              </span>
            </Link>

            <ThemeToggle />
          </div>
        </header>

        <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-500">
              <AlertCircle size={28} />
            </div>

            <h1 className="text-2xl font-extrabold">
              Something went wrong
            </h1>

            <p
              className="mt-3 text-sm leading-6"
              style={{ color: "var(--text)" }}
            >
              {error}
            </p>

            <Link
              to="/career"
              className="mt-7 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
              style={{ background: "var(--primary)" }}
            >
              <ArrowLeft size={15} />
              Back to Career
            </Link>
          </div>
        </main>
      </div>
    );
  }

  /* =========================================================
     NO CAREER
  ========================================================= */

  if (!career) {
    return (
      <div
        className="min-h-screen text-[var(--text-heading)] transition-colors duration-300"
        style={{ background: "var(--bg)" }}
      >
        <header
          className="border-b backdrop-blur-xl"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
          }}
        >
          <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
            <Link
              to="/career"
              className="flex items-center gap-3 text-xl font-bold"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
                style={{ background: "var(--primary)" }}
              >
                <Sparkles size={18} />
              </span>

              <span>
                Skill
                <span style={{ color: "var(--primary)" }}>
                  Bridge
                </span>
              </span>
            </Link>

            <ThemeToggle />
          </div>
        </header>

        <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-muted)",
              }}
            >
              <Target size={27} />
            </div>

            <h1 className="text-2xl font-extrabold">
              No Career Selected
            </h1>

            <p
              className="mt-3 text-sm leading-6"
              style={{ color: "var(--text)" }}
            >
              Return to Career and choose an AI career
              recommendation first.
            </p>

            <Link
              to="/career"
              className="mt-7 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
              style={{ background: "var(--primary)" }}
            >
              <ArrowLeft size={15} />
              Back to Career
            </Link>
          </div>
        </main>
      </div>
    );
  }

  /* =========================================================
     MAIN PAGE
  ========================================================= */

  return (
    <div
      className="min-h-screen overflow-x-hidden transition-colors duration-300"
      style={{
        background: "var(--bg)",
        color: "var(--text-heading)",
      }}
    >
      {/* =====================================================
          BACKGROUND ATMOSPHERE
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div
          className="absolute -left-40 top-24 h-96 w-96 rounded-full blur-3xl"
          style={{
            background: "var(--primary-soft)",
            opacity: 0.65,
          }}
        />

        <div
          className="absolute -right-40 top-[38%] h-96 w-96 rounded-full blur-3xl"
          style={{
            background: "var(--primary-soft)",
            opacity: 0.45,
          }}
        />
      </div>

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface)",
        }}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

          <Link
            to="/career"
            className="group flex items-center gap-3"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:rotate-2"
              style={{ background: "var(--primary)" }}
            >
              <Sparkles size={18} />
            </span>

            <span className="text-xl font-bold tracking-tight sm:text-2xl">
              Skill
              <span style={{ color: "var(--primary)" }}>
                Bridge
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">

            <Link
              to="/career"
              className="hidden items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all hover:bg-[var(--primary-soft)] sm:flex"
            >
              <ArrowLeft size={15} />
              Career
            </Link>

            <ThemeToggle />

          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:py-14">

        {/* =====================================================
            HERO
        ====================================================== */}

        <section
          className="relative mb-10 overflow-hidden rounded-[32px] border p-7 shadow-[0_20px_70px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-colors duration-300 sm:p-9 lg:p-11"
          style={{
            borderColor: "var(--border)",
            background:
              "linear-gradient(135deg, var(--surface), var(--primary-soft))",
          }}
        >
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
            style={{
              background: "var(--primary)",
              opacity: 0.08,
            }}
          />

          <div
            className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full blur-3xl"
            style={{
              background: "var(--primary)",
              opacity: 0.06,
            }}
          />

          <div className="relative max-w-4xl">

            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em]"
              style={{
                borderColor: "var(--border)",
                background: "var(--primary-soft)",
                color: "var(--primary)",
              }}
            >
              <Zap size={13} />
              AI Skill Gap Analysis
            </div>

            <h1 className="text-4xl font-black leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Build the skills for{" "}
              <span
                className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent"
              >
                {career.title}
              </span>
            </h1>

            <p
              className="mt-5 max-w-3xl text-base leading-7"
              style={{ color: "var(--text)" }}
            >
              Compare your current skills with the requirements of
              your recommended career and discover exactly what you
              should learn next.
            </p>

          </div>
        </section>

        {/* =====================================================
            CAREER CARD
        ====================================================== */}

        <section
          className="group relative mb-7 overflow-hidden rounded-[28px] border p-6 shadow-[0_15px_55px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(15,23,42,0.09)] sm:p-7"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
          }}
        >
          <div
            className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: "var(--primary-soft)",
            }}
          />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2.5">

                <span
                  className="rounded-full border px-3 py-1 text-[11px] font-bold"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--primary-soft)",
                    color: "var(--primary)",
                  }}
                >
                  Recommended Career
                </span>

                {career.demand_level && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                    {career.demand_level} demand
                  </span>
                )}

              </div>

              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {career.title}
              </h2>

              {career.description && (
                <p
                  className="mt-3 max-w-3xl text-sm leading-6"
                  style={{ color: "var(--text)" }}
                >
                  {career.description}
                </p>
              )}
            </div>

            {career.career_url && (
              <a
                href={career.career_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  color: "var(--text-heading)",
                }}
              >
                Explore Career
                <ExternalLink size={15} />
              </a>
            )}

          </div>
        </section>

        {/* =====================================================
            STATS
        ====================================================== */}

        <section className="mb-7 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">

          {/* COVERAGE */}

          <div
            className="group rounded-[26px] border p-6 shadow-[0_12px_45px_rgba(15,23,42,0.05)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 sm:p-7"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
            }}
          >
            <div className="flex items-start justify-between">

              <div>
                <p
                  className="text-xs font-bold uppercase tracking-[0.12em]"
                  style={{ color: "var(--text)" }}
                >
                  Career Skill Coverage
                </p>

                <div className="mt-3 flex items-end gap-3">
                  <span
                    className="text-4xl font-black tracking-tight"
                    style={{ color: "var(--primary)" }}
                  >
                    {coverage}%
                  </span>

                  <span
                    className="mb-1 text-sm font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    profile match
                  </span>
                </div>
              </div>

              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: "var(--primary-soft)",
                  color: "var(--primary)",
                }}
              >
                <TrendingUp size={20} />
              </div>

            </div>

            <div className="mt-6">

              <div
                className="mb-2 flex justify-between text-xs font-semibold"
                style={{ color: "var(--text)" }}
              >
                <span>
                  {matchedSkills.length} matched
                </span>

                <span>
                  {requiredSkillNames.length} required
                </span>
              </div>

              <div
                className="h-3 overflow-hidden rounded-full"
                style={{
                  background: "var(--surface-muted)",
                }}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-all duration-700"
                  style={{
                    width: `${coverage}%`,
                  }}
                />
              </div>

            </div>
          </div>

          {/* FOCUS */}

          <div
            className="rounded-[26px] border p-6 shadow-[0_12px_45px_rgba(15,23,42,0.05)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 sm:p-7"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
            }}
          >
            <div className="flex items-start gap-4">

              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: "var(--primary-soft)",
                  color: "var(--primary)",
                }}
              >
                <Route size={20} />
              </div>

              <div>
                <p
                  className="text-xs font-bold uppercase tracking-[0.12em]"
                  style={{ color: "var(--text)" }}
                >
                  Your Learning Focus
                </p>

                <h3 className="mt-2 text-xl font-extrabold">
                  {missingSkills.length > 0
                    ? `${missingSkills.length} skill${
                        missingSkills.length === 1
                          ? ""
                          : "s"
                      } to improve`
                    : "Career ready"}
                </h3>
              </div>

            </div>

            <p
              className="mt-5 text-sm leading-6"
              style={{ color: "var(--text)" }}
            >
              {missingSkills.length > 0
                ? "Focus on the missing skills below to strengthen your profile for this career."
                : "Your current skills match all the required skills available for this career."}
            </p>
          </div>

        </section>

        {/* =====================================================
            SKILL COMPARISON
        ====================================================== */}

        <section className="mb-7 grid gap-5 lg:grid-cols-2">

          {/* HAVE */}

          <div
            className="rounded-[26px] border p-6 shadow-[0_12px_45px_rgba(15,23,42,0.05)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 sm:p-7"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
            }}
          >

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={19} />
              </div>

              <div>
                <h2 className="font-extrabold">
                  Skills You Have
                </h2>

                <p
                  className="mt-0.5 text-xs"
                  style={{ color: "var(--text)" }}
                >
                  Already aligned with this career
                </p>
              </div>

            </div>

            {matchedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700"
                  >
                    <Check size={14} />
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div
                className="rounded-2xl border border-dashed p-6 text-center"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface-muted)",
                }}
              >
                <p
                  className="text-sm"
                  style={{ color: "var(--text)" }}
                >
                  No matching skills found yet.
                </p>
              </div>
            )}

          </div>

          {/* MISSING */}

          <div
            className="rounded-[26px] border p-6 shadow-[0_12px_45px_rgba(15,23,42,0.05)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 sm:p-7"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
            }}
          >

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Target size={19} />
              </div>

              <div>
                <h2 className="font-extrabold">
                  Skills to Develop
                </h2>

                <p
                  className="mt-0.5 text-xs"
                  style={{ color: "var(--text)" }}
                >
                  Prioritize these skills next
                </p>
              </div>

            </div>

            {missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700"
                  >
                    <Target size={14} />
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} />
                  Great job! No skill gaps were detected.
                </div>
              </div>
            )}

          </div>

        </section>

        {/* =====================================================
            RESOURCES
        ====================================================== */}

        {missingSkills.length > 0 && (
          <section
            className="mb-7 rounded-[26px] border p-6 shadow-[0_12px_45px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:p-7"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
            }}
          >

            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background: "var(--primary-soft)",
                    color: "var(--primary)",
                  }}
                >
                  <BookOpen size={19} />
                </div>

                <div>
                  <h2 className="font-extrabold">
                    Recommended Learning Resources
                  </h2>

                  <p
                    className="mt-1 text-xs"
                    style={{ color: "var(--text)" }}
                  >
                    Curated resources for your skill gaps
                  </p>
                </div>

              </div>

              <Link
                to="/resources"
                className="inline-flex items-center gap-2 text-sm font-bold transition-all hover:gap-3"
                style={{ color: "var(--primary)" }}
              >
                View all
                <ArrowRight size={15} />
              </Link>

            </div>

            {recommendedResources.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                {recommendedResources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface-muted)",
                    }}
                  >

                    <div
                      className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background: "var(--primary-soft)",
                      }}
                    />

                    <div className="relative">

                      <div className="mb-4 flex items-center justify-between">

                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl"
                          style={{
                            background: "var(--surface)",
                            color: "var(--primary)",
                          }}
                        >
                          {getResourceIcon(
                            resource.resource_type
                          )}
                        </div>

                        <ExternalLink
                          size={15}
                          className="transition"
                          style={{ color: "var(--text-muted)" }}
                        />

                      </div>

                      <h3 className="font-bold leading-6">
                        {resource.title}
                      </h3>

                      {resource.description && (
                        <p
                          className="mt-2 line-clamp-2 text-xs leading-5"
                          style={{ color: "var(--text)" }}
                        >
                          {resource.description}
                        </p>
                      )}

                      <div className="mt-4 flex items-center gap-2">

                        <span
                          className="rounded-lg border px-2.5 py-1 text-[11px] font-bold"
                          style={{
                            borderColor: "var(--border)",
                            background: "var(--surface)",
                            color: "var(--text)",
                          }}
                        >
                          {getResourceTypeLabel(
                            resource.resource_type
                          )}
                        </span>

                        {resource.skill_name && (
                          <span
                            className="truncate text-[11px] font-medium"
                            style={{ color: "var(--text)" }}
                          >
                            {resource.skill_name}
                          </span>
                        )}

                      </div>

                    </div>
                  </a>
                ))}

              </div>
            ) : (
              <div
                className="rounded-2xl border border-dashed p-8 text-center"
                style={{
                  borderColor: "var(--border)",
                }}
              >

                <BookOpen
                  size={25}
                  className="mx-auto mb-3"
                  style={{ color: "var(--text-muted)" }}
                />

                <h3 className="font-bold">
                  No matching resources found
                </h3>

                <p
                  className="mx-auto mt-2 max-w-md text-sm"
                  style={{ color: "var(--text)" }}
                >
                  Explore the Resources section to find learning
                  material for your missing skills.
                </p>

                <Link
                  to="/resources"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
                  style={{ background: "var(--primary)" }}
                >
                  Explore Resources
                  <ArrowRight size={15} />
                </Link>

              </div>
            )}

          </section>
        )}

        {/* =====================================================
            CTA
        ====================================================== */}

        <section
          className="relative mb-8 overflow-hidden rounded-[30px] border p-7 shadow-[0_18px_60px_rgba(79,70,229,0.08)] sm:p-9"
          style={{
            borderColor: "var(--border)",
            background:
              "linear-gradient(135deg, var(--surface), var(--primary-soft))",
          }}
        >

          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
            style={{
              background: "var(--primary)",
              opacity: 0.08,
            }}
          />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-2xl">

              <div
                className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg"
                style={{ background: "var(--primary)" }}
              >
                <Route size={20} />
              </div>

              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                Ready to close your skill gap?
              </h2>

              <p
                className="mt-3 text-sm leading-6"
                style={{ color: "var(--text)" }}
              >
                Start with the missing skills above and build a
                focused learning path toward your recommended
                career.
              </p>

            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">

              <Link
                to="/skills"
                className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  color: "var(--text-heading)",
                }}
              >
                <span>Manage My Skills</span>
                <ArrowRight size={15} />
              </Link>

              <Link
                to="/resources"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                style={{ background: "var(--primary)" }}
              >
                <span>Start Learning</span>
                <ArrowRight size={15} />
              </Link>

            </div>
          </div>
        </section>

        {/* =====================================================
            BACK
        ====================================================== */}

        <div className="mt-8">
          <Link
            to="/career"
            className="group inline-flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3"
            style={{ color: "var(--text)" }}
          >
            <ArrowLeft size={15} />
            Back to Career Recommendations
          </Link>
        </div>

      </main>
    </div>
  );
}

export default SkillGap;
