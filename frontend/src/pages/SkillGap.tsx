
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

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-[#050816] dark:text-white">
        <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur-xl transition-colors duration-500 dark:border-white/[0.06] dark:bg-[#050816]/85">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link
              to="/career"
              className="flex items-center gap-2 text-xl font-extrabold tracking-tight"
            >
              <Sparkles size={21} />
              SkillBridge
            </Link>

            <div className="flex items-center gap-3">
              <Link
                to="/career"
                className="hidden items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white sm:flex"
              >
                <ArrowLeft size={15} />
                Career
              </Link>

              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex min-h-[75vh] items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-lg transition-colors duration-500 dark:border-white/10 dark:bg-white/[0.06]">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-600 dark:border-t-white" />
            </div>

            <h2 className="text-xl font-bold">
              Analyzing your skills...
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Preparing your personalized skill gap analysis.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-[#050816] dark:text-white">
        <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#050816]/85">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link
              to="/career"
              className="flex items-center gap-2 text-xl font-extrabold"
            >
              <Sparkles size={21} />
              SkillBridge
            </Link>

            <ThemeToggle />
          </div>
        </header>

        <main className="flex min-h-[75vh] items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-500 dark:border-red-500/20 dark:bg-red-500/10">
              <AlertCircle size={27} />
            </div>

            <h1 className="text-2xl font-extrabold">
              Something went wrong
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {error}
            </p>

            <Link
              to="/career"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl dark:bg-white dark:text-slate-950"
            >
              <ArrowLeft size={15} />
              Back to Career
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // --------------------------------------------------
  // NO CAREER
  // --------------------------------------------------

  if (!career) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-[#050816] dark:text-white">
        <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#050816]/85">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link
              to="/career"
              className="flex items-center gap-2 text-xl font-extrabold"
            >
              <Sparkles size={21} />
              SkillBridge
            </Link>

            <ThemeToggle />
          </div>
        </header>

        <main className="flex min-h-[75vh] items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/[0.06]">
              <Target size={26} />
            </div>

            <h1 className="text-2xl font-extrabold">
              No Career Selected
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Return to Career and choose an AI career
              recommendation first.
            </p>

            <Link
              to="/career"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
            >
              <ArrowLeft size={15} />
              Back to Career
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-[#050816] dark:text-white">

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl transition-colors duration-500 dark:bg-indigo-500/10" />

        <div className="absolute -right-32 top-[35%] h-80 w-80 rounded-full bg-violet-400/10 blur-3xl transition-colors duration-500 dark:bg-violet-500/10" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl transition-colors duration-500 dark:border-white/[0.06] dark:bg-[#050816]/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link
            to="/career"
            className="group flex items-center gap-2.5 text-xl font-extrabold tracking-tight"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white transition group-hover:rotate-6 dark:bg-white dark:text-slate-950">
              <Sparkles size={17} />
            </span>

            SkillBridge
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/career"
              className="hidden items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white sm:flex"
            >
              <ArrowLeft size={15} />
              Career
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:py-14">

        {/* HERO */}
        <section className="mb-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-indigo-700 transition-colors duration-500 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300">
            <Zap size={13} />
            AI Skill Gap Analysis
          </div>

          <div className="max-w-4xl">
            <h1 className="text-4xl font-black leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
              Build the skills for{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-indigo-300 dark:via-violet-300 dark:to-fuchsia-300">
                {career.title}
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-400">
              Compare your current skills with the requirements of
              your recommended career and discover exactly what you
              should learn next.
            </p>
          </div>
        </section>

        {/* CAREER CARD */}
        <section className="group relative mb-7 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_15px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(15,23,42,0.09)] dark:border-white/[0.07] dark:bg-white/[0.045] dark:shadow-none">

          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl transition-colors duration-500 group-hover:bg-indigo-500/20" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2.5">

                <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700 dark:border-white/[0.07] dark:bg-white/[0.06] dark:text-slate-300">
                  Recommended Career
                </span>

                {career.demand_level && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                    {career.demand_level} demand
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {career.title}
              </h2>

              {career.description && (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {career.description}
                </p>
              )}
            </div>

            {career.career_url && (
              <a
                href={career.career_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
              >
                Explore Career
                <ExternalLink size={15} />
              </a>
            )}
          </div>
        </section>

        {/* STATS */}
        <section className="mb-7 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">

          {/* Coverage */}
          <div className="rounded-[26px] border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-500 dark:border-white/[0.07] dark:bg-white/[0.045] dark:shadow-none sm:p-7">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  Career Skill Coverage
                </p>

                <div className="mt-3 flex items-end gap-3">
                  <span className="text-4xl font-black tracking-tight">
                    {coverage}%
                  </span>

                  <span className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                    profile match
                  </span>
                </div>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors duration-500 dark:bg-indigo-400/10 dark:text-indigo-300">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>
                  {matchedSkills.length} matched
                </span>

                <span>
                  {requiredSkillNames.length} required
                </span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 transition-colors duration-500 dark:bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                  style={{
                    width: `${coverage}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Focus */}
          <div className="rounded-[26px] border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-500 dark:border-white/[0.07] dark:bg-white/[0.045] dark:shadow-none sm:p-7">

            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-300">
                <Route size={20} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
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

            <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {missingSkills.length > 0
                ? "Focus on the missing skills below to strengthen your profile for this career."
                : "Your current skills match all the required skills available for this career."}
            </p>
          </div>
        </section>

        {/* SKILL COMPARISON */}
        <section className="mb-7 grid gap-5 lg:grid-cols-2">

          {/* HAVE */}
          <div className="rounded-[26px] border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-500 dark:border-white/[0.07] dark:bg-white/[0.045] dark:shadow-none sm:p-7">

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300">
                <CheckCircle2 size={19} />
              </div>

              <div>
                <h2 className="font-extrabold">
                  Skills You Have
                </h2>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Already aligned with this career
                </p>
              </div>
            </div>

            {matchedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
                  >
                    <Check size={14} />
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center dark:border-white/[0.07] dark:bg-white/[0.025]">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No matching skills found yet.
                </p>
              </div>
            )}
          </div>

          {/* MISSING */}
          <div className="rounded-[26px] border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-500 dark:border-white/[0.07] dark:bg-white/[0.045] dark:shadow-none sm:p-7">

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300">
                <Target size={19} />
              </div>

              <div>
                <h2 className="font-extrabold">
                  Skills to Develop
                </h2>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Prioritize these skills next
                </p>
              </div>
            </div>

            {missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300"
                  >
                    <Target size={14} />
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} />
                  Great job! No skill gaps were detected.
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RESOURCES */}
        {missingSkills.length > 0 && (
          <section className="mb-7 rounded-[26px] border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-500 dark:border-white/[0.07] dark:bg-white/[0.045] dark:shadow-none sm:p-7">

            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
                  <BookOpen size={19} />
                </div>

                <div>
                  <h2 className="font-extrabold">
                    Recommended Learning Resources
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Curated resources for your skill gaps
                  </p>
                </div>
              </div>

              <Link
                to="/resources"
                className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 transition-all hover:gap-3 dark:text-indigo-300"
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
                    className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:bg-white hover:shadow-lg dark:border-white/[0.06] dark:bg-white/[0.025] dark:hover:border-indigo-400/20 dark:hover:bg-white/[0.05]"
                  >
                    <div className="mb-4 flex items-center justify-between">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-white/[0.07] dark:text-indigo-300">
                        {getResourceIcon(
                          resource.resource_type
                        )}
                      </div>

                      <ExternalLink
                        size={15}
                        className="text-slate-400 transition group-hover:text-indigo-500"
                      />
                    </div>

                    <h3 className="font-bold leading-6">
                      {resource.title}
                    </h3>

                    {resource.description && (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {resource.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-2">
                      <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:border-white/[0.06] dark:bg-white/[0.05] dark:text-slate-300">
                        {getResourceTypeLabel(
                          resource.resource_type
                        )}
                      </span>

                      {resource.skill_name && (
                        <span className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {resource.skill_name}
                        </span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-white/[0.08]">

                <BookOpen
                  size={25}
                  className="mx-auto mb-3 text-slate-400"
                />

                <h3 className="font-bold">
                  No matching resources found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                  Explore the Resources section to find learning
                  material for your missing skills.
                </p>

                <Link
                  to="/resources"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                >
                  Explore Resources
                  <ArrowRight size={15} />
                </Link>
              </div>
            )}
          </section>
        )}

        {/* CTA */}
        <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/80 p-7 shadow-sm backdrop-blur-xl transition-colors duration-500 dark:border-white/[0.07] dark:bg-white/[0.045] dark:shadow-none sm:p-9">

          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-2xl">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
                <Route size={20} />
              </div>

              <h2 className="text-2xl font-black tracking-tight">
                Ready to close your skill gap?
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Start with the missing skills above and build a
                focused learning path toward your recommended
                career.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">

              <Link
                to="/skills"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
              >
                <span>Manage My Skills</span>
                <ArrowRight size={15} />
              </Link>

              <Link
                to="/resources"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl dark:bg-blue-600 dark:text-white"
              >
                <span>Start Learning</span>
                <ArrowRight size={15} />
              </Link>

            </div>
          </div>
        </section>

        {/* BACK */}
        <div className="mt-8">
          <Link
            to="/career"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
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
