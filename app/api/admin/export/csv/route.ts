import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { RESULTS_ID } from "@/lib/constants";
import { scoreSubmission } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: "asc" }
  });

  const results = await prisma.result.findUnique({
    where: { id: RESULTS_ID }
  });

  const hasResults =
    results &&
    results.winner &&
    results.overUnder &&
    results.mvp &&
    results.receiving &&
    results.rushing &&
    results.badBunny;

  const header = [
    "Timestamp",
    "Name",
    "Sieger",
    "Over/Under",
    "MVP",
    "Most Receiving Yards",
    "Most Rushing Yards",
    "Bad Bunny beleidigt?",
    "Warum ich die Patriots liebe",
    "Punkte"
  ];

  const rows = submissions.map((submission) => {
    const score = hasResults
      ? scoreSubmission(submission, results).total
      : "";
    return [
      submission.createdAt.toISOString(),
      submission.name,
      submission.winner,
      submission.overUnder,
      submission.mvp,
      submission.receiving,
      submission.rushing,
      submission.badBunny,
      submission.patriotsLove,
      String(score)
    ];
  });

  const csv = [header, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="tobis-superbowl-tippspiel.csv"'
    }
  });
}
