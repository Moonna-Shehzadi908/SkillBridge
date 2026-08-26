
import { useEffect, useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="app">
      {/* =========================
          Navigation
      ========================== */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2.5"
            onClick={closeMenu}
            aria-label="SkillBridge home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-lg font-bold text-white shadow-sm">
              S
            </span>

            <span className="text-xl font-bold tracking-tight text-[var(--text-heading)]">
              Skill<span className="text-[var(--primary)]">Bridge</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#home"
              className="text-sm font-medium text-[var(--text-heading)] transition-colors hover:text-[var(--primary)]"
            >
              Home
            </a>

            <a
              href="#skills"
              className="text-sm font-medium text-[var(--text)] transition-colors hover:text-[var(--primary)]"
            >
              Skills
            </a>

            <a
              href="#resources"
              className="text-sm font-medium text-[var(--text)] transition-colors hover:text-[var(--primary)]"
            >
              Resources
            </a>

            <a
              href="#career"
              className="text-sm font-medium text-[var(--text)] transition-colors hover:text-[var(--primary)]"
            >
              Career
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-lg transition-all hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? "☀" : "☾"}
            </button>

           <button
  type="button"
  onClick={() => navigate("/login")}
  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--text-heading)] transition-colors hover:text-[var(--primary)]"
>
  Log in
</button>

          <button
  type="button"
  onClick={() => navigate("/register")}
  className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold !text-white shadow-sm transition-all hover:bg-[var(--primary-hover)] hover:shadow-md"
>
  Get Started
</button>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-lg"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? "☀" : "☾"}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xl text-[var(--text-heading)]"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? "×" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-4 md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1">
              <a
                href="#home"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-[var(--text-heading)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
              >
                Home
              </a>

              <a
                href="#skills"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-[var(--text)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
              >
                Skills
              </a>

              <a
                href="#resources"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-[var(--text)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
              >
                Resources
              </a>

              <a
                href="#career"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-[var(--text)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
              >
                Career
              </a>

              <div className="mt-3 flex gap-3 border-t border-[var(--border)] pt-4">
               <button
  type="button"
  onClick={() => navigate("/login")}
  className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-heading)]"
>
  Log in
</button>

               <button
  type="button"
  onClick={() => navigate("/register")}
  className="flex-1 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white"
>
  Get Started
</button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* =========================
          Temporary Main Area
      ========================== */}
      <main
        id="home"
        className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="max-w-2xl text-center">
          <span className="mb-5 inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--primary)] shadow-sm">
            Smart Skill & Career Development
          </span>

          <h1 className="text-4xl font-bold tracking-tight text-[var(--text-heading)] sm:text-5xl lg:text-6xl">
            Build your skills.
            <span className="block text-[var(--primary)]">
              Shape your career.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[var(--text)] sm:text-lg">
            SkillBridge helps learners discover skills, explore learning
            resources, and find the right career direction — all in one place.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              className="rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[var(--primary-hover)] hover:shadow-lg"
            >
              Start Learning
            </button>

            <a
  href="#skills"
  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--text-heading)] transition-all hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]"
>
  Explore Skills
</a>
          </div>
        </div>
      </main>
      <section
  id="skills"
  className="border-t border-[var(--border)] px-4 py-20 sm:px-6 lg:px-8"
