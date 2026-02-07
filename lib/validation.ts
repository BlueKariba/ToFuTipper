import { z } from "zod";
import { OPTIONS } from "./constants";

const enumFrom = <T extends readonly [string, ...string[]]>(values: T) =>
  z.enum(values as unknown as [string, ...string[]]);

const winnerEnum = enumFrom(OPTIONS.winner);
const overUnderEnum = enumFrom(OPTIONS.overUnder);
const mvpEnum = enumFrom(OPTIONS.mvp);
const receivingEnum = enumFrom(OPTIONS.receiving);
const rushingEnum = enumFrom(OPTIONS.rushing);
const badBunnyEnum = enumFrom(OPTIONS.badBunny);
const patriotsLoveEnum = enumFrom(OPTIONS.patriotsLove);

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
