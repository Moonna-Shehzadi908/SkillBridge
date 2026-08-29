
import { useEffect, useState } from "react";
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
} from "lucide-react";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((current) => !current);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // =========================
  // SMOOTH SCROLL HANDLER
  // =========================

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

  // =========================
  // NAVIGATION HANDLERS
  // =========================

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

  return (
    <div className="app min-h-screen overflow-x-hidden">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <a
            href="#home"
            onClick={(event) => {
              event.preventDefault();
              scrollToSection("home");
            }}
            className="group flex items-center gap-3"
            aria-label="SkillBridge home"
          >
            <span className="logo-mark">
              <span className="text-xl font-bold text-white">S</span>
            </span>

            <span className="text-xl font-bold tracking-tight text-[var(--text-heading)] sm:text-2xl">
              Skill<span className="text-[var(--primary)]">Bridge</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-7 lg:flex">

            <a
              href="#home"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("home");
              }}
              className="nav-link nav-link-active"
            >
              Home
            </a>

            <a
              href="#skills"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("skills");
              }}
              className="nav-link"
            >
              Skills
            </a>

            <a
              href="#resources"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("resources");
              }}
              className="nav-link"
            >
              Resources
            </a>

            <a
              href="#career"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("career");
              }}
              className="nav-link"
            >
              Career
            </a>

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

            {/* Theme Toggle */}
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

            {/* Login */}
            <button
              type="button"
              onClick={handleLogin}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--text-heading)] transition-all hover:text-[var(--primary)]"
            >
              Log in
            </button>

            {/* Get Started */}
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

              <a
                href="#home"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection("home");
                }}
                className="mobile-nav-link"
              >
                Home
              </a>

              <a
                href="#skills"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection("skills");
                }}
                className="mobile-nav-link"
              >
                Skills
              </a>

              <a
                href="#resources"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection("resources");
                }}
                className="mobile-nav-link"
              >
                Resources
              </a>

              <a
                href="#career"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection("career");
                }}
                className="mobile-nav-link"
              >
                Career
              </a>

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
          HERO SECTION
      ====================================================== */}

      <main id="home">
        <section
          className="hero-section"
          style={
            {
              "--hero-image": `url("${heroImage}")`,
            } as React.CSSProperties
          }
        >
          <div className="hero-image-layer" />
          <div className="hero-color-layer" />

          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid w-full items-center lg:grid-cols-[1.02fr_0.98fr]">

              {/* HERO CONTENT */}
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

              {/* HERO VISUAL */}
              <div className="hero-visual">

                <div className="hero-glow" />

                {/* Card 1 */}
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

                {/* Main Card */}
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
                      <strong>72%</strong>
                    </div>

                    <div className="progress-track">
                      <div className="progress-fill" />
                    </div>

                  </div>

                  <p>
                    Learn. Grow. Build. Succeed.
                  </p>

                </div>

                {/* Card 3 */}
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
            SKILLS SECTION
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

              {/* Web Development */}
              <article className="modern-card">

                <div className="skill-card-top">

                  <div className="icon-circle icon-purple">
                    <Code2 className="h-7 w-7" />
                  </div>

                  <span className="skill-number">01</span>

                </div>

                <h3>Web Development</h3>

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

              {/* AI */}
              <article className="modern-card">

                <div className="skill-card-top">

                  <div className="icon-circle icon-blue">
                    <Sparkles className="h-7 w-7" />
                  </div>

                  <span className="skill-number">02</span>

                </div>

                <h3>AI & Machine Learning</h3>

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

              {/* Data */}
              <article className="modern-card">

                <div className="skill-card-top">

                  <div className="icon-circle icon-green">
                    <BarChart3 className="h-7 w-7" />
                  </div>

                  <span className="skill-number">03</span>

                </div>

                <h3>Data & Analytics</h3>

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

              {/* UI UX */}
              <article className="modern-card">

                <div className="skill-card-top">

                  <div className="icon-circle icon-pink">
                    <Palette className="h-7 w-7" />
                  </div>

                  <span className="skill-number">04</span>

                </div>

                <h3>UI / UX Design</h3>

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
            

              {/* Mobile */}
              <article className="modern-card">

                <div className="skill-card-top">

                  <div className="icon-circle icon-orange">
                    <Users className="h-7 w-7" />
                  </div>

                  <span className="skill-number">05</span>

                </div>

                <h3>Mobile Development</h3>

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

              {/* Professional Skills */}
              <article className="modern-card">

                <div className="skill-card-top">

                  <div className="icon-circle icon-indigo">
                    <Rocket className="h-7 w-7" />
                  </div>

                  <span className="skill-number">06</span>

                </div>

                <h3>Career & Professional Skills</h3>

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
            RESOURCES SECTION
        ====================================================== */}

        <section
          id="resources"
          className="resource-section border-t border-[var(--border)]"
        >
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">

            <div className="grid items-center gap-14 lg:grid-cols-2">

              {/* Left */}
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

                <button
                  type="button"
                  onClick={handleResources}
                  className="primary-button mt-8"
                >
                  Browse Resources
                  <ArrowRight className="h-4 w-4" />
                </button>

              </div>

              {/* Resource Cards */}
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
            CAREER SECTION
        ====================================================== */}

        <section
          id="career"
          className="border-t border-[var(--border)] px-4 py-24 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">

            <div className="career-banner">

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
          FOOTER
      ====================================================== */}

      <footer className="border-t border-[var(--border)] bg-[var(--surface)]">

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

            {/* Brand */}
            <div className="max-w-sm">

              <a
                href="#home"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection("home");
                }}
                className="flex items-center gap-3"
              >
                <span className="logo-mark">
                  <span className="text-xl font-bold text-white">
                    S
                  </span>
                </span>

                <span className="text-xl font-bold tracking-tight text-[var(--text-heading)]">
                  Skill
                  <span className="text-[var(--primary)]">
                    Bridge
                  </span>
                </span>
              </a>

              <p className="mt-4 text-sm leading-6 text-[var(--text)]">
                Smart skill and career development for learners who
                want to grow, learn, and build their future.
              </p>

            </div>

            {/* Links */}
            <nav className="flex flex-wrap gap-x-7 gap-y-3 text-sm">

              <a
                href="#home"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection("home");
                }}
                className="footer-link"
              >
                Home
              </a>

              <a
                href="#skills"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection("skills");
                }}
                className="footer-link"
              >
                Skills
              </a>

              <a
                href="#resources"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection("resources");
                }}
                className="footer-link"
              >
                Resources
              </a>

              <a
                href="#career"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection("career");
                }}
                className="footer-link"
              >
                Career
              </a>

              <button
                type="button"
                onClick={handleDashboard}
                className="footer-link"
              >
                Dashboard
              </button>

            </nav>
          </div>
<div className="footer-bottom mt-9 border-t border-[var(--border)] pt-6 text-center text-sm">
  © 2026 SkillBridge. All rights reserved.
</div>

        </div>
      </footer>

    </div>
  );
}

export default App;
