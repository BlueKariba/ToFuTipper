"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  CATEGORY_LABELS,
  GAME,
  OPTIONS,
  PROJECT_TITLE
} from "@/lib/constants";
import type { SubmissionInput } from "@/lib/validation";

type DistributionItem = {
  option: string;
  count: number;
  percent: number;
};

type OverviewSubmission = {
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
  score?: number;
  breakdown?: {
    winner: boolean;
    overUnder: boolean;
    mvp: boolean;
    receiving: boolean;
    rushing: boolean;
    badBunny: boolean;
  };
};

type Results = {
  winner: string;
  overUnder: string;
  mvp: string;
  receiving: string;
  rushing: string;
  badBunny: string;
  lockedAt: string | null;
};

type OverviewData = {
  total: number;
  topScore: number | null;
  results: Results | null;
  submissions: OverviewSubmission[];
  distributions: Record<string, DistributionItem[]>;
};

const initialForm: SubmissionInput = {
  name: "",
  winner: OPTIONS.winner[0],
  overUnder: OPTIONS.overUnder[0],
  mvp: OPTIONS.mvp[0],
  receiving: OPTIONS.receiving[0],
  rushing: OPTIONS.rushing[0],
  badBunny: OPTIONS.badBunny[0],
  patriotsLove: OPTIONS.patriotsLove[0]
};

const topEightKeys = new Set(["mvp", "receiving", "rushing"]);
const distributionOrder = [
  "winner",
  "overUnder",
  "mvp",
  "receiving",
  "rushing",
  "badBunny",
  "patriotsLove"
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function buildTopItems(
  items: DistributionItem[],
  showAll: boolean
): DistributionItem[] {
  if (showAll || items.length <= 8) return items;

  const sorted = [...items].sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, 8);
  const rest = sorted.slice(8);
  const restCount = rest.reduce((sum, item) => sum + item.count, 0);
  const total = sorted.reduce((sum, item) => sum + item.count, 0);
  const restPercent = total === 0 ? 0 : Number(((restCount / total) * 100).toFixed(1));

  return [...top, { option: "Andere", count: restCount, percent: restPercent }];
}

