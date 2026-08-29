"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

function UserIcon() {
  return (
    <svg
      className="h-4 w-4 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <circle cx="12" cy="8" r="3.25" />
      <path
        strokeLinecap="round"
        d="M5 19.5c0-3.59 3.13-6.5 7-6.5s7 2.91 7 6.5"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      className="h-4 w-4 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v10.5A2.25 2.25 0 0 1 18.75 19.5H5.25A2.25 2.25 0 0 1 3 17.25V6.75Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.5 7 8 6 8-6" />
    </svg>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  // =========================
  // CURRENT USER
  // =========================

  const [user, setUser] = useState<User | null>(null);

  // =========================
  // ALL USERS
  // =========================

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  // =========================
  // PROFILE
  // =========================

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // =========================
  // MESSAGES
  // =========================

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // ACTION STATES
  // =========================

  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // =========================
  // GET CURRENT USER
  // =========================

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        router.push("/");
        return;
      }

      const data: User = await response.json();

      setUser(data);
      setName(data.name);
      setEmail(data.email);
    } catch (err) {
      console.error(err);

      setError("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GET ALL USERS
  // =========================

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError("");

      const response = await fetch(`${API_URL}/users`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Failed to fetch users",
        );
      }

      setUsers(data);
    } catch (err) {
      console.error(err);

      setUsersError(
        err instanceof Error ? err.message : "Failed to fetch users",
      );
    } finally {
      setUsersLoading(false);
    }
  };

  // =========================
  // LOAD DASHBOARD
  // =========================

  useEffect(() => {
    fetchUser();
    fetchUsers();
  }, []);

  // =========================
  // EDIT PROFILE
  // =========================

  const handleEdit = () => {
    if (!user) return;

    setName(user.name);
    setEmail(user.email);

    setMessage("");
    setError("");

    setEditing(true);
  };

  // =========================
  // UPDATE PROFILE
  // =========================

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) return;

    try {
      setMessage("");
      setError("");

      const response = await fetch(`${API_URL}/users/${user._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Failed to update user",
        );
      }

      setUser(data);
      setName(data.name);
      setEmail(data.email);

      setEditing(false);
      setMessage("Profile updated successfully");

      // Refresh all users so updated information appears
      // in the users list.
      await fetchUsers();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "Failed to update profile",
      );
    }
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const handleCancel = () => {
    if (!user) return;

    setName(user.name);
    setEmail(user.email);

    setEditing(false);

    setMessage("");
    setError("");
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      setError("");

      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.push("/");
    } catch (err) {
      console.error(err);

      setError(err instanceof Error ? err.message : "Failed to logout");

      setLoggingOut(false);
    }
  };

  // =========================
  // DELETE ACCOUNT
  // =========================

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/users/${user._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Failed to delete account",
        );
      }

      // Account deleted.
      // Go back to login page.
      router.push("/");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "Failed to delete account",
      );

      setDeleting(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-indigo-50">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 shadow-sm">
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  // =========================
  // USER NOT FOUND
  // =========================

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-indigo-50 px-6">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
          >
            {error || "Unable to load user"}
          </p>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            Go to login
          </button>
        </div>
      </main>
    );
  }

  // =========================
  // DASHBOARD
  // =========================

  return (
    <main className="min-h-screen bg-indigo-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Manage your account details
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut || deleting}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut ? "Logging out…" : "Log out"}
          </button>
        </div>

        {/* =========================
            PROFILE CARD
        ========================= */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          {/* PROFILE HEADER */}

          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                My profile
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                View and manage your account information
              </p>
            </div>

            {!editing && (
              <button
                type="button"
                onClick={handleEdit}
                disabled={deleting}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Edit profile
              </button>
            )}
          </div>

          {/* SUCCESS MESSAGE */}

          {message && (
            <div
              role="status"
              className="mb-5 rounded-lg border border-green-200 bg-green-50 px-3.5 py-2.5 text-sm text-green-700"
            >
              {message}
            </div>
          )}

          {/* ERROR MESSAGE */}

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
            >
              <span className="mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* =========================
              VIEW PROFILE
          ========================= */}

          {!editing ? (
            <div className="space-y-5">
              {/* NAME */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Name
                </p>
                <p className="mt-1 text-base font-medium text-slate-900">
                  {user.name}
                </p>
              </div>

              {/* EMAIL */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Email
                </p>
                <p className="mt-1 text-base font-medium text-slate-900">
                  {user.email}
                </p>
              </div>
            </div>
          ) : (
            /* =========================
               EDIT PROFILE
            ========================= */

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* NAME */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500"
                >
                  Name
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                  <UserIcon />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500"
                >
                  Email
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                  <MailIcon />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Save changes
                </button>
              </div>
            </form>
          )}

          {/* =========================
              DANGER ZONE
          ========================= */}

          {!editing && (
            <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Danger zone
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Deleting your account is permanent and cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting || loggingOut}
                className="shrink-0 rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting account…" : "Delete account"}
              </button>
            </div>
          )}
        </div>

        {/* =========================
            ALL USERS
        ========================= */}

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          {/* USERS HEADER */}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                All users
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                View all registered users
              </p>
            </div>

            <button
              type="button"
              onClick={fetchUsers}
              disabled={usersLoading}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {usersLoading ? "Loading…" : "Refresh"}
            </button>
          </div>

          {/* USERS ERROR */}

          {usersError && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
            >
              {usersError}
            </div>
          )}

          {/* USERS LOADING */}

          {usersLoading ? (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-500">Loading users…</p>
            </div>
          ) : users.length === 0 ? (
            /* NO USERS */
            <div className="py-10 text-center">
              <p className="text-sm text-slate-500">No users found.</p>
            </div>
          ) : (
            /* USERS TABLE */
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Name
                    </th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Email
                    </th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Created at
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 text-sm font-medium text-slate-900">
                        {item.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {item.email}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
