import { ScoringKey } from "./constants";

export type ScoringResults = {
  winner: string;
  overUnder: string;
  mvp: string;
  receiving: string;
  rushing: string;
  badBunny: string;
};

export type ScoringSubmission = {
  winner: string;
  overUnder: string;
  mvp: string;
  receiving: string;
  rushing: string;
  badBunny: string;
};

export type ScoreBreakdown = Record<ScoringKey, boolean> & { total: number };

export function scoreSubmission(
  submission: ScoringSubmission,
  results: ScoringResults
): ScoreBreakdown {
  const breakdown = {
    winner: submission.winner === results.winner,
    overUnder: submission.overUnder === results.overUnder,
    mvp: submission.mvp === results.mvp,
    receiving: submission.receiving === results.receiving,
    rushing: submission.rushing === results.rushing,
    badBunny: submission.badBunny === results.badBunny,
    total: 0
  };

  breakdown.total = Object.values(breakdown).filter((value) => value === true).length;

  return breakdown;
}