>
  <div className="mx-auto max-w-7xl">
    {/* Section Heading */}
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--primary-soft)] px-4 py-2 text-sm font-semibold text-[var(--primary)]">
        Explore Your Potential
      </span>

      <h2 className="mt-5 text-3xl font-bold tracking-tight text-[var(--text-heading)] sm:text-4xl">
        Discover skills that move you forward
      </h2>

      <p className="mt-4 text-base leading-7 text-[var(--text)] sm:text-lg">
        Explore in-demand skills and find learning paths that match your
        interests, goals, and career direction.
      </p>
    </div>

    {/* Skill Cards */}
    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <article className="skill-card group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="skill-icon">💻</div>

        <h3 className="mt-5 text-xl font-semibold text-[var(--text-heading)]">
          Web Development
        </h3>

        <p className="mt-3 text-sm leading-6 text-[var(--text)]">
          Build modern websites and applications with frontend and backend
          development skills.
        </p>

        <button
          type="button"
          className="mt-5 text-sm font-semibold text-[var(--primary)]"
        >
          Explore skill →
        </button>
      </article>

      <article className="skill-card group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="skill-icon">🤖</div>

        <h3 className="mt-5 text-xl font-semibold text-[var(--text-heading)]">
          AI & Machine Learning
        </h3>

        <p className="mt-3 text-sm leading-6 text-[var(--text)]">
          Learn the fundamentals of artificial intelligence and machine
          learning for the future of technology.
        </p>

        <button
          type="button"
          className="mt-5 text-sm font-semibold text-[var(--primary)]"
        >
          Explore skill →
        </button>
      </article>

      <article className="skill-card group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="skill-icon">📊</div>

        <h3 className="mt-5 text-xl font-semibold text-[var(--text-heading)]">
          Data & Analytics
        </h3>

        <p className="mt-3 text-sm leading-6 text-[var(--text)]">
          Turn data into meaningful insights and develop practical analytical
          skills for modern careers.
        </p>

        <button
          type="button"
          className="mt-5 text-sm font-semibold text-[var(--primary)]"
        >
          Explore skill →
        </button>
      </article>

      <article className="skill-card group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="skill-icon">🎨</div>

        <h3 className="mt-5 text-xl font-semibold text-[var(--text-heading)]">
          UI / UX Design
        </h3>

        <p className="mt-3 text-sm leading-6 text-[var(--text)]">
          Create useful, accessible, and beautiful digital experiences through
          modern design principles.
        </p>

        <button
          type="button"
          className="mt-5 text-sm font-semibold text-[var(--primary)]"
        >
          Explore skill →
        </button>
      </article>

      <article className="skill-card group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="skill-icon">📱</div>

        <h3 className="mt-5 text-xl font-semibold text-[var(--text-heading)]">
          Mobile Development
        </h3>

        <p className="mt-3 text-sm leading-6 text-[var(--text)]">
          Learn how to create modern mobile applications and build experiences
          for users on the go.
        </p>

        <button
          type="button"
          className="mt-5 text-sm font-semibold text-[var(--primary)]"
        >
          Explore skill →
        </button>
      </article>

      <article className="skill-card group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="skill-icon">🚀</div>

        <h3 className="mt-5 text-xl font-semibold text-[var(--text-heading)]">
          Career & Professional Skills
        </h3>

        <p className="mt-3 text-sm leading-6 text-[var(--text)]">
          Develop communication, problem-solving, and career skills that help
          you become job-ready.
        </p>

        <button
          type="button"
          className="mt-5 text-sm font-semibold text-[var(--primary)]"
        >
          Explore skill →
        </button>
      </article>
    </div>
  </div>
</section>
<section
  id="resources"
  className="border-t border-[var(--border)] px-4 py-20 sm:px-6 lg:px-8"
