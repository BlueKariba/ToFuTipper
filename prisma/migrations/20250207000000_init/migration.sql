CREATE TABLE "Submission" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "nameNormalized" TEXT NOT NULL,
  "winner" TEXT NOT NULL,
  "overUnder" TEXT NOT NULL,
  "mvp" TEXT NOT NULL,
  "receiving" TEXT NOT NULL,
  "rushing" TEXT NOT NULL,
  "badBunny" TEXT NOT NULL,
  "patriotsLove" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "Submission_nameNormalized_key" ON "Submission"("nameNormalized");

CREATE TABLE "Result" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "winner" TEXT,
  "overUnder" TEXT,
  "mvp" TEXT,
  "receiving" TEXT,
  "rushing" TEXT,
  "badBunny" TEXT,
  "lockedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
);

CREATE TABLE "AdminSession" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP NOT NULL
);
