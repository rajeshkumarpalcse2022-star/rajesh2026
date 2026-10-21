"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data: { error?: string } = {};
      try {
        data = (await response.json()) as { error?: string };
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.error || "Could not sign you in. Please try again.");
      }

      const params = new URLSearchParams(window.location.search);
      const next = params.get("from");
      router.replace(next && next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not sign you in. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <main className="admin-app admin-app--center">
      <section className="admin-auth">
        <div className="admin-auth__brand">
          <span className="admin-auth__mark" aria-hidden="true" />
          <p className="admin-eyebrow">Sharodiya · Administration</p>
          <h1 className="admin-title">Admin Login</h1>
          <p className="admin-auth__sub">
            Sign in to review and manage saved greetings.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-field">
            <label className="admin-label" htmlFor="admin-email">
              Email
            </label>
            <input
              id="admin-email"
              className="admin-input"
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              required
              disabled={loading}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              className="admin-input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              disabled={loading}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <p role="alert" className="admin-error" aria-live="assertive">
            {error ?? ""}
          </p>

          <button
            type="submit"
            className="admin-btn admin-btn--solid"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="admin-auth__foot">
          <Link href="/" className="admin-link">
            Back to the greeting
          </Link>
        </p>
      </section>
    </main>
  );
}
