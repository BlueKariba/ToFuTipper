import { z } from "zod";
import { OPTIONS } from "./constants";

const winnerEnum = z.enum(OPTIONS.winner as [string, ...string[]]);
const overUnderEnum = z.enum(OPTIONS.overUnder as [string, ...string[]]);
const mvpEnum = z.enum(OPTIONS.mvp as [string, ...string[]]);
const receivingEnum = z.enum(OPTIONS.receiving as [string, ...string[]]);
const rushingEnum = z.enum(OPTIONS.rushing as [string, ...string[]]);
const badBunnyEnum = z.enum(OPTIONS.badBunny as [string, ...string[]]);
const patriotsLoveEnum = z.enum(OPTIONS.patriotsLove as [string, ...string[]]);

export const submissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name ist zu kurz")
    .max(40, "Name ist zu lang"),
  winner: winnerEnum,
  overUnder: overUnderEnum,
  mvp: mvpEnum,
  receiving: receivingEnum,
  rushing: rushingEnum,
  badBunny: badBunnyEnum,
  patriotsLove: patriotsLoveEnum
});

export const resultsSchema = z.object({
  winner: winnerEnum,
  overUnder: overUnderEnum,
  mvp: mvpEnum,
  receiving: receivingEnum,
  rushing: rushingEnum,
  badBunny: badBunnyEnum
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
export type ResultsInput = z.infer<typeof resultsSchema>;
