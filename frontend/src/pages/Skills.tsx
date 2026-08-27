
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

const API_URL = "http://127.0.0.1:8000";

interface Skill {
  id: number;
  name: string;
  description: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

function Skills() {
  const navigate = useNavigate();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [mySkills, setMySkills] = useState<Skill[]>([]);

  const [loading, setLoading] = useState(true);
  const [mySkillsLoading, setMySkillsLoading] = useState(true);

  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // =========================
  // Get JWT token
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
  // Fetch All Skills
  // =========================
  const fetchSkills = async () => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/skills/`, {
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
        throw new Error("Unable to load skills.");
      }

      const data: Skill[] = await response.json();
      setSkills(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading skills.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Fetch User's Skills
  // =========================
  const fetchMySkills = async () => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/accounts/me/skills/`, {
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
        throw new Error("Unable to load your skills.");
      }

      const data: Skill[] = await response.json();
      setMySkills(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading your skills.",
      );
    } finally {
      setMySkillsLoading(false);
    }
  };

  // =========================
  // Initial Load
  // =========================
  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    fetchSkills();
    fetchMySkills();
  }, [navigate]);

  // =========================
  // Add Skill
  // =========================
  const handleAddSkill = async (skillId: number) => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    setActionLoading(skillId);
    setActionMessage("");

    try {
      const response = await fetch(`${API_URL}/api/accounts/me/skills/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skill_id: skillId,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to add this skill.",
        );
      }

      setActionMessage("Skill added successfully.");

      await fetchMySkills();
    } catch (err) {
      setActionMessage(
        err instanceof Error
          ? err.message
          : "Unable to add this skill.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================
  // Remove Skill
  // =========================
  const handleRemoveSkill = async (skillId: number) => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    setActionLoading(skillId);
    setActionMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/accounts/me/skills/${skillId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to remove this skill.",
        );
      }

      setActionMessage("Skill removed successfully.");

      await fetchMySkills();
    } catch (err) {
      setActionMessage(
        err instanceof Error
          ? err.message
          : "Unable to remove this skill.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================
  // Check if skill is selected
  // =========================
  const isSkillSelected = (skillId: number) => {
    return mySkills.some((skill) => skill.id === skillId);
  };

  // =========================
  // Loading
  // =========================
  if (loading || mySkillsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]" />
          <p>Loading your skills...</p>
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
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-lg font-bold text-white">
              S
            </span>

            <span className="text-xl font-bold tracking-tight text-[var(--text-heading)]">
              Skill<span className="text-[var(--primary)]">Bridge</span>
            </span>
          </Link>

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

        {/* Header */}
        <section className="mb-8">
          <p className="text-sm font-semibold text-[var(--primary)]">
            Skill Development 🎯
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--text-heading)] sm:text-4xl">
            Explore Skills
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6">
            Discover skills you want to learn and add them to your
            SkillBridge profile.
          </p>
        </section>

        {/* Action Message */}
        {actionMessage && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
              actionMessage.includes("successfully")
                ? "border-[var(--border)] bg-[var(--surface)] text-[var(--primary)]"
                : "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
            }`}
          >
            {actionMessage}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {/* =========================
            My Skills
        ========================== */}
        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-[var(--text-heading)]">
              My Skills
            </h2>

            <p className="mt-1 text-sm">
              Skills you have selected for your learning journey.
            </p>
          </div>

          {mySkills.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
              <div className="text-4xl">🎯</div>

              <h3 className="mt-3 text-lg font-bold text-[var(--text-heading)]">
                No skills added yet
              </h3>

              <p className="mt-2 text-sm">
                Explore the available skills below and add your first skill.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {mySkills.map((skill) => (
                <div
                  key={skill.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-heading)]">
                        {skill.name}
                      </h3>

                      {skill.category && (
                        <span className="mt-2 inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                          {skill.category}
                        </span>
                      )}
                    </div>

                    <span className="text-xl">✓</span>
                  </div>

                  {skill.description && (
                    <p className="mt-4 text-sm leading-6">
                      {skill.description}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill.id)}
                    disabled={actionLoading === skill.id}
                    className="mt-5 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-heading)] transition hover:border-red-400 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading === skill.id
                      ? "Removing..."
                      : "Remove Skill"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =========================
            Available Skills
        ========================== */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-[var(--text-heading)]">
              Available Skills
            </h2>

            <p className="mt-1 text-sm">
              Choose skills you want to develop.
            </p>
          </div>

          {skills.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
              <h3 className="text-lg font-bold text-[var(--text-heading)]">
                No skills available
              </h3>

              <p className="mt-2 text-sm">
                Skills will appear here once they are added by an administrator.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => {
                const selected = isSkillSelected(skill.id);

                return (
                  <div
                    key={skill.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-[var(--text-heading)]">
                          {skill.name}
                        </h3>

                        {skill.category && (
                          <span className="mt-2 inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                            {skill.category}
                          </span>
                        )}
                      </div>

                      <span className="text-2xl">🎯</span>
                    </div>

                    <p className="mt-4 min-h-[48px] text-sm leading-6">
                      {skill.description || "No description available."}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleAddSkill(skill.id)}
                      disabled={selected || actionLoading === skill.id}
                      className="mt-5 w-full rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLoading === skill.id
                        ? "Adding..."
                        : selected
                          ? "Skill Added ✓"
                          : "Add Skill"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Skills;
