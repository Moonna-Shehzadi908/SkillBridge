
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

    if (!file) {
      return;
    }

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
          <div
            className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]"
            aria-hidden="true"
          />

          <p className="text-sm font-medium">
            Loading your dashboard...
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
          className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-lg"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-bold text-[var(--text-heading)]">
            Something went wrong
          </h1>

          <p className="mt-3 text-sm leading-6">{error}</p>

          <Link
            to="/login"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // =========================
  // Dashboard
  // =========================
  return (
  <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">

    {logoutMessage && (
      <div
        role="alert"
        aria-live="polite"
        className="fixed right-4 top-20 z-[100] flex w-[calc(100%-2rem)] max-w-sm items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-xl"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
          ✓
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--text-heading)]">
            Logout Successful
          </p>

          <p className="mt-0.5 text-xs">
            {logoutMessage}
          </p>
        </div>
      </div>
    )}

    <ThemeToggle />

    {/* remaining  dashboard */}

      {/* =========================
          Navigation
      ========================= */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            aria-label="SkillBridge home"
            className="flex shrink-0 items-center gap-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-lg font-bold text-white shadow-sm">
              S
            </span>

            <span className="text-xl font-bold tracking-tight text-[var(--text-heading)]">
              Skill<span className="text-[var(--primary)]">Bridge</span>
            </span>
          </Link>

          <nav
            aria-label="Dashboard navigation"
            className="hidden items-center gap-1 md:flex"
          >
            <Link
              to="/skills"
              className="rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              Skills
            </Link>

            <Link
              to="/resources"
              className="rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              Resources
            </Link>

            <Link
              to="/career"
              className="rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              Career
            </Link>
          </nav>

          <button
  type="button"
  onClick={handleLogout}
  aria-label="Log out of SkillBridge"
  className="inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[var(--primary-hover)] hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
>
  Log out
</button>
        </div>
      </header>

      {/* =========================
          Main
      ========================= */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* =========================
            Welcome Hero
        ========================= */}
        <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[var(--primary-soft)] blur-3xl" />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                {/* Avatar */}
                <div className="shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={`${fullName}'s profile`}
                      className="h-20 w-20 rounded-2xl object-cover shadow-md ring-4 ring-[var(--primary-soft)] sm:h-24 sm:w-24"
                    />
                  ) : (
                    <div
                      aria-label={`${fullName}'s profile initials`}
                      className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-3xl font-bold text-[var(--primary)] shadow-sm ring-4 ring-[var(--primary-soft)] sm:h-24 sm:w-24"
                    >
                      {avatarLetter}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--primary)]">
                    Welcome back 👋
                  </p>

                  <h1 className="mt-1 truncate text-3xl font-bold tracking-tight text-[var(--text-heading)] sm:text-4xl">
                    {fullName}
                  </h1>

                  <p className="mt-2 text-sm">
                    @{user?.username}
                  </p>

                  {user?.bio && (
                    <p className="mt-3 max-w-2xl text-sm leading-6">
                      {user.bio}
                    </p>
                  )}

                  {user?.location && (
                    <p className="mt-2 flex items-center gap-1.5 text-sm">
                      <span aria-hidden="true">📍</span>
                      {user.location}
                    </p>
                  )}
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
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <p className="text-sm font-medium">Skills</p>

            <p className="mt-2 text-3xl font-bold text-[var(--text-heading)]">
              {skills.length}
            </p>

            <p className="mt-1 text-xs">
              Skills in your profile
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <p className="text-sm font-medium">Profile</p>

            <p className="mt-2 text-3xl font-bold text-[var(--text-heading)]">
              {user?.bio && user?.location ? "100%" : "In progress"}
            </p>

            <p className="mt-1 text-xs">
              Keep your profile complete
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <p className="text-sm font-medium">Learning</p>

            <p className="mt-2 text-3xl font-bold text-[var(--text-heading)]">
              Ready
            </p>

            <p className="mt-1 text-xs">
              Continue your skill journey
            </p>
          </div>
        </section>

        {/* =========================
            Quick Actions
        ========================= */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-[var(--text-heading)]">
              Continue Learning
            </h2>

            <p className="mt-1 text-sm">
              Explore SkillBridge features and build your career path.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {/* Skills */}
            <article className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xl transition group-hover:scale-105">
                  🎯
                </div>

                <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--primary)]">
                  Skills
                </span>
              </div>

              <h3 className="mt-5 text-lg font-bold text-[var(--text-heading)]">
                My Skills
              </h3>

              <p className="mt-2 text-sm leading-6">
                Add, explore and manage the skills you want to develop.
              </p>

              <Link
                to="/skills"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
              >
                Explore Skills
                <span aria-hidden="true">→</span>
              </Link>
            </article>

            {/* Resources */}
            <article className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xl transition group-hover:scale-105">
                  📚
                </div>

                <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--primary)]">
                  Learn
                </span>
              </div>

              <h3 className="mt-5 text-lg font-bold text-[var(--text-heading)]">
                Learning Resources
              </h3>

              <p className="mt-2 text-sm leading-6">
                Discover useful resources to improve your technical and
                professional skills.
              </p>

              <Link
                to="/resources"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
              >
                Browse Resources
                <span aria-hidden="true">→</span>
              </Link>
            </article>

            {/* Career */}
            <article className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xl transition group-hover:scale-105">
                  🚀
                </div>

                <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--primary)]">
                  Career
                </span>
              </div>

              <h3 className="mt-5 text-lg font-bold text-[var(--text-heading)]">
                Career Path
              </h3>

              <p className="mt-2 text-sm leading-6">
                Explore career directions based on your interests and skills.
              </p>

              <Link
                to="/career"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
              >
                Explore Career
                <span aria-hidden="true">→</span>
              </Link>
            </article>
          </div>
        </section>

        {/* =========================
            Skills Preview
        ========================= */}
        <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-heading)]">
                Skills Preview
              </h2>

              <p className="mt-1 text-sm">
                A quick look at the skills connected to your profile.
              </p>
            </div>

            <Link
              to="/skills"
