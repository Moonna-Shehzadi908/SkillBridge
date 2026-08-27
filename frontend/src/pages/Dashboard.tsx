
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

const API_URL = "http://127.0.0.1:8000";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
  bio: string | null;
  location: string | null;
  skills?: {
    id: number;
    name: string;
    description: string;
    category: string;
  }[];
}

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editMode, setEditMode] = useState(false);

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

    navigate("/login");
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
  // Loading
  // =========================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]" />

          <p>Loading your dashboard...</p>
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
        <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-[var(--text-heading)]">
            Something went wrong
          </h1>

          <p className="mt-3 text-sm">{error}</p>

          <Link
            to="/login"
            className="mt-6 inline-flex rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // =========================
  // Avatar
  // =========================
  const avatarUrl = imagePreview
    ? imagePreview
    : user?.profile_picture
      ? `${API_URL}${user.profile_picture}`
      : null;

  const avatarLetter =
    user?.first_name?.charAt(0).toUpperCase() ||
    user?.username?.charAt(0).toUpperCase() ||
    "U";

  // =========================
  // Dashboard
  // =========================
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      <ThemeToggle />

      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-lg font-bold text-white">
              S
            </span>

            <span className="text-xl font-bold tracking-tight text-[var(--text-heading)]">
              Skill<span className="text-[var(--primary)]">Bridge</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="whitespace-nowrap rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--text-heading)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Welcome */}
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

            {/* Profile Picture */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="h-20 w-20 shrink-0 rounded-2xl object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-3xl font-bold text-[var(--primary)]">
                {avatarLetter}
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-[var(--primary)]">
                Welcome back 👋
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--text-heading)] sm:text-4xl">
                {user?.first_name
                  ? `${user.first_name} ${user.last_name}`.trim()
                  : user?.username}
              </h1>

              <p className="mt-2 text-sm">
                @{user?.username}
              </p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {/* Skills */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xl">
              🎯
            </div>

            <h2 className="text-lg font-bold text-[var(--text-heading)]">
              My Skills
            </h2>

            <p className="mt-2 text-sm leading-6">
              Add and manage the skills you want to develop.
            </p>

            <button onClick={() => navigate("/skills")}
              type="button"
              className="mt-5 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
            >
              Explore Skills
            </button>
          </div>

          {/* Resources */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xl">
              📚
            </div>

            <h2 className="text-lg font-bold text-[var(--text-heading)]">
              Learning Resources
            </h2>

            <p className="mt-2 text-sm leading-6">
              Discover useful resources to improve your skills.
            </p>

            <button onClick={() => navigate("/resources")}
              type="button"
              className="mt-5 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
            >
              Browse Resources
            </button>
          </div>

          {/* Career */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xl">
              🚀
            </div>

            <h2 className="text-lg font-bold text-[var(--text-heading)]">
              Career Path
            </h2>

            <p className="mt-2 text-sm leading-6">
              Explore career directions based on your interests.
            </p>

           <Link
  to="/career"
  className="mt-5 inline-flex rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-[var(--primary-hover)]"
>
  Explore Career
</Link>
          </div>
        </section>

        {/* Profile */}
        <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">

          {/* Profile Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-heading)]">
                Profile Information
              </h2>

              <p className="mt-1 text-sm">
                Your information from your SkillBridge account.
              </p>
            </div>

            {!editMode && (
              <button
                type="button"
                onClick={handleEditProfile}
                className="self-start rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-heading)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:self-auto"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Edit Form */}
          {editMode ? (
            <div className="mt-6 space-y-5">

              {/* Profile Picture Upload */}
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
                      className="inline-flex cursor-pointer rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                    >
                      Choose Picture
                    </label>

                    <input
                      id="profile_picture"
                      name="profile_picture"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
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

              {/* First + Last Name */}
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
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
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
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
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
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
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
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
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
                  className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-heading)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-hover)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--text-heading)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                {saveMessage && (
                  <p
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
            /* Profile Display */
            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              {/* Email */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Email
                </p>

                <p className="mt-1 break-words font-medium text-[var(--text-heading)]">
                  {user?.email}
                </p>
              </div>

              {/* Location */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Location
                </p>

                <p className="mt-1 font-medium text-[var(--text-heading)]">
                  {user?.location || "Not added yet"}
                </p>
              </div>

              {/* Bio */}
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Bio
                </p>

                <p className="mt-1 font-medium text-[var(--text-heading)]">
                  {user?.bio || "No bio added yet."}
                </p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {!editMode && saveMessage && (
            <p className="mt-4 text-sm font-medium text-[var(--primary)]">
              {saveMessage}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;