>
  <div className="mx-auto max-w-7xl">
    <div className="grid items-center gap-12 lg:grid-cols-2">
      {/* Left Content */}
      <div>
        <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--primary-soft)] px-4 py-2 text-sm font-semibold text-[var(--primary)]">
          Learn Smarter
        </span>

        <h2 className="mt-5 text-3xl font-bold tracking-tight text-[var(--text-heading)] sm:text-4xl">
          Everything you need to keep learning
        </h2>

        <p className="mt-5 max-w-xl text-base leading-7 text-[var(--text)] sm:text-lg">
          Find useful learning resources in one place and build a learning
          path that works for your goals.
        </p>

        <a
          href="#resources-list"
          className="mt-7 inline-flex rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold !text-white shadow-md transition-all hover:bg-[var(--primary-hover)] hover:shadow-lg"
        >
          Browse Resources
        </a>
      </div>

      {/* Resource Cards */}
      <div id="resources-list" className="grid gap-4 sm:grid-cols-2">
        <article className="resource-card rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="resource-icon">📚</div>

          <h3 className="mt-4 text-lg font-semibold text-[var(--text-heading)]">
            Courses
          </h3>

          <p className="mt-2 text-sm leading-6 text-[var(--text)]">
            Follow structured courses to develop practical and job-ready
            skills.
          </p>
        </article>

        <article className="resource-card rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="resource-icon">🎥</div>

          <h3 className="mt-4 text-lg font-semibold text-[var(--text-heading)]">
            Video Learning
          </h3>

          <p className="mt-2 text-sm leading-6 text-[var(--text)]">
            Learn visually through tutorials, demonstrations, and expert
            explanations.
          </p>
        </article>

        <article className="resource-card rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="resource-icon">📖</div>

          <h3 className="mt-4 text-lg font-semibold text-[var(--text-heading)]">
            Articles & Guides
          </h3>

          <p className="mt-2 text-sm leading-6 text-[var(--text)]">
            Explore articles and guides to strengthen your understanding of
            important concepts.
          </p>
        </article>

        <article className="resource-card rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="resource-icon">🧩</div>

          <h3 className="mt-4 text-lg font-semibold text-[var(--text-heading)]">
            Practice
          </h3>

          <p className="mt-2 text-sm leading-6 text-[var(--text)]">
            Put your knowledge into practice and improve through hands-on
            learning.
          </p>
        </article>
      </div>
    </div>
  </div>
</section>
<section
  id="career"
  className="border-t border-[var(--border)] px-4 py-20 sm:px-6 lg:px-8"
>
  <div className="mx-auto max-w-7xl">
    <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--primary-soft)] px-6 py-12 text-center sm:px-10 sm:py-16">
      <div className="relative z-10 mx-auto max-w-3xl">
        <span className="inline-flex rounded-full border border-[var(--primary)]/20 bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--primary)]">
          Your Career Starts Here
        </span>

        <h2 className="mt-5 text-3xl font-bold tracking-tight text-[var(--text-heading)] sm:text-4xl lg:text-5xl">
          Turn your skills into your future
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--text)] sm:text-lg">
          Discover the skills you need, follow the right learning path, and
          take meaningful steps toward the career you want.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="#skills"
            className="inline-flex justify-center rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold !text-white shadow-md transition-all hover:bg-[var(--primary-hover)] hover:shadow-lg"
          >
            Explore Skills
          </a>

          <a
            href="#resources"
            className="inline-flex justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold !text-[var(--text-heading)] transition-all hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]"
          >
            Find Resources
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

{/* =========================
    Footer
========================= */}
<footer className="border-t border-[var(--border)] bg-[var(--surface)]">
  <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
      {/* Brand */}
      <div className="max-w-sm">
        <a
          href="#home"
          className="flex items-center gap-2.5 !text-[var(--text-heading)]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-lg font-bold !text-white shadow-sm">
            S
          </span>

          <span className="text-xl font-bold tracking-tight">
            Skill<span className="text-[var(--primary)]">Bridge</span>
          </span>
        </a>

        <p className="mt-3 text-sm leading-6 text-[var(--text)]">
          Smart skill and career development for learners who want to grow,
          learn, and build their future.
        </p>
      </div>

      {/* Footer Links */}
      <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
        <a
          href="#home"
          className="!text-[var(--text)] transition-colors hover:!text-[var(--primary)]"
        >
          Home
        </a>

        <a
          href="#skills"
          className="!text-[var(--text)] transition-colors hover:!text-[var(--primary)]"
        >
          Skills
        </a>

        <a
          href="#resources"
          className="!text-[var(--text)] transition-colors hover:!text-[var(--primary)]"
        >
          Resources
        </a>

        <a
          href="#career"
          className="!text-[var(--text)] transition-colors hover:!text-[var(--primary)]"
        >
          Career
        </a>
      </nav>
    </div>

    <div className="mt-8 border-t border-[var(--border)] pt-6 text-center text-sm text-[var(--text)]">
      © 2026 SkillBridge. All rights reserved.
    </div>
  </div>
</footer>
    </div>
  );
}

export default App;