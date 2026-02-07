"use client";

import { useEffect, useMemo, useState } from "react";
import { PROJECT_TITLE, OPTIONS, CATEGORY_LABELS } from "@/lib/constants";

type Submission = {
  id: string;
  name: string;
  winner: string;
  overUnder: string;
  mvp: string;
  receiving: string;
  rushing: string;
  badBunny: string;
  patriotsLove: string;
  createdAt: string;
};

type Results = {
  id: string;
  winner: string;
  overUnder: string;
  mvp: string;
  receiving: string;
  rushing: string;
  badBunny: string;
  lockedAt: string | null;
};

const emptyResults = {
  winner: OPTIONS.winner[0],
  overUnder: OPTIONS.overUnder[0],
  mvp: OPTIONS.mvp[0],
  receiving: OPTIONS.receiving[0],
  rushing: OPTIONS.rushing[0],
  badBunny: OPTIONS.badBunny[0]
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function AdminClient() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [results, setResults] = useState<Results | null>(null);
  const [formResults, setFormResults] = useState({ ...emptyResults });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [submissionsRes, resultsRes] = await Promise.all([
      fetch("/api/admin/submissions", { cache: "no-store" }),
      fetch("/api/admin/results", { cache: "no-store" })
    ]);

    if (submissionsRes.ok) {
      const data = await submissionsRes.json();
      setSubmissions(data.submissions ?? []);
    }

    if (resultsRes.ok) {
      const data = await resultsRes.json();
      if (data.results) {
        setResults(data.results);
        setFormResults({
          winner: data.results.winner,
          overUnder: data.results.overUnder,
          mvp: data.results.mvp,
          receiving: data.results.receiving,
          rushing: data.results.rushing,
          badBunny: data.results.badBunny
        });
      } else {
        setResults(null);
        setFormResults({ ...emptyResults });
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSubmissions = useMemo(() => {
    if (!query.trim()) return submissions;
    const q = query.trim().toLowerCase();
    return submissions.filter((submission) =>
      submission.name.toLowerCase().includes(q)
    );
  }, [submissions, query]);

  const handleDelete = async (id: string) => {
    if (!confirm("Diesen Tipp wirklich löschen?")) return;
    await fetch(`/api/admin/submissions?id=${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    await loadData();
  };

  const handleDeleteByName = async () => {
    if (!query.trim()) return;
    if (!confirm("Alle Tipps mit diesem Namen löschen?")) return;
    await fetch(`/api/admin/submissions?name=${encodeURIComponent(query.trim())}`,
      { method: "DELETE" }
    );
    await loadData();
  };

  const handleReset = async () => {
    if (!confirm("Wirklich ALLE Tipps und Ergebnisse löschen?")) return;
    await fetch("/api/admin/reset", { method: "POST" });
    await loadData();
  };

  const handleSaveResults = async () => {
    setMessage(null);
    const res = await fetch("/api/admin/results", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formResults)
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg =
        typeof data?.error === "string"
          ? data.error
          : "Speichern fehlgeschlagen.";
      setMessage(msg);
      return;
    }

    setMessage("Ergebnisse gespeichert.");
    await loadData();
  };

  const handleLockResults = async () => {
    const res = await fetch("/api/admin/results/lock", { method: "POST" });
    if (res.ok) {
      await loadData();
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl text-white">Admin Dashboard</h1>
            <p className="text-white/80">
              {PROJECT_TITLE} – Ergebnisse, Exporte und Tippverwaltung.
            </p>
          </div>
          <button className="btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="card p-6" data-testid="admin-panel">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-patriots-navy" htmlFor="search">
                Suche Teilnehmer
              </label>
              <input
                id="search"
                className="input"
                placeholder="Name suchen..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <button className="btn-secondary" onClick={handleDeleteByName}>
              Delete by Name
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-patriots-navy">
                  <th className="py-2">Name</th>
                  <th className="py-2">Sieger</th>
                  <th className="py-2">Over/Under</th>
                  <th className="py-2">MVP</th>
                  <th className="py-2">Receiving</th>
                  <th className="py-2">Rushing</th>
                  <th className="py-2">Bad Bunny</th>
                  <th className="py-2">Patriots-Liebe</th>
                  <th className="py-2">Zeit</th>
                  <th className="py-2">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="border-t border-patriots-silver/40">
                    <td className="py-2 pr-4 font-semibold text-patriots-navy">
                      {submission.name}
                    </td>
                    <td className="py-2 pr-4">{submission.winner}</td>
                    <td className="py-2 pr-4">{submission.overUnder}</td>
                    <td className="py-2 pr-4">{submission.mvp}</td>
                    <td className="py-2 pr-4">{submission.receiving}</td>
                    <td className="py-2 pr-4">{submission.rushing}</td>
                    <td className="py-2 pr-4">{submission.badBunny}</td>
                    <td className="py-2 pr-4">{submission.patriotsLove}</td>
                    <td className="py-2 pr-4 text-xs">
                      {formatDate(submission.createdAt)}
                    </td>
                    <td className="py-2">
                      <button
                        className="btn-secondary"
                        onClick={() => handleDelete(submission.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td className="py-6 text-center text-patriots-navy/70" colSpan={10}>
                      {loading ? "Lade Daten..." : "Keine Tipps gefunden."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl text-patriots-navy">Ergebnisse eintragen</h2>
            <p className="text-sm text-patriots-navy/70">
              Kategorie &quot;Warum ich die Patriots liebe&quot; ist nur Fun und gibt 0 Punkte.
            </p>
            {results?.lockedAt ? (
              <span className="badge bg-patriots-silver text-patriots-navy">
                Ergebnisse gesperrt seit {formatDate(results.lockedAt)}
              </span>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {(
              [
                { key: "winner", label: CATEGORY_LABELS.winner, options: OPTIONS.winner },
                { key: "overUnder", label: CATEGORY_LABELS.overUnder, options: OPTIONS.overUnder },
                { key: "mvp", label: CATEGORY_LABELS.mvp, options: OPTIONS.mvp },
                { key: "receiving", label: CATEGORY_LABELS.receiving, options: OPTIONS.receiving },
                { key: "rushing", label: CATEGORY_LABELS.rushing, options: OPTIONS.rushing },
                { key: "badBunny", label: CATEGORY_LABELS.badBunny, options: OPTIONS.badBunny }
              ] as const
            ).map((field) => (
              <div key={field.key} className="space-y-2">
                <label
                  className="block text-sm font-semibold text-patriots-navy"
                  htmlFor={`result-${field.key}`}
                >
                  {field.label}
                </label>
                <select
                  id={`result-${field.key}`}
                  className="select"
                  value={formResults[field.key]}
                  onChange={(event) =>
                    setFormResults((prev) => ({
                      ...prev,
                      [field.key]: event.target.value
                    }))
                  }
                  disabled={Boolean(results?.lockedAt)}
                >
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {message ? (
            <p className="mt-4 text-sm text-patriots-red">{message}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="btn-primary"
              onClick={handleSaveResults}
              disabled={Boolean(results?.lockedAt)}
            >
              Ergebnisse speichern
            </button>
            <button
              className="btn-secondary"
              onClick={handleLockResults}
              disabled={Boolean(results?.lockedAt)}
            >
              Lock Results
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-2xl text-patriots-navy">Exporte</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <a className="btn-primary" href="/api/admin/export/xlsx">
              Excel Export (.xlsx)
            </a>
            <a className="btn-secondary" href="/api/admin/export/csv">
              CSV Export (optional)
            </a>
          </div>
        </div>

        <div className="card border border-patriots-red/60 bg-white/90 p-6">
          <h2 className="text-2xl text-patriots-red">Danger Zone</h2>
          <p className="mt-2 text-sm text-patriots-navy/70">
            Löscht alle Tipps UND Ergebnisse.
          </p>
          <button className="btn-primary mt-4" onClick={handleReset}>
            Reset All
          </button>
        </div>
      </div>
    </main>
  );
}
