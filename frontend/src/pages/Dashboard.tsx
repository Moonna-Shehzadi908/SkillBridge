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

  // =========================
  // Fetch Current User
  // =========================
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

  // =========================
  // Logout
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setLogoutMessage("Successfully logged out.");

    setTimeout(() => {
      navigate("/login");
    }, 1200);
  };

  // =========================
  // Edit Input Change
  // =========================
  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setEditData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // =========================
  // Image Change
  // =========================
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

  // =========================
  // Open Edit Mode
  // =========================
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
    setImagePreview(null);
    setSaveMessage("");
    setEditMode(true);
  };

  // =========================
  // Cancel Edit
  // =========================
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

  // =========================
  // Save Profile + Picture
  // =========================
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

  // =========================
  // Display Values
  // =========================
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

  // =========================
  // Loading
  // =========================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 text-[var(--text)]">
        <div className="text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]" />

          <p className="text-sm font-semibold text-[var(--text-heading)]">
            Loading your dashboard...
          </p>

          <p className="mt-1 text-xs">
            Preparing your SkillBridge workspace
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // Error
  // =========================
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 text-[var(--text)]">
        <div
          role="alert"
          className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-xl"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-bold text-[var(--text-heading)]">
            Something went wrong
          </h1>

          <p className="mt-3 text-sm leading-6">{error}</p>

          <Link
            to="/login"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">

      {/* Logout Toast */}
      {logoutMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="fixed right-4 top-20 z-[100] flex w-[calc(100%-2rem)] max-w-sm items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 shadow-2xl"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
            ✓
          </div>

          <div>
            <p className="text-sm font-bold text-[var(--text-heading)]">
              Logout Successful
            </p>

            <p className="mt-0.5 text-xs">
              {logoutMessage}
            </p>
          </div>
        </div>
      )}

      <ThemeToggle />

      {/* =========================
          Navigation
      ========================= */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

          <Link
            to="/"
            aria-label="SkillBridge home"
            className="flex shrink-0 items-center gap-2.5 rounded-xl"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-lg font-bold text-white shadow-md">
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
              className="rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
            >
              Skills
            </Link>

            <Link
              to="/resources"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
            >
              Resources
            </Link>

            <Link
              to="/career"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
            >
              Career
            </Link>
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out of SkillBridge"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg"
          >
            Log out
          </button>
        </div>
      </header>

      {/* =========================
          Main
      ========================= */}
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-11">

        {/* =========================
            Premium Hero
        ========================= */}
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-lg">

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--primary-soft)] blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-64 w-64 rounded-full bg-[var(--primary-soft)] opacity-60 blur-3xl" />

          <div className="relative p-6 sm:p-9 lg:p-11">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-center">

                {/* Avatar */}
                <div className="shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={`${fullName}'s profile`}
                      className="h-24 w-24 rounded-3xl object-cover shadow-xl ring-4 ring-[var(--primary-soft)] sm:h-28 sm:w-28"
                    />
                  ) : (
                    <div
                      aria-label={`${fullName}'s profile initials`}
                      className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[var(--primary-soft)] text-4xl font-extrabold text-[var(--primary)] shadow-lg ring-4 ring-[var(--primary-soft)] sm:h-28 sm:w-28"
                    >
                      {avatarLetter}
                    </div>
                  )}
                </div>

                <div className="min-w-0">

                  <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                    PERSONAL DASHBOARD
                  </div>

                  <p className="mt-4 text-sm font-semibold text-[var(--primary)]">
                    Welcome back 👋
                  </p>

                  <h1 className="mt-1 truncate text-3xl font-extrabold tracking-tight text-[var(--text-heading)] sm:text-4xl lg:text-5xl">
                    {fullName}
                  </h1>

                  <p className="mt-2 text-sm font-medium">
                    @{user?.username}
                  </p>

                  {user?.bio && (
                    <p className="mt-4 max-w-2xl text-sm leading-7">
                      {user.bio}
                    </p>
                  )}

                  {user?.location && (
                    <p className="mt-3 flex items-center gap-2 text-sm font-medium">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary-soft)]">
                        📍
                      </span>
                      {user.location}
                    </p>
                  )}
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-6 py-5 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider">
                    Your Journey
                  </p>

                  <p className="mt-2 text-2xl font-extrabold text-[var(--primary)]">
                    Keep Growing
                  </p>

                  <p className="mt-1 text-xs">
                    Build skills. Shape your future.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================
            Stats
        ========================= */}
        <section
          aria-label="Profile statistics"
          className="mt-6 grid gap-4 sm:grid-cols-3"
        >
          <div className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-lg">
                🎯
              </div>

              <span className="text-xs font-semibold text-[var(--primary)]">
                PROFILE
              </span>
            </div>

            <p className="mt-5 text-sm font-semibold">
              Skills
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--text-heading)]">
              {skills.length}
            </p>

            <p className="mt-1 text-xs">
              Skills in your profile
            </p>
          </div>

          <div className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-lg">
                ✨
              </div>

              <span className="text-xs font-semibold text-[var(--primary)]">
                STATUS
              </span>
            </div>

            <p className="mt-5 text-sm font-semibold">
              Profile
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--text-heading)]">
              {user?.bio && user?.location ? "100%" : "In progress"}
            </p>

            <p className="mt-1 text-xs">
              Keep your profile complete
            </p>
          </div>

          <div className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-lg">
                🚀
              </div>

              <span className="text-xs font-semibold text-[var(--primary)]">
                JOURNEY
              </span>
            </div>

            <p className="mt-5 text-sm font-semibold">
              Learning
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--text-heading)]">
              Ready
            </p>

            <p className="mt-1 text-xs">
              Continue your skill journey
            </p>
          </div>
        </section>

        {/* =========================
            Continue Learning
        ========================= */}
        <section className="mt-10">

          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-[var(--primary)]" />

              <div>
                <h2 className="text-2xl font-extrabold text-[var(--text-heading)]">
                  Continue Learning
                </h2>

                <p className="mt-1 text-sm">
                  Explore SkillBridge features and build your career path.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">

            {/* Skills */}
            <article className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl transition group-hover:scale-105">
                  🎯
                </div>

                <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)]">
                  SKILLS
                </span>
              </div>

              <h3 className="mt-6 text-xl font-extrabold text-[var(--text-heading)]">
                My Skills
              </h3>

              <p className="mt-2 text-sm leading-7">
                Add, explore and manage the skills you want to develop.
              </p>

              <Link
                to="/skills"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg"
              >
                Explore Skills
                <span>→</span>
              </Link>
            </article>

            {/* Resources */}
            <article className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl transition group-hover:scale-105">
                  📚
                </div>

                <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)]">
                  LEARN
                </span>
              </div>

              <h3 className="mt-6 text-xl font-extrabold text-[var(--text-heading)]">
                Learning Resources
              </h3>

              <p className="mt-2 text-sm leading-7">
                Discover useful resources to improve your technical and
                professional skills.
              </p>

              <Link
                to="/resources"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg"
              >
                Browse Resources
                <span>→</span>
              </Link>
            </article>

            {/* Career */}
            <article className="group rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl transition group-hover:scale-105">
                  🚀
                </div>

                <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-bold text-[var(--primary)]">
                  CAREER
                </span>
              </div>

              <h3 className="mt-6 text-xl font-extrabold text-[var(--text-heading)]">
                Career Path
              </h3>

              <p className="mt-2 text-sm leading-7">
                Explore career directions based on your interests and skills.
              </p>

              <Link
                to="/career"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg"
              >
                Explore Career
                <span>→</span>
              </Link>
            </article>

          </div>
        </section>

        {/* =========================
            Skills Preview
        ========================= */}
        <section className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)]">
                  🎯
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-[var(--text-heading)]">
                    Skills Preview
                  </h2>

                  <p className="mt-1 text-sm">
                    A quick look at the skills connected to your profile.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/skills"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg"
            >
              Manage Skills
              <span>→</span>
            </Link>
          </div>

          {skills.length > 0 ? (
            <div className="mt-7 flex flex-wrap gap-3">
              {skills.slice(0, 8).map((skill) => (
                <div
                  key={skill.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-3.5 transition hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-md"
                >
                  <p className="text-sm font-bold text-[var(--text-heading)]">
                    {skill.name}
                  </p>

                  {skill.category && (
                    <p className="mt-1 text-xs">
                      {skill.category}
                    </p>
                  )}
                </div>
              ))}

              {skills.length > 8 && (
                <Link
                  to="/skills"
                  className="flex items-center rounded-2xl border border-dashed border-[var(--border)] px-5 py-3.5 text-sm font-bold text-[var(--primary)] transition hover:border-[var(--primary)]"
                >
                  +{skills.length - 8} more
                </Link>
              )}
            </div>
          ) : (
            <div className="mt-7 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg)] p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl">
                🎯
              </div>

              <h3 className="mt-5 font-bold text-[var(--text-heading)]">
                No skills added yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6">
                Start building your learning profile by adding the skills
                you want to develop.
              </p>

              <Link
                to="/skills"
                className="mt-6 inline-flex rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold !text-white shadow-md transition hover:bg-[var(--primary-hover)]"
              >
                Add Your First Skill
              </Link>
            </div>
          )}
        </section>

        {/* =========================
            Profile Information
        ========================= */}
        <section className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)]">
                  👤
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-[var(--text-heading)]">
                    Profile Information
                  </h2>

                  <p className="mt-1 text-sm">
                    Keep your SkillBridge profile up to date.
                  </p>
                </div>
              </div>
            </div>

            {!editMode && (
              <button
                type="button"
                onClick={handleEditProfile}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-lg sm:w-auto"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Edit Form */}
          {editMode ? (
            <div className="mt-7 space-y-6">

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
                      className="h-24 w-24 rounded-2xl object-cover shadow-lg"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-3xl font-bold text-[var(--primary)]">
                      {avatarLetter}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="profile_picture"
                      className="inline-flex cursor-pointer rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[var(--primary-hover)]"
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
          ) : (
            /* Profile Display */
            <div className="mt-7 grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 transition hover:shadow-md">
                <p className="text-xs font-bold uppercase tracking-wider">
                  Username
                </p>

                <p className="mt-2 break-words font-bold text-[var(--text-heading)]">
                  @{user?.username}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 transition hover:shadow-md">
                <p className="text-xs font-bold uppercase tracking-wider">
                  Email
                </p>

                <p className="mt-2 break-words font-bold text-[var(--text-heading)]">
                  {user?.email || "Not available"}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 transition hover:shadow-md">
                <p className="text-xs font-bold uppercase tracking-wider">
                  Location
                </p>

                <p className="mt-2 font-bold text-[var(--text-heading)]">
                  {user?.location || "Not added yet"}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 transition hover:shadow-md">
                <p className="text-xs font-bold uppercase tracking-wider">
                  Full Name
                </p>

                <p className="mt-2 font-bold text-[var(--text-heading)]">
                  {fullName}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wider">
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
              className="mt-5 rounded-xl bg-[var(--primary-soft)] px-4 py-3 text-sm font-semibold text-[var(--primary)]"
            >
              ✓ {saveMessage}
            </p>
          )}
        </section>

        {/* =========================
            Mobile Navigation
        ========================= */}
        <section className="mt-10 md:hidden">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">

            <p className="mb-4 text-sm font-bold text-[var(--text-heading)]">
              Quick Navigation
            </p>

            <div className="grid grid-cols-3 gap-3">

              <Link
                to="/skills"
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-3 py-4 text-center text-xs font-bold transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                <span className="text-lg">🎯</span>
                <span className="mt-2 block">Skills</span>
              </Link>

              <Link
                to="/resources"
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-3 py-4 text-center text-xs font-bold transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                <span className="text-lg">📚</span>
                <span className="mt-2 block">Resources</span>
              </Link>

              <Link
                to="/career"
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-3 py-4 text-center text-xs font-bold transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                <span className="text-lg">🚀</span>
                <span className="mt-2 block">Career</span>
              </Link>

            </div>
          </div>
        </section>
      </main>

      {/* =========================
          Footer
      ========================= */}
      <footer className="mt-4 border-t border-[var(--border)] bg-[var(--surface)] py-7">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs sm:px-6 lg:px-8">
          <p className="font-medium">
            © {new Date().getFullYear()} SkillBridge.
          </p>

          <p className="mt-1">
            Keep learning, keep growing.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;