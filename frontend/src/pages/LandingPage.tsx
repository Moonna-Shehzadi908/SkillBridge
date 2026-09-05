
import { useEffect, useMemo, useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/hero section.avif";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  GraduationCap,
  Menu,
  Moon,
  Palette,
  BarChart3,
  Rocket,
  Sparkles,
  Sun,
  TrendingUp,
  Users,
  Video,
  X,
  Layers3,
  Target,
  Zap,
  BriefcaseBusiness,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

interface Skill {
  id: number;
  name: string;
  description?: string;
  category?: string;
}

interface Resource {
  id: number;
  title?: string;
  name?: string;
  resource_type?: string;
  type?: string;
  skill?: number | string;
}

interface CareerRecommendation {
  id?: number;
  title: string;
  matchPercentage: number;
  demandLevel: string;
  averageSalary?: number | string | null;
  missingSkills: string[];
  careerUrl?: string | null;
}

const getToken = (): string | null => localStorage.getItem("access_token");

const getArrayFromResponse = (data: unknown): unknown[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const value = data as Record<string, unknown>;
    if (Array.isArray(value.results)) return value.results;
    if (Array.isArray(value.data)) return value.data;
    if (Array.isArray(value.skills)) return value.skills;
    if (Array.isArray(value.resources)) return value.resources;
    if (Array.isArray(value.recommendations)) return value.recommendations;
  }
  return [];
};

const isSkill = (item: unknown): item is Skill => {
  if (!item || typeof item !== "object") return false;
  const value = item as Record<string, unknown>;
  return typeof value.id === "number" && typeof value.name === "string";
};

const isResource = (item: unknown): item is Resource => {
  if (!item || typeof item !== "object") return false;
  const value = item as Record<string, unknown>;
  return typeof value.id === "number";
};