className="inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold !text-white shadow-sm transition-all duration-200 hover:bg-[var(--primary-hover)] hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"            >
              Manage Skills
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {skills.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {skills.slice(0, 8).map((skill) => (
                <div
                  key={skill.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 transition hover:border-[var(--primary)] hover:shadow-sm"
                >
                  <p className="text-sm font-semibold text-[var(--text-heading)]">
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
                  className="flex items-center rounded-xl border border-dashed border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--primary)] transition hover:border-[var(--primary)]"
                >
                  +{skills.length - 8} more
                </Link>
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg)] p-8 text-center">
              <div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xl"
                aria-hidden="true"
              >
                🎯
              </div>

              <h3 className="mt-4 font-semibold text-[var(--text-heading)]">
                No skills added yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6">
                Start building your learning profile by adding the skills
                you want to develop.
              </p>

              <Link
                to="/skills"
                className="mt-5 inline-flex rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                Add Your First Skill
              </Link>
            </div>
          )}
        </section>

        {/* =========================
            Profile Information
        ========================= */}
        <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-heading)]">
                Profile Information
              </h2>

              <p className="mt-1 text-sm">
                Keep your SkillBridge profile up to date.
              </p>
            </div>

            {!editMode && (
             <button
  type="button"
  onClick={handleEditProfile}
  className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[var(--primary-hover)] hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 sm:w-auto"
>
  Edit Profile
</button>
            )}
          </div>

          {/* =========================
              Edit Form
          ========================= */}
          {editMode ? (
            <div className="mt-6 space-y-5">
              {/* Profile Picture */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
                <p className="mb-4 text-sm font-semibold text-[var(--text-heading)]">
                  Profile Picture
                </p>

                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile preview"
                      className="h-24 w-24 rounded-2xl object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-3xl font-bold text-[var(--primary)]">
                      {avatarLetter}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="profile_picture"
                      className="inline-flex cursor-pointer rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] focus-within:ring-2 focus-within:ring-[var(--primary)]"
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
                      <p className="mt-1 text-xs font-medium text-[var(--primary)]">
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
                    className="mb-2 block text-sm font-semibold text-[var(--text-heading)]"
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
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition placeholder:text-[var(--text)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="last_name"
                    className="mb-2 block text-sm font-semibold text-[var(--text-heading)]"
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
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition placeholder:text-[var(--text)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[var(--text-heading)]"
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
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition placeholder:text-[var(--text)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
                />
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-semibold text-[var(--text-heading)]"
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
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition placeholder:text-[var(--text)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
                />
              </div>

              {/* Bio */}
              <div>
                <label
                  htmlFor="bio"
                  className="mb-2 block text-sm font-semibold text-[var(--text-heading)]"
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
                  className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition placeholder:text-[var(--text)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-hover)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--text-heading)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                {saveMessage && (
                  <p
                    role="status"
                    aria-live="polite"
                    className={`text-sm font-medium ${
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
            /* =========================
               Profile Display
            ========================= */
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {/* Username */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Username
                </p>

                <p className="mt-1 break-words font-medium text-[var(--text-heading)]">
                  @{user?.username}
                </p>
              </div>

              {/* Email */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Email
                </p>

                <p className="mt-1 break-words font-medium text-[var(--text-heading)]">
                  {user?.email || "Not available"}
                </p>
              </div>

              {/* Location */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Location
                </p>

                <p className="mt-1 font-medium text-[var(--text-heading)]">
                  {user?.location || "Not added yet"}
                </p>
              </div>

              {/* Name */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Full Name
                </p>

                <p className="mt-1 font-medium text-[var(--text-heading)]">
                  {fullName}
                </p>
              </div>

              {/* Bio */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Bio
                </p>

                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--text-heading)]">
                  {user?.bio || "No bio added yet."}
                </p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {!editMode && saveMessage && (
            <p
              role="status"
              aria-live="polite"
              className="mt-4 text-sm font-medium text-[var(--primary)]"
            >
              {saveMessage}
            </p>
          )}
        </section>

        {/* =========================
            Mobile Navigation
        ========================= */}
        <section className="mt-8 md:hidden">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-[var(--text-heading)]">
              Quick Navigation
            </p>

            <div className="grid grid-cols-3 gap-2">
              <Link
                to="/skills"
                className="rounded-xl border border-[var(--border)] px-3 py-3 text-center text-xs font-semibold transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                🎯
                <span className="mt-1 block">Skills</span>
              </Link>

              <Link
                to="/resources"
                className="rounded-xl border border-[var(--border)] px-3 py-3 text-center text-xs font-semibold transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                📚
                <span className="mt-1 block">Resources</span>
              </Link>

              <Link
                to="/career"
                className="rounded-xl border border-[var(--border)] px-3 py-3 text-center text-xs font-semibold transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                🚀
                <span className="mt-1 block">Career</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* =========================
          Footer
      ========================= */}
      <footer className="border-t border-[var(--border)] py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs sm:px-6 lg:px-8">
          © {new Date().getFullYear()} SkillBridge. Keep learning, keep growing.
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;
