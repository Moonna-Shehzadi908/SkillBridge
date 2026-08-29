
import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

const API_URL = "http://127.0.0.1:8000";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.detail) {
          throw new Error(data.detail);
        }

        throw new Error("Invalid username or password.");
      }

      // Save JWT tokens
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      // Login successful → Dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app relative min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[rgba(88,86,232,0.12)] blur-3xl dark:bg-[rgba(119,117,255,0.10)]" />

        <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-[rgba(119,117,255,0.10)] blur-3xl dark:bg-[rgba(119,117,255,0.12)]" />

        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(88,86,232,0.05)] blur-3xl dark:bg-[rgba(119,117,255,0.06)]" />
      </div>

      <div className="relative z-10">
        <ThemeToggle />

        <main className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
          <div className="w-full max-w-md">

            {/* Logo */}
            <div className="mb-8 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2.5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-lg font-bold text-white shadow-lg shadow-[rgba(88,86,232,0.22)]">
                  S
                </span>

                <span className="text-2xl font-bold tracking-tight text-[var(--text-heading)]">
                  Skill<span className="text-[var(--primary)]">Bridge</span>
                </span>
              </Link>
            </div>

            {/* Card */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_25px_70px_rgba(30,35,80,0.10)] backdrop-blur-xl sm:p-8 dark:shadow-[0_25px_70px_rgba(0,0,0,0.25)]">
              <div className="mb-7 text-center">
                <h1 className="text-2xl font-bold text-[var(--text-heading)] sm:text-3xl">
                  Welcome back
                </h1>

                <p className="mt-2 text-sm text-[var(--text)]">
                  Sign in to continue your SkillBridge journey.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-semibold text-[var(--text-heading)]"
                  >
                    Username
                  </label>

                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    autoComplete="username"
                    required
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-[var(--text-heading)]"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[var(--primary-hover)] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Log in"}
                </button>
              </form>

              {/* Register */}
              <p className="mt-6 text-center text-sm text-[var(--text)]">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-[var(--primary)] hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>

            {/* Back */}
            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-sm font-medium text-[var(--text)] transition-colors hover:text-[var(--primary)]"
              >
                ← Back to SkillBridge
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default LoginPage;