export default function AppClient() {
  const [activeTab, setActiveTab] = useState<"tippen" | "gesamt">("tippen");
  const [form, setForm] = useState<SubmissionInput>(initialForm);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [meSubmission, setMeSubmission] = useState<OverviewSubmission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState<Record<string, boolean>>({
    mvp: false,
    receiving: false,
    rushing: false
  });

  const loadOverview = async () => {
    const res = await fetch("/api/overview", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setOverview(data);
    }
  };

  const loadMe = async () => {
    const res = await fetch("/api/me", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setMeSubmission(data.submission);
      if (data.submission) {
        setForm((prev) => ({
          ...prev,
          name: data.submission.name
        }));
      }
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadOverview(), loadMe()]);
      setLoading(false);
    };
    load();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const message =
        typeof data?.error === "string"
          ? data.error
          : "Speichern fehlgeschlagen.";
      setError(message);
      setSubmitting(false);
      return;
    }

    setSuccess("Dein Tipp ist gespeichert und gesperrt.");
    await Promise.all([loadOverview(), loadMe()]);
    setActiveTab("gesamt");
    setSubmitting(false);
  };

  const hasResults = Boolean(overview?.results);

  const topScore = overview?.topScore ?? null;

  const leaders = useMemo(() => {
    if (!overview || topScore === null) return new Set<string>();
    return new Set(
      overview.submissions
        .filter((submission) => submission.score === topScore)
        .map((submission) => submission.id)
    );
  }, [overview, topScore]);

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-card">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/60">
                {GAME.event}
              </p>
              <h1 className="text-4xl font-semibold">{PROJECT_TITLE}</h1>
              <p className="mt-2 text-white/80">{GAME.teams}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-sm">
              <p>{GAME.date}</p>
              <p className="mt-1">Over/Under: {GAME.overUnder}</p>
            </div>
          </div>
          <div className="divider-stars" />
          <p className="text-white/70">
            Ein Link, ein Tippspiel, Patriots-Style. Nach dem Absenden sind Tipps nicht
            mehr veränderbar.
          </p>
        </header>

        <section className="flex flex-wrap gap-3" role="tablist" aria-label="Tabs">
          <button
            role="tab"
            aria-selected={activeTab === "tippen"}
            className={clsx(
              "btn-ghost",
              activeTab === "tippen" && "bg-white text-patriots-navy"
            )}
            onClick={() => setActiveTab("tippen")}
          >
            Tippen
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "gesamt"}
            className={clsx(
              "btn-ghost",
              activeTab === "gesamt" && "bg-white text-patriots-navy"
            )}
            onClick={() => setActiveTab("gesamt")}
          >
            Gesamtübersicht
          </button>
        </section>

        {activeTab === "tippen" ? (
          <section role="tabpanel" className="space-y-6">
            {meSubmission ? (
              <div className="card p-6">
                <h2 className="text-2xl text-patriots-navy">Deine Tipps (gesperrt)</h2>
                <p className="text-sm text-patriots-navy/70">
                  Dieser Tipp ist an dieses Gerät gebunden und kann nicht mehr geändert werden.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-patriots-navy/50">
                      {CATEGORY_LABELS.winner}
                    </p>
                    <p className="font-semibold text-patriots-navy">{meSubmission.winner}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-patriots-navy/50">
                      {CATEGORY_LABELS.overUnder}
                    </p>
                    <p className="font-semibold text-patriots-navy">{meSubmission.overUnder}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-patriots-navy/50">
                      {CATEGORY_LABELS.mvp}
                    </p>
                    <p className="font-semibold text-patriots-navy">{meSubmission.mvp}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-patriots-navy/50">
                      {CATEGORY_LABELS.receiving}
                    </p>
                    <p className="font-semibold text-patriots-navy">{meSubmission.receiving}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-patriots-navy/50">
                      {CATEGORY_LABELS.rushing}
                    </p>
                    <p className="font-semibold text-patriots-navy">{meSubmission.rushing}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-patriots-navy/50">
                      {CATEGORY_LABELS.badBunny}
                    </p>
                    <p className="font-semibold text-patriots-navy">{meSubmission.badBunny}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs uppercase text-patriots-navy/50">
                      {CATEGORY_LABELS.patriotsLove}
                    </p>
                    <p className="font-semibold text-patriots-navy">{meSubmission.patriotsLove}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <button className="btn-primary" onClick={() => setActiveTab("gesamt")}
                  >
                    Zur Gesamtübersicht
                  </button>
                </div>
              </div>
            ) : (
              <div className="card p-6">
                <h2 className="text-2xl text-patriots-navy">Tipps abgeben</h2>
                <p className="text-sm text-patriots-navy/70">
                  Bitte fülle alle 7 Kategorien aus. Danach ist der Tipp gesperrt.
                </p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-patriots-navy" htmlFor="name">
                      Dein Name
                    </label>
                    <input
                      id="name"
                      className="input"
                      value={form.name}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, name: event.target.value }))
                      }
                      placeholder="Name eingeben"
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label
                        className="block text-sm font-semibold text-patriots-navy"
                        htmlFor="winner"
                      >
                        {CATEGORY_LABELS.winner}
                      </label>
                      <select
                        id="winner"
                        className="select"
                        value={form.winner}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, winner: event.target.value }))
                        }
                      >
                        {OPTIONS.winner.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold text-patriots-navy"
                        htmlFor="overUnder"
                      >
                        {CATEGORY_LABELS.overUnder}
                      </label>
                      <select
                        id="overUnder"
                        className="select"
                        value={form.overUnder}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, overUnder: event.target.value }))
                        }
                      >
                        {OPTIONS.overUnder.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold text-patriots-navy"
                        htmlFor="mvp"
                      >
                        {CATEGORY_LABELS.mvp}
                      </label>
                      <select
                        id="mvp"
                        className="select"
                        value={form.mvp}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, mvp: event.target.value }))
                        }
                      >
                        {OPTIONS.mvp.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold text-patriots-navy"
                        htmlFor="receiving"
                      >
                        {CATEGORY_LABELS.receiving}
                      </label>
                      <select
                        id="receiving"
                        className="select"
                        value={form.receiving}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, receiving: event.target.value }))
                        }
                      >
                        {OPTIONS.receiving.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold text-patriots-navy"
                        htmlFor="rushing"
                      >
                        {CATEGORY_LABELS.rushing}
                      </label>
                      <select
                        id="rushing"
                        className="select"
                        value={form.rushing}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, rushing: event.target.value }))
                        }
                      >
                        {OPTIONS.rushing.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold text-patriots-navy"
                        htmlFor="badBunny"
                      >
                        {CATEGORY_LABELS.badBunny}
                      </label>
                      <select
                        id="badBunny"
                        className="select"
                        value={form.badBunny}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, badBunny: event.target.value }))
                        }
                      >
                        {OPTIONS.badBunny.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label
                        className="block text-sm font-semibold text-patriots-navy"
                        htmlFor="patriotsLove"
                      >
                        {CATEGORY_LABELS.patriotsLove}
                      </label>
                      <select
                        id="patriotsLove"
                        className="select"
                        value={form.patriotsLove}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            patriotsLove: event.target.value
                          }))
                        }
                      >
                        {OPTIONS.patriotsLove.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {error ? (
                    <p className="text-sm text-patriots-red">{String(error)}</p>
                  ) : null}
                  {success ? (
                    <p className="text-sm text-patriots-navy">{success}</p>
                  ) : null}

                  <button className="btn-primary" type="submit" disabled={submitting}>
                    {submitting ? "Sende..." : "Tipp absenden"}
                  </button>
                </form>
              </div>
            )}
          </section>
        ) : (
          <section role="tabpanel" className="space-y-6">
            <div className="card p-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl text-patriots-navy">Gesamtübersicht</h2>
                  <p className="text-sm text-patriots-navy/70">
                    Bisher {overview?.total ?? 0} Tipps
                  </p>
                </div>
                <button className="btn-secondary" onClick={loadOverview}>
                  Aktualisieren
                </button>
              </div>

              <div className="mt-6 hidden overflow-x-auto md:block">
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
                      {hasResults ? <th className="py-2">Punkte</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {overview?.submissions.map((submission) => (
                      <tr
                        key={submission.id}
                        className={clsx(
                          "border-t border-patriots-silver/40",
                          hasResults && leaders.has(submission.id) && "gold-leader"
                        )}
                      >
                        <td className="py-2 pr-4 font-semibold">
                          <div className="flex flex-wrap items-center gap-2">
                            <span>{submission.name}</span>
                            {hasResults && leaders.has(submission.id) ? (
                              <span className="badge bg-patriots-navy text-white">🏆 Leader</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            <span>{submission.winner}</span>
                            {hasResults ? (
                              <span aria-label={submission.breakdown?.winner ? "Richtig" : "Falsch"}>
                                {submission.breakdown?.winner ? "✅" : "❌"}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            <span>{submission.overUnder}</span>
                            {hasResults ? (
                              <span>
                                {submission.breakdown?.overUnder ? "✅" : "❌"}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            <span>{submission.mvp}</span>
                            {hasResults ? (
                              <span>{submission.breakdown?.mvp ? "✅" : "❌"}</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            <span>{submission.receiving}</span>
                            {hasResults ? (
                              <span>{submission.breakdown?.receiving ? "✅" : "❌"}</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            <span>{submission.rushing}</span>
                            {hasResults ? (
                              <span>{submission.breakdown?.rushing ? "✅" : "❌"}</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            <span>{submission.badBunny}</span>
                            {hasResults ? (
                              <span>{submission.breakdown?.badBunny ? "✅" : "❌"}</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-2 pr-4">{submission.patriotsLove}</td>
                        <td className="py-2 pr-4 text-xs">
                          {formatDate(submission.createdAt)}
                        </td>
                        {hasResults ? (
                          <td className="py-2 pr-4 font-semibold">{submission.score}</td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {overview && overview.submissions.length === 0 ? (
                  <p className="mt-6 text-center text-patriots-navy/70">
                    Noch keine Tipps.
                  </p>
                ) : null}
              </div>

              <div className="mt-6 grid gap-4 md:hidden">
                {overview?.submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className={clsx(
                      "rounded-2xl border border-patriots-silver/60 bg-white p-4 text-patriots-navy",
                      hasResults && leaders.has(submission.id) && "gold-leader"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold">{submission.name}</p>
                      {hasResults && leaders.has(submission.id) ? (
                        <span className="badge bg-patriots-navy text-white">🏆 Leader</span>
                      ) : null}
                    </div>
                    <p className="text-xs text-patriots-navy/60">
                      {formatDate(submission.createdAt)}
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      <p>
                        <strong>{CATEGORY_LABELS.winner}:</strong> {submission.winner} {hasResults ? (submission.breakdown?.winner ? "✅" : "❌") : ""}
                      </p>
                      <p>
                        <strong>{CATEGORY_LABELS.overUnder}:</strong> {submission.overUnder} {hasResults ? (submission.breakdown?.overUnder ? "✅" : "❌") : ""}
                      </p>
                      <p>
                        <strong>{CATEGORY_LABELS.mvp}:</strong> {submission.mvp} {hasResults ? (submission.breakdown?.mvp ? "✅" : "❌") : ""}
                      </p>
                      <p>
                        <strong>{CATEGORY_LABELS.receiving}:</strong> {submission.receiving} {hasResults ? (submission.breakdown?.receiving ? "✅" : "❌") : ""}
                      </p>
                      <p>
                        <strong>{CATEGORY_LABELS.rushing}:</strong> {submission.rushing} {hasResults ? (submission.breakdown?.rushing ? "✅" : "❌") : ""}
                      </p>
                      <p>
                        <strong>{CATEGORY_LABELS.badBunny}:</strong> {submission.badBunny} {hasResults ? (submission.breakdown?.badBunny ? "✅" : "❌") : ""}
                      </p>
                      <p>
                        <strong>{CATEGORY_LABELS.patriotsLove}:</strong> {submission.patriotsLove}
                      </p>
                      {hasResults ? (
                        <p className="font-semibold">Punkte: {submission.score}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl text-patriots-navy">Tipp-Verteilung</h3>
                <p className="text-sm text-patriots-navy/70">
                  Prozentuale Auswahl pro Kategorie (1 Nachkommastelle).
                </p>
              </div>
              <div className="mt-6 grid gap-6">
                {overview
                  ? distributionOrder.map((key) => {
                      const items = overview.distributions[key];
                      const showAllForKey = showAll[key] ?? false;
                      const displayItems = topEightKeys.has(key)
                        ? buildTopItems(items, showAllForKey)
                        : items;
                      return (
                        <div key={key} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-patriots-navy">
                              {CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS]}
                            </h4>
                            {topEightKeys.has(key) ? (
                              <button
                                className="btn-secondary"
                                onClick={() =>
                                  setShowAll((prev) => ({
                                    ...prev,
                                    [key]: !showAllForKey
                                  }))
                                }
                              >
                                {showAllForKey ? "Top 8 anzeigen" : "Alle anzeigen"}
                              </button>
                            ) : null}
                          </div>
                          <div className="space-y-3">
                            {displayItems.map((item) => (
                              <div key={item.option} className="space-y-1">
                                <div className="flex items-center justify-between text-sm text-patriots-navy">
                                  <span>{item.option}</span>
                                  <span>
                                    {item.count} · {item.percent.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="progress-bar">
                                  <div
                                    className="progress-fill"
                                    style={{ width: `${item.percent}%` }}
                                    aria-hidden="true"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  : null}
              </div>
            </div>
          </section>
        )}

        {loading ? (
          <p className="text-center text-white/70">Lade Daten...</p>
        ) : null}
      </div>
    </main>
  );
}
