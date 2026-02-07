import { prisma } from "./prisma";
import { OPTIONS, RESULTS_ID } from "./constants";
import { scoreSubmission } from "./scoring";

export type DistributionItem = {
  option: string;
  count: number;
  percent: number;
};

export type OverviewSubmission = {
  id: string;
  name: string;
  winner: string;
  overUnder: string;
  mvp: string;
  receiving: string;
  rushing: string;
  badBunny: string;
  patriotsLove: string;
  createdAt: Date;
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

export type OverviewData = {
  total: number;
  submissions: OverviewSubmission[];
  distributions: Record<string, DistributionItem[]>;
  results: {
    winner: string;
    overUnder: string;
    mvp: string;
    receiving: string;
    rushing: string;
    badBunny: string;
    lockedAt: Date | null;
  } | null;
  topScore: number | null;
};

function buildDistribution<T extends keyof typeof OPTIONS>(
  options: readonly string[],
  submissions: OverviewSubmission[],
  key: T
): DistributionItem[] {
  const counts = new Map<string, number>();
  options.forEach((option) => counts.set(option, 0));

  submissions.forEach((submission) => {
    const value = submission[key as keyof OverviewSubmission] as string;
    if (counts.has(value)) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  });

  const total = submissions.length;
  return options.map((option) => {
    const count = counts.get(option) ?? 0;
    const percent = total === 0 ? 0 : Number(((count / total) * 100).toFixed(1));
    return { option, count, percent };
  });
}

export async function getOverviewData(): Promise<OverviewData> {
  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: "asc" }
  });

  const resultsRow = await prisma.result.findUnique({
    where: { id: RESULTS_ID }
  });

  const results =
    resultsRow &&
    resultsRow.winner &&
    resultsRow.overUnder &&
    resultsRow.mvp &&
    resultsRow.receiving &&
    resultsRow.rushing &&
    resultsRow.badBunny
      ? {
          winner: resultsRow.winner,
          overUnder: resultsRow.overUnder,
          mvp: resultsRow.mvp,
          receiving: resultsRow.receiving,
          rushing: resultsRow.rushing,
          badBunny: resultsRow.badBunny,
          lockedAt: resultsRow.lockedAt
        }
      : null;

  const overviewSubmissions: OverviewSubmission[] = submissions.map((submission) => {
    const base = {
      id: submission.id,
      name: submission.name,
      winner: submission.winner,
      overUnder: submission.overUnder,
      mvp: submission.mvp,
      receiving: submission.receiving,
      rushing: submission.rushing,
      badBunny: submission.badBunny,
      patriotsLove: submission.patriotsLove,
      createdAt: submission.createdAt
    };

    if (!results) {
      return base;
    }

    const score = scoreSubmission(submission, results);
    return {
      ...base,
      score: score.total,
      breakdown: {
        winner: score.winner,
        overUnder: score.overUnder,
        mvp: score.mvp,
        receiving: score.receiving,
        rushing: score.rushing,
        badBunny: score.badBunny
      }
    };
  });

  const distributions = {
    winner: buildDistribution(OPTIONS.winner, overviewSubmissions, "winner"),
    overUnder: buildDistribution(OPTIONS.overUnder, overviewSubmissions, "overUnder"),
    mvp: buildDistribution(OPTIONS.mvp, overviewSubmissions, "mvp"),
    receiving: buildDistribution(OPTIONS.receiving, overviewSubmissions, "receiving"),
    rushing: buildDistribution(OPTIONS.rushing, overviewSubmissions, "rushing"),
    badBunny: buildDistribution(OPTIONS.badBunny, overviewSubmissions, "badBunny"),
    patriotsLove: buildDistribution(
      OPTIONS.patriotsLove,
      overviewSubmissions,
      "patriotsLove"
    )
  };

  const scores = overviewSubmissions
    .map((submission) => submission.score)
    .filter((score): score is number => typeof score === "number");
  const topScore = scores.length > 0 ? Math.max(...scores) : null;

  return {
    total: overviewSubmissions.length,
    submissions: overviewSubmissions,
    distributions,
    results,
    topScore
  };
}
