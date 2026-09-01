
import { useEffect, useMemo, useState } from "react";
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

  // =========================================================
  // Fetch Current User
  // =========================================================
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

  // =========================================================
  // Logout
  // =========================================================
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setLogoutMessage("Successfully logged out.");

    setTimeout(() => {
      navigate("/login");
    }, 1200);
  };

  // =========================================================
  // Edit Input Change
  // =========================================================
  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setEditData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // =========================================================
  // Image Change
  // =========================================================
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
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

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // =========================================================
  // Open Edit Mode
  // =========================================================
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

  // =========================================================
  // Cancel Edit
  // =========================================================
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

  // =========================================================
  // Save Profile
  // =========================================================
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

  // =========================================================
  // Display Values
  // =========================================================
  const fullName = useMemo(() => {
    if (!user) return "User";

    const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();

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

  // =========================================================
  // Profile Completion
  // =========================================================
  const profileCompletion =
    (user?.first_name ? 20 : 0) +
    (user?.last_name ? 15 : 0) +
    (user?.email ? 15 : 0) +
    (user?.bio ? 20 : 0) +
    (user?.location ? 15 : 0) +
    (user?.profile_picture ? 15 : 0);

  // =========================================================
  // AI / Smart Career Readiness
  // Frontend-only for now — no backend changes required.
  // =========================================================
  const careerReadiness = useMemo(() => {
    let score = profileCompletion;

    if (skills.length >= 3) {
      score += 5;
    }

    if (skills.length >= 5) {
      score += 5;
    }

    if (user?.bio && user.bio.length >= 80) {
      score += 5;
    }

    return Math.min(score, 100);
  }, [profileCompletion, skills.length, user?.bio]);

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
        title: "Your profile needs attention",
        message:
          "A stronger profile helps SkillBridge understand your goals and provide better career recommendations.",
        action: "Complete Profile",
        icon: "🧠",
      };
    }

    if (skills.length === 0) {
      return {
        title: "Start with your skills",
        message:
          "Add the technologies and abilities you already have. This will help shape your future career recommendations.",
        action: "Add Skills",
        icon: "🎯",
      };
    }

    if (skills.length < 3) {
      return {
        title: "Build a stronger skill set",
        message:
          "You have started well. Add a few more relevant skills to create a stronger career foundation.",
        action: "Explore Skills",
        icon: "🚀",
      };
    }

    if (!user.bio) {
      return {
        title: "Tell SkillBridge about you",
        message:
          "Add a short professional bio so future career guidance can better understand your interests.",
        action: "Update Profile",
        icon: "💡",
      };
    }

    return {
      title: "You're building momentum",
      message:
        "Your profile has a solid foundation. The next step is to explore career paths that match your skills and interests.",
      action: "Explore Career",
      icon: "✨",
    };
  }, [user, profileCompletion, skills.length]);

  // =========================================================
  // AI Readiness Label
  // =========================================================
  const readinessLabel =
    careerReadiness >= 90
      ? "Excellent"
      : careerReadiness >= 75
        ? "Strong"
        : careerReadiness >= 50
          ? "Growing"
          : "Getting Started";

  // =========================================================
  // Loading
  // =========================================================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 text-[var(--text)]">
        <div className="text-center">
          <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-[3px] border-[var(--border)] border-t-[var(--primary)]" />

          <p className="text-sm font-bold text-[var(--text-heading)]">
            Loading your dashboard...
          </p>

          <p className="mt-1 text-xs">
            Preparing your SkillBridge workspace
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // Error
  // =========================================================
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 text-[var(--text)]">
        <div
          role="alert"
          className="w-full max-w-md rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-2xl"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-[var(--text-heading)]">
            Something went wrong
          </h1>

          <p className="mt-3 text-sm leading-6">{error}</p>

          <Link
            to="/login"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:bg-[var(--primary-hover)]"
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
          BACKGROUND DECORATION
      ====================================================== */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-[var(--primary-soft)] opacity-30 blur-3xl" />

        <div className="absolute -right-40 top-[35%] h-96 w-96 rounded-full bg-[var(--primary-soft)] opacity-20 blur-3xl" />

        <div className="absolute left-[40%] top-[75%] h-72 w-72 rounded-full bg-[var(--primary-soft)] opacity-10 blur-3xl" />
      </div>

      {/* =====================================================
          LOGOUT TOAST
      ====================================================== */}
      {logoutMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="fixed right-4 top-20 z-[100] flex w-[calc(100%-2rem)] max-w-sm items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
            ✓
          </div>

          <div>
            <p className="text-sm font-bold text-[var(--text-heading)]">
              Logout Successful
            </p>

            <p className="mt-0.5 text-xs">{logoutMessage}</p>
          </div>
        </div>
      )}

      <ThemeToggle />

      {/* =====================================================
          NAVIGATION
      ====================================================== */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/80 shadow-sm backdrop-blur-2xl">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

          <Link
            to="/"
            aria-label="SkillBridge home"
            className="group flex shrink-0 items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary)] text-lg font-extrabold text-white shadow-lg transition-all duration-300 group-hover:-rotate-3 group-hover:scale-105">
              S
            </span>

            <span className="text-xl font-extrabold tracking-tight text-[var(--text-heading)]">
              Skill<span className="text-[var(--primary)]">Bridge</span>
            </span>
          </Link>

          <nav
            aria-label="Dashboard navigation"
            className="hidden items-center gap-1 md:flex"
          >
            <Link
              to="/skills"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
            >
              Skills
            </Link>

            <Link
              to="/resources"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
            >
              Resources
            </Link>

            <Link
              to="/career"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
            >
              Career
            </Link>
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out of SkillBridge"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-xl"
          >
            Log out
          </button>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

        {/* ===================================================
            PREMIUM HERO
        ==================================================== */}
        <section className="group relative overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-[var(--surface)] shadow-xl">

          <div className="absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[var(--primary-soft)] opacity-60 blur-3xl transition-all duration-700 group-hover:scale-110" />

          <div className="absolute -bottom-56 -left-44 h-80 w-80 rounded-full bg-[var(--primary-soft)] opacity-30 blur-3xl" />

          <div className="pointer-events-none absolute right-10 top-10 hidden h-36 w-36 rounded-full border border-[var(--primary)]/10 lg:block" />

          <div className="pointer-events-none absolute right-20 top-20 hidden h-16 w-16 rounded-full border border-[var(--primary)]/20 bg-[var(--primary-soft)] lg:block" />

          <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_320px] lg:p-12">

            {/* Hero Content */}
            <div className="flex min-w-0 flex-col justify-center">
              <div className="flex flex-col gap-7 sm:flex-row sm:items-center">

                {/* Avatar */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={handleEditProfile}
                    aria-label="Update profile"
                    title="Update Profile"
                    className="group/avatar relative block rounded-[2rem] outline-none"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={`${fullName}'s profile`}
                        className="h-28 w-28 rounded-[2rem] object-cover shadow-2xl ring-4 ring-[var(--primary-soft)] transition-all duration-300 group-hover/avatar:scale-[1.04] group-hover/avatar:ring-[var(--primary)]/30 sm:h-32 sm:w-32"
                      />
                    ) : (
                      <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-[var(--primary-soft)] text-5xl font-extrabold text-[var(--primary)] shadow-2xl ring-4 ring-[var(--primary-soft)] transition-all duration-300 group-hover/avatar:scale-[1.04] group-hover/avatar:ring-[var(--primary)]/30 sm:h-32 sm:w-32">
                        {avatarLetter}
                      </div>
                    )}

                    <span className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl border-4 border-[var(--surface)] bg-[var(--primary)] text-base text-white shadow-xl transition-all duration-300 group-hover/avatar:scale-110 group-hover/avatar:rotate-6">
                      ✎
                    </span>
                  </button>
                </div>

                {/* Hero Text */}
                <div className="min-w-0 flex-1">

                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/10 bg-[var(--primary-soft)] px-3.5 py-1.5 text-[10px] font-extrabold tracking-[0.16em] text-[var(--primary)]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--primary)]" />
                    PERSONAL DASHBOARD
                  </div>

                  <p className="mt-5 text-sm font-bold text-[var(--primary)]">
                    Welcome back 👋
                  </p>

                  <h1 className="mt-1 max-w-2xl text-3xl font-extrabold tracking-tight text-[var(--text-heading)] sm:text-4xl lg:text-5xl">
                    {fullName}
                  </h1>

                  <p className="mt-2 text-sm font-medium opacity-70">
                    @{user?.username}
                  </p>

                  {user?.bio && (
                    <p className="mt-4 max-w-2xl text-sm leading-7">
                      {user.bio}
                    </p>
                  )}

                  {user?.location && (
                    <p className="mt-4 flex items-center gap-2 text-sm font-semibold">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--primary-soft)]">
                        📍
                      </span>
                      {user.location}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleEditProfile}
                      className="group/update inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--primary-hover)] hover:shadow-xl"
                    >
                      <span className="text-base transition-transform duration-300 group-hover/update:rotate-12">
                        ✎
                      </span>

                      Edit Profile

                      <span className="transition-transform duration-300 group-hover/update:translate-x-1">
                        →
                      </span>
                    </button>

                    <span className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 px-4 py-3 text-xs font-semibold backdrop-blur">
                      Keep your profile up to date
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="relative z-10 flex max-h-[230px] flex-col justify-between rounded-[1.75rem] border border-[var(--border)] bg-[var(--bg)]/85 p-4 shadow-lg backdrop-blur-xl sm:p-5">

              <div>
                <div className="flex items-center justify-between gap-2">

                  <div className="min-w-0">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[var(--primary)]">
                      Profile
                    </p>

                    <p className="mt-0.5 text-base font-extrabold text-[var(--text-heading)]">
                      Completion
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xs font-extrabold text-[var(--primary)] shadow-sm">
                    {profileCompletion}%
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--border)]">
                  <div
                    className="h-full rounded-full bg-[var(--primary)] transition-all duration-700 ease-out"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>

                <p className="mt-2.5 text-[11px] leading-5 opacity-70">
                  {profileCompletion === 100
                    ? "Your profile is complete. Great work!"
                    : "Complete your profile to strengthen your learning journey."}
                </p>
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-[var(--border)] pt-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">
                  Status
                </span>

                <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[9px] font-extrabold text-[var(--primary)]">
                  {profileCompletion === 100 ? "Complete" : "In Progress"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            SMART AI CAREER INSIGHT
        ==================================================== */}
        <section className="relative mt-6 overflow-hidden rounded-[2rem] border border-[var(--primary)]/20 bg-[var(--surface)] shadow-lg">

          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[var(--primary-soft)] opacity-60 blur-3xl" />

          <div className="absolute -bottom-24 -left-20 h-48 w-48 rounded-full bg-[var(--primary-soft)] opacity-30 blur-3xl" />

          <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_250px] lg:items-center">

            <div className="flex items-start gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-2xl text-white shadow-lg">
                🤖
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]">
                    Smart Career Insight
                  </span>

                  <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[9px] font-extrabold text-[var(--primary)]">
                    AI READY
                  </span>
                </div>

                <h2 className="mt-2 text-xl font-extrabold text-[var(--text-heading)] sm:text-2xl">
                  {smartInsight.title}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 opacity-75">
                  {smartInsight.message}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">

                  {smartInsight.action === "Add Skills" ||
                  smartInsight.action === "Explore Skills" ? (
                    <Link
                      to="/skills"
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg"
                    >
                      {smartInsight.action}
                      <span>→</span>
                    </Link>
                  ) : smartInsight.action === "Explore Career" ? (
                    <Link
                      to="/career"
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold !text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg"
                    >
                      Explore Career
                      <span>→</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={handleEditProfile}
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg"
                    >
                      {smartInsight.action}
                      <span>→</span>
                    </button>
                  )}

                </div>
              </div>
            </div>

            {/* AI Readiness */}
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--bg)] p-5">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[var(--primary)]">
                    Career
                  </p>

                  <p className="mt-1 text-sm font-extrabold text-[var(--text-heading)]">
                    Readiness
                  </p>
                </div>

                <span className="text-2xl">
                  {smartInsight.icon}
                </span>
              </div>

              <div className="mt-5 flex items-end justify-between">
                <span className="text-3xl font-extrabold text-[var(--text-heading)]">
                  {careerReadiness}%
                </span>

                <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[9px] font-extrabold text-[var(--primary)]">
                  {readinessLabel}
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--border)]">
                <div
                  className="h-full rounded-full bg-[var(--primary)] transition-all duration-700"
                  style={{ width: `${careerReadiness}%` }}
                />
              </div>

              <p className="mt-3 text-[10px] leading-5 opacity-60">
                Based on your current profile and skill information.
              </p>
            </div>
          </div>
        </section>

        {/* ===================================================
            STATS
        ==================================================== */}
        <section
          aria-label="Profile statistics"
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            {
              icon: "🎯",
              label: "PROFILE",
              title: "Skills",
              value: skills.length,
              description: "Skills in your profile",
            },
            {
              icon: "✨",
              label: "STATUS",
              title: "Profile",
              value: `${profileCompletion}%`,
              description: "Profile completion",
            },
            {
              icon: "🤖",
              label: "AI INSIGHT",
              title: "Readiness",
              value: `${careerReadiness}%`,
              description: "Career readiness",
            },
            {
              icon: "🚀",
              label: "JOURNEY",
              title: "Learning",
              value: "Ready",
              description: "Continue your journey",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/30 hover:shadow-xl"
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--primary-soft)] opacity-0 blur-2xl transition duration-300 group-hover:opacity-80" />

              <div className="relative flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-lg transition-transform duration-300 group-hover:scale-110">
                  {stat.icon}
                </div>

                <span className="text-[10px] font-extrabold tracking-[0.14em] text-[var(--primary)]">
                  {stat.label}
                </span>
              </div>

              <p className="relative mt-5 text-sm font-semibold">
                {stat.title}
              </p>

              <p className="relative mt-1 text-2xl font-extrabold text-[var(--text-heading)]">
                {stat.value}
              </p>

              <p className="relative mt-1 text-xs opacity-70">
                {stat.description}
              </p>
            </div>
          ))}
        </section>

        {/* ===================================================
            CONTINUE LEARNING
        ==================================================== */}
        <section className="mt-12">

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <div className="flex items-center gap-3">

                <div className="h-9 w-1.5 rounded-full bg-[var(--primary)]" />

                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--primary)]">
                    Your Workspace
                  </p>

                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--text-heading)] sm:text-3xl">
                    Continue Learning
                  </h2>
                </div>
              </div>

              <p className="mt-3 text-sm">
                Explore SkillBridge features and keep moving toward your goals.
              </p>
            </div>

            <span className="hidden rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-bold shadow-sm sm:inline-flex">
              Build • Learn • Grow
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-3">

            {/* Skills */}
            <article className="group relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[var(--primary)]/40 hover:shadow-2xl">

              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[var(--primary-soft)] opacity-0 blur-3xl transition duration-500 group-hover:opacity-100" />

              <div className="relative">

                <div className="flex items-start justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl transition duration-300 group-hover:scale-110 group-hover:rotate-3">
                    🎯
                  </div>

                  <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-[10px] font-extrabold tracking-wider text-[var(--primary)]">
                    SKILLS
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-extrabold text-[var(--text-heading)]">
                  My Skills
                </h3>

                <p className="mt-2 min-h-[56px] text-sm leading-7">
                  Add, explore and manage the skills you want to develop.
                </p>

                <Link
                  to="/skills"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold !text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg"
                >
                  Explore Skills
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </article>

            {/* Resources */}
            <article className="group relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[var(--primary)]/40 hover:shadow-2xl">

              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[var(--primary-soft)] opacity-0 blur-3xl transition duration-500 group-hover:opacity-100" />

              <div className="relative">

                <div className="flex items-start justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl transition duration-300 group-hover:scale-110 group-hover:rotate-3">
                    📚
                  </div>

                  <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-[10px] font-extrabold tracking-wider text-[var(--primary)]">
                    LEARN
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-extrabold text-[var(--text-heading)]">
                  Learning Resources
                </h3>

                <p className="mt-2 min-h-[56px] text-sm leading-7">
                  Discover useful resources to improve your technical and
                  professional skills.
                </p>

                <Link
                  to="/resources"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold !text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg"
                >
                  Browse Resources
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </article>

            {/* Career */}
            <article className="group relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[var(--primary)]/40 hover:shadow-2xl">

              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[var(--primary-soft)] opacity-0 blur-3xl transition duration-500 group-hover:opacity-100" />

              <div className="relative">

                <div className="flex items-start justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl transition duration-300 group-hover:scale-110 group-hover:rotate-3">
                    🚀
                  </div>

                  <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-[10px] font-extrabold tracking-wider text-[var(--primary)]">
                    CAREER
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-extrabold text-[var(--text-heading)]">
                  Career Path
                </h3>

                <p className="mt-2 min-h-[56px] text-sm leading-7">
                  Explore career directions based on your interests and skills.
                </p>

                <Link
                  to="/career"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold !text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg"
                >
                  Explore Career
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* ===================================================
            AI QUICK ACTIONS
        ==================================================== */}
        <section className="mt-12">

          <div className="mb-6">
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-xl">
                ✨
              </div>

              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--primary)]">
                  Smart Actions
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-[var(--text-heading)]">
                  What's your next move?
                </h2>
              </div>
            </div>

            <p className="mt-3 text-sm">
              Choose an action and keep progressing through your SkillBridge journey.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">

            <Link
              to="/skills"
              className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/40 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">🎯</span>

                <span className="text-lg opacity-40 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>

              <h3 className="mt-4 font-extrabold text-[var(--text-heading)]">
                Improve Skills
              </h3>

              <p className="mt-1 text-xs leading-5 opacity-70">
                Add or explore skills that support your goals.
              </p>
            </Link>

            <Link
              to="/resources"
              className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/40 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">📚</span>

                <span className="text-lg opacity-40 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>

              <h3 className="mt-4 font-extrabold text-[var(--text-heading)]">
                Learn Something New
              </h3>

              <p className="mt-1 text-xs leading-5 opacity-70">
                Discover resources to strengthen your knowledge.
              </p>
            </Link>

            <Link
              to="/career"
              className="group rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary-soft)]/30 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/50 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">🤖</span>

                <span className="text-lg opacity-40 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>

              <h3 className="mt-4 font-extrabold text-[var(--text-heading)]">
                Discover Your Path
              </h3>

              <p className="mt-1 text-xs leading-5 opacity-70">
                Explore career directions based on your profile.
              </p>
            </Link>

          </div>
        </section>

        {/* ===================================================
            SKILLS PREVIEW
        ==================================================== */}
        <section className="relative mt-12 overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">

          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--primary-soft)] opacity-30 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-xl">
                  🎯
                </div>

                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--primary)]">
                    Skill Profile
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold text-[var(--text-heading)]">
                    Skills Preview
                  </h2>
                </div>
              </div>

              <p className="mt-3 text-sm">
                A quick look at the skills connected to your profile.
              </p>
            </div>

            <Link
              to="/skills"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold !text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg"
            >
              Manage Skills
              <span>→</span>
            </Link>
          </div>

          {skills.length > 0 ? (
            <div className="relative mt-7 flex flex-wrap gap-3">

              {skills.slice(0, 8).map((skill) => (
                <div
                  key={skill.id}
                  className="group/skill rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-3.5 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--primary)]/50 hover:bg-[var(--primary-soft)] hover:shadow-md"
                >
                  <p className="text-sm font-bold text-[var(--text-heading)]">
                    {skill.name}
                  </p>

                  {skill.category && (
                    <p className="mt-1 text-xs opacity-70">
                      {skill.category}
                    </p>
                  )}
                </div>
              ))}

              {skills.length > 8 && (
                <Link
                  to="/skills"
                  className="flex items-center rounded-2xl border border-dashed border-[var(--border)] px-5 py-3.5 text-sm font-bold text-[var(--primary)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]"
                >
                  +{skills.length - 8} more
                </Link>
              )}

            </div>
          ) : (
            <div className="relative mt-7 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg)] p-10 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl">
                🎯
              </div>

              <h3 className="mt-5 font-bold text-[var(--text-heading)]">
                No skills added yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6">
                Start building your learning profile by adding the skills you
                want to develop.
              </p>

              <Link
                to="/skills"
                className="mt-6 inline-flex rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold !text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
              >
                Add Your First Skill
              </Link>

            </div>
          )}
        </section>

        {/* ===================================================
            PROFILE INFORMATION
        ==================================================== */}
        <section
          id="profile-information"
          className="mt-12 scroll-mt-28 overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-sm"
        >

          <div className="border-b border-[var(--border)] p-6 sm:p-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)]">
                    👤
                  </div>

                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--primary)]">
                      Account
                    </p>

                    <h2 className="mt-1 text-xl font-extrabold text-[var(--text-heading)]">
                      Profile Information
                    </h2>
                  </div>

                </div>

                <p className="mt-3 text-sm">
                  Keep your SkillBridge profile up to date.
                </p>
              </div>

              {!editMode && (
                <button
                  type="button"
                  onClick={handleEditProfile}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg sm:w-auto"
                >
                  Edit Profile
                  <span>✎</span>
                </button>
              )}

            </div>
          </div>

          {/* Edit Form */}
          {editMode ? (
            <div className="p-6 sm:p-8">

              <div className="space-y-6">

                <div className="rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] p-5">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
                      ✎
                    </div>

                    <div>
                      <p className="font-extrabold text-[var(--text-heading)]">
                        Update your profile
                      </p>

                      <p className="mt-1 text-xs leading-5">
                        Make changes below and click Save Changes when you're
                        finished.
                      </p>
                    </div>

                  </div>
                </div>

                {/* Profile Picture */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">

                  <p className="mb-4 text-sm font-bold text-[var(--text-heading)]">
                    Profile Picture
                  </p>

                  <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">

                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile preview"
                        className="h-24 w-24 rounded-2xl object-cover shadow-lg ring-2 ring-[var(--primary-soft)]"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-3xl font-bold text-[var(--primary)]">
                        {avatarLetter}
                      </div>
                    )}

                    <div>

                      <label
                        htmlFor="profile_picture"
                        className="inline-flex cursor-pointer rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
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

                      <p className="mt-2 text-xs">
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

                {/* Names */}
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
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition placeholder:text-[var(--text)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
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
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition placeholder:text-[var(--text)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
                    />
                  </div>

                </div>

                {/* Email */}
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
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition placeholder:text-[var(--text)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
                  />
                </div>

                {/* Location */}
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
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition placeholder:text-[var(--text)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label
                    htmlFor="bio"
                    className="mb-2 block text-sm font-bold text-[var(--text-heading)]"
                  >
                    Bio
                  </label>

                  <textarea
                    id="bio"
                    name="bio"
                    value={editData.bio}
                    onChange={handleEditChange}
                    rows={4}
                    placeholder="Tell us a little about yourself..."
                    className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition placeholder:text-[var(--text)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">

                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
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
            /* Profile Display */
            <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">

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
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)]/30 hover:shadow-md"
                >
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em]">
                    {item.label}
                  </p>

                  <p className="mt-2 break-words font-bold text-[var(--text-heading)] transition-colors group-hover:text-[var(--primary)]">
                    {item.value}
                  </p>
                </div>
              ))}

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 sm:col-span-2">

                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em]">
                  Bio
                </p>

                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[var(--text-heading)]">
                  {user?.bio || "No bio added yet."}
                </p>

              </div>
            </div>
          )}

          {!editMode && saveMessage && (
            <p
              role="status"
              aria-live="polite"
              className="mx-6 mb-6 rounded-xl bg-[var(--primary-soft)] px-4 py-3 text-sm font-semibold text-[var(--primary)] sm:mx-8"
            >
              ✓ {saveMessage}
            </p>
          )}

        </section>

        {/* ===================================================
            PREMIUM BOTTOM CTA
        ==================================================== */}
        <section className="relative mt-12 overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-[var(--surface)] shadow-xl">

          <div className="absolute inset-0 bg-[var(--primary-soft)] opacity-30" />

          <div className="absolute -right-20 -top-28 h-64 w-64 rounded-full bg-[var(--primary-soft)] blur-3xl" />

          <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-[var(--primary-soft)] blur-3xl" />

          <div className="relative px-6 py-10 text-center sm:px-10 sm:py-12">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-2xl text-white shadow-xl">
              🤖
            </div>

            <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--primary)]">
              Your Career Journey
            </p>

            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--text-heading)] sm:text-3xl">
              Ready to discover what comes next?
            </h2>

            <p className="text-center text-sm leading-7">
              Explore career paths, strengthen your skills and prepare for
              opportunities that match your potential.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">

              <Link
                to="/career"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold !text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:bg-[var(--primary-hover)] hover:shadow-xl"
              >
                Explore Career
                <span>→</span>
              </Link>

              <Link
                to="/skills"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-bold text-[var(--text-heading)] shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-md"
              >
                Build Your Skills
              </Link>

            </div>
          </div>
        </section>

        {/* ===================================================
            MOBILE NAVIGATION
        ==================================================== */}
        <section className="mt-10 md:hidden">

          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">

            <p className="mb-4 text-sm font-bold text-[var(--text-heading)]">
              Quick Navigation
            </p>

            <div className="grid grid-cols-3 gap-3">

              <Link
                to="/skills"
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-3 py-4 text-center text-xs font-bold transition-all hover:-translate-y-1 hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
              >
                <span className="text-lg">🎯</span>
                <span className="mt-2 block">Skills</span>
              </Link>

              <Link
                to="/resources"
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-3 py-4 text-center text-xs font-bold transition-all hover:-translate-y-1 hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
              >
                <span className="text-lg">📚</span>
                <span className="mt-2 block">Resources</span>
              </Link>

              <Link
                to="/career"
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-3 py-4 text-center text-xs font-bold transition-all hover:-translate-y-1 hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
              >
                <span className="text-lg">🚀</span>
                <span className="mt-2 block">Career</span>
              </Link>

            </div>
          </div>
        </section>

      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="mt-14 border-t border-[var(--border)] bg-[var(--surface)]">

        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-xs sm:px-6 lg:px-8">

          <p className="font-bold text-[var(--text-heading)]">
            © {new Date().getFullYear()} SkillBridge
          </p>

          <p className="mt-1 opacity-70">
            Keep learning. Keep growing. Keep building your future.
          </p>

        </div>

      </footer>
    </div>
  );
}

export default Dashboard;