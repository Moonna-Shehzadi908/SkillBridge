import {useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

const API_URL = "http://127.0.0.1:8000";

interface Skill {
  id: number;
  name: string;
  description: string;
  category: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
  bio: string | null;
  location: string | null;
  skills?: Skill[];
}

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");

  const [editData, setEditData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    bio: "",
    location: "",
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  /* =========================================================
     FETCH USER
  ========================================================= */

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/accounts/me/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load your profile.");
        }

        const data: User = await response.json();

        setUser(data);

        setEditData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          bio: data.bio || "",
          location: data.location || "",
        });
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

    fetchUser();
  }, [navigate]);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setLogoutMessage("Successfully logged out.");

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  /* =========================================================
     EDIT INPUT
  ========================================================= */

  const handleEditChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setEditData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /* =========================================================
     IMAGE
  ========================================================= */

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSaveMessage("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveMessage("Image size must be less than 5 MB.");
      return;
    }

    setSelectedImage(file);
    setSaveMessage("");

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(URL.createObjectURL(file));
  };

  /* =========================================================
     EDIT PROFILE
  ========================================================= */

  const handleEditProfile = () => {
    if (!user) return;

    setEditData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      bio: user.bio || "",
      location: user.location || "",
    });

    setSelectedImage(null);
    setSaveMessage("");
    setEditMode(true);

    setTimeout(() => {
      document
        .getElementById("profile-information")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  /* =========================================================
     CANCEL
  ========================================================= */

  const handleCancelEdit = () => {
    if (!user) return;

    setEditData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      bio: user.bio || "",
      location: user.location || "",
    });

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview(null);
    setSaveMessage("");
    setEditMode(false);
  };

  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setSaving(true);
    setSaveMessage("");

    try {
      const formData = new FormData();

      formData.append("first_name", editData.first_name);
      formData.append("last_name", editData.last_name);
      formData.append("email", editData.email);
      formData.append("bio", editData.bio);
      formData.append("location", editData.location);

      if (selectedImage) {
        formData.append("profile_picture", selectedImage);
      }

      const response = await fetch(`${API_URL}/api/accounts/me/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        if (typeof data === "object" && data !== null) {
          const firstError = Object.values(data)[0];

          if (Array.isArray(firstError)) {
            throw new Error(String(firstError[0]));
          }

          if (typeof firstError === "string") {
            throw new Error(firstError);
          }
        }

        throw new Error("Unable to update your profile.");
      }

      const updatedUser: User = data;

      setUser(updatedUser);

      setEditData({
        first_name: updatedUser.first_name || "",
        last_name: updatedUser.last_name || "",
        email: updatedUser.email || "",
        bio: updatedUser.bio || "",
        location: updatedUser.location || "",
      });

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      setSelectedImage(null);
      setImagePreview(null);
      setEditMode(false);
      setSaveMessage("Profile updated successfully.");

      setTimeout(() => {
        document
          .getElementById("profile-information")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (err) {
      setSaveMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DISPLAY VALUES
  ========================================================= */

  const fullName = useMemo(() => {
    if (!user) return "User";

    const name = `${user.first_name || ""} ${
      user.last_name || ""
    }`.trim();

    return name || user.username;
  }, [user]);

  const avatarUrl = imagePreview
    ? imagePreview
    : user?.profile_picture
      ? user.profile_picture.startsWith("http")
        ? user.profile_picture
        : `${API_URL}${user.profile_picture}`
      : null;

  const avatarLetter =
    user?.first_name?.charAt(0).toUpperCase() ||
    user?.username?.charAt(0).toUpperCase() ||
    "U";

  const skills = user?.skills || [];

  /* =========================================================
     PROFILE COMPLETION
  ========================================================= */

  const profileCompletion =
    (user?.first_name ? 20 : 0) +
    (user?.last_name ? 15 : 0) +
    (user?.email ? 15 : 0) +
    (user?.bio ? 20 : 0) +
    (user?.location ? 15 : 0) +
    (user?.profile_picture ? 15 : 0);

  /* =========================================================
     CAREER READINESS
  ========================================================= */

  const careerReadiness = useMemo(() => {
    let score = profileCompletion;

    if (skills.length >= 3) score += 5;
    if (skills.length >= 5) score += 5;

    if (user?.bio && user.bio.length >= 80) {
      score += 5;
    }

    return Math.min(score, 100);
  }, [profileCompletion, skills.length, user?.bio]);

  const readinessLabel =
    careerReadiness >= 90
      ? "Excellent"
      : careerReadiness >= 75
        ? "Strong"
        : careerReadiness >= 50
          ? "Growing"
          : "Getting Started";

  /* =========================================================
     SMART INSIGHT
  ========================================================= */

  const smartInsight = useMemo(() => {
    if (!user) {
      return {
        title: "Let's build your career profile",
        message:
          "Complete your profile and add skills to unlock personalized career guidance.",
        action: "Complete Profile",
        icon: "✨",
      };
    }

    if (profileCompletion < 50) {
      return {
        title: "Complete your professional profile",
        message:
          "A stronger profile gives SkillBridge better information for your learning and career journey.",
        action: "Complete Profile",
        icon: "🧠",
      };
    }

    if (skills.length === 0) {
      return {
        title: "Start with your skills",
        message:
          "Add the technologies and abilities you already have to unlock smarter career recommendations.",
        action: "Add Skills",
        icon: "🎯",
      };
    }

    if (skills.length < 3) {
      return {
        title: "Build your skill foundation",
        message:
          "You have started well. Add a few more relevant skills to strengthen your career profile.",
        action: "Explore Skills",
        icon: "🚀",
      };
    }

    if (!user.bio) {
      return {
        title: "Tell us more about you",
        message:
          "Add a short professional bio so your SkillBridge profile represents your interests and goals.",
        action: "Update Profile",
        icon: "💡",
      };
    }

    return {
      title: "You're building strong momentum",
      message:
        "Your profile has a solid foundation. Explore career paths and continue developing the skills that matter.",
      action: "Explore Career",
      icon: "✨",
    };
  }, [user, profileCompletion, skills.length]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 text-[var(--text)]">
        <div className="w-full max-w-sm rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-10 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-soft)]">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[var(--border)] border-t-[var(--primary)]" />
          </div>

          <h2 className="mt-6 text-lg font-extrabold text-[var(--text-heading)]">
            Loading dashboard
          </h2>

          <p className="mt-2 text-sm opacity-60">
            Preparing your SkillBridge workspace...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
        <div className="w-full max-w-md rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-[var(--text-heading)]">
            Something went wrong
          </h1>

          <p className="mt-3 text-sm leading-6 opacity-70">
            {error}
          </p>

          <Link
            to="/login"
            className="mt-6 inline-flex rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[32rem] w-[32rem] rounded-full bg-[var(--primary-soft)] opacity-30 blur-3xl" />
        <div className="absolute -right-40 top-[25%] h-[30rem] w-[30rem] rounded-full bg-[var(--primary-soft)] opacity-20 blur-3xl" />
        <div className="absolute left-[35%] bottom-0 h-[24rem] w-[24rem] rounded-full bg-[var(--primary-soft)] opacity-10 blur-3xl" />
      </div>

      {/* =====================================================
          LOGOUT TOAST
      ====================================================== */}

      {logoutMessage && (
        <div className="fixed right-4 top-20 z-[100] w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
              ✓
            </div>

            <div>
              <p className="text-sm font-extrabold text-[var(--text-heading)]">
                Logout Successful
              </p>

              <p className="mt-0.5 text-xs opacity-60">
                {logoutMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      <ThemeToggle />

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/85 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-[70px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <Link
            to="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-lg font-black text-white shadow-lg transition duration-300 group-hover:scale-105">
              S
            </div>

            <span className="text-lg font-extrabold tracking-tight text-[var(--text-heading)] sm:text-xl">
              Skill<span className="text-[var(--primary)]">Bridge</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              to="/skills"
              className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
            >
              Skills
            </Link>

            <Link
              to="/resources"
              className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
            >
              Resources
            </Link>

            <Link
              to="/career"
              className="rounded-xl bg-[var(--primary-soft)] px-4 py-2 text-sm font-bold text-[var(--primary)]"
            >
              Career
            </Link>
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg sm:px-5"
          >
            Log out
          </button>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

        {/* ===================================================
            HERO / PROFILE OVERVIEW
        ==================================================== */}

        <section className="relative overflow-hidden rounded-[2.25rem] border border-[var(--border)] bg-[var(--surface)] shadow-xl">

          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[var(--primary-soft)] opacity-50 blur-3xl" />

          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-[var(--primary-soft)] opacity-20 blur-3xl" />

          <div className="relative grid lg:grid-cols-[1fr_300px]">

            {/* PROFILE */}

            <div className="p-6 sm:p-8 lg:p-10">

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

                <button
                  type="button"
                  onClick={handleEditProfile}
                  className="group relative h-28 w-28 shrink-0 rounded-[2rem] outline-none sm:h-32 sm:w-32"
                  aria-label="Edit profile"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={`${fullName}'s profile`}
                      className="h-full w-full rounded-[2rem] object-cover shadow-xl ring-4 ring-[var(--primary-soft)] transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-[2rem] bg-[var(--primary-soft)] text-5xl font-black text-[var(--primary)] shadow-xl ring-4 ring-[var(--primary-soft)] transition duration-300 group-hover:scale-[1.03]">
                      {avatarLetter}
                    </div>
                  )}

                  <span className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl border-4 border-[var(--surface)] bg-[var(--primary)] text-white shadow-lg transition group-hover:rotate-6">
                    ✎
                  </span>
                </button>

                <div className="min-w-0 flex-1">

                  <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                    Personal Dashboard
                  </div>

                  <p className="mt-4 text-sm font-bold text-[var(--primary)]">
                    Welcome back 👋
                  </p>

                  <h1 className="mt-1 text-3xl font-black tracking-tight text-[var(--text-heading)] sm:text-4xl lg:text-5xl">
                    {fullName}
                  </h1>

                  <p className="mt-1 text-sm opacity-50">
                    @{user?.username}
                  </p>

                  {user?.bio && (
                    <p className="mt-4 max-w-2xl text-sm leading-7 opacity-70">
                      {user.bio}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3">

                    {user?.location && (
                      <span className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-xs font-semibold">
                        <span>📍</span>
                        {user.location}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleEditProfile}
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-xs font-bold text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg"
                    >
                      Edit Profile
                      <span>→</span>
                    </button>

                  </div>
                </div>
              </div>
            </div>

            {/* COMPLETION */}

            <div className="border-t border-[var(--border)] bg-[var(--bg)]/60 p-6 lg:border-l lg:border-t-0 lg:p-8">

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">
                    Profile health
                  </p>

                  <h2 className="mt-1 text-lg font-extrabold text-[var(--text-heading)]">
                    Completion
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-sm font-black text-[var(--primary)]">
                  {profileCompletion}%
                </div>
              </div>

              <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-[var(--border)]">
                <div
                  className="h-full rounded-full bg-[var(--primary)] transition-all duration-700"
                  style={{
                    width: `${profileCompletion}%`,
                  }}
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs opacity-50">
                  Profile status
                </span>

                <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[9px] font-extrabold text-[var(--primary)]">
                  {profileCompletion === 100
                    ? "Complete"
                    : "In Progress"}
                </span>
              </div>

              <p className="mt-5 text-xs leading-5 opacity-55">
                Complete your profile to make your SkillBridge experience more personalized.
              </p>

            </div>
          </div>
        </section>

        {/* ===================================================
            SMART INSIGHT + READINESS
        ==================================================== */}

        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_300px]">

          {/* INSIGHT */}

          <div className="relative overflow-hidden rounded-[2rem] border border-[var(--primary)]/15 bg-[var(--surface)] p-6 shadow-lg sm:p-8">

            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[var(--primary-soft)] opacity-50 blur-3xl" />

            <div className="relative flex flex-col gap-5 sm:flex-row">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-2xl text-white shadow-lg">
                {smartInsight.icon}
              </div>

              <div className="min-w-0 flex-1">

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">
                    Smart Career Insight
                  </span>

                  <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[8px] font-extrabold text-[var(--primary)]">
                    PERSONALIZED
                  </span>
                </div>

                <h2 className="mt-2 text-xl font-extrabold text-[var(--text-heading)] sm:text-2xl">
                  {smartInsight.title}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 opacity-65">
                  {smartInsight.message}
                </p>

                <div className="mt-5">

                  {smartInsight.action === "Add Skills" ||
                  smartInsight.action === "Explore Skills" ? (
                    <Link
                      to="/skills"
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
                    >
                      {smartInsight.action}
                      <span>→</span>
                    </Link>
                  ) : smartInsight.action === "Explore Career" ? (
                    <Link
                      to="/career"
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
                    >
                      Explore Career
                      <span>→</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={handleEditProfile}
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
                    >
                      {smartInsight.action}
                      <span>→</span>
                    </button>
                  )}

                </div>
              </div>
            </div>
          </div>

          {/* READINESS */}

          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">
                  Career
                </p>

                <h2 className="mt-1 text-lg font-extrabold text-[var(--text-heading)]">
                  Readiness
                </h2>
              </div>

              <div className="text-2xl">🚀</div>
            </div>

            <div className="mt-6 flex items-end justify-between">
              <span className="text-4xl font-black text-[var(--text-heading)]">
                {careerReadiness}%
              </span>

              <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-[9px] font-extrabold text-[var(--primary)]">
                {readinessLabel}
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full rounded-full bg-[var(--primary)] transition-all duration-700"
                style={{
                  width: `${careerReadiness}%`,
                }}
              />
            </div>

            <p className="mt-3 text-[10px] leading-5 opacity-50">
              Based on your profile completeness and current skills.
            </p>

          </div>
        </section>

        {/* ===================================================
            OVERVIEW STATS
        ==================================================== */}

        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          {[
            {
              icon: "🎯",
              label: "Skills",
              value: skills.length,
              description: "In your profile",
            },
            {
              icon: "✓",
              label: "Profile",
              value: `${profileCompletion}%`,
              description: "Completed",
            },
            {
              icon: "⚡",
              label: "Readiness",
              value: `${careerReadiness}%`,
              description: readinessLabel,
            },
            {
              icon: "📈",
              label: "Journey",
              value: "Active",
              description: "Keep progressing",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/30 hover:shadow-lg"
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--primary-soft)] opacity-0 blur-2xl transition duration-300 group-hover:opacity-80" />

              <div className="relative flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-lg">
                  {stat.icon}
                </div>

                <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-40">
                  {stat.label}
                </span>
              </div>

              <p className="relative mt-5 text-2xl font-black text-[var(--text-heading)]">
                {stat.value}
              </p>

              <p className="relative mt-1 text-xs opacity-55">
                {stat.description}
              </p>
            </div>
          ))}

        </section>

        {/* ===================================================
            WORKSPACE
        ==================================================== */}

        <section className="mt-12">

          <div className="mb-6">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">
              Your Workspace
            </p>

            <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-2xl font-black tracking-tight text-[var(--text-heading)] sm:text-3xl">
                Continue your journey
              </h2>

              <p className="text-xs opacity-50">
                Build • Learn • Grow
              </p>
            </div>

            <p className="mt-2 max-w-2xl text-sm opacity-65">
              Everything you need to strengthen your skills and move toward the right career path.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">

            {/* SKILLS */}

            <Link
              to="/skills"
              className="group relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-[var(--primary)]/40 hover:shadow-xl"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--primary-soft)] opacity-0 blur-3xl transition duration-500 group-hover:opacity-100" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl">
                    🎯
                  </div>

                  <span className="text-lg opacity-30 transition group-hover:translate-x-1 group-hover:text-[var(--primary)] group-hover:opacity-100">
                    →
                  </span>
                </div>

                <p className="mt-6 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">
                  Skill Profile
                </p>

                <h3 className="mt-1 text-xl font-extrabold text-[var(--text-heading)]">
                  My Skills
                </h3>

                <p className="mt-2 min-h-[48px] text-sm leading-6 opacity-60">
                  Manage the skills that shape your learning and career recommendations.
                </p>

                <div className="mt-5 flex items-center justify-between rounded-xl bg-[var(--bg)] px-4 py-3">
                  <span className="text-xs font-bold">
                    Current skills
                  </span>

                  <span className="font-black text-[var(--primary)]">
                    {skills.length}
                  </span>
                </div>
              </div>
            </Link>

            {/* RESOURCES */}

            <Link
              to="/resources"
              className="group relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-[var(--primary)]/40 hover:shadow-xl"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--primary-soft)] opacity-0 blur-3xl transition duration-500 group-hover:opacity-100" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl">
                    📚
                  </div>

                  <span className="text-lg opacity-30 transition group-hover:translate-x-1 group-hover:text-[var(--primary)] group-hover:opacity-100">
                    →
                  </span>
                </div>

                <p className="mt-6 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">
                  Learning Hub
                </p>

                <h3 className="mt-1 text-xl font-extrabold text-[var(--text-heading)]">
                  Resources
                </h3>

                <p className="mt-2 min-h-[48px] text-sm leading-6 opacity-60">
                  Discover articles, courses, videos and documentation to keep learning.
                </p>

                <div className="mt-5 flex items-center justify-between rounded-xl bg-[var(--bg)] px-4 py-3">
                  <span className="text-xs font-bold">
                    Explore learning
                  </span>

                  <span className="font-black text-[var(--primary)]">
                    →
                  </span>
                </div>
              </div>
            </Link>

            {/* CAREER */}

            <Link
              to="/career"
              className="group relative overflow-hidden rounded-[2rem] border border-[var(--primary)]/20 bg-[var(--primary-soft)]/30 p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-[var(--primary)]/50 hover:shadow-xl"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--primary-soft)] opacity-50 blur-3xl transition duration-500 group-hover:scale-125" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[var(--primary)] text-2xl text-white shadow-lg">
                    🚀
                  </div>

                  <span className="text-lg opacity-40 transition group-hover:translate-x-1 group-hover:text-[var(--primary)] group-hover:opacity-100">
                    →
                  </span>
                </div>

                <p className="mt-6 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">
                  Career Intelligence
                </p>

                <h3 className="mt-1 text-xl font-extrabold text-[var(--text-heading)]">
                  Career Path
                </h3>

                <p className="mt-2 min-h-[48px] text-sm leading-6 opacity-65">
                  Explore career directions that align with your current skills.
                </p>

                <div className="mt-5 flex items-center justify-between rounded-xl bg-[var(--surface)]/80 px-4 py-3">
                  <span className="text-xs font-bold">
                    Discover your path
                  </span>

                  <span className="font-black text-[var(--primary)]">
                    →
                  </span>
                </div>
              </div>
            </Link>

          </div>
        </section>

        {/* ===================================================
            SKILLS PREVIEW
        ==================================================== */}

        <section className="mt-12 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-sm">

          <div className="flex flex-col gap-5 border-b border-[var(--border)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)]">
                  🎯
                </div>

                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">
                    Skill Profile
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold text-[var(--text-heading)]">
                    Your skills
                  </h2>
                </div>
              </div>

              <p className="mt-3 text-sm opacity-60">
                Skills currently connected to your profile.
              </p>
            </div>

            <Link
              to="/skills"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
            >
              Manage Skills
              <span>→</span>
            </Link>
          </div>

          <div className="p-6 sm:p-8">

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-3">

                {skills.slice(0, 8).map((skill) => (
                  <div
                    key={skill.id}
                    className="group rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 transition duration-200 hover:-translate-y-1 hover:border-[var(--primary)]/40 hover:bg-[var(--primary-soft)]"
                  >
                    <p className="text-sm font-bold text-[var(--text-heading)]">
                      {skill.name}
                    </p>

                    {skill.category && (
                      <p className="mt-1 text-[10px] opacity-50">
                        {skill.category}
                      </p>
                    )}
                  </div>
                ))}

                {skills.length > 8 && (
                  <Link
                    to="/skills"
                    className="flex items-center rounded-2xl border border-dashed border-[var(--border)] px-4 py-3 text-sm font-bold text-[var(--primary)] transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]"
                  >
                    +{skills.length - 8} more
                  </Link>
                )}

              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg)] p-10 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl">
                  🎯
                </div>

                <h3 className="mt-5 font-extrabold text-[var(--text-heading)]">
                  No skills added yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 opacity-60">
                  Add skills to start receiving more personalized career guidance.
                </p>

                <Link
                  to="/skills"
                  className="mt-5 inline-flex rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
                >
                  Add Your First Skill
                </Link>

              </div>
            )}

          </div>
        </section>

        {/* ===================================================
            PROFILE SETTINGS
        ==================================================== */}

        <section
          id="profile-information"
          className="mt-12 overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-sm"
        >

          <div className="border-b border-[var(--border)] p-6 sm:p-8">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">
                  Account Settings
                </p>

                <h2 className="mt-1 text-xl font-extrabold text-[var(--text-heading)]">
                  Profile Information
                </h2>

                <p className="mt-2 text-sm opacity-60">
                  Keep your personal and professional information up to date.
                </p>
              </div>

              {!editMode && (
                <button
                  type="button"
                  onClick={handleEditProfile}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
                >
                  Edit Profile
                  <span>✎</span>
                </button>
              )}

            </div>
          </div>

          {editMode ? (
            <div className="p-6 sm:p-8">

              {/* EDIT INTRO */}

              <div className="mb-7 rounded-2xl border border-[var(--primary)]/15 bg-[var(--primary-soft)] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
                    ✎
                  </div>

                  <div>
                    <h3 className="font-extrabold text-[var(--text-heading)]">
                      Update your profile
                    </h3>

                    <p className="mt-1 text-xs leading-5 opacity-65">
                      Make your profile more complete and professional.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">

                {/* PHOTO */}

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
                  <p className="mb-4 text-sm font-bold text-[var(--text-heading)]">
                    Profile Picture
                  </p>

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile preview"
                        className="h-24 w-24 rounded-2xl object-cover shadow-lg ring-2 ring-[var(--primary-soft)]"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-3xl font-black text-[var(--primary)]">
                        {avatarLetter}
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="profile_picture"
                        className="inline-flex cursor-pointer rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
                      >
                        Choose Picture
                      </label>

                      <input
                        id="profile_picture"
                        name="profile_picture"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />

                      <p className="mt-2 text-xs opacity-50">
                        JPG, PNG or other image formats. Maximum 5 MB.
                      </p>

                      {selectedImage && (
                        <p className="mt-1 text-xs font-semibold text-[var(--primary)]">
                          Selected: {selectedImage.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* NAME */}

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label
                      htmlFor="first_name"
                      className="mb-2 block text-sm font-bold text-[var(--text-heading)]"
                    >
                      First Name
                    </label>

                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={editData.first_name}
                      onChange={handleEditChange}
                      placeholder="Enter your first name"
                      autoComplete="given-name"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition placeholder:opacity-40 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="last_name"
                      className="mb-2 block text-sm font-bold text-[var(--text-heading)]"
                    >
                      Last Name
                    </label>

                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={editData.last_name}
                      onChange={handleEditChange}
                      placeholder="Enter your last name"
                      autoComplete="family-name"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition placeholder:opacity-40 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
                    />
                  </div>

                </div>

                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold text-[var(--text-heading)]"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={editData.email}
                    onChange={handleEditChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition placeholder:opacity-40 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
                  />
                </div>

                {/* LOCATION */}

                <div>
                  <label
                    htmlFor="location"
                    className="mb-2 block text-sm font-bold text-[var(--text-heading)]"
                  >
                    Location
                  </label>

                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={editData.location}
                    onChange={handleEditChange}
                    placeholder="Add your location"
                    autoComplete="address-level2"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition placeholder:opacity-40 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
                  />
                </div>

                {/* BIO */}

                <div>
                  <label
                    htmlFor="bio"
                    className="mb-2 block text-sm font-bold text-[var(--text-heading)]"
                  >
                    Professional Bio
                  </label>

                  <textarea
                    id="bio"
                    name="bio"
                    value={editData.bio}
                    onChange={handleEditChange}
                    rows={5}
                    placeholder="Tell us a little about yourself..."
                    className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition placeholder:opacity-40 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
                  />
                </div>

                {/* ACTIONS */}

                <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center">

                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="rounded-xl border border-[var(--border)] px-6 py-3 text-sm font-bold text-[var(--text-heading)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  {saveMessage && (
                    <p
                      role="status"
                      aria-live="polite"
                      className={`text-sm font-semibold ${
                        saveMessage.includes("successfully")
                          ? "text-[var(--primary)]"
                          : "text-red-500"
                      }`}
                    >
                      {saveMessage}
                    </p>
                  )}

                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8">

              <div className="grid gap-4 sm:grid-cols-2">

                {[
                  {
                    label: "Username",
                    value: user?.username
                      ? `@${user.username}`
                      : "Not available",
                  },
                  {
                    label: "Email",
                    value: user?.email || "Not available",
                  },
                  {
                    label: "Location",
                    value: user?.location || "Not added yet",
                  },
                  {
                    label: "Full Name",
                    value: fullName,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="group rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)]/30"
                  >
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] opacity-45">
                      {item.label}
                    </p>

                    <p className="mt-2 break-words text-sm font-bold text-[var(--text-heading)] transition group-hover:text-[var(--primary)]">
                      {item.value}
                    </p>
                  </div>
                ))}

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 sm:col-span-2">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] opacity-45">
                    Professional Bio
                  </p>

                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[var(--text-heading)] opacity-75">
                    {user?.bio || "No bio added yet."}
                  </p>
                </div>

              </div>

              {saveMessage && (
                <p className="mt-5 rounded-xl bg-[var(--primary-soft)] px-4 py-3 text-sm font-semibold text-[var(--primary)]">
                  ✓ {saveMessage}
                </p>
              )}

            </div>
          )}

        </section>

        {/* ===================================================
            FINAL CTA
        ==================================================== */}

        <section className="relative mt-12 overflow-hidden rounded-[2.25rem] border border-[var(--primary)]/20 bg-[var(--surface)] shadow-xl">

          <div className="absolute inset-0 bg-[var(--primary-soft)] opacity-25" />

          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--primary-soft)] blur-3xl" />

          <div className="relative px-6 py-10 text-center sm:px-10 sm:py-12">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-2xl text-white shadow-xl">
              🚀
            </div>

            <p className="mt-5 text-[9px] font-extrabold uppercase tracking-[0.2em] text-[var(--primary)]">
              Keep Moving Forward
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--text-heading)] sm:text-3xl">
              Your next opportunity starts with your next skill.
            </h2>

            <p className="text-center text-sm leading-7 opacity-60">
              Explore career paths, strengthen your skills and continue building a future that matches your potential.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                to="/career"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold !text-white shadow-lg transition hover:-translate-y-1 hover:bg-[var(--primary-hover)] hover:shadow-xl"
              >
                Explore Career
                <span>→</span>
              </Link>

              <Link
                to="/resources"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-bold text-[var(--text-heading)] transition hover:-translate-y-1 hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                Browse Resources
              </Link>

            </div>
          </div>
        </section>

        {/* ===================================================
            MOBILE NAV
        ==================================================== */}

        <section className="mt-8 md:hidden">

          <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">

            <p className="mb-4 text-xs font-extrabold uppercase tracking-wider opacity-50">
              Quick Navigation
            </p>

            <div className="grid grid-cols-3 gap-3">

              <Link
                to="/skills"
                className="rounded-xl bg-[var(--bg)] px-3 py-4 text-center text-xs font-bold transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
              >
                <span className="text-lg">🎯</span>
                <span className="mt-1.5 block">Skills</span>
              </Link>

              <Link
                to="/resources"
                className="rounded-xl bg-[var(--bg)] px-3 py-4 text-center text-xs font-bold transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
              >
                <span className="text-lg">📚</span>
                <span className="mt-1.5 block">Resources</span>
              </Link>

              <Link
                to="/career"
                className="rounded-xl bg-[var(--bg)] px-3 py-4 text-center text-xs font-bold transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
              >
                <span className="text-lg">🚀</span>
                <span className="mt-1.5 block">Career</span>
              </Link>

            </div>
          </div>
        </section>

      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="mt-14 border-t border-[var(--border)] bg-[var(--surface)]">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-7 text-center text-xs sm:flex-row sm:px-6 lg:px-8 sm:text-left">

          <p className="font-bold text-[var(--text-heading)]">
            © {new Date().getFullYear()} SkillBridge
          </p>

          <p className="opacity-50">
            Keep learning. Keep growing. Keep building your future.
          </p>

        </div>

      </footer>

    </div>
  );
}

export default Dashboard;