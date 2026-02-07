"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROJECT_TITLE } from "@/lib/constants";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Login fehlgeschlagen.");
      setLoading(false);
      return;
    }

    router.refresh();
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-4xl text-white">Admin Login</h1>
          <p className="text-white/80">
            Zugriff auf {PROJECT_TITLE} – nur mit Passwort.
          </p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="admin-login">
            <label className="block text-sm font-semibold text-patriots-navy" htmlFor="password">
              Admin Passwort
            </label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="TB12"
              required
            />
            {error ? (
              <p className="text-sm text-patriots-red">{error}</p>
            ) : null}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Login läuft…" : "Login"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