const normalizeRecommendations = (data: unknown): CareerRecommendation[] => {
  const recommendations: CareerRecommendation[] = [];

  for (const item of getArrayFromResponse(data)) {
    if (!item || typeof item !== "object") continue;

    const value = item as Record<string, unknown>;
    const rawMatch =
      value.match_percentage ??
      value.matchPercentage ??
      value.match ??
      value.score ??
      0;
    const match = Number(rawMatch);
    const missingRaw = value.missing_skills ?? value.missingSkills ?? [];

    const missingSkills: string[] = Array.isArray(missingRaw)
      ? missingRaw
          .map((skill) => {
            if (typeof skill === "string") return skill;
            if (skill && typeof skill === "object") {
              const skillObject = skill as Record<string, unknown>;
              return String(skillObject.name ?? skillObject.title ?? "");
            }
            return String(skill);
          })
          .filter(Boolean)
      : [];

    recommendations.push({
      id: typeof value.id === "number" ? value.id : undefined,
      title: String(
        value.title ??
          value.name ??
          value.career ??
          value.career_title ??
          "Career Path",
      ),
      matchPercentage: Math.max(
        0,
        Math.min(100, Number.isFinite(match) ? Math.round(match) : 0),
      ),
      demandLevel: String(value.demand_level ?? value.demand ?? "—"),
      averageSalary:
  value.average_salary !== undefined &&
  value.average_salary !== null
    ? String(value.average_salary)
    : value.salary !== undefined &&
        value.salary !== null
      ? String(value.salary)
      : null,
      missingSkills,
      careerUrl:
        value.career_url != null
          ? String(value.career_url)
          : value.url != null
            ? String(value.url)
            : null,
    });
  }

  return recommendations;
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const navigate = useNavigate();

  const fetchLandingData = async () => {
    try {
      setDataLoading(true);
      const token = getToken();
      const headers: HeadersInit = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const requests: Promise<Response>[] = [
        fetch(`${API_URL}/api/skills/`, { headers }),
        fetch(`${API_URL}/api/resources/`, { headers }),
      ];

      if (token) {
        requests.push(
          fetch(`${API_URL}/api/career/recommendations/`, { headers }),
        );
      }

      const responses = await Promise.allSettled(requests);

      if (responses[0]?.status === "fulfilled" && responses[0].value.ok) {
        const data: unknown = await responses[0].value.json();
        setSkills(getArrayFromResponse(data).filter(isSkill));
      }

      if (responses[1]?.status === "fulfilled" && responses[1].value.ok) {
        const data: unknown = await responses[1].value.json();
        setResources(getArrayFromResponse(data).filter(isResource));
      }

      if (
        token &&
        responses[2]?.status === "fulfilled" &&
        responses[2].value.ok
      ) {
        const data: unknown = await responses[2].value.json();
        setRecommendations(normalizeRecommendations(data));
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error("Landing page data error:", error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    void fetchLandingData();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((current) => !current);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // =========================================================
  // SMOOTH SCROLL
  // =========================================================

  const scrollToSection = (sectionId: string) => {
    closeMenu();

    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const handleDashboard = () => {
    closeMenu();
    navigate("/dashboard");
  };

  const handleLogin = () => {
    closeMenu();
    navigate("/login");
  };

  const handleRegister = () => {
    closeMenu();
    navigate("/register");
  };

  const handleResources = () => {
    closeMenu();
    navigate("/resources");
  };

  const handleSkills = () => {
    closeMenu();
    navigate("/skills");
  };

  const topCareer = recommendations[0];
  const dynamicProgress = topCareer?.matchPercentage ?? 0;
  const skillCount = skills.length;
  const resourceCount = resources.length;

  const skillNames = useMemo(() => {
    const fallback = [
      "Web Development",
      "AI & Machine Learning",
      "Data & Analytics",
      "UI / UX Design",
      "Mobile Development",
      "Career & Professional Skills",
    ];

    return Array.from({ length: 6 }, (_, index) => {
      return skills[index]?.name || fallback[index];
    });
  }, [skills]);

  return (
    <div
      className="app min-h-screen overflow-x-hidden"
      style={{
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <button
            type="button"
            onClick={() => scrollToSection("home")}
            className="group flex items-center gap-3"
            aria-label="SkillBridge home"
          >
            <span className="logo-mark transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
              <span className="text-xl font-bold text-white">S</span>
            </span>

            <span className="text-xl font-bold tracking-tight text-[var(--text-heading)] sm:text-2xl">
              Skill
              <span className="text-[var(--primary)]">Bridge</span>
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-7 lg:flex">
            <button
              type="button"
              onClick={() => scrollToSection("home")}
              className="nav-link nav-link-active"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("skills")}
              className="nav-link"
            >
              Skills
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("resources")}
              className="nav-link"
            >
              Resources
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("career")}
              className="nav-link"
            >
              Career
            </button>

            <button
              type="button"
              onClick={handleDashboard}
              className="nav-link"
            >
              Dashboard
            </button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 md:flex">

            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleLogin}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--text-heading)] transition-all hover:text-[var(--primary)]"
            >
              Log in
            </button>

            <button
              type="button"
              onClick={handleRegister}
              className="primary-button"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">

            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="theme-toggle"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="mobile-menu lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">

              <button
                type="button"
                onClick={() => scrollToSection("home")}
                className="mobile-nav-link text-left"
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("skills")}
                className="mobile-nav-link text-left"
              >
                Skills
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("resources")}
                className="mobile-nav-link text-left"
              >
                Resources
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("career")}
                className="mobile-nav-link text-left"
              >
                Career
              </button>

              <button
                type="button"
                onClick={handleDashboard}
                className="mobile-nav-link text-left"
              >
                Dashboard
              </button>

              <div className="mt-3 flex gap-3 border-t border-[var(--border)] pt-4">

                <button
                  type="button"
                  onClick={handleLogin}
                  className="secondary-button flex-1"
                >
                  Log in
                </button>

                <button
                  type="button"
                  onClick={handleRegister}
                  className="primary-button flex-1"
                >
                  Get Started
                </button>

              </div>
            </nav>
          </div>
        )}
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}

      <main id="home">

        <section className="hero-section">

          {/* Hero Background Image */}
          <div
            className="hero-image-layer"
            style={{
              backgroundImage: `url("${heroImage}")`,
              opacity: 0.9,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Gradient Atmosphere */}
          <div className="hero-color-layer" />

          <div className="hero-extra-glow hero-extra-glow-left" />
          <div className="hero-extra-glow hero-extra-glow-right" />

          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">

            <div className="grid w-full items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">

              {/* Hero Content */}
              <div className="hero-content">

                <div className="hero-badge">
                  <Sparkles className="h-4 w-4" />
                  Smart Skill & Career Development
                </div>

                <h1>
                  Bridge Your Skills
                  <span className="hero-title-gradient">
                    To Your Future
                  </span>
                </h1>

                <p>
                  Discover skills, access expert resources, track your
                  progress, and explore career opportunities — all in one
                  place.
                </p>

                <div className="hero-actions">

                  <button
                    type="button"
                    onClick={() => scrollToSection("skills")}
                    className="primary-button hero-button"
                  >
                    Explore Skills
                    <ArrowRight className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection("resources")}
                    className="secondary-button hero-button"
                  >
                    View Resources
                  </button>

                </div>

                <div className="hero-trust-points">

                  <div>
                    <CheckCircle2 />
                    <span>Learn at your pace</span>
                  </div>

                  <div>
                    <CheckCircle2 />
                    <span>Track your progress</span>
                  </div>

                  <div>
                    <CheckCircle2 />
                    <span>Build your career</span>
                  </div>

                </div>
              </div>

              {/* =================================================
                  HERO VISUAL
              ================================================== */}

              <div className="hero-visual">

                <div className="hero-glow" />

                {/* Learning Card */}
                <div className="floating-card floating-card-one">

                  <div className="floating-card-icon icon-purple">
                    <GraduationCap />
                  </div>

                  <div className="floating-card-content">
                    <span>Learning</span>
                    <strong>Grow Your Skills</strong>
                  </div>

                  <div className="card-status">
                    <CheckCircle2 />
                  </div>
                </div>

                {/* Main Journey Card */}
                <div className="hero-center-card">

                  <div className="center-card-header">

                    <div className="hero-center-icon">
                      <Rocket />
                    </div>

                    <div>
                      <span>Your Journey</span>
                      <strong>Keep Growing</strong>
                    </div>

                  </div>

                  <div className="journey-line">

                    <span className="journey-dot active" />
                    <span className="journey-connector active" />
                    <span className="journey-dot active" />
                    <span className="journey-connector" />
                    <span className="journey-dot" />

                  </div>

                  <div className="journey-progress">

                    <div>
                      <span>Learning Journey</span>
                      <strong>{dataLoading ? "—" : `${dynamicProgress}%`}</strong>
                    </div>

                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${dynamicProgress}%` }} />
                    </div>

                  </div>

                  <p>Learn. Grow. Build. Succeed.</p>

                </div>

                {/* Progress Card */}
                <div className="floating-card floating-card-two">

                  <div className="floating-card-icon icon-blue">
                    <TrendingUp />
                  </div>

                  <div className="floating-card-content">
                    <span>Progress</span>
                    <strong>Keep Moving Forward</strong>
                  </div>

                  <div className="progress-mini">
                    <TrendingUp />
                  </div>

                </div>

              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SKILLS
        ====================================================== */}

        <section
          id="skills"
          className="skills-section border-t border-[var(--border)] px-4 py-24 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">

            <div className="section-heading">

              <span className="section-badge">
                Explore Your Potential
              </span>

              <h2>
                Discover skills that
                <span> move you forward</span>
              </h2>

              <p>
                Explore in-demand skills and find learning paths that
                match your interests, goals, and career direction.
              </p>

            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {/* 01 */}
              <article className="modern-card">

                <div className="skill-card-top">
                  <div className="icon-circle icon-purple">
                    <Code2 className="h-7 w-7" />
                  </div>

                  <span className="skill-number">01</span>
                </div>

                <h3>{skillNames[0]}</h3>

                <p>
                  Build modern websites and applications with frontend
                  and backend development skills.
                </p>

                <button
                  type="button"
                  onClick={handleSkills}
                  className="card-action"
                >
                  Explore skill
                  <ArrowRight className="h-4 w-4" />
                </button>

              </article>

              {/* 02 */}
              <article className="modern-card">

                <div className="skill-card-top">
                  <div className="icon-circle icon-blue">
                    <Sparkles className="h-7 w-7" />
                  </div>

                  <span className="skill-number">02</span>
                </div>

                <h3>{skillNames[1]}</h3>

                <p>
                  Learn artificial intelligence and machine learning
                  fundamentals for future technology.
                </p>

                <button
                  type="button"
                  onClick={handleSkills}
                  className="card-action"
                >
                  Explore skill
                  <ArrowRight className="h-4 w-4" />
                </button>

              </article>

              {/* 03 */}
              <article className="modern-card">

                <div className="skill-card-top">
                  <div className="icon-circle icon-green">
                    <BarChart3 className="h-7 w-7" />
                  </div>

                  <span className="skill-number">03</span>
                </div>

                <h3>{skillNames[2]}</h3>

                <p>
                  Turn data into meaningful insights and develop
                  practical analytical skills.
                </p>

                <button
                  type="button"
                  onClick={handleSkills}
                  className="card-action"
                >
                  Explore skill
                  <ArrowRight className="h-4 w-4" />
                </button>

              </article>

              {/* 04 */}
              <article className="modern-card">

                <div className="skill-card-top">
                  <div className="icon-circle icon-pink">
                    <Palette className="h-7 w-7" />
                  </div>

                  <span className="skill-number">04</span>
                </div>

                <h3>{skillNames[3]}</h3>

                <p>
                  Create useful, accessible, and beautiful digital
                  experiences through modern design.
                </p>

                <button
                  type="button"
                  onClick={handleSkills}
                  className="card-action"
                >
                  Explore skill
                  <ArrowRight className="h-4 w-4" />
                </button>

              </article>

              {/* 05 */}
              <article className="modern-card">

                <div className="skill-card-top">
                  <div className="icon-circle icon-orange">
                    <Users className="h-7 w-7" />
                  </div>

                  <span className="skill-number">05</span>
                </div>

                <h3>{skillNames[4]}</h3>

                <p>
                  Learn how to create modern mobile applications and
                  experiences for users on the go.
                </p>

                <button
                  type="button"
                  onClick={handleSkills}
                  className="card-action"
                >
                  Explore skill
                  <ArrowRight className="h-4 w-4" />
                </button>

              </article>

              {/* 06 */}
              <article className="modern-card">

                <div className="skill-card-top">
                  <div className="icon-circle icon-indigo">
                    <Rocket className="h-7 w-7" />
                  </div>

                  <span className="skill-number">06</span>
                </div>

                <h3>{skillNames[5]}</h3>

                <p>
                  Develop communication, problem-solving, and career
                  skills that help you become job-ready.
                </p>

                <button
                  type="button"
                  onClick={handleSkills}
                  className="card-action"
                >
                  Explore skill
                  <ArrowRight className="h-4 w-4" />
                </button>

              </article>

            </div>
          </div>
        </section>

        {/* =====================================================
            RESOURCES
        ====================================================== */}

        <section
          id="resources"
          className="resource-section border-t border-[var(--border)]"
        >
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">

            <div className="grid items-center gap-14 lg:grid-cols-2">

              <div>

                <span className="section-badge">
                  Learn Smarter
                </span>

                <h2 className="mt-6 text-3xl font-bold tracking-tight text-[var(--text-heading)] sm:text-4xl">

                  Everything you need to

                  <span className="block text-[var(--primary)]">
                    keep learning
                  </span>

                </h2>

                <p className="mt-5 max-w-xl text-base leading-7 text-[var(--text)] sm:text-lg">
                  Find useful learning resources in one place and
                  build a learning path that works for your goals.
                </p>

                <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--text)]">
                  <span className="rounded-full border border-[var(--border)] px-3 py-1.5">
                    {dataLoading ? "Loading..." : `${resourceCount} learning resources`}
                  </span>
                  <span className="rounded-full border border-[var(--border)] px-3 py-1.5">
                    {dataLoading ? "Syncing..." : `${skillCount} skills available`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleResources}
                  className="primary-button mt-8"
                >
                  Browse Resources
                  <ArrowRight className="h-4 w-4" />
                </button>

              </div>

              <div
                id="resources-list"
                className="grid gap-4 sm:grid-cols-2"
              >

                <article className="resource-card">
                  <div className="resource-icon">
                    <BookOpen className="h-6 w-6" />
                  </div>

                  <h3>Courses</h3>

                  <p>
                    Follow structured courses to develop practical and
                    job-ready skills.
                  </p>
                </article>

                <article className="resource-card">
                  <div className="resource-icon">
                    <Video className="h-6 w-6" />
                  </div>

                  <h3>Video Learning</h3>

                  <p>
                    Learn visually through tutorials, demonstrations,
                    and expert explanations.
                  </p>
                </article>

                <article className="resource-card">
                  <div className="resource-icon">
                    <BookOpen className="h-6 w-6" />
                  </div>

                  <h3>Articles & Guides</h3>

                  <p>
                    Explore articles and guides to strengthen your
                    understanding of important concepts.
                  </p>
                </article>

                <article className="resource-card">
                  <div className="resource-icon">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>

                  <h3>Practice</h3>

                  <p>
                    Put your knowledge into practice and improve
                    through hands-on learning.
                  </p>
                </article>

              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            CAREER
        ====================================================== */}

        <section
          id="career"
          className="border-t border-[var(--border)] px-4 py-24 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">

            <div className="career-banner">

              <div className="career-decoration career-decoration-one" />
              <div className="career-decoration career-decoration-two" />

              {/* Additional subtle decorative glow */}
              <div className="career-decoration career-decoration-three" />

              <div className="relative z-10 mx-auto max-w-3xl text-center">

                <div className="career-icon">
                  <Rocket className="h-7 w-7" />
                </div>

                <span className="section-badge mt-6">
                  Your Career Starts Here
                </span>

                <h2 className="mt-6 text-3xl font-bold tracking-tight text-[var(--text-heading)] sm:text-4xl lg:text-5xl">

                  Turn your skills into

                  <span className="block text-[var(--primary)]">
                    your future
                  </span>

                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--text)] sm:text-lg">
                  Discover the skills you need, follow the right
                  learning path, and take meaningful steps toward the
                  career you want.
                </p>

                {topCareer && (
                  <div className="mx-auto mt-7 max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-4 text-left backdrop-blur-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text)]">
                          AI Career Match
                        </span>
                        <h3 className="mt-1 text-lg font-bold text-[var(--text-heading)]">
                          {topCareer.title}
                        </h3>
                      </div>
                      <div className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm font-bold text-[var(--primary)]">
                        {topCareer.matchPercentage}% match
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--text)]">
                      <span className="rounded-full border border-[var(--border)] px-2.5 py-1">
                        Demand: {topCareer.demandLevel}
                      </span>
                      <span className="rounded-full border border-[var(--border)] px-2.5 py-1">
                        {topCareer.missingSkills.length} skill{topCareer.missingSkills.length === 1 ? "" : "s"} to improve
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">

                  <button
                    type="button"
                    onClick={handleSkills}
                    className="primary-button justify-center"
                  >
                    Explore Skills
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleResources}
                    className="secondary-button justify-center"
                  >
                    Find Resources
                  </button>

                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          PREMIUM FOOTER
      ====================================================== */}

      <footer className="skillbridge-footer border-t border-[var(--border)]">

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

          {/* FOOTER TOP BRAND STRIP */}
          <div className="mb-12 overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-r from-violet-500/[0.07] via-[var(--surface)] to-blue-500/[0.07] p-6 sm:p-7">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-4">

                <div className="footer-top-icon">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div>
                  <strong className="block text-sm font-bold text-[var(--text-heading)]">
                    Keep learning. Keep growing.
                  </strong>

                  <span className="mt-1 block text-xs text-[var(--text)]">
                    Your skills today shape your opportunities tomorrow.
                  </span>
                </div>

              </div>

              <button
                type="button"
                onClick={handleRegister}
                className="footer-top-button"
              >
                Start Your Journey
                <ArrowRight className="h-4 w-4" />
              </button>

            </div>
          </div>

          {/* Footer Main */}
          <div className="grid gap-12 lg:grid-cols-[1.55fr_1fr_1fr]">

            {/* Brand */}
            <div className="footer-brand-area">

              <button
                type="button"
                onClick={() => scrollToSection("home")}
                className="group flex items-center gap-3"
              >

                <span className="logo-mark transition-all duration-300 group-hover:scale-105">
                  <span className="text-xl font-bold text-white">
                    S
                  </span>
                </span>

                <span className="text-xl font-bold tracking-tight text-[var(--text-heading)] sm:text-2xl">
                  Skill
                  <span className="text-[var(--primary)]">
                    Bridge
                  </span>
                </span>

              </button>

              <p className="mt-5 max-w-md text-sm leading-7 text-[var(--text)]">
                A smarter way to discover skills, learn through useful
                resources, track your growth, and move confidently
                toward your career goals.
              </p>

              {/* Brand Pill */}
              <div className="footer-brand-pill">
                <Sparkles className="h-4 w-4" />
                <span>Learn • Grow • Build • Succeed</span>
              </div>

              {/* Mini Stats */}
              <div className="mt-6 flex flex-wrap gap-3">

                <div className="footer-mini-stat">
                  <Target className="h-4 w-4" />
                  <span>Focused Learning</span>
                </div>

                <div className="footer-mini-stat">
                  <Zap className="h-4 w-4" />
                  <span>Career Ready</span>
                </div>

              </div>
            </div>

            {/* Explore */}
            <div>

              <div className="footer-heading">
                <Layers3 className="h-4 w-4" />
                <span>Explore</span>
              </div>

              <nav className="mt-5 flex flex-col gap-3">

                <button
                  type="button"
                  onClick={() => scrollToSection("home")}
                  className="footer-nav-item"
                >
                  Home
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection("skills")}
                  className="footer-nav-item"
                >
                  Skills
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection("resources")}
                  className="footer-nav-item"
                >
                  Resources
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection("career")}
                  className="footer-nav-item"
                >
                  Career
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

              </nav>
            </div>

            {/* Platform */}
            <div>

              <div className="footer-heading">
                <BriefcaseBusiness className="h-4 w-4" />
                <span>Platform</span>
              </div>

              <nav className="mt-5 flex flex-col gap-3">

                <button
                  type="button"
                  onClick={handleDashboard}
                  className="footer-nav-item"
                >
                  Dashboard
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleSkills}
                  className="footer-nav-item"
                >
                  Skill Paths
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleResources}
                  className="footer-nav-item"
                >
                  Learning Resources
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleLogin}
                  className="footer-nav-item"
                >
                  Log in
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

              </nav>
            </div>
          </div>

        </div>
      {/* =====================================================
          FOOTER CTA + FOOTER
      ====================================================== */}

      {/* Footer CTA Strip */}
      <div className="footer-cta-strip mt-12">

        <div className="flex items-center gap-3">

          <div className="footer-cta-icon">
            <Rocket className="h-5 w-5" />
          </div>

          <div className="flex flex-col">
            <strong>
              Ready to grow?
            </strong>

            <span>
              Start building the skills for your future.
            </span>
          </div>

        </div>

        <button
          type="button"
          onClick={handleRegister}
          className="footer-cta-button"
        >
          Get Started
          <ArrowRight className="h-4 w-4" />
        </button>

      </div>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <div className="mt-8 border-t border-[var(--border)] bg-[var(--surface)]">

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          <div className="footer-bottom-gradient">

            <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">

              <div>
                <p className="font-bold text-[var(--text-heading)]">
                  © {new Date().getFullYear()} SkillBridge
                </p>

                <p className="mt-1 text-xs opacity-70">
                  Keep learning. Keep growing. Keep building your future.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-[var(--text)]">
                <span>Built for learners</span>

                <span className="footer-dot">
                  •
                </span>

                <span>Built for growth</span>
              </div>

            </div>

          </div>

        </div>

      </div>
      </footer>

    </div>
  );
}

export default App;
